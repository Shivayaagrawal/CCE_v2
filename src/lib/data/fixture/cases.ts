import { DecisionRecord, Layer, TelemetryRow, Check, PolicyBand, RegulatoryRule, SuppliedModelCard } from '../types';

export const SHARED_TELEMETRY_35: TelemetryRow[] = [
  { param: 'SoH Percentage (Model Output)', value: '85.4', unit: '%', basis: 'Range: 0–100% | Good band: 80–<90% | Replacement review below 80%', flagged: false },
  { param: 'SoH Status', value: 'GOOD', unit: '—', basis: 'ChargeUp classification; Good band 80–<90%', flagged: false },
  { param: 'Charge Cycle Count', value: '397', unit: 'Cycles', basis: 'Integer ≥ 0', flagged: false },
  { param: 'State of Charge (SoC)', value: '66.1', unit: '%', basis: 'Range: 0–100% | Deep-discharge risk below 10% (AIS-156)', flagged: false },
  { param: 'Current', value: '-20.7269', unit: 'A', basis: 'Negative = discharge (as supplied)', flagged: false },
  { param: 'Power', value: '-1059.7966', unit: 'W', basis: 'Sign must match current', flagged: false },
  { param: 'Cell Imbalance (std)', value: '0.06497', unit: 'V', basis: 'Digital Twin output | Threshold 0.05 V (50 mV)', flagged: true },
  { param: 'Internal Resistance (raw)', value: '-0.00792', unit: 'Ω', basis: 'As displayed, before CCE ABS preprocessing', flagged: false },
  { param: 'Internal Resistance (CCE)', value: '0.00792', unit: 'Ω', basis: 'Post-ABS; must be > 0', flagged: false },
  { param: 'Cell 01 Voltage', value: '3.8172', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 02 Voltage', value: '3.8142', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 03 Voltage', value: '3.8309', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 04 Voltage', value: '3.8212', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 05 Voltage', value: '3.8324', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 06 Voltage', value: '3.8266', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 07 Voltage', value: '3.8332', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 08 Voltage', value: '3.8333', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 09 Voltage', value: '3.9063', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 10 Voltage', value: '3.8408', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 11 Voltage', value: '3.821', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 12 Voltage', value: '3.8352', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 13 Voltage', value: '3.8379', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Cell 14 Voltage', value: '3.8956', unit: 'V', basis: 'Range: 2.5–4.2 V', flagged: false },
  { param: 'Max Cell Voltage (DT)', value: '4.0098', unit: 'V', basis: 'Digital Twin | Range: 2.5–4.2 V', flagged: false },
  { param: 'Min Cell Voltage (DT)', value: '3.779', unit: 'V', basis: 'Digital Twin | Range: 2.5–4.2 V', flagged: false },
  { param: 'Max–Min ΔV (DT)', value: '0.2309', unit: 'V', basis: 'Digital Twin | Inspection above 200 mV (AIS-038)', flagged: false },
  { param: 'Battery Pack Voltage', value: '53.7459', unit: 'V', basis: 'Range: 35.0–58.8 V (14S) | Should equal sum of 14 cells', flagged: false },
  { param: 'Over/Under Voltage Event', value: '0', unit: '—', basis: 'BMS fault flag; 0 = no breach (AIS-156)', flagged: false },
  { param: 'Max Cell Temperature', value: '32.32', unit: '°C', basis: 'Range: -20 to +60 °C discharge', flagged: false },
  { param: 'Min Cell Temperature', value: '30.28', unit: '°C', basis: 'Range: -20 to +60 °C discharge', flagged: false },
  { param: 'Cell Temp 01', value: '31.2', unit: '°C', basis: 'Within [min, max] cell temperature', flagged: false },
  { param: 'Cell Temp 02', value: '31.21', unit: '°C', basis: 'Within [min, max] cell temperature', flagged: false },
  { param: 'Cell Temp 03', value: '31.82', unit: '°C', basis: 'Within [min, max] cell temperature', flagged: false },
  { param: 'Model Version', value: 'DLL:V2', unit: '—', basis: 'Must equal configured production model', flagged: false },
  { param: 'Configured Production Model', value: 'DLL:V2', unit: '—', basis: 'Reference value', flagged: false },
];

export const UC4_TELEMETRY_6: TelemetryRow[] = [
  { param: 'SoH Percentage (Model Output)', value: '76.2', unit: '%', basis: 'Range: 0–100% | Good band: 80–<90% | Replacement review below 80%', flagged: false },
  { param: 'SoH Status', value: 'REPLACEMENT REVIEW', unit: '—', basis: 'ChargeUp classification; Good band 80–<90%', flagged: false },
  { param: 'Charge Cycle Count', value: '312', unit: 'Cycles', basis: 'Integer ≥ 0', flagged: false },
  { param: 'Model Version', value: 'DLL:V2', unit: '—', basis: 'Must equal configured production model', flagged: false },
  { param: 'Configured Production Model', value: 'DLL:V2', unit: '—', basis: 'Reference value', flagged: false },
  { param: 'Forecast Horizon', value: '365', unit: 'days', basis: 'Supplied for this scenario', flagged: false },
];

export const INPUT_CHECKS_CANONICAL: Check[] = [
  { id: 'SOH-RANGE-01', label: 'Output Range Validation', evaluates: 'SoH output within 0.0–100.0%', result: 'clear', finding: null },
  { id: 'CYCLE-03', label: 'Charge Cycle Count', evaluates: 'Cycle count is an integer ≥ 0 and within rated cycle life', result: 'clear', finding: null },
  { id: 'AIS-156-SOC', label: 'State of Charge (SoC)', evaluates: 'SoC ≥ 10.0% to prevent deep-discharge cell reversal', result: 'clear', finding: null },
  { id: 'CURR-DIR-05', label: 'Current Direction & Envelope', evaluates: 'Current sign aligns with operation; continuous C-rate limits', result: 'clear', finding: null },
  { id: 'POWER-SIGN-06', label: 'Power Sign & Identity Consistency', evaluates: 'Power sign matches current; P = V × I within tolerance', result: 'clear', finding: null },
  { id: 'AIS-038-IMB', label: 'Cell Imbalance Standard', evaluates: 'σ of the 14 cell voltages ≤ 0.050 V (50 mV)', result: 'clear', finding: null },
  { id: 'IR-POS-08', label: 'Internal Resistance Rectification', evaluates: 'Internal resistance strictly > 0 Ω post-rectification', result: 'clear', finding: null },
  { id: 'PACK-V-10', label: 'Pack Voltage vs Series Sum', evaluates: 'Pack voltage equals the sum of 14 cells; 35.00–58.80 V', result: 'clear', finding: null },
  { id: 'TEMP-RANGE-12', label: 'Thermal Spread & Limits', evaluates: 'All sensors within −20.0 to +60.0 °C discharge window', result: 'clear', finding: null },
  { id: 'OVUV-11', label: 'BMS Fault & Safety Triggers', evaluates: 'Latching over/under-voltage fault flags equal 0', result: 'clear', finding: null },
];

export const MODEL_CHECKS_CANONICAL: Check[] = [
  { id: 'MOD-RNG-01', label: 'Output Range Validation', evaluates: 'Predicted SoH within 0.0–100.0%', result: 'clear', finding: null },
  { id: 'MOD-CON-01', label: 'Output-to-Status Consistency', evaluates: 'Status label matches the numeric band (80–<90% = GOOD)', result: 'clear', finding: null },
  { id: 'MOD-VER-01', label: 'Model Identity & Version Gate', evaluates: 'Incoming model version equals configured production release', result: 'clear', finding: null },
  { id: 'MOD-FEA-01', label: 'Input Feature Availability', evaluates: 'All required battery features present, no missing vectors', result: 'clear', finding: null },
];

export const POLICY_CHECKS_CANONICAL: Check[] = [
  { id: 'SOH-OPER-02', label: 'SoH Operating Band Policy', evaluates: 'SoH against ChargeUp operating policy (≥80% Tier 1 clearance)', result: 'clear', finding: null },
  { id: 'IMBAL-THRESH-02', label: 'AIS-038 Cell Imbalance Limit', evaluates: 'Cell voltage imbalance against the statutory 50 mV ceiling', result: 'clear', finding: null },
  { id: 'DELTAV-INSPECT-03', label: 'Voltage Spread Inspection Threshold', evaluates: 'Max-to-min cell voltage spread < 200 mV', result: 'clear', finding: null },
  { id: 'OVUV-ALERT-04', label: 'BMS Fault Trigger Check', evaluates: 'Zero latching over/under-voltage breach events per AIS-156', result: 'clear', finding: null },
  { id: 'SOC-DEEPDIS-05', label: 'Deep-Discharge Prevention Rule', evaluates: 'SoC against the ≥10.0% deep-discharge safety floor (AIS-156)', result: 'clear', finding: null },
];

export function getPolicyBandsForSoh(sohPct: number): PolicyBand[] {
  return [
    { min: 90, max: null, label: 'Excellent', ruleCode: 'SOH-CONT-10', action: 'CONTINUE_OPERATION', actionText: 'Continue operation', matched: sohPct >= 90 },
    { min: 80, max: 90, label: 'Good / Healthy', ruleCode: 'SOH-CONT-10', action: 'CONTINUE_OPERATION', actionText: 'Continue operation', matched: sohPct >= 80 && sohPct < 90 },
    { min: 70, max: 80, label: 'Noticeable wear', ruleCode: 'SOH-MAINT-09', action: 'SCHEDULE_MAINTENANCE', actionText: 'Schedule maintenance', matched: sohPct >= 70 && sohPct < 80 },
    { min: 60, max: 70, label: 'Significantly worn', ruleCode: 'SOH-REPLACE-07', action: 'REPLACE_BATTERY', actionText: 'Replace battery', matched: sohPct >= 60 && sohPct < 70 },
    { min: null, max: 60, label: 'End of useful life', ruleCode: 'SOH-RETIRE-05', action: 'RETIRE_ASSET', actionText: 'Retire asset', matched: sohPct < 60 },
    { min: null, max: null, label: 'Boundary risk', ruleCode: 'SOH-BOUNDARY-06', action: 'ESCALATE_FOR_REVIEW', actionText: 'Escalate for review', matched: false },
  ];
}

export const REGULATORY_RULES_CANONICAL: RegulatoryRule[] = [
  { standard: 'AIS-156', scope: 'Deep-discharge prevention (SoC ≥ 10%) and latching BMS fault safety triggers', applies: true, result: 'clear' },
  { standard: 'AIS-038', scope: 'Cell voltage imbalance limit (≤ 50 mV) & max-min spread inspection (< 200 mV)', applies: true, result: 'clear' },
  { standard: 'IEC 62660-1', scope: 'Secondary lithium-ion cell thermal operating envelope (−20 °C to +60 °C)', applies: true, result: 'clear' },
  { standard: 'ChargeUp SOH.pdf', scope: 'Commercial operating policy: 80% replacement review, 60% critical floor', applies: true, result: 'clear' },
];

export const SUPPLIED_MODEL_CARD_CANONICAL: SuppliedModelCard = {
  entries: [
    { label: 'Architecture', value: 'Deep Learning Neural Network' },
    { label: 'Ensemble Reference', value: 'XGBoost + LightGBM' },
    { label: 'Training Accuracy Claim', value: '97.87% on held-out test data' },
    { label: 'Degradation Forecast Accuracy', value: '95.23% at 365 days' },
  ],
  provenanceNote: 'Supplied by the source system. Not measured or verified by CCE.',
};

export const UC1_RECORD: DecisionRecord = {
  id: 'CRD-2026-UC1-001',
  caseRef: 'UC1',
  timestampUtc: '2026-06-01T09:30:00Z',
  scenario: 'Clean evidence',
  batteryId: 'BAT-CU-14S-8842',
  previousBatteryId: null,
  vehicleId: 'VEH-CU-4092',
  manufacturer: 'LG',
  packConfiguration: '14S',
  outcome: 'ASSURED',
  action: 'APPROVE WARRANTY — TIER 1 CLEARANCE',
  businessAction: null,
  engineAction: 'CONTINUE_OPERATION',
  reason: 'All five assurance layers passed. The battery health reading (85.4%, Good) is within range, the approved model version (DLL:V2) was used, and all five policy checks passed against the ChargeUp and government standards. Nothing unusual was found in this vehicle\'s history, and the explanation matches the model output. This battery is fully assured.',
  soh: { value: 85.4, unit: '%', provenance: 'measured', basis: 'Range: 0–100% | Good band: 80–<90%' },
  sohStatus: 'GOOD',
  sohPrevious: null,
  cycleCount: { value: 397, unit: 'Cycles', provenance: 'measured', basis: 'Integer ≥ 0' },
  pipelineLatencySeconds: { value: 0.42, unit: 's', provenance: 'measured', basis: 'Pipeline latency' },
  layers: {
    input: { key: 'input', index: 1, name: 'Input Assurance', purpose: 'Verifies structural integrity, bounds, and electrical validity of all ingested telemetry vectors.', result: 'clear', summary: '10 of 10 Checks Passed', checks: INPUT_CHECKS_CANONICAL, finding: null },
    model: { key: 'model', index: 2, name: 'Model Assurance', purpose: 'Verifies model identity, production version alignment, and inference plausibility.', result: 'clear', summary: '4 of 4 Checks Passed', checks: MODEL_CHECKS_CANONICAL, finding: null },
    policy: { key: 'policy', index: 3, name: 'Policy Assurance', purpose: 'Evaluates statutory limits (AIS-156, AIS-038) and commercial battery replacement thresholds.', result: 'clear', summary: '5 of 5 Checks Passed', checks: POLICY_CHECKS_CANONICAL, finding: null },
    decision: { key: 'decision', index: 4, name: 'Decision Assurance', purpose: 'Detects contextual anomalies, historical degradation jumps, and repeated asset swaps.', result: 'clear', summary: 'No anomalous pattern detected', checks: [], finding: null },
    explanation: { key: 'explanation', index: 5, name: 'Explanation Assurance', purpose: 'Verifies natural language faithfulness against model outputs and governed decisions.', result: 'clear', summary: 'Explanation faithful & complete', checks: [], finding: null },
  },
  telemetry: SHARED_TELEMETRY_35,
  policyBands: getPolicyBandsForSoh(85.4),
  regulatory: REGULATORY_RULES_CANONICAL,
  modelIdentity: { incomingVersion: 'DLL:V2', configuredProduction: 'DLL:V2', matches: true, manufacturer: 'LG', assuranceEngine: 'CCE-v3.2', policySet: ['ChargeUp SOH.pdf', 'AIS-156', 'AIS-038', 'IEC 62660-1'] },
  suppliedModelCard: SUPPLIED_MODEL_CARD_CANONICAL,
  explanation: { externalExplanation: 'The State of Health (SoH) of a battery, estimated here at 85.37%, reflects the overall condition of the battery compared to when it was brand new...', externalSource: 'LLM Rationale Engine', band: 'Faithful', bandRationale: 'Every alignment check is clear', checks: [], counts: { clear: 8, review: 0, breach: 0 }, recommendation: null },
  context: { totalDecisionsForVehicle: 4, replacementsOnVehicle: 0, previousBatteryId: null, cycleCountAtAssessment: 397, rulesTriggered: [], historyPoints: [{ label: 'Assessment 1', sohPct: 92.1, decisionId: 'CRD-2026-HIST-001' }, { label: 'Assessment 2', sohPct: 89.4, decisionId: 'CRD-2026-HIST-002' }, { label: 'Assessment 3', sohPct: 87.8, decisionId: 'CRD-2026-HIST-003' }, { label: 'Current Assessment', sohPct: 85.4, decisionId: 'CRD-2026-UC1-001' }] },
  escalation: { required: false, assignedTo: null, rolePlaceholder: false, basis: null },
  hasFullRecord: true,
};

export const UC2_RECORD: DecisionRecord = {
  ...UC1_RECORD,
  id: 'CRD-2026-UC2-001',
  caseRef: 'UC2',
  timestampUtc: null,
  scenario: 'Model version differs from production',
  outcome: 'ASSURED WITH LIMITATIONS',
  action: 'ONE MODEL VERSION REVIEW',
  businessAction: 'Conditional warranty use after model-version review',
  reason: 'The battery information still passes and the policy still passes. The limitation is prediction provenance: the result cannot be confirmed as generated by the approved production model. Credge therefore reduces assurance rather than blocking the battery.',
  layers: {
    ...UC1_RECORD.layers,
    model: {
      ...UC1_RECORD.layers.model,
      result: 'limitation',
      summary: 'Incoming DLL V1 does not match configured DLL V2.',
      finding: 'Incoming model version DLL:V1 does not match configured DLL:V2',
      checks: MODEL_CHECKS_CANONICAL.map(c => c.id === 'MOD-VER-01' ? { ...c, result: 'limitation', finding: 'Incoming model version DLL:V1 does not match configured DLL:V2' } : c),
    },
    explanation: { ...UC1_RECORD.layers.explanation, result: 'review', summary: 'Explanation does not surface the model-version mismatch.', finding: 'Explanation does not surface model version mismatch' },
  },
  telemetry: SHARED_TELEMETRY_35.map(t => t.param === 'Model Version' ? { ...t, value: 'DLL:V1' } : t),
  modelIdentity: { ...UC1_RECORD.modelIdentity, incomingVersion: 'DLL:V1', matches: false },
  escalation: { required: true, assignedTo: 'Model Risk Reviewer', rolePlaceholder: true, basis: 'Model version mismatch DLL:V1 vs DLL:V2' },
};

export const UC3_RECORD: DecisionRecord = {
  ...UC1_RECORD,
  id: 'CRD-2026-UC3-001',
  caseRef: 'UC3',
  timestampUtc: null,
  scenario: 'Anomalous SoH history and cell imbalance breach',
  outcome: 'REVIEW REQUIRED',
  action: 'HOLD FOR HUMAN REVIEW',
  businessAction: 'Hold and investigate battery',
  engineAction: 'ESCALATE_FOR_REVIEW',
  reason: 'The evidence is no longer clean enough to support an automatic decision. The SoH history has moved in an unexpected direction and cell imbalance has crossed the permitted policy threshold. Credge does not diagnose the physical cause; it requires investigation.',
  soh: { value: 87.2, unit: '%', provenance: 'measured', basis: 'Range: 0–100% | Good band: 80–<90%' },
  sohPrevious: 85.4,
  policyBands: getPolicyBandsForSoh(87.2),
  regulatory: REGULATORY_RULES_CANONICAL.map(r => r.standard === 'AIS-038' ? { ...r, result: 'breach' } : r),
  layers: {
    ...UC1_RECORD.layers,
    policy: {
      ...UC1_RECORD.layers.policy,
      result: 'breach',
      summary: 'Cell imbalance 64.97 mV exceeds the 50 mV policy threshold.',
      finding: 'Cell imbalance 64.97 mV exceeds statutory 50 mV ceiling',
      checks: POLICY_CHECKS_CANONICAL.map(c => c.id === 'IMBAL-THRESH-02' ? { ...c, result: 'breach', finding: 'Cell imbalance 64.97 mV exceeds the 50 mV policy threshold' } : c),
    },
    decision: { ...UC1_RECORD.layers.decision, result: 'breach', summary: 'SoH increased from 85.4% to 87.2%, contrary to expected ageing direction.', finding: 'SoH increased from 85.4% to 87.2%' },
    explanation: { ...UC1_RECORD.layers.explanation, result: 'review', summary: 'Explanation must surface the anomalous history and imbalance.', finding: 'Explanation omits cell imbalance and inverted aging trajectory' },
  },
  telemetry: SHARED_TELEMETRY_35.map(t => t.param === 'SoH Percentage (Model Output)' ? { ...t, value: '87.2' } : t),
  context: {
    ...UC1_RECORD.context,
    rulesTriggered: [{ id: 'SOH-MONO-02', description: 'Forecast SoH increased against expected ageing direction' }],
  },
  escalation: { required: true, assignedTo: 'Battery Asset Manager', rolePlaceholder: true, basis: 'Cell imbalance 64.97 mV and inverted aging trajectory' },
};

export const UC4_RECORD: DecisionRecord = {
  ...UC1_RECORD,
  id: 'CRD-2026-UC4-001',
  caseRef: 'UC4',
  timestampUtc: null,
  scenario: 'New battery repeats degradation pattern on same vehicle',
  batteryId: 'BAT-CU-14S-9031',
  previousBatteryId: 'BAT-CU-14S-8842',
  outcome: 'ESCALATE',
  action: 'VEHICLE INSPECTION',
  businessAction: 'Inspect vehicle root cause',
  engineAction: 'ESCALATE_FOR_REVIEW',
  reason: 'The new battery has triggered a replacement-review concern, but vehicle history changes the decision context. A different battery is showing a concerning degradation pattern on the same vehicle. Credge therefore avoids automatically recommending another battery replacement and escalates for vehicle inspection.',
  soh: { value: 76.2, unit: '%', provenance: 'measured', basis: 'Range: 0–100% | Good band: 80–<90% | Replacement review below 80%' },
  sohStatus: 'REPLACEMENT REVIEW',
  sohPrevious: null,
  cycleCount: { value: 312, unit: 'Cycles', provenance: 'measured', basis: 'Integer ≥ 0' },
  policyBands: getPolicyBandsForSoh(76.2),
  regulatory: REGULATORY_RULES_CANONICAL.map(r => r.standard === 'ChargeUp SOH.pdf' ? { ...r, result: 'breach' } : r),
  layers: {
    ...UC1_RECORD.layers,
    policy: {
      ...UC1_RECORD.layers.policy,
      result: 'breach',
      summary: '76.2% is below the 80% replacement-review threshold.',
      finding: 'SoH 76.2% triggers replacement review (<80.0%)',
      checks: POLICY_CHECKS_CANONICAL.map(c => c.id === 'SOH-OPER-02' ? { ...c, result: 'breach', finding: '76.2% is below the 80% replacement-review threshold' } : c),
    },
    decision: { ...UC1_RECORD.layers.decision, result: 'breach', summary: 'A different battery repeats the degradation pattern on the same vehicle.', finding: 'Repeat degradation pattern across successive batteries on same vehicle' },
  },
  telemetry: UC4_TELEMETRY_6,
  context: {
    totalDecisionsForVehicle: 6,
    replacementsOnVehicle: 1,
    previousBatteryId: 'BAT-CU-14S-8842',
    cycleCountAtAssessment: 312,
    rulesTriggered: [
      { id: 'DEC-REP-01', description: 'A replacement battery repeats degradation on the same vehicle' },
      { id: 'SOH-UNVALIDATED-08', description: 'Forecast horizon 365 days exceeds 330 days' },
    ],
    historyPoints: [
      { label: 'Prev Bat 1', sohPct: 91.0, decisionId: 'CRD-2026-HIST-010' },
      { label: 'Prev Bat 2', sohPct: 85.4, decisionId: 'CRD-2026-HIST-011' },
      { label: 'New Bat 1', sohPct: 83.2, decisionId: 'CRD-2026-HIST-012' },
      { label: 'Current Assessment', sohPct: 76.2, decisionId: 'CRD-2026-UC4-001' },
    ],
  },
  escalation: { required: true, assignedTo: 'Head of Fleet Safety', rolePlaceholder: true, basis: 'Repeat degradation on vehicle VEH-CU-4092' },
};

export const CANONICAL_CASES: Record<string, DecisionRecord> = {
  'CRD-2026-UC1-001': UC1_RECORD,
  'CRD-2026-UC2-001': UC2_RECORD,
  'CRD-2026-UC3-001': UC3_RECORD,
  'CRD-2026-UC4-001': UC4_RECORD,
};

