import type { EngineAction, PolicyBand } from '@/lib/data/types';

const BAND_DEFS: Omit<PolicyBand, 'matched'>[] = [
  { min: 90, max: null, label: 'Excellent', ruleCode: 'SOH-CONT-10', action: 'CONTINUE_OPERATION', actionText: 'Continue operation' },
  { min: 80, max: 90, label: 'Good / Healthy', ruleCode: 'SOH-CONT-10', action: 'CONTINUE_OPERATION', actionText: 'Continue operation' },
  { min: 70, max: 80, label: 'Noticeable wear', ruleCode: 'SOH-MAINT-09', action: 'SCHEDULE_MAINTENANCE', actionText: 'Schedule maintenance' },
  { min: 60, max: 70, label: 'Significantly worn', ruleCode: 'SOH-REPLACE-07', action: 'REPLACE_BATTERY', actionText: 'Replace battery' },
  { min: null, max: 60, label: 'End of useful life', ruleCode: 'SOH-RETIRE-05', action: 'RETIRE_ASSET', actionText: 'Retire asset' },
  { min: null, max: null, label: 'Boundary risk', ruleCode: 'SOH-BOUNDARY-06', action: 'ESCALATE_FOR_REVIEW', actionText: 'Escalate for review' },
];

function matchesBand(soh: number, band: Omit<PolicyBand, 'matched'>): boolean {
  if (band.ruleCode === 'SOH-BOUNDARY-06') return false;
  const aboveMin = band.min === null || soh >= band.min;
  const belowMax = band.max === null || soh < band.max;
  return aboveMin && belowMax;
}

export function buildPolicyBands(sohPct: number): PolicyBand[] {
  return BAND_DEFS.map((b) => ({
    ...b,
    matched: matchesBand(sohPct, b),
  }));
}

export function matchedEngineAction(sohPct: number): EngineAction {
  const matched = BAND_DEFS.find((b) => b.ruleCode !== 'SOH-BOUNDARY-06' && matchesBand(sohPct, b));
  return matched?.action ?? 'CONTINUE_OPERATION';
}
