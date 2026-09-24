import {
  DecisionEvent,
  EventFilters,
  FleetAggregates,
  Outcome,
  EngineAction,
  SohStatus,
  VehicleType,
  LayerResult,
  Alert,
} from '../types';
import { CANONICAL_CASES, UC1_RECORD, UC2_RECORD, UC3_RECORD, UC4_RECORD } from './cases';

// AS_OF constant (§14.5)
export const AS_OF = '2026-06-01T10:30:00Z';

// Seeded PRNG: mulberry32 (seed 20260924)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface VehicleProfile {
  id: string;
  type: VehicleType;
  manufacturer: string;
  batteries: string[];
}

function generateFleet(): DecisionEvent[] {
  const rand = mulberry32(20260924);

  // 1. Generate 312 Vehicles
  // Distribution: Last Mile Delivery 128, Intercity Cargo 71, Passenger Shuttle 54, Municipal Fleet 35, Rental Pool 24
  // Manufacturer: LG 198, Samsung SDI 68, Exide 46
  const vehicles: VehicleProfile[] = [];

  const typesList: VehicleType[] = [
    ...Array(128).fill('Last Mile Delivery'),
    ...Array(71).fill('Intercity Cargo'),
    ...Array(54).fill('Passenger Shuttle'),
    ...Array(35).fill('Municipal Fleet'),
    ...Array(24).fill('Rental Pool'),
  ];

  const mfgList: string[] = [
    ...Array(198).fill('LG'),
    ...Array(68).fill('Samsung SDI'),
    ...Array(46).fill('Exide'),
  ];

  for (let i = 0; i < 312; i++) {
    const vehNum = (4000 + i).toString().padStart(4, '0');
    const vehId = i === 92 ? 'VEH-CU-4092' : `VEH-CU-${vehNum}`;
    const bat1 = `BAT-CU-14S-${(8000 + i * 2).toString().padStart(4, '0')}`;
    const bat2 = `BAT-CU-14S-${(8001 + i * 2).toString().padStart(4, '0')}`;
    const batteries = i === 92 ? ['BAT-CU-14S-8842', 'BAT-CU-14S-9031'] : [bat1, bat2];

    vehicles.push({
      id: vehId,
      type: i === 92 ? 'Last Mile Delivery' : typesList[i],
      manufacturer: i === 92 ? 'LG' : mfgList[i],
      batteries,
    });
  }

  // 2. Setup target outcome pool for 1,248 events
  // ASSURED: 1080, ASSURED WITH LIMITATIONS: 97, REVIEW REQUIRED: 51, ESCALATE: 20
  // Note: 4 canonical UC records will be placed at the most recent timestamps
  const outcomePool: Outcome[] = [
    ...Array(1080 - 1).fill('ASSURED' as Outcome), // -1 for UC1
    ...Array(97 - 1).fill('ASSURED WITH LIMITATIONS' as Outcome), // -1 for UC2
    ...Array(51 - 1).fill('REVIEW REQUIRED' as Outcome), // -1 for UC3
    ...Array(20 - 1).fill('ESCALATE' as Outcome), // -1 for UC4
  ];

  // Shuffle outcomes with seeded PRNG
  for (let i = outcomePool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [outcomePool[i], outcomePool[j]] = [outcomePool[j], outcomePool[i]];
  }

  const asOfMs = new Date(AS_OF).getTime();
  const windowMs = 14 * 24 * 60 * 60 * 1000; // 14 days

  const generatedEvents: DecisionEvent[] = [];

  for (let i = 0; i < 1244; i++) {
    const outcome = outcomePool[i];
    const veh = vehicles[Math.floor(rand() * vehicles.length)];
    const batteryId = veh.batteries[Math.floor(rand() * veh.batteries.length)];

    // Timestamp spread over 14 days before AS_OF (excluding the last 4 hours reserved for UC1-4)
    const timeOffset = (rand() * (windowMs - 4 * 3600 * 1000)) + (4 * 3600 * 1000);
    const eventTime = new Date(asOfMs - timeOffset).toISOString();

    // SoH drawn per outcome consistent with §6.3
    let sohPct: number;
    if (outcome === 'ASSURED') {
      sohPct = parseFloat((80.0 + rand() * 16.0).toFixed(1)); // 80-96%
    } else if (outcome === 'ASSURED WITH LIMITATIONS') {
      sohPct = parseFloat((80.0 + rand() * 14.0).toFixed(1)); // 80-94%
    } else if (outcome === 'REVIEW REQUIRED') {
      sohPct = parseFloat((72.0 + rand() * 17.0).toFixed(1)); // 72-89%
    } else {
      sohPct = parseFloat((54.0 + rand() * 25.0).toFixed(1)); // 54-79%
    }

    // Determine engineAction and sohStatus from SoH via §7.4
    let engineAction: EngineAction;
    let sohStatus: SohStatus;

    if (sohPct >= 90.0) {
      engineAction = 'CONTINUE_OPERATION';
      sohStatus = 'EXCELLENT';
    } else if (sohPct >= 80.0) {
      engineAction = 'CONTINUE_OPERATION';
      sohStatus = 'GOOD';
    } else if (sohPct >= 70.0) {
      engineAction = 'SCHEDULE_MAINTENANCE';
      sohStatus = 'FAIR';
    } else if (sohPct >= 60.0) {
      engineAction = 'REPLACE_BATTERY';
      sohStatus = 'REPLACEMENT REVIEW';
    } else {
      engineAction = 'RETIRE_ASSET';
      sohStatus = 'CRITICAL';
    }

    if (outcome === 'ESCALATE' && rand() > 0.5) {
      engineAction = 'ESCALATE_FOR_REVIEW';
    }

    // Layer results compatible with outcome (§4.3)
    let layerResults: Record<'input' | 'model' | 'policy' | 'decision' | 'explanation', LayerResult> = {
      input: 'clear',
      model: 'clear',
      policy: 'clear',
      decision: 'clear',
      explanation: 'clear',
    };

    if (outcome === 'ASSURED WITH LIMITATIONS') {
      layerResults.model = 'limitation';
      layerResults.explanation = rand() > 0.5 ? 'review' : 'clear';
    } else if (outcome === 'REVIEW REQUIRED') {
      layerResults.policy = rand() > 0.5 ? 'breach' : 'clear';
      layerResults.decision = rand() > 0.5 ? 'breach' : 'clear';
      layerResults.explanation = 'review';
    } else if (outcome === 'ESCALATE') {
      layerResults.policy = 'breach';
      layerResults.decision = 'breach';
      layerResults.explanation = rand() > 0.5 ? 'review' : 'clear';
    }

    const eventId = `CRD-2026-FLT-${(1000 + i).toString().padStart(4, '0')}`;

    generatedEvents.push({
      id: eventId,
      timestampUtc: eventTime,
      batteryId,
      vehicleId: veh.id,
      vehicleType: veh.type,
      manufacturer: veh.manufacturer,
      sohPct,
      sohStatus,
      engineAction,
      outcome,
      layerResults,
      hasFullRecord: false,
    });
  }

  // Inject the 4 Canonical UC Records at the 4 most recent timestamps
  const ucEvents: DecisionEvent[] = [
    {
      id: UC1_RECORD.id,
      timestampUtc: new Date(asOfMs - 10 * 60 * 1000).toISOString(),
      batteryId: UC1_RECORD.batteryId,
      vehicleId: UC1_RECORD.vehicleId,
      vehicleType: 'Last Mile Delivery',
      manufacturer: UC1_RECORD.manufacturer,
      sohPct: UC1_RECORD.soh.value!,
      sohStatus: UC1_RECORD.sohStatus,
      engineAction: UC1_RECORD.engineAction,
      outcome: UC1_RECORD.outcome,
      layerResults: {
        input: UC1_RECORD.layers.input.result,
        model: UC1_RECORD.layers.model.result,
        policy: UC1_RECORD.layers.policy.result,
        decision: UC1_RECORD.layers.decision.result,
        explanation: UC1_RECORD.layers.explanation.result,
      },
      hasFullRecord: true,
    },
    {
      id: UC2_RECORD.id,
      timestampUtc: new Date(asOfMs - 25 * 60 * 1000).toISOString(),
      batteryId: UC2_RECORD.batteryId,
      vehicleId: UC2_RECORD.vehicleId,
      vehicleType: 'Last Mile Delivery',
      manufacturer: UC2_RECORD.manufacturer,
      sohPct: UC2_RECORD.soh.value!,
      sohStatus: UC2_RECORD.sohStatus,
      engineAction: UC2_RECORD.engineAction,
      outcome: UC2_RECORD.outcome,
      layerResults: {
        input: UC2_RECORD.layers.input.result,
        model: UC2_RECORD.layers.model.result,
        policy: UC2_RECORD.layers.policy.result,
        decision: UC2_RECORD.layers.decision.result,
        explanation: UC2_RECORD.layers.explanation.result,
      },
      hasFullRecord: true,
    },
    {
      id: UC3_RECORD.id,
      timestampUtc: new Date(asOfMs - 45 * 60 * 1000).toISOString(),
      batteryId: UC3_RECORD.batteryId,
      vehicleId: UC3_RECORD.vehicleId,
      vehicleType: 'Last Mile Delivery',
      manufacturer: UC3_RECORD.manufacturer,
      sohPct: UC3_RECORD.soh.value!,
      sohStatus: UC3_RECORD.sohStatus,
      engineAction: UC3_RECORD.engineAction,
      outcome: UC3_RECORD.outcome,
      layerResults: {
        input: UC3_RECORD.layers.input.result,
        model: UC3_RECORD.layers.model.result,
        policy: UC3_RECORD.layers.policy.result,
        decision: UC3_RECORD.layers.decision.result,
        explanation: UC3_RECORD.layers.explanation.result,
      },
      hasFullRecord: true,
    },
    {
      id: UC4_RECORD.id,
      timestampUtc: new Date(asOfMs - 60 * 60 * 1000).toISOString(),
      batteryId: UC4_RECORD.batteryId,
      vehicleId: UC4_RECORD.vehicleId,
      vehicleType: 'Last Mile Delivery',
      manufacturer: UC4_RECORD.manufacturer,
      sohPct: UC4_RECORD.soh.value!,
      sohStatus: UC4_RECORD.sohStatus,
      engineAction: UC4_RECORD.engineAction,
      outcome: UC4_RECORD.outcome,
      layerResults: {
        input: UC4_RECORD.layers.input.result,
        model: UC4_RECORD.layers.model.result,
        policy: UC4_RECORD.layers.policy.result,
        decision: UC4_RECORD.layers.decision.result,
        explanation: UC4_RECORD.layers.explanation.result,
      },
      hasFullRecord: true,
    },
  ];

  // Combine and sort descending by timestamp
  const allEvents = [...ucEvents, ...generatedEvents].sort(
    (a, b) => new Date(b.timestampUtc).getTime() - new Date(a.timestampUtc).getTime()
  );

  return allEvents;
}

// Global cached fleet
export const FLEET_EVENTS: DecisionEvent[] = generateFleet();

// Largest-remainder rounding helper so displayed shares always sum to 100.0% (§6.3)
export function calculateLargestRemainderShares(counts: number[], total: number): number[] {
  if (total === 0) return counts.map(() => 0);
  const rawPcts = counts.map((c) => (c / total) * 100);
  const roundedFloors = rawPcts.map((p) => Math.floor(p * 10) / 10);
  const currentSum = Math.round(roundedFloors.reduce((a, b) => a + b, 0) * 10) / 10;
  let remainderTenths = Math.round((100.0 - currentSum) * 10);

  const remainders = rawPcts.map((p, idx) => ({
    idx,
    rem: p * 10 - Math.floor(p * 10),
  })).sort((a, b) => b.rem - a.rem);

  const result = [...roundedFloors];
  for (let i = 0; i < remainderTenths && i < remainders.length; i++) {
    result[remainders[i].idx] = Math.round((result[remainders[i].idx] + 0.1) * 10) / 10;
  }

  return result;
}

export function filterFleetEvents(events: DecisionEvent[], filters?: EventFilters): DecisionEvent[] {
  if (!filters) return events;

  return events.filter((e) => {
    // Date bounds
    if (filters.from && new Date(e.timestampUtc) < new Date(filters.from)) return false;
    if (filters.to && new Date(e.timestampUtc) > new Date(filters.to)) return false;

    // Vehicle Types
    if (filters.vehicleTypes && filters.vehicleTypes.length > 0) {
      if (!filters.vehicleTypes.includes(e.vehicleType)) return false;
    }

    // Manufacturers
    if (filters.manufacturers && filters.manufacturers.length > 0) {
      if (!filters.manufacturers.includes(e.manufacturer)) return false;
    }

    // Outcomes
    if (filters.outcomes && filters.outcomes.length > 0) {
      if (!filters.outcomes.includes(e.outcome)) return false;
    }

    // Engine Actions
    if (filters.engineActions && filters.engineActions.length > 0) {
      if (!filters.engineActions.includes(e.engineAction)) return false;
    }

    // SoH Statuses
    if (filters.sohStatuses && filters.sohStatuses.length > 0) {
      if (!filters.sohStatuses.includes(e.sohStatus)) return false;
    }

    // SoH Band
    if (filters.sohBand) {
      if (e.sohPct < filters.sohBand.min || e.sohPct >= filters.sohBand.max) return false;
    }

    // Free text query
    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase();
      const matchId = e.id.toLowerCase().includes(q);
      const matchBat = e.batteryId.toLowerCase().includes(q);
      const matchVeh = e.vehicleId.toLowerCase().includes(q);
      if (!matchId && !matchBat && !matchVeh) return false;
    }

    return true;
  });
}

export function computeFleetAggregates(events: DecisionEvent[]): FleetAggregates {
  const total = events.length;

  const byOutcome: Record<Outcome, number> = {
    ASSURED: 0,
    'ASSURED WITH LIMITATIONS': 0,
    'REVIEW REQUIRED': 0,
    ESCALATE: 0,
  };

  const byAction: Record<EngineAction, number> = {
    CONTINUE_OPERATION: 0,
    SCHEDULE_MAINTENANCE: 0,
    REPLACE_BATTERY: 0,
    RETIRE_ASSET: 0,
    ESCALATE_FOR_REVIEW: 0,
  };

  const sohBins = [
    { bin: '≥90%', min: 90, max: 101, count: 0 },
    { bin: '80–<90%', min: 80, max: 90, count: 0 },
    { bin: '70–<80%', min: 70, max: 80, count: 0 },
    { bin: '60–<70%', min: 60, max: 70, count: 0 },
    { bin: '<60%', min: 0, max: 60, count: 0 },
  ];

  const layerClearCounts: Record<'input' | 'model' | 'policy' | 'decision' | 'explanation', number> = {
    input: 0,
    model: 0,
    policy: 0,
    decision: 0,
    explanation: 0,
  };

  for (const e of events) {
    if (byOutcome[e.outcome] !== undefined) byOutcome[e.outcome]++;
    if (byAction[e.engineAction] !== undefined) byAction[e.engineAction]++;

    for (const b of sohBins) {
      if (e.sohPct >= b.min && e.sohPct < b.max) {
        b.count++;
        break;
      }
    }

    if (e.layerResults.input === 'clear') layerClearCounts.input++;
    if (e.layerResults.model === 'clear') layerClearCounts.model++;
    if (e.layerResults.policy === 'clear') layerClearCounts.policy++;
    if (e.layerResults.decision === 'clear') layerClearCounts.decision++;
    if (e.layerResults.explanation === 'clear') layerClearCounts.explanation++;
  }

  const binCounts = sohBins.map((b) => b.count);
  const binPcts = calculateLargestRemainderShares(binCounts, total);

  const sohDistribution = sohBins.map((b, idx) => ({
    bin: b.bin,
    count: b.count,
    pct: binPcts[idx] || 0,
  }));

  const assuranceRate = total > 0 ? parseFloat(((byOutcome.ASSURED / total) * 100).toFixed(1)) : 0;

  return {
    totalEvents: total,
    byOutcome,
    byAction,
    sohDistribution,
    sohTrend: [],
    layerClearRate: {
      input: total > 0 ? layerClearCounts.input / total : 0,
      model: total > 0 ? layerClearCounts.model / total : 0,
      policy: total > 0 ? layerClearCounts.policy / total : 0,
      decision: total > 0 ? layerClearCounts.decision / total : 0,
      explanation: total > 0 ? layerClearCounts.explanation / total : 0,
    },
    assuranceRate,
    windowStart: new Date(new Date(AS_OF).getTime() - 14 * 24 * 3600 * 1000).toISOString(),
    windowEnd: AS_OF,
  };
}

export const FLEET_ALERTS: Alert[] = [
  {
    id: 'ALT-2026-001',
    severity: 'warning',
    title: 'Model Version Delta Detected',
    detail: 'Incoming model DLL:V1 on BAT-CU-14S-8842 differs from production target DLL:V2.',
    timestampUtc: '2026-06-01T10:05:00Z',
  },
  {
    id: 'ALT-2026-002',
    severity: 'critical',
    title: 'Statutory Cell Imbalance Breach',
    detail: 'Cell imbalance 64.97 mV exceeds AIS-038 statutory threshold (50.00 mV) on BAT-CU-14S-8842.',
    timestampUtc: '2026-06-01T09:45:00Z',
  },
  {
    id: 'ALT-2026-003',
    severity: 'critical',
    title: 'Rapid Replacement Degradation',
    detail: 'Successive battery swap on VEH-CU-4092 repeated degradation pattern (76.2% SoH). Escalated.',
    timestampUtc: '2026-06-01T09:30:00Z',
  },
];
