import type {
  Alert,
  DecisionEvent,
  DecisionRecord,
  EngineAction,
  EventFilters,
  FleetAggregates,
  LayerKey,
  Outcome,
} from './types';
import { engineActionFromSoh, SOH_BINS } from '../assurance/policy';
import { AS_OF } from './fixture/config';
import type { GeneratedFleetEvent } from './fixture/fleet';
import { windowStartIso } from './fixture/fleet';
import { buildAlerts, getFleetRows, getRecordById } from './fixture/store';

export async function getDecision(id: string): Promise<DecisionRecord | null> {
  await Promise.resolve();
  return getRecordById(id);
}

export async function getDecisionIds(): Promise<string[]> {
  await Promise.resolve();
  return getFleetRows()
    .filter((r) => r.hasFullRecord)
    .map((r) => r.id);
}

function applyFilters(rows: GeneratedFleetEvent[], filters?: EventFilters): GeneratedFleetEvent[] {
  let result = [...rows];
  if (!filters) return result;

  if (filters.from) {
    const from = new Date(filters.from).getTime();
    result = result.filter((r) => new Date(r.eventTimestampUtc).getTime() >= from);
  }
  if (filters.to) {
    const to = new Date(filters.to).getTime();
    result = result.filter((r) => new Date(r.eventTimestampUtc).getTime() <= to);
  }
  if (filters.vehicleTypes?.length) {
    result = result.filter((r) => filters.vehicleTypes!.includes(r.vehicleType));
  }
  if (filters.manufacturers?.length) {
    result = result.filter((r) => filters.manufacturers!.includes(r.manufacturer));
  }
  if (filters.outcomes?.length) {
    result = result.filter((r) => filters.outcomes!.includes(r.outcome));
  }
  if (filters.engineActions?.length) {
    result = result.filter((r) => filters.engineActions!.includes(r.engineAction));
  }
  if (filters.sohStatuses?.length) {
    result = result.filter((r) => filters.sohStatuses!.includes(r.sohStatus));
  }
  if (filters.sohBand) {
    const { min, max } = filters.sohBand;
    result = result.filter((r) => r.sohPct >= min && r.sohPct < max);
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.batteryId.toLowerCase().includes(q) ||
        r.vehicleId.toLowerCase().includes(q)
    );
  }

  if (filters.sort) {
    const { column, direction } = filters.sort;
    const dir = direction === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      if (column === 'timestampUtc') {
        av = a.eventTimestampUtc;
        bv = b.eventTimestampUtc;
      } else {
        av = a[column];
        bv = b[column];
      }
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  }

  return result;
}

function largestRemainderPercents(counts: number[], total: number): number[] {
  if (total === 0) return counts.map(() => 0);
  const raw = counts.map((c) => (c / total) * 100);
  const floors = raw.map((v) => Math.floor(v * 10) / 10);
  let remainder = Math.round((100 - floors.reduce((s, v) => s + v, 0)) * 10);
  const order = raw
    .map((v, i) => ({ i, frac: v * 10 - Math.floor(v * 10) }))
    .sort((a, b) => b.frac - a.frac);
  const pct = [...floors];
  for (const { i } of order) {
    if (remainder <= 0) break;
    pct[i] = Math.round((pct[i]! + 0.1) * 10) / 10;
    remainder -= 1;
  }
  return pct;
}

function computeAggregates(rows: GeneratedFleetEvent[]): FleetAggregates {
  const totalEvents = rows.length;
  const outcomes: Outcome[] = ['ASSURED', 'ASSURED WITH LIMITATIONS', 'REVIEW REQUIRED', 'ESCALATE'];
  const byOutcome = Object.fromEntries(
    outcomes.map((o) => [o, rows.filter((r) => r.outcome === o).length])
  ) as Record<Outcome, number>;

  const actions: EngineAction[] = [
    'CONTINUE_OPERATION',
    'SCHEDULE_MAINTENANCE',
    'REPLACE_BATTERY',
    'RETIRE_ASSET',
    'ESCALATE_FOR_REVIEW',
  ];
  const byAction = Object.fromEntries(
    actions.map((a) => [a, rows.filter((r) => r.engineAction === a).length])
  ) as Record<EngineAction, number>;

  const binCounts = SOH_BINS.map((bin) =>
    rows.filter((r) => {
      if (bin.min === 90) return r.sohPct >= 90;
      if (bin.max === 60) return r.sohPct < 60;
      return r.sohPct >= bin.min && r.sohPct < bin.max!;
    }).length
  );
  const binPcts = largestRemainderPercents(binCounts, totalEvents);
  const sohDistribution = SOH_BINS.map((bin, i) => ({
    bin: bin.label,
    count: binCounts[i]!,
    pct: binPcts[i]!,
  }));

  const start = new Date(windowStartIso());
  const sohTrend: { date: string; meanSohPct: number }[] = [];
  for (let d = 0; d < 14; d += 1) {
    const dayStart = new Date(start.getTime() + d * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayRows = rows.filter((r) => {
      const t = new Date(r.eventTimestampUtc).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime();
    });
    const mean =
      dayRows.length === 0
        ? 0
        : Math.round((dayRows.reduce((s, r) => s + r.sohPct, 0) / dayRows.length) * 10) / 10;
    sohTrend.push({ date: dayStart.toISOString().slice(0, 10), meanSohPct: mean });
  }

  const layerKeys: LayerKey[] = ['input', 'model', 'policy', 'decision', 'explanation'];
  const layerClearRate = Object.fromEntries(
    layerKeys.map((k) => [
      k,
      totalEvents === 0 ? 0 : rows.filter((r) => r.layerResults[k] === 'clear').length / totalEvents,
    ])
  ) as Record<LayerKey, number>;

  const assuranceRate = totalEvents === 0 ? 0 : byOutcome.ASSURED / totalEvents;

  return {
    totalEvents,
    byOutcome,
    byAction,
    sohDistribution,
    sohTrend,
    layerClearRate,
    assuranceRate,
    windowStart: windowStartIso(),
    windowEnd: AS_OF,
  };
}

function toDecisionEvent(r: GeneratedFleetEvent): DecisionEvent {
  return {
    id: r.id,
    timestampUtc: r.eventTimestampUtc,
    batteryId: r.batteryId,
    vehicleId: r.vehicleId,
    vehicleType: r.vehicleType,
    manufacturer: r.manufacturer,
    sohPct: r.sohPct,
    sohStatus: r.sohStatus,
    engineAction: r.engineAction,
    outcome: r.outcome,
    layerResults: r.layerResults,
    hasFullRecord: r.hasFullRecord,
  };
}

export async function getEvents(filters?: EventFilters): Promise<{
  rows: DecisionEvent[];
  total: number;
  page: number;
  pageSize: number;
}> {
  await Promise.resolve();
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 8;
  const filtered = applyFilters(getFleetRows(), filters);
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize).map(toDecisionEvent);
  return { rows: pageRows, total, page, pageSize };
}

export async function getAggregates(filters?: EventFilters): Promise<FleetAggregates> {
  await Promise.resolve();
  return computeAggregates(applyFilters(getFleetRows(), filters));
}

export async function getAlerts(): Promise<Alert[]> {
  await Promise.resolve();
  return buildAlerts();
}

export async function getVehicleHistory(vehicleId: string): Promise<DecisionEvent[]> {
  await Promise.resolve();
  return getFleetRows()
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.eventTimestampUtc).getTime() - new Date(a.eventTimestampUtc).getTime())
    .map(toDecisionEvent);
}

export { engineActionFromSoh, largestRemainderPercents, computeAggregates };
