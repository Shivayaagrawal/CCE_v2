import { describe, expect, it } from 'vitest';
import { getDecision } from '@/lib/data';
import { consistencyProofs } from './consistencyProofs';

describe('cross-input consistency examples', () => {
  it('quotes pack voltage against the cell sum for a full record', async () => {
    const record = await getDecision('CRD-2026-UC1-001');
    expect(record).not.toBeNull();
    const pack = consistencyProofs(record!).find((proof) => proof.id === 'PACK-V-10');
    expect(pack).toMatchObject({
      title: 'Pack Voltage vs Cell Sum',
      rule: 'Pack voltage must equal sum of Cell 01–14.',
      observed: '53.7459 V vs 53.7458 V',
      standard: 'AIS-156',
      result: 'clear',
      comparable: true,
    });
  });

  it('quotes a shared negative sign as discharge', async () => {
    const record = await getDecision('CRD-2026-UC1-001');
    const power = consistencyProofs(record!).find((proof) => proof.id === 'POWER-SIGN-06');
    expect(power).toMatchObject({
      title: 'Power Sign vs Current Sign',
      rule: 'Power sign must be consistent with current sign.',
      observed: 'Both negative (discharge mode)',
      standard: 'AIS-156',
      result: 'clear',
      comparable: true,
    });
  });

  it('does not invent a comparison when cells and power were not supplied', async () => {
    const record = await getDecision('CRD-2026-UC4-001');
    const proofs = consistencyProofs(record!);
    expect(proofs.every((proof) => proof.comparable === false)).toBe(true);
    expect(proofs.every((proof) => proof.result === 'unmeasured')).toBe(true);
  });
});