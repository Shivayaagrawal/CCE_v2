import type { Check, Layer, LayerKey, LayerResult } from '@/lib/data/types';

type CheckDef = Omit<Check, 'result' | 'finding'>;

export const INPUT_CHECK_DEFS: CheckDef[] = [
  { id: 'SOH-RANGE-01', label: 'Output Range Validation', evaluates: 'SoH output within 0.0–100.0%' },
  { id: 'CYCLE-03', label: 'Charge Cycle Count', evaluates: 'Cycle count is an integer ≥ 0 and within rated cycle life' },
  { id: 'AIS-156-SOC', label: 'State of Charge (SoC)', evaluates: 'SoC ≥ 10.0% to prevent deep-discharge cell reversal' },
  { id: 'CURR-DIR-05', label: 'Current Direction & Envelope', evaluates: 'Current sign aligns with operation; continuous C-rate limits' },
  { id: 'POWER-SIGN-06', label: 'Power Sign & Identity Consistency', evaluates: 'Power sign matches current; P = V × I within tolerance' },
  { id: 'AIS-038-IMB', label: 'Cell Imbalance Standard', evaluates: 'σ of the 14 cell voltages ≤ 0.050 V (50 mV)' },
  { id: 'IR-POS-08', label: 'Internal Resistance Rectification', evaluates: 'Internal resistance strictly > 0 Ω post-rectification' },
  { id: 'PACK-V-10', label: 'Pack Voltage vs Series Sum', evaluates: 'Pack voltage equals the sum of 14 cells; 35.00–58.80 V' },
  { id: 'TEMP-RANGE-12', label: 'Thermal Spread & Limits', evaluates: 'All sensors within −20.0 to +60.0 °C discharge window' },
  { id: 'OVUV-11', label: 'BMS Fault & Safety Triggers', evaluates: 'Latching over/under-voltage fault flags equal 0' },
];

export const MODEL_CHECK_DEFS: CheckDef[] = [
  { id: 'MOD-RNG-01', label: 'Output Range Validation', evaluates: 'Predicted SoH within 0.0–100.0%' },
  { id: 'MOD-CON-01', label: 'Output-to-Status Consistency', evaluates: 'Status label matches the numeric band (80–<90% = GOOD)' },
  { id: 'MOD-VER-01', label: 'Model Identity & Version Gate', evaluates: 'Incoming model version equals configured production release' },
  { id: 'MOD-FEA-01', label: 'Input Feature Availability', evaluates: 'All required battery features present, no missing vectors' },
];

export const POLICY_CHECK_DEFS: CheckDef[] = [
  { id: 'SOH-OPER-02', label: 'SoH Operating Band Policy', evaluates: 'SoH against ChargeUp operating policy (≥80% Tier 1 clearance)' },
  { id: 'IMBAL-THRESH-02', label: 'AIS-038 Cell Imbalance Limit', evaluates: 'Cell voltage imbalance against the statutory 50 mV ceiling' },
  { id: 'DELTAV-INSPECT-03', label: 'Voltage Spread Inspection Threshold', evaluates: 'Max-to-min cell voltage spread < 200 mV' },
  { id: 'OVUV-ALERT-04', label: 'BMS Fault Trigger Check', evaluates: 'Zero latching over/under-voltage breach events per AIS-156' },
  { id: 'SOC-DEEPDIS-05', label: 'Deep-Discharge Prevention Rule', evaluates: 'SoC against the ≥10.0% deep-discharge safety floor (AIS-156)' },
];

export const DECISION_CHECK_DEFS: CheckDef[] = [
  { id: 'DEC-CTX-01', label: 'Contextual Action Alignment', evaluates: 'Recommended business action matches the governed evidence' },
  { id: 'SOH-BOUNDARY-06', label: 'Decision Boundary Proximity', evaluates: 'Distance from the nearest policy threshold vs. a 2.0 pp margin' },
  { id: 'DEC-REP-01', label: 'Repeat Action & Historical Context', evaluates: 'Whether a previous battery on the same vehicle showed the same pattern' },
];

export const EXPLANATION_CHECK_DEFS: CheckDef[] = [
  { id: 'EXP-AVAIL-01', label: 'Explanation Availability', evaluates: 'An explanation string was generated and provided' },
  { id: 'EXP-FAITH-02', label: 'Output Faithfulness', evaluates: 'The explanation accurately states the SoH percentage and status' },
  { id: 'EXP-NUM-03', label: 'Numerical Consistency', evaluates: 'Cycle count, voltages and temperatures in the text match ingested values' },
  { id: 'EXP-DEC-04', label: 'Decision Consistency', evaluates: 'The narrative supports the governed action' },
  { id: 'EXP-POL-05', label: 'Policy Consistency', evaluates: 'Rules, standards and thresholds are quoted correctly' },
  { id: 'EXP-CONTR-06', label: 'Contradiction Detection', evaluates: 'The explanation does not contradict telemetry, model identity or policy' },
  { id: 'EXP-GROUND-07', label: 'Evidence Grounding', evaluates: 'Material claims are grounded in ingested telemetry' },
  { id: 'EXP-RAT-08', label: 'Rationale Completeness', evaluates: 'The driving governance rationale is articulated, not just the raw prediction' },
];

export const CONTEXTUAL_RULE_DESCRIPTIONS: Record<string, string> = {
  'SOH-ERR-01': 'Upstream prediction is ERROR',
  'SOH-MONO-02': 'forecast_soh_pct > state_of_health_pct — physically impossible',
  'SOH-DEFAULT-03': 'Inputs left on pre-filled training averages (inputs_are_defaults == true)',
  'SOH-SAFE-04': 'thermal_anomalies_30d >= 2 and cycle_count > rated_cycles',
  'SOH-BOUNDARY-06': 'Reading within 2.0 pp of any policy threshold (60, 70, 80, 90%)',
  'SOH-UNVALIDATED-08': 'battery_age_months > 2 and forecast_horizon_days > 330',
  'DEC-REP-01': 'A replacement battery repeats degradation on the same vehicle',
};

function withResults(defs: CheckDef[], results: Record<string, { result: LayerResult; finding?: string | null }>): Check[] {
  return defs.map((d) => {
    const r = results[d.id] ?? { result: 'clear' as LayerResult, finding: null };
    return { ...d, result: r.result, finding: r.finding ?? null };
  });
}

function countLayer(checks: Check[]): { clear: number; review: number; breach: number } {
  return checks.reduce(
    (acc, c) => {
      if (c.result === 'clear') acc.clear += 1;
      else if (c.result === 'review') acc.review += 1;
      else if (c.result === 'breach' || c.result === 'limitation') {
        if (c.result === 'limitation') acc.review += 1;
        else acc.breach += 1;
      }
      return acc;
    },
    { clear: 0, review: 0, breach: 0 }
  );
}

function layerSummary(checks: Check[], result: LayerResult): string {
  const clear = checks.filter((c) => c.result === 'clear').length;
  if (result === 'clear') return `${clear} of ${checks.length} checks clear`;
  return `${clear} of ${checks.length} checks clear`;
}

export function buildLayer(
  key: LayerKey,
  index: 1 | 2 | 3 | 4 | 5,
  name: string,
  purpose: string,
  result: LayerResult,
  summary: string,
  checks: Check[],
  finding: string | null
): Layer {
  return { key, index, name, purpose, result, summary, checks, finding };
}

export function buildInputLayer(result: LayerResult, summary: string, finding: string | null, overrides: Record<string, { result: LayerResult; finding?: string | null }> = {}): Layer {
  const checks = withResults(INPUT_CHECK_DEFS, overrides);
  return buildLayer('input', 1, 'Input Assurance', 'Validate input data quality, ranges, mandatory fields and cross-input consistency', result, summary, checks, finding);
}

export function buildModelLayer(result: LayerResult, summary: string, finding: string | null, overrides: Record<string, { result: LayerResult; finding?: string | null }> = {}): Layer {
  const checks = withResults(MODEL_CHECK_DEFS, overrides);
  return buildLayer('model', 2, 'Model Assurance', 'Verify model identity and the integrity of its output', result, summary, checks, finding);
}

export function buildPolicyLayer(result: LayerResult, summary: string, finding: string | null, overrides: Record<string, { result: LayerResult; finding?: string | null }> = {}): Layer {
  const checks = withResults(POLICY_CHECK_DEFS, overrides);
  return buildLayer('policy', 3, 'Policy Assurance', 'Validate the decision against manufacturer and regulatory policy', result, summary, checks, finding);
}

export function buildDecisionLayer(result: LayerResult, summary: string, finding: string | null, overrides: Record<string, { result: LayerResult; finding?: string | null }> = {}): Layer {
  const checks = withResults(DECISION_CHECK_DEFS, overrides);
  return buildLayer('decision', 4, 'Decision Assurance', 'Test the recommended action against context, history and decision boundaries', result, summary, checks, finding);
}

export function buildExplanationLayer(result: LayerResult, summary: string, finding: string | null, overrides: Record<string, { result: LayerResult; finding?: string | null }> = {}): Layer {
  const checks = withResults(EXPLANATION_CHECK_DEFS, overrides);
  return buildLayer('explanation', 5, 'Explanation Assurance', 'Check the stated reason is faithful to the evidence and the governed decision', result, summary, checks, finding);
}

export { countLayer, withResults };
