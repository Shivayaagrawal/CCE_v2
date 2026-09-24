import type { EngineAction, Outcome } from '@/lib/data/types';

export const OUTCOME_FILL: Record<Outcome, string> = {
  ASSURED: '#157F52',
  'ASSURED WITH LIMITATIONS': '#B07D00',
  'REVIEW REQUIRED': '#FF6A00',
  ESCALATE: '#FF1F1F',
};

export const ACTION_FILL: Record<EngineAction, string> = {
  CONTINUE_OPERATION: '#2A78D6',
  SCHEDULE_MAINTENANCE: '#EB6834',
  REPLACE_BATTERY: '#1BAF7A',
  RETIRE_ASSET: '#EDA100',
  ESCALATE_FOR_REVIEW: '#FF1F1F',
};

/** Ordinal SoH bins, starting at sequential step 250. */
export const SOH_BIN_FILLS = ['#86B6EF', '#5598E7', '#2A78D6', '#1C5CAB', '#104281'];

export const SEQ_BAR = ['#CDE2FB', '#B7D3F6', '#9EC5F4', '#86B6EF', '#6DA7EC', '#5598E7', '#3987E5', '#2A78D6', '#256ABF', '#1C5CAB', '#184F95', '#104281', '#0D366B', '#0D366B'];

export const LAYER_RESULT_MARK: Record<string, string> = {
  clear: '#157F52',
  limitation: '#B07D00',
  review: '#FF6A00',
  breach: '#FF1F1F',
  unmeasured: '#8A94A3',
};
