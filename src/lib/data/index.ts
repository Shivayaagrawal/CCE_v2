import {
  DecisionRecord,
  DecisionEvent,
  EventFilters,
  FleetAggregates,
  Alert,
} from './types';
import { CANONICAL_CASES, UC1_RECORD } from './fixture/cases';

export async function getDecision(id: string): Promise<DecisionRecord | null> {
  await Promise.resolve();
  return CANONICAL_CASES[id] ?? null;
}

export async function getDecisionIds(): Promise<string[]> {
  await Promise.resolve();
  return Object.keys(CANONICAL_CASES);
}

export async function getEvents(filters?: EventFilters): Promise<{
  rows: DecisionEvent[];
  total: number;
  page: number;
  pageSize: number;
}> {
  await Promise.resolve();
  const rows: DecisionEvent[] = Object.values(CANONICAL_CASES).map((rec) => ({
    id: rec.id,
    timestampUtc: rec.timestampUtc ?? '',
    batteryId: rec.batteryId,
    vehicleId: rec.vehicleId,
    vehicleType: 'Last Mile Delivery',
    manufacturer: rec.manufacturer,
    sohPct: rec.soh.value ?? 0,
    sohStatus: rec.sohStatus,
    engineAction: rec.engineAction,
    outcome: rec.outcome,
    layerResults: {
      input: rec.layers.input.result,
      model: rec.layers.model.result,
      policy: rec.layers.policy.result,
      decision: rec.layers.decision.result,
      explanation: rec.layers.explanation.result,
    },
    hasFullRecord: rec.hasFullRecord,
  }));

  return {
    rows,
    total: rows.length,
    page: filters?.page ?? 1,
    pageSize: filters?.pageSize ?? 8,
  };
}

export async function getAggregates(filters?: EventFilters): Promise<FleetAggregates> {
  await Promise.resolve();
  return {
    totalEvents: 1248,
    byOutcome: {
      ASSURED: 1080,
      'ASSURED WITH LIMITATIONS': 97,
      'REVIEW REQUIRED': 51,
      ESCALATE: 20,
    },
    byAction: {
      CONTINUE_OPERATION: 1080,
      SCHEDULE_MAINTENANCE: 97,
      REPLACE_BATTERY: 51,
      RETIRE_ASSET: 0,
      ESCALATE_FOR_REVIEW: 20,
    },
    sohDistribution: [
      { bin: '≥90%', count: 480, pct: 38.5 },
      { bin: '80–<90%', count: 600, pct: 48.1 },
      { bin: '70–<80%', count: 117, pct: 9.4 },
      { bin: '60–<70%', count: 35, pct: 2.8 },
      { bin: '<60%', count: 16, pct: 1.3 },
    ],
    sohTrend: [],
    layerClearRate: {
      input: 1.0,
      model: 0.95,
      policy: 0.94,
      decision: 0.94,
      explanation: 0.98,
    },
    assuranceRate: 86.5,
    windowStart: '2026-05-18T00:00:00Z',
    windowEnd: '2026-06-01T23:59:59Z',
  };
}

export async function getAlerts(): Promise<Alert[]> {
  await Promise.resolve();
  return [];
}

export async function getVehicleHistory(vehicleId: string): Promise<DecisionEvent[]> {
  await Promise.resolve();
  const { rows } = await getEvents();
  return rows.filter((r) => r.vehicleId === vehicleId);
}

export * from './types';
