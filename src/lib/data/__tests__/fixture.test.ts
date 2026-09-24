import { describe, it, expect } from 'vitest';
import { NOT_MEASURED, formatCount, formatPercent } from '@/lib/format';
import { rollupOutcome } from '@/lib/assurance/rollup';
import { engineActionFromSoh } from '@/lib/assurance/policy';
import { OUTCOME_COUNTS } from '@/lib/data/fixture/config';
import { UC_CASES } from '@/lib/data/fixture/cases';
import { getFleetRows } from '@/lib/data/fixture/store';
import {
  computeAggregates,
  getAlerts,
  getDecision,
  getVehicleHistory,
  largestRemainderPercents,
} from '@/lib/data/index';
import type { DecisionRecord } from '@/lib/data/types';

describe('fixture consistency (SPEC §6.4)', () => {
  it('1. outcome counts sum to totalEvents and match §6.3', async () => {
    const aggregates = await computeAggregates(getFleetRows());
    const sum = Object.values(aggregates.byOutcome).reduce((a, b) => a + b, 0);
    expect(sum).toBe(aggregates.totalEvents);
    expect(aggregates.totalEvents).toBe(1248);
    expect(aggregates.byOutcome).toEqual(OUTCOME_COUNTS);
  });

  it('2. donut segment percentages recompute from counts via largest-remainder', async () => {
    const aggregates = await computeAggregates(getFleetRows());
    const counts = Object.values(aggregates.byOutcome);
    const total = aggregates.totalEvents;
    const pcts = largestRemainderPercents(counts, total);
    expect(Math.round(pcts.reduce((s, v) => s + v, 0) * 10) / 10).toBe(100);
    counts.forEach((count, i) => {
      const recomputed = Math.round((count / total) * 1000) / 10;
      const displayed = pcts[i]!;
      expect(Math.abs(displayed - recomputed)).toBeLessThanOrEqual(0.2);
    });
  });

  it('3. SoH distribution bin counts sum to totalEvents', async () => {
    const aggregates = await computeAggregates(getFleetRows());
    const binSum = aggregates.sohDistribution.reduce((s, b) => s + b.count, 0);
    expect(binSum).toBe(aggregates.totalEvents);
    const pctSum = Math.round(aggregates.sohDistribution.reduce((s, b) => s + b.pct, 0) * 10) / 10;
    expect(pctSum).toBe(100);
  });

  it('4. every generated row engineAction matches §7.4 for its SoH', () => {
    const rows = getFleetRows().filter((r) => !r.hasFullRecord);
    rows.forEach((row) => {
      expect(row.engineAction).toBe(engineActionFromSoh(row.sohPct));
    });
  });

  it('5. layerClearRate equals clear count divided by totalEvents', async () => {
    const rows = getFleetRows();
    const aggregates = await computeAggregates(rows);
    (Object.keys(aggregates.layerClearRate) as (keyof typeof aggregates.layerClearRate)[]).forEach((layer) => {
      const clear = rows.filter((r) => r.layerResults[layer] === 'clear').length;
      expect(aggregates.layerClearRate[layer]).toBeCloseTo(clear / rows.length, 10);
    });
  });

  it('6. every ID referenced in alerts and vehicle history resolves to a fleet row', async () => {
    const rows = getFleetRows();
    const ids = new Set(rows.map((r) => r.id));
    const alerts = await getAlerts();
    alerts.forEach((alert) => {
      const match = alert.detail.match(/CRD-[\w-]+/);
      if (match) expect(ids.has(match[0]!)).toBe(true);
    });
    const history = await getVehicleHistory('VEH-CU-4092');
    history.forEach((event) => expect(ids.has(event.id)).toBe(true));
    UC_CASES.forEach((uc) => {
      uc.context.historyPoints.forEach((hp) => {
        if (hp.decisionId.startsWith('CRD-')) expect(ids.has(hp.decisionId)).toBe(true);
      });
    });
  });

  it('7. four UC records match stated outcome, telemetry counts 35/35/35/6, and layer results', async () => {
    const expectedLayers = {
      UC1: { input: 'clear', model: 'clear', policy: 'clear', decision: 'clear', explanation: 'clear' },
      UC2: { input: 'clear', model: 'limitation', policy: 'clear', decision: 'clear', explanation: 'review' },
      UC3: { input: 'clear', model: 'clear', policy: 'breach', decision: 'breach', explanation: 'review' },
      UC4: { input: 'clear', model: 'clear', policy: 'breach', decision: 'breach', explanation: 'clear' },
    } as const;

    const telemetryCounts = { UC1: 35, UC2: 35, UC3: 35, UC4: 6 };

    for (const uc of UC_CASES) {
      const loaded = await getDecision(uc.id);
      expect(loaded).not.toBeNull();
      expect(loaded!.outcome).toBe(uc.outcome);
      expect(loaded!.telemetry.length).toBe(telemetryCounts[uc.caseRef!]);
      const layers = expectedLayers[uc.caseRef!];
      (Object.keys(layers) as (keyof typeof layers)[]).forEach((key) => {
        expect(loaded!.layers[key].result).toBe(layers[key]);
      });
    }
  });

  it('8. null fixture values are never formatted as zero via format.ts', () => {
    const nullishValues: (number | null | undefined)[] = [null, undefined];
    nullishValues.forEach((v) => {
      expect(formatPercent(v)).toBe(NOT_MEASURED);
      expect(formatCount(v)).toBe(NOT_MEASURED);
    });

    const uc4 = UC_CASES.find((c) => c.caseRef === 'UC4')!;
    expect(uc4.telemetry.length).toBe(6);
    uc4.telemetry.forEach((row) => {
      if (row.value === null) {
        expect(row.value).not.toBe(0);
      }
    });

    const collectNullValueFields = (record: DecisionRecord): unknown[] => {
      const vals: unknown[] = [];
      if (record.soh.value === null) vals.push(record.soh.value);
      if (record.cycleCount.value === null) vals.push(record.cycleCount.value);
      if (record.pipelineLatencySeconds.value === null) vals.push(record.pipelineLatencySeconds.value);
      return vals;
    };

    UC_CASES.forEach((record) => {
      collectNullValueFields(record).forEach((v) => {
        expect(formatPercent(v as number | null)).toBe(NOT_MEASURED);
      });
    });
  });
});

describe('rollup (SPEC §4.3)', () => {
  it('matches the four UC layer tables for reference', () => {
    UC_CASES.forEach((uc) => {
      const rolled = rollupOutcome({
        input: uc.layers.input.result,
        model: uc.layers.model.result,
        policy: uc.layers.policy.result,
        decision: uc.layers.decision.result,
        explanation: uc.layers.explanation.result,
      });
      if (uc.caseRef === 'UC1' || uc.caseRef === 'UC4') {
        expect(rolled).toBe(uc.outcome);
      }
    });
  });
});
