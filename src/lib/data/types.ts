// ---------- vocabulary ----------
export type Outcome =
  | 'ASSURED'
  | 'ASSURED WITH LIMITATIONS'
  | 'REVIEW REQUIRED'
  | 'ESCALATE';

export type LayerResult = 'clear' | 'limitation' | 'review' | 'breach' | 'unmeasured';

export type LayerKey = 'input' | 'model' | 'policy' | 'decision' | 'explanation';

export type SohStatus =
  | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'REPLACEMENT REVIEW' | 'CRITICAL';

export type EngineAction =
  | 'CONTINUE_OPERATION' | 'SCHEDULE_MAINTENANCE' | 'REPLACE_BATTERY'
  | 'RETIRE_ASSET' | 'ESCALATE_FOR_REVIEW';

export type Provenance = 'measured' | 'supplied' | 'not_measured' | 'demonstration';

// ---------- atoms ----------
/** Every displayed value carries its provenance. Null means the source does not
 *  supply it — it is NEVER rendered as zero. */
export interface Value<T> {
  value: T | null;
  unit?: string;
  provenance: Provenance;
  /** The validity statement shown beneath or beside the value, verbatim from source. */
  basis?: string;
}

export interface Check {
  id: string;              // e.g. 'AIS-038-IMB'
  label: string;           // e.g. 'Cell Imbalance Standard'
  evaluates: string;       // one sentence, what it tests
  result: LayerResult;
  /** Present only when the check produced a finding. <= 120 chars. */
  finding: string | null;
}

export interface TelemetryRow {
  param: string;
  value: string | null;
  unit: string;
  basis: string;
  /** Set when this row is the subject of a failing check. */
  flagged: boolean;
}

// ---------- layers ----------
export interface Layer {
  key: LayerKey;
  index: 1 | 2 | 3 | 4 | 5;
  name: string;            // 'Input Assurance'
  purpose: string;         // from §2
  result: LayerResult;
  /** Short summary shown on the rail, e.g. '10 of 10 checks clear'. */
  summary: string;
  checks: Check[];
  finding: string | null;
}

// ---------- policy ----------
export interface PolicyBand {
  min: number | null;      // null = unbounded below
  max: number | null;      // null = unbounded above
  label: string;           // 'Good / Healthy'
  ruleCode: string;        // 'SOH-CONT-10'
  action: EngineAction;
  actionText: string;
  matched: boolean;
}

export interface RegulatoryRule {
  standard: string;        // 'AIS-156'
  scope: string;           // what it governs, one line
  applies: boolean;
  result: LayerResult;
}

// ---------- model ----------
export interface ModelIdentity {
  incomingVersion: string;        // 'DLL:V2'
  configuredProduction: string;   // 'DLL:V2'
  matches: boolean;
  manufacturer: string;           // 'LG'
  assuranceEngine: string;        // 'CCE-v3.2'
  policySet: string[];
}

/** Catalog specification supplied by the source system. NOT measured by CCE.
 *  Rendered as text under a provenance line. Never charted. */
export interface SuppliedModelCard {
  entries: { label: string; value: string }[];
  provenanceNote: string;
}

// ---------- explanation ----------
export type FaithfulnessBand = 'Faithful' | 'Partially faithful' | 'Not faithful';

export interface ExplanationAssessment {
  externalExplanation: string;
  externalSource: string;
  band: FaithfulnessBand;
  bandRationale: string;
  checks: Check[];
  counts: { clear: number; review: number; breach: number };
  recommendation: string | null;
}

// ---------- decision context ----------
export interface DecisionContext {
  totalDecisionsForVehicle: number;
  replacementsOnVehicle: number;
  previousBatteryId: string | null;
  cycleCountAtAssessment: number | null;
  rulesTriggered: { id: string; description: string }[];
  historyPoints: { label: string; sohPct: number | null; decisionId: string }[];
}

// ---------- escalation ----------
export interface Escalation {
  required: boolean;
  assignedTo: string | null;   // role name
  rolePlaceholder: boolean;    // true -> render '(provisional)'
  basis: string | null;
}

// ---------- the record ----------
export interface DecisionRecord {
  id: string;                  // 'CRD-2026-UC1-001'
  caseRef: 'UC1' | 'UC2' | 'UC3' | 'UC4' | null;  // null for generated fleet rows
  timestampUtc: string | null;
  scenario: string;
  batteryId: string;
  previousBatteryId: string | null;
  vehicleId: string;
  manufacturer: string;
  packConfiguration: string;   // '14S'
  outcome: Outcome;
  action: string;              // 'APPROVE WARRANTY — TIER 1 CLEARANCE'
  businessAction: string | null;
  engineAction: EngineAction;
  reason: string;
  soh: Value<number>;
  sohStatus: SohStatus;
  sohPrevious: number | null;
  cycleCount: Value<number>;
  pipelineLatencySeconds: Value<number>;
  layers: Record<LayerKey, Layer>;
  telemetry: TelemetryRow[];
  policyBands: PolicyBand[];
  regulatory: RegulatoryRule[];
  modelIdentity: ModelIdentity;
  suppliedModelCard: SuppliedModelCard;
  explanation: ExplanationAssessment;
  context: DecisionContext;
  escalation: Escalation;
  /** true for the four UC records, false for generated fleet rows. */
  hasFullRecord: boolean;
}

/** The light row used in tables and the fleet list. */
export interface DecisionEvent {
  id: string;
  timestampUtc: string;
  batteryId: string;
  vehicleId: string;
  vehicleType: VehicleType;
  manufacturer: string;
  sohPct: number;
  sohStatus: SohStatus;
  engineAction: EngineAction;
  outcome: Outcome;
  layerResults: Record<LayerKey, LayerResult>;
  hasFullRecord: boolean;
}

/** Vehicle categories. Derived from the `vehicle_type` field on the source
 *  vehicle record. These five are the closed set for this build. */
export type VehicleType =
  | 'Last Mile Delivery'
  | 'Intercity Cargo'
  | 'Passenger Shuttle'
  | 'Municipal Fleet'
  | 'Rental Pool';

/** The filter shape every accessor accepts. Omitted keys mean "no constraint".
 *  Arrays are OR within a key, AND across keys. */
export interface EventFilters {
  /** Inclusive ISO date bounds. Omit for the whole window. */
  from?: string;
  to?: string;
  vehicleTypes?: VehicleType[];
  manufacturers?: string[];
  outcomes?: Outcome[];
  engineActions?: EngineAction[];
  sohStatuses?: SohStatus[];
  /** SoH band filter, used by cross-filtering from the distribution chart. */
  sohBand?: { min: number; max: number };
  /** Free-text match against decision ID, battery ID and vehicle ID. */
  query?: string;
  /** Pagination. Defaults: page 1, pageSize 8 (§12). */
  page?: number;
  pageSize?: number;
  sort?: {
    column: 'timestampUtc' | 'sohPct' | 'outcome' | 'batteryId' | 'vehicleId';
    direction: 'asc' | 'desc';
  };
}

// ---------- aggregates ----------
export interface FleetAggregates {
  totalEvents: number;
  byOutcome: Record<Outcome, number>;
  byAction: Record<EngineAction, number>;
  sohDistribution: { bin: string; count: number; pct: number }[];
  sohTrend: { date: string; meanSohPct: number }[];
  layerClearRate: Record<LayerKey, number>;   // 0..1, DERIVED, never hardcoded
  assuranceRate: number;                       // share of ASSURED, DERIVED
  windowStart: string;
  windowEnd: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  detail: string;
  timestampUtc: string;
}
