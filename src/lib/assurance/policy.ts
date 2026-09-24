import type { EngineAction, LayerKey, LayerResult, Outcome, SohStatus } from '@/lib/data/types';

const THRESHOLDS = [60, 70, 80, 90] as const;
const BOUNDARY_PP = 2.0;

/** §7.4 policy band → engine action (demonstration fleet rows). */
export function engineActionFromSoh(sohPct: number): EngineAction {
  for (const t of THRESHOLDS) {
    if (Math.abs(sohPct - t) <= BOUNDARY_PP) {
      return 'ESCALATE_FOR_REVIEW';
    }
  }
  if (sohPct >= 90) return 'CONTINUE_OPERATION';
  if (sohPct >= 80) return 'CONTINUE_OPERATION';
  if (sohPct >= 70) return 'SCHEDULE_MAINTENANCE';
  if (sohPct >= 60) return 'REPLACE_BATTERY';
  return 'RETIRE_ASSET';
}

export function sohStatusFromPct(sohPct: number): SohStatus {
  if (sohPct >= 90) return 'EXCELLENT';
  if (sohPct >= 80) return 'GOOD';
  if (sohPct >= 70) return 'FAIR';
  if (sohPct >= 60) return 'REPLACEMENT REVIEW';
  return 'CRITICAL';
}

/** C2 / aggregate bin labels (§7.4 policy bands). */
export const SOH_BINS: { label: string; min: number; max: number }[] = [
  { label: '≥90% Excellent', min: 90, max: 100 },
  { label: '80–<90% Good', min: 80, max: 90 },
  { label: '70–<80% Noticeable wear', min: 70, max: 80 },
  { label: '60–<70% Significantly worn', min: 60, max: 70 },
  { label: '<60% End of useful life', min: 0, max: 60 },
];

export function sohBinLabel(sohPct: number): string {
  if (sohPct >= 90) return SOH_BINS[0]!.label;
  if (sohPct >= 80) return SOH_BINS[1]!.label;
  if (sohPct >= 70) return SOH_BINS[2]!.label;
  if (sohPct >= 60) return SOH_BINS[3]!.label;
  return SOH_BINS[4]!.label;
}

const SOH_BAND_BY_OUTCOME: Record<Outcome, [number, number]> = {
  ASSURED: [80, 96],
  'ASSURED WITH LIMITATIONS': [80, 94],
  'REVIEW REQUIRED': [72, 89],
  ESCALATE: [54, 79],
};

export function sohForOutcome(rng: () => number, outcome: Outcome): number {
  const [min, max] = SOH_BAND_BY_OUTCOME[outcome];
  const raw = floatInRange(rng, min, max);
  return Math.round(raw * 10) / 10;
}

function floatInRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function layerResultsForOutcome(outcome: Outcome): Record<LayerKey, LayerResult> {
  switch (outcome) {
    case 'ASSURED':
      return {
        input: 'clear',
        model: 'clear',
        policy: 'clear',
        decision: 'clear',
        explanation: 'clear',
      };
    case 'ASSURED WITH LIMITATIONS':
      return {
        input: 'clear',
        model: 'limitation',
        policy: 'clear',
        decision: 'clear',
        explanation: 'clear',
      };
    case 'REVIEW REQUIRED':
      return {
        input: 'clear',
        model: 'clear',
        policy: 'breach',
        decision: 'clear',
        explanation: 'review',
      };
    case 'ESCALATE':
      return {
        input: 'clear',
        model: 'clear',
        policy: 'clear',
        decision: 'breach',
        explanation: 'clear',
      };
  }
}
