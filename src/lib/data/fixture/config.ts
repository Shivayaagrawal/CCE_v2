/** Single as-of date for the demonstration fleet (SPEC §14.5). */
export const AS_OF = '2026-09-24T23:59:59.000Z';

export const FLEET_SEED = 20260924;
export const FLEET_EVENT_COUNT = 1248;
export const GENERATED_EVENT_COUNT = FLEET_EVENT_COUNT - 4;

export const OUTCOME_COUNTS = {
  ASSURED: 1080,
  'ASSURED WITH LIMITATIONS': 97,
  'REVIEW REQUIRED': 51,
  ESCALATE: 20,
} as const;

/** Generated-row outcome pool (four UC records supply one each). */
export const GENERATED_OUTCOME_COUNTS = {
  ASSURED: OUTCOME_COUNTS.ASSURED - 1,
  'ASSURED WITH LIMITATIONS': OUTCOME_COUNTS['ASSURED WITH LIMITATIONS'] - 1,
  'REVIEW REQUIRED': OUTCOME_COUNTS['REVIEW REQUIRED'] - 1,
  ESCALATE: OUTCOME_COUNTS.ESCALATE - 1,
} as const;
