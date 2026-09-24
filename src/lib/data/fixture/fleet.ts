import type {
  DecisionEvent,
  DecisionRecord,
  EngineAction,
  LayerKey,
  LayerResult,
  Outcome,
  VehicleType,
} from '@/lib/data/types';
import { engineActionFromSoh, layerResultsForOutcome, sohForOutcome, sohStatusFromPct } from '@/lib/assurance/policy';
import { AS_OF, FLEET_SEED, GENERATED_EVENT_COUNT, GENERATED_OUTCOME_COUNTS } from './config';
import { UC_CASES } from './cases';
import { floatInRange, intInRange, mulberry32 } from './prng';

const MANUFACTURERS = ['LG', 'Samsung SDI', 'Exide'] as const;
const VEHICLE_TYPES: VehicleType[] = [
  'Last Mile Delivery',
  'Intercity Cargo',
  'Passenger Shuttle',
  'Municipal Fleet',
  'Rental Pool',
];

const VEHICLE_TYPE_COUNTS = [128, 71, 54, 35, 24] as const;
const MANUFACTURER_COUNTS = [198, 68, 46] as const;

export interface FleetVehicle {
  vehicleId: string;
  vehicleType: VehicleType;
  manufacturer: string;
  primaryBatteryId: string;
  secondaryBatteryId: string | null;
}

export interface GeneratedFleetEvent {
  id: string;
  eventTimestampUtc: string;
  batteryId: string;
  vehicleId: string;
  vehicleType: VehicleType;
  manufacturer: string;
  sohPct: number;
  sohStatus: ReturnType<typeof sohStatusFromPct>;
  engineAction: EngineAction;
  outcome: Outcome;
  layerResults: Record<LayerKey, LayerResult>;
  hasFullRecord: boolean;
  record: DecisionRecord | null;
}

function expandCounts<T extends string>(labels: readonly T[], counts: readonly number[]): T[] {
  const out: T[] = [];
  labels.forEach((label, i) => {
    for (let j = 0; j < (counts[i] ?? 0); j += 1) out.push(label);
  });
  return out;
}

function shuffleInPlace<T>(items: T[], rng: () => number): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
}

function buildVehicleIds(rng: () => number): number[] {
  const ids = new Set<number>([4092]);
  while (ids.size < 312) {
    ids.add(intInRange(rng, 1000, 9998));
  }
  return [...ids].sort((a, b) => a - b);
}

function buildVehicles(rng: () => number): FleetVehicle[] {
  const numericIds = buildVehicleIds(rng);
  const types = expandCounts(VEHICLE_TYPES, VEHICLE_TYPE_COUNTS);
  const manufacturers = expandCounts(MANUFACTURERS, MANUFACTURER_COUNTS);
  shuffleInPlace(types, rng);
  shuffleInPlace(manufacturers, rng);

  return numericIds.map((num, index) => {
    let vehicleType = types[index]!;
    let manufacturer = manufacturers[index]!;
    if (num === 4092) {
      vehicleType = 'Last Mile Delivery';
      manufacturer = 'LG';
    }
    const primaryBatteryId = `BAT-CU-14S-${String(1000 + (num % 8000)).padStart(4, '0')}`;
    const secondaryBatteryId =
      rng() > 0.55 ? `BAT-CU-14S-${String(1000 + ((num + 137) % 8000)).padStart(4, '0')}` : null;
    return {
      vehicleId: `VEH-CU-${String(num).padStart(4, '0')}`,
      vehicleType,
      manufacturer,
      primaryBatteryId,
      secondaryBatteryId,
    };
  });
}

function windowStartIso(): string {
  const end = new Date(AS_OF);
  const start = new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}

function timestampForSlot(slotIndex: number, totalSlots: number): string {
  const start = new Date(windowStartIso());
  const end = new Date(AS_OF);
  const span = end.getTime() - start.getTime();
  const t = start.getTime() + Math.floor((span * slotIndex) / Math.max(totalSlots - 1, 1));
  return new Date(t).toISOString();
}

function buildOutcomePool(rng: () => number): Outcome[] {
  const pool: Outcome[] = [];
  (Object.keys(GENERATED_OUTCOME_COUNTS) as Outcome[]).forEach((outcome) => {
    const count = GENERATED_OUTCOME_COUNTS[outcome];
    for (let i = 0; i < count; i += 1) pool.push(outcome);
  });
  shuffleInPlace(pool, rng);
  return pool;
}

function generatedEventId(index: number): string {
  return `CRD-2026-GEN-${String(index + 1).padStart(5, '0')}`;
}

export function buildFleet(): GeneratedFleetEvent[] {
  const rng = mulberry32(FLEET_SEED);
  const vehicles = buildVehicles(rng);
  const outcomes = buildOutcomePool(rng);
  const generated: GeneratedFleetEvent[] = [];

  for (let i = 0; i < GENERATED_EVENT_COUNT; i += 1) {
    const vehicle = vehicles[i % vehicles.length]!;
    const outcome = outcomes[i]!;
    const sohPct = sohForOutcome(rng, outcome);
    const layerResults = layerResultsForOutcome(outcome);
    const useSecondary = vehicle.secondaryBatteryId !== null && rng() > 0.5;
    const batteryId = useSecondary ? vehicle.secondaryBatteryId! : vehicle.primaryBatteryId;

    generated.push({
      id: generatedEventId(i),
      eventTimestampUtc: timestampForSlot(i, GENERATED_EVENT_COUNT),
      batteryId,
      vehicleId: vehicle.vehicleId,
      vehicleType: vehicle.vehicleType,
      manufacturer: vehicle.manufacturer,
      sohPct,
      sohStatus: sohStatusFromPct(sohPct),
      engineAction: engineActionFromSoh(sohPct),
      outcome,
      layerResults,
      hasFullRecord: false,
      record: null,
    });
  }

  const ucOrder: DecisionRecord[] = [...UC_CASES].sort((a, b) => {
    const rank = (c: DecisionRecord) => (c.caseRef === 'UC4' ? 0 : c.caseRef === 'UC3' ? 1 : c.caseRef === 'UC2' ? 2 : 3);
    return rank(a) - rank(b);
  });

  const ucEvents: GeneratedFleetEvent[] = ucOrder.map((record, idx) => {
    const slot = GENERATED_EVENT_COUNT + idx;
    const eventTimestampUtc = timestampForSlot(slot, GENERATED_EVENT_COUNT + 4);
    return {
      id: record.id,
      eventTimestampUtc,
      batteryId: record.batteryId,
      vehicleId: record.vehicleId,
      vehicleType: 'Last Mile Delivery',
      manufacturer: record.manufacturer,
      sohPct: record.soh.value ?? 0,
      sohStatus: record.sohStatus,
      engineAction: record.engineAction,
      outcome: record.outcome,
      layerResults: {
        input: record.layers.input.result,
        model: record.layers.model.result,
        policy: record.layers.policy.result,
        decision: record.layers.decision.result,
        explanation: record.layers.explanation.result,
      },
      hasFullRecord: true,
      record,
    };
  });

  return [...generated, ...ucEvents].sort(
    (a, b) => new Date(b.eventTimestampUtc).getTime() - new Date(a.eventTimestampUtc).getTime()
  );
}

export function toDecisionEvent(row: GeneratedFleetEvent): DecisionEvent {
  return {
    id: row.id,
    timestampUtc: row.eventTimestampUtc,
    batteryId: row.batteryId,
    vehicleId: row.vehicleId,
    vehicleType: row.vehicleType,
    manufacturer: row.manufacturer,
    sohPct: row.sohPct,
    sohStatus: row.sohStatus,
    engineAction: row.engineAction,
    outcome: row.outcome,
    layerResults: row.layerResults,
    hasFullRecord: row.hasFullRecord,
  };
}

/** Deterministic jitter for alert timestamps (still within window). */
export function alertTimestampUtc(rng: () => number): string {
  const end = new Date(AS_OF).getTime();
  const start = new Date(windowStartIso()).getTime();
  return new Date(start + rng() * (end - start)).toISOString();
}

export { floatInRange, windowStartIso };
