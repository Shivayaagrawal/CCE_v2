import type { DecisionRecord, RegulatoryRule, SuppliedModelCard } from '@/lib/data/types';
import {
  buildDecisionLayer,
  buildExplanationLayer,
  buildInputLayer,
  buildModelLayer,
  buildPolicyLayer,
  countLayer,
} from './checks';
import { buildPolicyBands } from './policyBands';
import { buildSharedTelemetry, buildUc4Telemetry } from './telemetry';

const POLICY_SET = ['ChargeUp SOH.pdf', 'AIS-156', 'AIS-038', 'IEC 62660-1'] as const;

const FAITHFUL_RATIONALE =
  'Every alignment check is clear: the stated reason matches the model output, the numbers, the governed decision and the policy applied.';
const PARTIAL_RATIONALE =
  'The stated reason is accurate as far as it goes, but at least one check found something it does not surface.';
const NOT_FAITHFUL_RATIONALE =
  'At least one alignment check found the stated reason contradicting the evidence or the governed decision.';

function sharedModelIdentity(incomingVersion: string, matches: boolean) {
  return {
    incomingVersion,
    configuredProduction: 'DLL:V2',
    matches,
    manufacturer: 'LG',
    assuranceEngine: 'CCE-v3.2',
    policySet: [...POLICY_SET],
  };
}

function sharedModelCard(): SuppliedModelCard {
  return {
    entries: [
      { label: 'Architecture', value: 'Deep Learning Neural Network' },
      { label: 'Ensemble reference', value: 'XGBoost + LightGBM' },
      { label: 'Accuracy (held-out test)', value: '97.87%' },
      { label: 'Accuracy at 365 days', value: '95.23%' },
    ],
    provenanceNote: 'Supplied by the source system. Not measured or verified by CCE. TODO: complete entry list',
  };
}

function regulatoryForCase(caseRef: 'UC1' | 'UC2' | 'UC3' | 'UC4'): RegulatoryRule[] {
  const base: RegulatoryRule[] = [
    { standard: 'AIS-156', scope: 'Deep-discharge prevention and OV/UV events', applies: true, result: 'clear' },
    { standard: 'AIS-038', scope: 'Cell imbalance ≤50 mV and ΔV inspection', applies: true, result: caseRef === 'UC3' ? 'breach' : 'clear' },
    { standard: 'IEC 62660-1', scope: 'Thermal envelope −20 to +60 °C', applies: true, result: 'clear' },
    { standard: 'ChargeUp SOH.pdf', scope: '80% replacement review and 60% critical floor', applies: true, result: caseRef === 'UC4' ? 'breach' : 'clear' },
  ];
  return base;
}

const UC1_EXPLANATION =
  'The State of Health (SoH) of a battery, estimated here at 85.37%, reflects the overall condition of the battery compared to when it was brand new. It essentially tells us how much of the battery\'s capacity remains usable. This value is strong, indicating the battery is in good health, but it has slightly aged due to wear and usage, which is normal for a battery with nearly 400 charge-discharge cycles. Key factors influencing SoH include temperature variations, voltage differences among cells, internal resistance, cycle count, and notable operational events like over-voltage or under-voltage occurrences. The absence of such events here suggests that the battery has been mostly operating under stable and controlled conditions. However, minor imbalances in cell voltages and measurable degradation in resistance point to slow natural aging.';

const UC2_EXPLANATION =
  'The explanation correctly describes the battery as 85.4% and in the Good range, but it does not surface that the prediction came from DLL V1 while the configured production version is DLL V2.';

const UC3_EXPLANATION =
  'The current 87.2% SoH remains inside the Good band, but the increase from the previous 85.4% reading is not the expected ageing direction. The cell imbalance is 64.97 mV, above the applicable 50 mV policy threshold.';

const UC4_EXPLANATION =
  'The new battery is showing 76.2% health after only 312 cycles. The ChargeUp policy threshold is 80% for replacement review. The same vehicle previously had battery BAT CU 14S 8842, which also showed abnormal degradation.';

function buildUc1(): DecisionRecord {
  const explanationChecks = buildExplanationLayer(
    'clear',
    'Explanation faithful & complete',
    null,
    {
      'EXP-NUM-03': { result: 'review', finding: 'Explanation cites 85.37% while telemetry SoH is 85.4%.' },
    }
  ).checks;
  const expCounts = countLayer(explanationChecks);

  return {
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
    reason:
      'All five assurance layers passed. The battery health reading (85.4%, Good) is within range, the approved model version (DLL:V2) was used, and all five policy checks passed against the ChargeUp and government standards. Nothing unusual was found in this vehicle\'s history, and the explanation matches the model output. This battery is fully assured.',
    soh: { value: 85.4, unit: '%', provenance: 'supplied', basis: 'Range: 0–100% | Good band: 80–<90%' },
    sohStatus: 'GOOD',
    sohPrevious: null,
    cycleCount: { value: 397, unit: 'Cycles', provenance: 'supplied' },
    pipelineLatencySeconds: { value: 0.42, unit: 's', provenance: 'measured' },
    layers: {
      input: buildInputLayer('clear', '10 of 10 Checks Passed', null),
      model: buildModelLayer('clear', '4 of 4 Checks Passed', null),
      policy: buildPolicyLayer('clear', '5 of 5 Checks Passed', null),
      decision: buildDecisionLayer('clear', 'No anomalous pattern detected', null),
      explanation: buildExplanationLayer('clear', 'Explanation faithful & complete', null, {
        'EXP-NUM-03': { result: 'review', finding: 'Explanation cites 85.37% while telemetry SoH is 85.4%.' },
      }),
    },
    telemetry: buildSharedTelemetry({ sohPct: '85.4', sohStatus: 'GOOD', modelVersion: 'DLL:V2' }),
    policyBands: buildPolicyBands(85.4),
    regulatory: regulatoryForCase('UC1'),
    modelIdentity: sharedModelIdentity('DLL:V2', true),
    suppliedModelCard: sharedModelCard(),
    explanation: {
      externalExplanation: UC1_EXPLANATION,
      externalSource: 'ChargeUp Digital Twin',
      band: 'Faithful',
      bandRationale: FAITHFUL_RATIONALE,
      checks: explanationChecks,
      counts: expCounts,
      recommendation: null,
    },
    context: {
      totalDecisionsForVehicle: 12,
      replacementsOnVehicle: 0,
      previousBatteryId: null,
      cycleCountAtAssessment: 397,
      rulesTriggered: [],
      historyPoints: [{ label: 'BAT-CU-14S-8842', sohPct: 85.4, decisionId: 'CRD-2026-UC1-001' }],
    },
    escalation: { required: false, assignedTo: null, rolePlaceholder: false, basis: null },
    hasFullRecord: true,
  };
}

function buildUc2(): DecisionRecord {
  const explanationLayer = buildExplanationLayer('review', 'Explanation does not surface the model-version mismatch.', 'Explanation does not surface the model-version mismatch.', {
    'EXP-FAITH-02': { result: 'review', finding: 'Does not state DLL V1 vs configured DLL V2.' },
    'EXP-CONTR-06': { result: 'review', finding: 'Omits prediction provenance mismatch.' },
    'EXP-RAT-08': { result: 'review', finding: 'Governance rationale incomplete on model version.' },
  });
  const expCounts = countLayer(explanationLayer.checks);

  return {
    id: 'CRD-2026-UC2-001',
    caseRef: 'UC2',
    timestampUtc: null,
    scenario: 'Model version differs from production',
    batteryId: 'BAT-CU-14S-8842',
    previousBatteryId: null,
    vehicleId: 'VEH-CU-4092',
    manufacturer: 'LG',
    packConfiguration: '14S',
    outcome: 'ASSURED WITH LIMITATIONS',
    action: 'ONE MODEL VERSION REVIEW',
    businessAction: 'Conditional warranty use after model-version review',
    engineAction: 'CONTINUE_OPERATION',
    reason:
      'The battery information still passes and the policy still passes. The limitation is prediction provenance: the result cannot be confirmed as generated by the approved production model. Credge therefore reduces assurance rather than blocking the battery.',
    soh: { value: 85.4, unit: '%', provenance: 'supplied' },
    sohStatus: 'GOOD',
    sohPrevious: null,
    cycleCount: { value: 397, unit: 'Cycles', provenance: 'supplied' },
    pipelineLatencySeconds: { value: null, unit: 's', provenance: 'not_measured' },
    layers: {
      input: buildInputLayer('clear', 'Same clean battery evidence as UC1.', null),
      model: buildModelLayer('limitation', 'Incoming DLL V1 does not match configured DLL V2.', 'Incoming DLL V1 does not match configured DLL V2.', {
        'MOD-VER-01': { result: 'limitation', finding: 'Incoming DLL V1 does not match configured DLL V2.' },
      }),
      policy: buildPolicyLayer('clear', 'Battery remains within policy and SoH remains in Good range.', null),
      decision: buildDecisionLayer('clear', 'Limitation is non-blocking; model-version review is required before important use.', null),
      explanation: explanationLayer,
    },
    telemetry: buildSharedTelemetry({ sohPct: '85.4', sohStatus: 'GOOD', modelVersion: 'DLL:V1' }),
    policyBands: buildPolicyBands(85.4),
    regulatory: regulatoryForCase('UC2'),
    modelIdentity: sharedModelIdentity('DLL:V1', false),
    suppliedModelCard: sharedModelCard(),
    explanation: {
      externalExplanation: UC2_EXPLANATION,
      externalSource: 'ChargeUp Digital Twin',
      band: 'Partially faithful',
      bandRationale: PARTIAL_RATIONALE,
      checks: explanationLayer.checks,
      counts: expCounts,
      recommendation: 'The explanation does not surface the model-version mismatch.',
    },
    context: {
      totalDecisionsForVehicle: 12,
      replacementsOnVehicle: 0,
      previousBatteryId: null,
      cycleCountAtAssessment: 397,
      rulesTriggered: [],
      historyPoints: [{ label: 'BAT-CU-14S-8842', sohPct: 85.4, decisionId: 'CRD-2026-UC2-001' }],
    },
    escalation: {
      required: true,
      assignedTo: 'Model Risk Reviewer',
      rolePlaceholder: true,
      basis: 'Model-version delta requires human review before important use.',
    },
    hasFullRecord: true,
  };
}

function buildUc3(): DecisionRecord {
  const explanationLayer = buildExplanationLayer('review', 'Explanation must surface the anomalous history and imbalance.', 'Explanation must surface the anomalous history and imbalance.', {
    'EXP-POL-05': { result: 'review', finding: 'Must surface 64.97 mV imbalance against 50 mV threshold.' },
    'EXP-GROUND-07': { result: 'review', finding: 'Anomalous SoH history should be grounded in payload.' },
    'EXP-RAT-08': { result: 'review', finding: 'Driving rationale should cover non-monotonic SoH movement.' },
  });
  const expCounts = countLayer(explanationLayer.checks);

  return {
    id: 'CRD-2026-UC3-001',
    caseRef: 'UC3',
    timestampUtc: null,
    scenario: 'Anomalous SoH history and cell imbalance breach',
    batteryId: 'BAT-CU-14S-8842',
    previousBatteryId: null,
    vehicleId: 'VEH-CU-4092',
    manufacturer: 'LG',
    packConfiguration: '14S',
    outcome: 'REVIEW REQUIRED',
    action: 'HOLD FOR HUMAN REVIEW',
    businessAction: 'Hold and investigate battery',
    engineAction: 'ESCALATE_FOR_REVIEW',
    reason:
      'The evidence is no longer clean enough to support an automatic decision. The SoH history has moved in an unexpected direction and cell imbalance has crossed the permitted policy threshold. Credge does not diagnose the physical cause; it requires investigation.',
    soh: { value: 87.2, unit: '%', provenance: 'supplied' },
    sohStatus: 'GOOD',
    sohPrevious: 85.4,
    cycleCount: { value: 397, unit: 'Cycles', provenance: 'supplied' },
    pipelineLatencySeconds: { value: null, unit: 's', provenance: 'not_measured' },
    layers: {
      input: buildInputLayer('clear', 'Current SoH remains numerically valid and the evidence is structurally usable.', null),
      model: buildModelLayer('clear', 'DLL V2 is the correct model version and current SoH is within 0–100%.', null),
      policy: buildPolicyLayer('breach', 'Cell imbalance 64.97 mV exceeds the 50 mV policy threshold.', 'Cell imbalance 64.97 mV exceeds the 50 mV policy threshold.', {
        'IMBAL-THRESH-02': { result: 'breach', finding: '64.97 mV exceeds 50 mV AIS-038 ceiling.' },
      }),
      decision: buildDecisionLayer('breach', 'SoH increased from 85.4% to 87.2%, contrary to expected ageing direction.', 'SoH increased from 85.4% to 87.2%, contrary to expected ageing direction.', {
        'DEC-CTX-01': { result: 'breach', finding: 'SoH moved against expected ageing direction.' },
      }),
      explanation: explanationLayer,
    },
    telemetry: buildSharedTelemetry({ sohPct: '87.2', sohStatus: 'GOOD', modelVersion: 'DLL:V2', flaggedImbalance: true }),
    policyBands: buildPolicyBands(87.2),
    regulatory: regulatoryForCase('UC3'),
    modelIdentity: sharedModelIdentity('DLL:V2', true),
    suppliedModelCard: sharedModelCard(),
    explanation: {
      externalExplanation: UC3_EXPLANATION,
      externalSource: 'ChargeUp Digital Twin',
      band: 'Partially faithful',
      bandRationale: PARTIAL_RATIONALE,
      checks: explanationLayer.checks,
      counts: expCounts,
      recommendation: null,
    },
    context: {
      totalDecisionsForVehicle: 12,
      replacementsOnVehicle: 0,
      previousBatteryId: null,
      cycleCountAtAssessment: 397,
      rulesTriggered: [
        { id: 'SOH-MONO-02', description: 'forecast_soh_pct > state_of_health_pct — physically impossible' },
      ],
      historyPoints: [
        { label: 'Prior reading', sohPct: 85.4, decisionId: 'CRD-2026-UC1-001' },
        { label: 'Current', sohPct: 87.2, decisionId: 'CRD-2026-UC3-001' },
      ],
    },
    escalation: {
      required: true,
      assignedTo: 'Battery Asset Manager',
      rolePlaceholder: true,
      basis: 'Policy and decision breaches require operational review.',
    },
    hasFullRecord: true,
  };
}

function buildUc4(): DecisionRecord {
  const explanationLayer = buildExplanationLayer('clear', 'The decision explanation identifies the vehicle-history context.', null);
  const expCounts = countLayer(explanationLayer.checks);

  return {
    id: 'CRD-2026-UC4-001',
    caseRef: 'UC4',
    timestampUtc: null,
    scenario: 'New battery repeats degradation pattern on same vehicle',
    batteryId: 'BAT-CU-14S-9031',
    previousBatteryId: 'BAT-CU-14S-8842',
    vehicleId: 'VEH-CU-4092',
    manufacturer: 'LG',
    packConfiguration: '14S',
    outcome: 'ESCALATE',
    action: 'VEHICLE INSPECTION',
    businessAction: 'Inspect vehicle root cause',
    engineAction: 'ESCALATE_FOR_REVIEW',
    reason:
      'The new battery has triggered a replacement-review concern, but vehicle history changes the decision context. A different battery is showing a concerning degradation pattern on the same vehicle. Credge therefore avoids automatically recommending another battery replacement and escalates for vehicle inspection.',
    soh: { value: 76.2, unit: '%', provenance: 'supplied' },
    sohStatus: 'REPLACEMENT REVIEW',
    sohPrevious: null,
    cycleCount: { value: 312, unit: 'Cycles', provenance: 'supplied' },
    pipelineLatencySeconds: { value: null, unit: 's', provenance: 'not_measured' },
    layers: {
      input: buildInputLayer('clear', 'The supplied scenario describes the new battery data as structurally valid.', null),
      model: buildModelLayer('clear', 'DLL V2 matches configured production version.', null),
      policy: buildPolicyLayer('breach', '76.2% is below the 80% replacement-review threshold.', '76.2% is below the 80% replacement-review threshold.', {
        'SOH-OPER-02': { result: 'breach', finding: '76.2% below 80% replacement-review threshold.' },
      }),
      decision: buildDecisionLayer('breach', 'A different battery repeats the degradation pattern on the same vehicle.', 'A different battery repeats the degradation pattern on the same vehicle.', {
        'DEC-REP-01': { result: 'breach', finding: 'Replacement battery repeats degradation on same vehicle.' },
      }),
      explanation: explanationLayer,
    },
    telemetry: buildUc4Telemetry(),
    policyBands: buildPolicyBands(76.2),
    regulatory: regulatoryForCase('UC4'),
    modelIdentity: sharedModelIdentity('DLL:V2', true),
    suppliedModelCard: sharedModelCard(),
    explanation: {
      externalExplanation: UC4_EXPLANATION,
      externalSource: 'ChargeUp Digital Twin',
      band: 'Faithful',
      bandRationale: FAITHFUL_RATIONALE,
      checks: explanationLayer.checks,
      counts: expCounts,
      recommendation: null,
    },
    context: {
      totalDecisionsForVehicle: 14,
      replacementsOnVehicle: 1,
      previousBatteryId: 'BAT-CU-14S-8842',
      cycleCountAtAssessment: 312,
      rulesTriggered: [
        { id: 'DEC-REP-01', description: 'A replacement battery repeats degradation on the same vehicle' },
        { id: 'SOH-UNVALIDATED-08', description: 'battery_age_months > 2 and forecast_horizon_days > 330' },
      ],
      historyPoints: [
        { label: 'BAT-CU-14S-8842', sohPct: 85.4, decisionId: 'CRD-2026-UC1-001' },
        { label: 'BAT-CU-14S-9031', sohPct: 76.2, decisionId: 'CRD-2026-UC4-001' },
      ],
    },
    escalation: {
      required: true,
      assignedTo: 'Head of Fleet Safety',
      rolePlaceholder: true,
      basis: 'Vehicle-level degradation pattern requires fleet safety review.',
    },
    hasFullRecord: true,
  };
}

export const UC_CASES: DecisionRecord[] = [buildUc1(), buildUc2(), buildUc3(), buildUc4()];

export const UC_CASE_IDS = UC_CASES.map((c) => c.id);
