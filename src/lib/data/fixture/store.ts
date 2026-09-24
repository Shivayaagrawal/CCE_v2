import type { Alert, DecisionRecord } from '@/lib/data/types';
import { UC_CASES } from './cases';
import { alertTimestampUtc, buildFleet, type GeneratedFleetEvent } from './fleet';
import { mulberry32 } from './prng';
import { FLEET_SEED } from './config';

let fleetCache: GeneratedFleetEvent[] | null = null;

export function getFleetRows(): GeneratedFleetEvent[] {
  if (!fleetCache) {
    fleetCache = buildFleet();
  }
  return fleetCache;
}

export function getAllDecisionRecords(): DecisionRecord[] {
  return UC_CASES;
}

export function getRecordById(id: string): DecisionRecord | null {
  const row = getFleetRows().find((r) => r.id === id);
  if (row?.record) return row.record;
  return UC_CASES.find((c) => c.id === id) ?? null;
}

export function buildAlerts(): Alert[] {
  const rows = getFleetRows();
  const rng = mulberry32(FLEET_SEED ^ 0xa11e7);
  const escalations = rows.filter((r) => r.outcome === 'ESCALATE').slice(0, 2);
  const reviews = rows.filter((r) => r.outcome === 'REVIEW REQUIRED').slice(0, 2);
  const alerts: Alert[] = [];

  escalations.forEach((row, i) => {
    alerts.push({
      id: `ALERT-ESC-${i + 1}`,
      severity: 'critical',
      title: 'Escalation required',
      detail: `${row.id} on ${row.vehicleId} requires immediate review.`,
      timestampUtc: alertTimestampUtc(rng),
    });
  });

  reviews.forEach((row, i) => {
    alerts.push({
      id: `ALERT-REV-${i + 1}`,
      severity: 'warning',
      title: 'Review required',
      detail: `${row.id} flagged for human review (SoH ${row.sohPct}%).`,
      timestampUtc: alertTimestampUtc(rng),
    });
  });

  if (alerts.length < 3) {
    const infoRow = rows.find((r) => r.hasFullRecord) ?? rows[0]!;
    alerts.push({
      id: 'ALERT-INFO-1',
      severity: 'info',
      title: 'Demonstration fleet active',
      detail: `Pinned record ${infoRow.id} is available for full assurance drill-down.`,
      timestampUtc: alertTimestampUtc(rng),
    });
  }

  return alerts.slice(0, 5);
}
