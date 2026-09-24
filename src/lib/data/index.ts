import {
  DecisionRecord,
  DecisionEvent,
  EventFilters,
  FleetAggregates,
  Alert,
} from './types';
import { CANONICAL_CASES } from './fixture/cases';
import {
  FLEET_EVENTS,
  filterFleetEvents,
  computeFleetAggregates,
  FLEET_ALERTS,
} from './fixture/fleet';

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
  const filtered = filterFleetEvents(FLEET_EVENTS, filters);

  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 8;
  const startIndex = (page - 1) * pageSize;
  const pagedRows = filtered.slice(startIndex, startIndex + pageSize);

  return {
    rows: pagedRows,
    total: filtered.length,
    page,
    pageSize,
  };
}

export async function getAggregates(filters?: EventFilters): Promise<FleetAggregates> {
  await Promise.resolve();
  const filtered = filterFleetEvents(FLEET_EVENTS, filters);
  return computeFleetAggregates(filtered);
}

export async function getAlerts(): Promise<Alert[]> {
  await Promise.resolve();
  return FLEET_ALERTS;
}

export async function getVehicleHistory(vehicleId: string): Promise<DecisionEvent[]> {
  await Promise.resolve();
  return FLEET_EVENTS.filter((r) => r.vehicleId === vehicleId);
}

export * from './types';
export { FLEET_EVENTS, filterFleetEvents, computeFleetAggregates } from './fixture/fleet';
