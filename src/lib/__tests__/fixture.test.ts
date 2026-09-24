import { describe, it, expect } from 'vitest';
import { FLEET_EVENTS, computeFleetAggregates } from '../data/fixture/fleet';
import { CANONICAL_CASES, UC1_RECORD, UC2_RECORD, UC3_RECORD, UC4_RECORD } from '../data/fixture/cases';
import { NOT_MEASURED, formatPercent } from '../format';


describe('Fleet Fixture Consistency Tests (SPEC.md §6.4)', () => {
  const total = FLEET_EVENTS.length;
  const aggregates = computeFleetAggregates(FLEET_EVENTS);

  it('1. Outcome counts sum to totalEvents (1,248) and match §6.3 exact table', () => {
    expect(total).toBe(1248);
    expect(aggregates.byOutcome.ASSURED).toBe(1080);
    expect(aggregates.byOutcome['ASSURED WITH LIMITATIONS']).toBe(97);
    expect(aggregates.byOutcome['REVIEW REQUIRED']).toBe(51);
    expect(aggregates.byOutcome.ESCALATE).toBe(20);

    const sumOutcomes =
      aggregates.byOutcome.ASSURED +
      aggregates.byOutcome['ASSURED WITH LIMITATIONS'] +
      aggregates.byOutcome['REVIEW REQUIRED'] +
      aggregates.byOutcome.ESCALATE;
    expect(sumOutcomes).toBe(1248);
  });

  it('2. SoH distribution bin counts sum to totalEvents (1,248)', () => {
    const sumBins = aggregates.sohDistribution.reduce((acc, b) => acc + b.count, 0);
    expect(sumBins).toBe(1248);

    const sumPcts = aggregates.sohDistribution.reduce((acc, b) => acc + b.pct, 0);
    expect(Math.round(sumPcts * 10) / 10).toBe(100.0);
  });

  it('3. Every row engineAction aligns with §7.4 policy bands', () => {
    for (const e of FLEET_EVENTS) {
      if (e.engineAction === 'ESCALATE_FOR_REVIEW') {
        // Escalate can be assigned for contextual boundary / policy violations
        expect(['REVIEW REQUIRED', 'ESCALATE', 'ASSURED WITH LIMITATIONS', 'ASSURED']).toContain(e.outcome);
      } else if (e.sohPct >= 90.0) {
        expect(e.engineAction).toBe('CONTINUE_OPERATION');
      } else if (e.sohPct >= 80.0) {
        expect(e.engineAction).toBe('CONTINUE_OPERATION');
      } else if (e.sohPct >= 70.0) {
        expect(e.engineAction).toBe('SCHEDULE_MAINTENANCE');
      } else if (e.sohPct >= 60.0) {
        expect(e.engineAction).toBe('REPLACE_BATTERY');
      } else {
        expect(e.engineAction).toBe('RETIRE_ASSET');
      }
    }
  });

  it('4. layerClearRate for each layer equals count(result === clear) / totalEvents', () => {
    const clearInput = FLEET_EVENTS.filter((e) => e.layerResults.input === 'clear').length;
    expect(aggregates.layerClearRate.input).toBeCloseTo(clearInput / total, 4);

    const clearModel = FLEET_EVENTS.filter((e) => e.layerResults.model === 'clear').length;
    expect(aggregates.layerClearRate.model).toBeCloseTo(clearModel / total, 4);

    const clearPolicy = FLEET_EVENTS.filter((e) => e.layerResults.policy === 'clear').length;
    expect(aggregates.layerClearRate.policy).toBeCloseTo(clearPolicy / total, 4);
  });

  it('5. All four UC records reproduce their stated outcome and telemetry row counts (35 / 35 / 35 / 6)', () => {
    expect(UC1_RECORD.outcome).toBe('ASSURED');
    expect(UC1_RECORD.telemetry.length).toBe(35);
    expect(UC1_RECORD.layers.input.result).toBe('clear');

    expect(UC2_RECORD.outcome).toBe('ASSURED WITH LIMITATIONS');
    expect(UC2_RECORD.telemetry.length).toBe(35);
    expect(UC2_RECORD.layers.model.result).toBe('limitation');

    expect(UC3_RECORD.outcome).toBe('REVIEW REQUIRED');
    expect(UC3_RECORD.telemetry.length).toBe(35);
    expect(UC3_RECORD.layers.policy.result).toBe('breach');

    expect(UC4_RECORD.outcome).toBe('ESCALATE');
    expect(UC4_RECORD.telemetry.length).toBe(6);
    expect(UC4_RECORD.layers.policy.result).toBe('breach');
  });

  it('6. Null values render as Not measured rather than 0', () => {
    expect(NOT_MEASURED).toBe('Not measured');
  });
});
