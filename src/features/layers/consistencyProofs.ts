import type { DecisionRecord, LayerResult, TelemetryRow } from '@/lib/data/types';
import { formatVoltage } from '@/lib/format';

export interface ConsistencyProof {
  id: string;
  title: string;
  rule: string;
  observed: string;
  standard: 'AIS-156';
  result: LayerResult;
  /** True when both sides of the comparison are present in telemetry. */
  comparable: boolean;
}

function reading(rows: TelemetryRow[], param: string): number | null {
  const row = rows.find((item) => item.param === param);
  if (row?.value == null || row.value === '') return null;
  const value = Number(row.value);
  return Number.isFinite(value) ? value : null;
}

function cellSum(rows: TelemetryRow[]): number | null {
  let sum = 0;
  for (let index = 1; index <= 14; index += 1) {
    const value = reading(rows, `Cell ${String(index).padStart(2, '0')} Voltage`);
    if (value == null) return null;
    sum += value;
  }
  return sum;
}

function storedResult(record: DecisionRecord, id: string): LayerResult {
  return record.layers.input.checks.find((check) => check.id === id)?.result ?? 'unmeasured';
}

function signOf(value: number): 'negative' | 'positive' | 'zero' {
  if (value < 0) return 'negative';
  if (value > 0) return 'positive';
  return 'zero';
}

function powerObservation(current: number, power: number): string {
  const currentSign = signOf(current);
  const powerSign = signOf(power);
  if (currentSign === 'negative' && powerSign === 'negative') return 'Both negative (discharge mode)';
  if (currentSign === 'positive' && powerSign === 'positive') return 'Both positive (charge mode)';
  return `Current is ${currentSign}, power is ${powerSign}`;
}

export function consistencyProofs(record: DecisionRecord): ConsistencyProof[] {
  const rows = record.telemetry;
  const pack = reading(rows, 'Battery Pack Voltage');
  const sum = cellSum(rows);
  const current = reading(rows, 'Current');
  const power = reading(rows, 'Power');
  const packComparable = pack != null && sum != null;
  const powerComparable = current != null && power != null;

  return [
    {
      id: 'PACK-V-10',
      title: 'Pack Voltage vs Cell Sum',
      rule: 'Pack voltage must equal sum of Cell 01–14.',
      observed: packComparable ? `${formatVoltage(pack)} vs ${formatVoltage(sum)}` : 'Cell voltages or pack voltage were not supplied.',
      standard: 'AIS-156',
      result: packComparable ? storedResult(record, 'PACK-V-10') : 'unmeasured',
      comparable: packComparable,
    },
    {
      id: 'POWER-SIGN-06',
      title: 'Power Sign vs Current Sign',
      rule: 'Power sign must be consistent with current sign.',
      observed: powerComparable ? powerObservation(current, power) : 'Current or power was not supplied.',
      standard: 'AIS-156',
      result: powerComparable ? storedResult(record, 'POWER-SIGN-06') : 'unmeasured',
      comparable: powerComparable,
    },
  ];
}
