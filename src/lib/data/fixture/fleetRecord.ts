import type { DecisionRecord, FaithfulnessBand, LayerKey, LayerResult, RegulatoryRule } from '@/lib/data/types';
import { engineActionLabel } from '@/features/labels';
import { sohStatusLabel } from '@/features/labels';
import {
  buildDecisionLayer,
  buildExplanationLayer,
  buildInputLayer,
  buildModelLayer,
  buildPolicyLayer,
  countLayer,
} from './checks';
import type { GeneratedFleetEvent } from './fleet';
import { buildPolicyBands } from './policyBands';

const POLICY_SET = ['ChargeUp SOH.pdf', 'AIS-156', 'AIS-038', 'IEC 62660-1'];

function findingFor(key: LayerKey, row: GeneratedFleetEvent): string | null {
  if (row.layerResults[key] === 'clear') return null;
  if (key === 'model') return 'Incoming model version differs from the configured production release.';
  if (key === 'policy') return `${row.sohPct}% sits outside the assured operating band.`;
  if (key === 'decision') return 'The governed action needs a human review.';
  if (key === 'explanation') return 'The stated reason does not fully cover the governed outcome.';
  return 'This layer did not clear.';
}

function checkOverride(key: LayerKey, result: LayerResult, finding: string | null) {
  if (result === 'clear' || !finding) return {};
  const id =
    key === 'model' ? 'MOD-VER-01' : key === 'policy' ? 'SOH-OPER-02' : key === 'decision' ? 'DEC-CTX-01' : key === 'explanation' ? 'EXP-FAITH-02' : 'SOH-RANGE-01';
  return { [id]: { result, finding } };
}

function bandFor(result: LayerResult): FaithfulnessBand {
  if (result === 'clear') return 'Faithful';
  if (result === 'breach') return 'Not faithful';
  return 'Partially faithful';
}

export function recordFromFleetEvent(row: GeneratedFleetEvent, fleet: GeneratedFleetEvent[]): DecisionRecord {
  const status = sohStatusLabel(row.sohStatus);
  const action = engineActionLabel(row.engineAction);
  const inputFinding = findingFor('input', row);
  const modelFinding = findingFor('model', row);
  const policyFinding = findingFor('policy', row);
  const decisionFinding = findingFor('decision', row);
  const explanationFinding = findingFor('explanation', row);
  const explanationLayer = buildExplanationLayer(
    row.layerResults.explanation,
    explanationFinding ?? 'The stated reason matches the governed outcome.',
    explanationFinding,
    checkOverride('explanation', row.layerResults.explanation, explanationFinding)
  );
  const sameVehicle = fleet.filter((event) => event.vehicleId === row.vehicleId);
  const regulatory: RegulatoryRule[] = [
    { standard: 'AIS-156', scope: 'Deep-discharge prevention and OV/UV events', applies: true, result: 'clear' },
    { standard: 'AIS-038', scope: 'Cell imbalance and voltage spread', applies: true, result: row.layerResults.policy === 'breach' ? 'breach' : 'clear' },
    { standard: 'IEC 62660-1', scope: 'Thermal envelope', applies: true, result: 'clear' },
    { standard: 'ChargeUp SOH.pdf', scope: 'Operating band for this SoH', applies: true, result: row.sohPct < 80 ? 'breach' : 'clear' },
  ];
  const held = row.outcome === 'ESCALATE' || row.outcome === 'REVIEW REQUIRED';

  return {
    id: row.id,
    caseRef: null,
    timestampUtc: row.eventTimestampUtc,
    scenario: 'Fleet event',
    batteryId: row.batteryId,
    previousBatteryId: null,
    vehicleId: row.vehicleId,
    manufacturer: row.manufacturer,
    packConfiguration: '14S',
    outcome: row.outcome,
    action,
    businessAction: null,
    engineAction: row.engineAction,
    reason: `${row.id} on ${row.vehicleId} is ${row.sohPct}% SoH (${status}). The governed action is ${action}.`,
    soh: { value: row.sohPct, unit: '%', provenance: 'supplied', basis: 'Fleet event SoH' },
    sohStatus: row.sohStatus,
    sohPrevious: null,
    cycleCount: { value: null, unit: 'Cycles', provenance: 'not_measured' },
    pipelineLatencySeconds: { value: null, unit: 's', provenance: 'not_measured' },
    layers: {
      input: buildInputLayer(row.layerResults.input, inputFinding ?? 'Supplied fleet fields are structurally valid.', inputFinding, checkOverride('input', row.layerResults.input, inputFinding)),
      model: buildModelLayer(row.layerResults.model, modelFinding ?? 'Model identity matches the configured release.', modelFinding, checkOverride('model', row.layerResults.model, modelFinding)),
      policy: buildPolicyLayer(row.layerResults.policy, policyFinding ?? 'SoH is inside the operating band.', policyFinding, checkOverride('policy', row.layerResults.policy, policyFinding)),
      decision: buildDecisionLayer(row.layerResults.decision, decisionFinding ?? 'The action matches the governed evidence.', decisionFinding, checkOverride('decision', row.layerResults.decision, decisionFinding)),
      explanation: explanationLayer,
    },
    telemetry: [
      { param: 'SoH Percentage (Model Output)', value: String(row.sohPct), unit: '%', basis: 'Fleet event SoH', flagged: false },
      { param: 'SoH Status', value: row.sohStatus, unit: '—', basis: 'Derived from the SoH band', flagged: false },
    ],
    policyBands: buildPolicyBands(row.sohPct),
    regulatory,
    modelIdentity: {
      incomingVersion: row.layerResults.model === 'clear' ? 'DLL:V2' : 'DLL:V1',
      configuredProduction: 'DLL:V2',
      matches: row.layerResults.model === 'clear',
      manufacturer: row.manufacturer,
      assuranceEngine: 'CCE-v3.2',
      policySet: POLICY_SET,
    },
    suppliedModelCard: {
      entries: [
        { label: 'Architecture', value: 'Deep Learning Neural Network' },
        { label: 'Ensemble reference', value: 'XGBoost + LightGBM' },
      ],
      provenanceNote: 'Catalog card supplied with the fleet event. Cell-level telemetry was not retained.',
    },
    explanation: {
      externalExplanation: `${row.batteryId} is reported at ${row.sohPct}% SoH. The governed action is ${action}.`,
      externalSource: 'ChargeUp fleet event',
      band: bandFor(row.layerResults.explanation),
      bandRationale: explanationFinding ?? 'The stated reason matches the governed outcome.',
      checks: explanationLayer.checks,
      counts: countLayer(explanationLayer.checks),
      recommendation: null,
    },
    context: {
      totalDecisionsForVehicle: sameVehicle.length,
      replacementsOnVehicle: sameVehicle.filter((event) => event.engineAction === 'REPLACE_BATTERY').length,
      previousBatteryId: null,
      cycleCountAtAssessment: null,
      rulesTriggered: [],
      historyPoints: sameVehicle.slice(0, 6).map((event) => ({
        label: event.batteryId,
        sohPct: event.sohPct,
        decisionId: event.id,
      })),
    },
    escalation: {
      required: held,
      assignedTo: held ? 'Battery Asset Manager' : null,
      rolePlaceholder: held,
      basis: held ? 'This fleet event is held for a human.' : null,
    },
    hasFullRecord: true,
  };
}
