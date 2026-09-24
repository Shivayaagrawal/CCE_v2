# CCE Decision Assurance Dashboard — Build Specification

**Version** 1.2 · **Date** 24 September 2026 · **Status** Approved to build · Phase 0.0 merged
**Owners** Yokesh (Track A) · Shivanya (Track B)
**Repo** `github.com/Shivayaagrawal/CCE_v2` · **Dev port** 3002

---

## 0. How to use this document

This is the single source of truth. Both developers build from it. The rules:

1. **No design decision is made in a screen file.** Colours, spacing, type sizes, motion durations, copy strings and status logic all come from here. If something is missing, it gets added *here first*, then used.
2. **No number is invented.** Every value on every screen traces to §6 (the fixture) or is derived from it at runtime. If you cannot trace a number, it does not go on screen.
3. **No two people edit the same file.** §16 is the ownership map. It is binding.
4. **If this document and a mockup screenshot disagree, this document wins.** §3 explains why.
5. When you finish a screen, run the checklist in §19 before opening a PR.

**This document is self-contained.** The appendices at the end carry the complete source data — all four decision records, every telemetry row, all 30 check definitions, the roles matrix. You do not need any other file to build from, with one exception noted in Appendix C. Sections 1–21 are the rules; the appendices are the data.

---

## 1. Goal, scope and non-goals

### 1.1 Goal

A six-screen enterprise dashboard showing every decision the CCE engine assured for ChargeUp's battery fleet, and the evidence behind each one. It must read as a purchased enterprise product, not a prototype: dense, calm, fast, and visually precise.

### 1.2 In scope (round one)

| # | Route | Screen |
|---|---|---|
| 0 | `/` | Decision Events Dashboard (fleet overview) |
| 1 | `/decisions/[id]/input` | Input Assurance |
| 2 | `/decisions/[id]/model` | Model Assurance |
| 3 | `/decisions/[id]/policy` | Policy Assurance |
| 4 | `/decisions/[id]/decision` | Decision Assurance |
| 5 | `/decisions/[id]/explanation` | Explanation Assurance |

### 1.3 Out of scope (round one)

Reports, Alerts detail, Settings, "View all decision events" list page. These render in the navigation and as links, **visibly disabled** with a `Coming soon` affordance. They are not stubs that 404.

### 1.4 Non-goals — state these out loud so nobody drifts

- Not a BI tool. No query builder, no pivot, no drag-and-drop, no custom chart creation.
- Not live. All data is hardcoded and static. No polling, no websockets, no simulated feed.
- Not responsive to mobile. Design target 1920×1080; must work correctly down to 1440×900; degrade acceptably to 1280×800. No tablet or phone layouts.
- Not a redesign. Panel positions, panel order and information density match the mockups.
- No dark mode.

### 1.5 The density rule — read this twice

The reference mockups are **dense on purpose**. Do not add whitespace. Do not increase padding to "let it breathe". Do not drop panels to reduce clutter.

Where a screen feels crowded, the fix is to **remove chrome, never to add space**: lighter dividers instead of borders, one rule line instead of a boxed container, gridlines at 8% opacity instead of 20%, labels that don't repeat the panel header, and icons only where they carry meaning. Same information, same footprint, less noise.

---

## 2. Product context

CCE (Credge Clarity Engine) is an **independent assurance layer**. It does not make the battery decision — an upstream system does. CCE takes that decision plus its evidence and runs it through five assurance layers, then issues an assurance outcome and, where needed, routes it to a named human owner.

The critical framing for every screen: **CCE verifies; it does not predict.** State of Health arrives as an input. CCE checks that the input is valid, that the model that produced it is the approved one, that the result complies with manufacturer and regulatory policy, that the recommended action fits the asset's history, and that the stated explanation is faithful to the evidence.

The five layers, in fixed order:

| # | Layer | Identifier | What it does |
|---|---|---|---|
| 1 | Input Assurance | `input` | Validate input data quality, ranges, mandatory fields and cross-input consistency |
| 2 | Model Assurance | `model` | Verify model identity and the integrity of its output |
| 3 | Policy Assurance | `policy` | Validate the decision against manufacturer and regulatory policy |
| 4 | Decision Assurance | `decision` | Test the recommended action against context, history and decision boundaries |
| 5 | Explanation Assurance | `explanation` | Check the stated reason is faithful to the evidence and the governed decision |

Source: `ui-next/src/app/chargeup/vocab.ts:182-213`.

> **IP note.** The internal ordering rationale of the pipeline is under patent review. This document describes the five layers as they appear to a user. Do not publish internal step-ordering rationale outward without founder clearance.

---

## 3. Ground truth — the mockups vs. the engine

The six reference mockups were drawn before the engine was audited. Five of their panels are backed by nothing. This section is the binding resolution. **Layout comes from the mockups; data and semantics come from the engine.**

### 3.1 What does not exist

Verified against `CONTEXT_EXTRACT.md`. **Section numbers in the Source column below refer to that file, not to this one.**

| Mockup element | Finding | Source (CONTEXT_EXTRACT.md) |
|---|---|---|
| "SoH DL Model v1.0", "Deep Learning (LSTM)", trained Feb 2024 | No ML model in the codebase. No weights, no `.pkl`/`.onnx`, no inference code. SoH is an **input payload field**. | §6, §12.1 |
| MAE 2.31 · RMSE 3.32 · MAPE 4.15 · R² 0.89 · Prediction Coverage 98.6% | Invented for the mockup. No evaluation run exists. | §6, §12.1 |
| Actual vs Predicted (Holdout Set) scatter | No holdout set exists. | §6 |
| Faithfulness "60% — Partially Faithful" gauge | Explicitly invented. `EventDetail.tsx:2001` states: *"The mockup showed a 60% faithfulness score. It was invented, and CCE has no calibrated score to put there."* | §7.3, §12.2 |
| Execution Time badges (125/128/96/148/112 ms) | Per-layer timing is not measured. Only total pipeline latency is recorded. | §3.3, §12.5 |
| "Anomaly Score (Contextual): Medium" | No continuous anomaly score exists. Detection is deterministic boolean rules. | §7.1, §12.3 |
| 1,248 events · 92.7% pass rate · per-layer pass rates 98.1/96.3/97.2/93.8/91.2% | No fleet dataset exists. Four demonstration records exist. | §12.4, §12.8 |
| Battery B001 · Vehicle V001 · 67% SoH · Li-ion (NMC) · 50 Ah · 48 V | Does not exist. Real asset is BAT-CU-14S-8842 / VEH-CU-4092, a 14S pack, manufacturer LG. | §1.1 |
| PASS / REVIEW / FAIL badge vocabulary | Superseded. See §4. | §2.1, §2.2 |

### 3.2 The resolution — panel by panel

Every panel keeps its grid position, its size and its role. Only its contents change.

| Screen | Mockup panel | Becomes |
|---|---|---|
| Model | Model Information card | **Model Identity** — Model Version `DLL:V2`, Configured Production Model `DLL:V2`, match state, manufacturer `LG`, assurance engine `CCE-v3.2`, policy set. All real. |
| Model | Model Quality Checks (8 generic) | **Model Assurance Checks** — the 4 real checks: `MOD-RNG-01`, `MOD-CON-01`, `MOD-VER-01`, `MOD-FEA-01`, each with ID, label, what it evaluates, result. |
| Model | Model Performance (holdout metrics) | **Model Card — as supplied by source system.** Carries the client-supplied catalog specifications verbatim, under a mandatory provenance line: *"Supplied by the source system. Not measured or verified by CCE."* Values are shown as text, never as CCE-computed metrics, and never in a chart. |
| Model | Actual vs Predicted scatter | **Cell Voltage Distribution** — the 14 real cell voltages as a column chart with the 2.50–4.20 V valid band shaded, the pack mean drawn, and the imbalance σ annotated against the 50 mV AIS-038 limit. Real, and a stronger visual than the scatter. |
| Explanation | Faithfulness 60% gauge | **Faithfulness Band** — a three-stop segmented meter reading `Faithful` / `Partially faithful` / `Not faithful`, derived from the eight `EXP-*` checks. No number. |
| Explanation | Explanation Alignment Checks | The 8 real checks: `EXP-AVAIL-01`, `EXP-FAITH-02`, `EXP-NUM-03`, `EXP-DEC-04`, `EXP-POL-05`, `EXP-CONTR-06`, `EXP-GROUND-07`, `EXP-RAT-08`. |
| Explanation | Explanation Summary (Faithfulness Score 60%, Missing Factors 3, Overstated 1) | **Check Roll-up** — counts of checks clear / review / breach, plus the named band. All derived. |
| Decision | Anomaly Score: Medium | **Rules Triggered** — the actual rule IDs that fired for this record, e.g. `DEC-REP-01`, `SOH-BOUNDARY-06`, with one-line descriptions. |
| Decision | Historical Pattern Comparison | Kept, driven by real UC4 data: this vehicle's two batteries, their cycle counts and SoH at assessment. |
| All detail | Execution Time badge per layer | **Removed from layers.** Total pipeline latency appears **once**, in the decision header, labelled `Pipeline latency`. It is the only timing figure that is measured. |
| Overview | 1,248 events and all aggregates | **Demonstration fleet**, generated per §6.3, carrying the source file's own disclaimer (§14.4). The four UC records are real and pinned. |

### 3.3 The provenance rule

Every figure on every screen falls into exactly one of four classes, and the class is visible in the UI:

| Class | Meaning | UI treatment |
|---|---|---|
| **Measured** | Produced by CCE at decision time | No annotation needed |
| **Supplied** | Provided by the source system; CCE did not verify it | Panel-level provenance line: *"Supplied by the source system. Not measured or verified by CCE."* |
| **Not measured** | CCE has no value for this | Render the literal string `Not measured` in `--ink-3`, never `0`, never `—`, never blank |
| **Demonstration** | Generated for this build | Fleet-level banner, §14.4 |

A `null` in the source data means *the source does not provide this field*. It is **never** rendered as zero. This is stated in the source file itself (`chargeup_uc_data.json:12`).

---

## 4. Canonical vocabulary

Bind these exactly. They replace PASS / REVIEW / FAIL everywhere.

### 4.1 Overall assurance outcome — the severity ladder

Source: `ui-next/src/app/chargeup/vocab.ts:20-25`.

| Order | Value | Display | Status token |
|---|---|---|---|
| 1 (lowest severity) | `ASSURED` | Assured | `assured` |
| 2 | `ASSURED WITH LIMITATIONS` | Assured with limitations | `limitation` |
| 3 | `REVIEW REQUIRED` | Review required | `review` |
| 4 (highest severity) | `ESCALATE` | Escalate | `escalate` |

> **Known conflict.** `sheet_data.json:3-8` uses `ASSURED WITH LIMITATION` (singular) and `NOT ASSURED`. That file is the older prototype variant. **`vocab.ts` is canonical.** Do not use the sheet_data strings anywhere.

### 4.2 Per-layer result

Source: `vocab.ts:35-65`.

| Value | Display | Meaning |
|---|---|---|
| `clear` | Clear | Every check in this layer passed |
| `limitation` | Limitation | A non-blocking shortfall was found |
| `review` | Review | Something needs a human to look at it |
| `breach` | Breach | A check failed against a policy or a hard bound |
| `unmeasured` | Not measured | CCE has no result for this layer |

Raw-string mapping, applied when ingesting fixture data (`vocab.ts:49-65`):

```
"PASS" | "CLEAR" | "OK"                                        -> clear
"LIMITATION" | "PASS WITH LIMITATION" | "ASSURED WITH LIMITATIONS" -> limitation
"REVIEW" | "REVIEW REQUIRED"                                   -> review
"FAIL" | "BREACH" | "ESCALATE" | "TRIGGERED"                   -> breach
null | undefined | anything else                               -> unmeasured
```

Note `TRIGGERED` maps to `breach` — this is how UC4's Policy layer resolves.

### 4.3 Roll-up rule

The overall outcome is a **pure function of the five layer results**. Implement it once, in `lib/assurance/rollup.ts`, and never re-derive it in a component.

```
if any layer is breach            -> ESCALATE if the breach is in `decision`, else REVIEW REQUIRED
else if any layer is review       -> REVIEW REQUIRED
else if any layer is limitation   -> ASSURED WITH LIMITATIONS
else if all layers are clear      -> ASSURED
else                              -> REVIEW REQUIRED   // any unmeasured layer forces review
```

Verify against the four fixtures — all four must reproduce their stated outcome:

| Case | input | model | policy | decision | explanation | Roll-up | Stated |
|---|---|---|---|---|---|---|---|
| UC1 | clear | clear | clear | clear | clear | ASSURED | ASSURED ✓ |
| UC2 | clear | limitation | clear | clear | review | REVIEW REQUIRED | ASSURED WITH LIMITATIONS ✗ |
| UC3 | clear | clear | breach | breach | review | ESCALATE | REVIEW REQUIRED ✗ |
| UC4 | clear | clear | breach | breach | clear | ESCALATE | ESCALATE ✓ |

**UC2 and UC3 do not reconcile with a naive roll-up.** This is expected: the engine's outcome is set by the rule engine, not by a layer-max. Therefore:

> **Binding rule:** `outcome` is a **stored field** on the decision record, taken from the fixture. The roll-up function exists only to render a *consistency indicator* in the styleguide and in the consistency test. It must never override the stored outcome on a screen.

This is the single most likely place for the two of you to diverge. Do not "fix" UC2 or UC3 to satisfy the roll-up.

### 4.4 SoH status

Closed set: `EXCELLENT` · `GOOD` · `FAIR` · `REPLACEMENT REVIEW` · `CRITICAL`.
Bands (§5.1 of the extract): ≥90 Excellent · 80–<90 Good · 70–<80 Noticeable wear · 60–<70 Significantly worn · <60 End of useful life.

### 4.5 Engine actions

`CONTINUE_OPERATION` · `SCHEDULE_MAINTENANCE` · `REPLACE_BATTERY` · `RETIRE_ASSET` · `ESCALATE_FOR_REVIEW`.
Display them in sentence case with the rule ID beside them, e.g. `Continue operation · SOH-CONT-10`.

---

## 5. Canonical data model

This is `lib/data/types.ts`. **Phase 0.0 deliverable — written jointly, committed before any other work.**

```ts
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
```

### 5.1 The accessor layer

`lib/data/index.ts` exposes **only** these. Screens never import the fixture directly.

```ts
export async function getDecision(id: string): Promise<DecisionRecord | null>;
export async function getDecisionIds(): Promise<string[]>;
export async function getEvents(filters?: EventFilters): Promise<{
  rows: DecisionEvent[]; total: number; page: number; pageSize: number;
}>;
export async function getAggregates(filters?: EventFilters): Promise<FleetAggregates>;
export async function getAlerts(): Promise<Alert[]>;
export async function getVehicleHistory(vehicleId: string): Promise<DecisionEvent[]>;
```

Every function is `async` and returns after a `Promise.resolve()` tick — not because anything is slow, but so that swapping the body for a `fetch` later changes nothing above it.

`next.config.js` carries an API rewrite and `NEXT_PUBLIC_API_BASE` from day one, unused. Twenty minutes now, a week saved later.

---

## 6. The canonical fixture

Two parts: the four real records, and a generated demonstration fleet around them.

### 6.1 Source of truth

**Appendix A** carries every value. Copy them **verbatim** — do not round, do not reformat, do not fill a `null`. The original is `chargeup_uc_data.json` in the old repo, but you should not need it.

Shared across all four cases:

| Field | Value |
|---|---|
| Vehicle | `VEH-CU-4092` |
| Manufacturer | `LG` |
| Pack configuration | `14S` (14 cells in series) |
| Assurance engine | `CCE-v3.2` |
| Policy set | `ChargeUp SOH.pdf`, `AIS-156`, `AIS-038`, `IEC 62660-1` |
| Configured production model | `DLL:V2` |

### 6.2 The four records — summary

Full data in **Appendix A**. This is the orientation.

**UC1 — `CRD-2026-UC1-001` — ASSURED**
Battery `BAT-CU-14S-8842` · 2026-06-01T09:30:00Z · SoH **85.4% GOOD** · 397 cycles · model `DLL:V2`
Action: `APPROVE WARRANTY — TIER 1 CLEARANCE` · Engine action `CONTINUE_OPERATION`
Layers: input clear (10/10) · model clear (4/4) · policy clear (5/5) · decision clear · explanation clear
Full telemetry table present: **35 rows** including all 14 cell voltages, 3 cell temps, pack voltage 53.7459 V, imbalance 0.06497 V, IR raw −0.00792 Ω / CCE 0.00792 Ω, ΔV 0.2309 V, OV/UV event 0.

**UC2 — `CRD-2026-UC2-001` — ASSURED WITH LIMITATIONS**
Same battery, same telemetry as UC1. Only difference: incoming model `DLL:V1` against configured `DLL:V2`. `timestampUtc` is `null`.
Action: `ONE MODEL VERSION REVIEW` · Business action: `Conditional warranty use after model-version review`
Layers: input clear · **model limitation** · policy clear · decision clear · **explanation review**
The limitation is prediction provenance, not battery condition. The screens must say that.

**UC3 — `CRD-2026-UC3-001` — REVIEW REQUIRED**
Same battery. SoH **87.2% GOOD**, previous 85.4%. `timestampUtc` is `null`.
Action: `HOLD FOR HUMAN REVIEW` · Business action: `Hold and investigate battery`
Layers: input clear · model clear · **policy breach** (imbalance 64.97 mV vs 50 mV) · **decision breach** (SoH rose 85.4→87.2, against expected ageing direction) · **explanation review**
Payload carries `soh_pct_previous: 85.4` and `cell_imbalance_policy_threshold_mv: 50`.

**UC4 — `CRD-2026-UC4-001` — ESCALATE**
Battery `BAT-CU-14S-9031`, previous battery `BAT-CU-14S-8842`. SoH **76.2% REPLACEMENT REVIEW** · 312 cycles · forecast horizon 365 days. `timestampUtc` is `null`.
Action: `VEHICLE INSPECTION` · Business action: `Inspect vehicle root cause` · Engine action `ESCALATE_FOR_REVIEW`
Layers: input clear · model clear · **policy breach** (76.2% below the 80% replacement-review threshold) · **decision breach** (different battery repeats the degradation pattern on the same vehicle) · explanation clear
**Telemetry is only 6 rows.** Everything else is `null` — the source does not supply it. Render `Not measured`. Do not copy UC1's values in. The source file says this explicitly.

### 6.3 The demonstration fleet

The overview screen needs a fleet. Four rows would make it meaningless. Generate one, deterministically, and label it.

**Generation rules — implement exactly; both developers must produce byte-identical output.**

- Seeded PRNG, **seed `20260924`**, mulberry32. No `Math.random()` anywhere.
- **1,248 events** across a **14-day window ending on the build's "as-of" date** (§14.5).
- Fixed outcome distribution, in this order:

| Outcome | Count | Share |
|---|---|---|
| `ASSURED` | 1,080 | 86.5% |
| `ASSURED WITH LIMITATIONS` | 97 | 7.8% |
| `REVIEW REQUIRED` | 51 | 4.1% |
| `ESCALATE` | 20 | 1.6% |
| **Total** | **1,248** | **100.0%** |

These counts are chosen so the displayed shares sum to exactly 100.0%. Where any other set of shares is displayed together, apply **largest-remainder rounding** so the displayed figures always sum to 100.0% — a donut legend that adds up to 100.1% is the kind of detail an enterprise buyer notices.

- Battery IDs `BAT-CU-14S-NNNN`, vehicle IDs `VEH-CU-NNNN`, both 4-digit, drawn from a fleet of **312 vehicles**, each vehicle carrying 1–2 batteries over the window.
- Each vehicle is assigned one `VehicleType` at creation and keeps it for every event. Distribution across the 312 vehicles: Last Mile Delivery 128 · Intercity Cargo 71 · Passenger Shuttle 54 · Municipal Fleet 35 · Rental Pool 24. The four UC records all sit on `VEH-CU-4092`, which is **Last Mile Delivery**.
- `manufacturer` is drawn from `LG` (198 vehicles), `Samsung SDI` (68), `Exide` (46). The four UC records are `LG`, as supplied.
- SoH drawn per outcome so that the bands are consistent with §4.4: `ASSURED` 80–96%, `ASSURED WITH LIMITATIONS` 80–94%, `REVIEW REQUIRED` 72–89%, `ESCALATE` 54–79%.
- `engineAction` derived from SoH via the §7.4 policy bands — **never assigned independently**. A row whose action contradicts its SoH is a bug the consistency test must catch.
- Per-layer results generated so they are *compatible* with the row's outcome under §4.3, then the outcome is stored as the authority.
- `hasFullRecord: false` on every generated row.
- **The four UC records are injected as real rows** at the four most recent timestamps, with `hasFullRecord: true`. They are the only clickable-to-depth rows.

**Everything on the overview is derived from this array at runtime.** Not one aggregate is hardcoded — not the donut counts, not the pass rates, not the KPI deltas. §19 tests this.

### 6.4 The consistency test

`lib/data/__tests__/fixture.test.ts` — Phase 0 Track B gate. It must assert:

1. Outcome counts sum to `totalEvents` and match the table in §6.3.
2. Every donut segment percentage recomputed from counts rounds to the displayed value.
3. SoH distribution bin counts sum to `totalEvents`.
4. Every row's `engineAction` is the one §7.4 assigns to its SoH.
5. `layerClearRate` for each layer equals `count(result === 'clear') / totalEvents`.
6. Every ID referenced anywhere (history tables, alerts, vehicle history) resolves to a row that exists.
7. All four UC records reproduce their stated outcome, telemetry row count (**35 / 35 / 35 / 6**), and layer results.
8. No `null` in the fixture is rendered anywhere as `0` — asserted via the formatter, §14.3.

**If this test does not pass, no screen work starts.** This is the gate that stops the two of you building on different numbers.

---

## 7. Design tokens

`src/design/tokens.css` — Phase 0 Track A deliverable. Every value below is final. Nothing else may be used.

### 7.1 Colour — surfaces and ink

```css
:root {
  /* navigation rail */
  --rail:            #0B1A2F;
  --rail-2:          #122844;
  --rail-active:     #1D4ED8;
  --rail-ink:        #FFFFFF;   /* 17.5:1 on rail */
  --rail-ink-muted:  #93A4BD;   /*  6.9:1 on rail */

  /* content */
  --canvas:          #F5F7FA;
  --surface:         #FFFFFF;
  --surface-2:       #F8FAFC;
  --surface-sunken:  #F1F4F8;

  /* lines — deliberately light; this is the density lever */
  --rule:            #E3E8EF;   /* panel borders, table rows */
  --rule-strong:     #CDD5DF;   /* section dividers only */
  --grid:            rgba(15,27,45,0.06);  /* chart gridlines */

  /* ink */
  --ink:             #0F1B2D;   /* 17.3:1 */
  --ink-2:           #4A5A70;   /*  7.0:1 */
  --ink-3:           #5F6C7E;   /*  5.3:1 — labels, axis, meta */

  /* interactive */
  --primary:         #1D4ED8;   /*  6.7:1 */
  --primary-hover:   #1A44BD;
  --primary-wash:    #EEF3FE;
  --focus-ring:      #2563EB;
}
```

`--ink-3` is the lightest ink permitted. There is no fourth step. If text feels too loud, make it smaller or uppercase — do not make it lighter.

### 7.2 Colour — status

Four states, one row each. **Never used for anything except assurance status.** Never used as a chart series colour for non-status data.

| State | Mark (charts) | Text | Tint bg | Tint border | Icon |
|---|---|---|---|---|---|
| `assured` | `#157F52` | `#0B5B36` (7.2:1) | `#E6F4EC` | `#BFE1CE` | check in circle |
| `limitation` | `#B07D00` | `#6E4A00` (7.1:1) | `#FBF1DC` | `#EDD9AC` | half-filled circle |
| `review` | `#D2601A` | `#8A3D0B` (6.7:1) | `#FCEDE3` | `#F2D2BC` | triangle with bar |
| `escalate` | `#B3261E` | `#8F1D16` (7.6:1) | `#FBE8E6` | `#F1C8C4` | triangle with exclamation |
| `unmeasured` | `#8A94A3` | `#4B5563` (6.8:1) | `#F1F3F6` | `#DDE1E7` | dash in circle |

```css
:root {
  --assured:     #157F52;  --assured-ink:    #0B5B36;
  --assured-bg:  #E6F4EC;  --assured-border: #BFE1CE;
  --limitation:  #B07D00;  --limitation-ink: #6E4A00;
  --limitation-bg:#FBF1DC; --limitation-border:#EDD9AC;
  --review:      #D2601A;  --review-ink:     #8A3D0B;
  --review-bg:   #FCEDE3;  --review-border:  #F2D2BC;
  --escalate:    #B3261E;  --escalate-ink:   #8F1D16;
  --escalate-bg: #FBE8E6;  --escalate-border:#F1C8C4;
  --unmeasured:  #8A94A3;  --unmeasured-ink: #4B5563;
  --unmeasured-bg:#F1F3F6; --unmeasured-border:#DDE1E7;
}
```

> **Why every status badge carries an icon and a word.** These four hues form a semantic ladder (green → amber → orange → red) and the middle two are close enough that colour alone cannot separate them — for anyone, and especially under deuteranopia. Measured: `limitation` vs `review` sit at ΔE 0.3 under deutan simulation. Colour is therefore a *reinforcement*, never the carrier. **A status is never rendered as colour alone anywhere in this product.** Badge = icon + label + tint. Donut segment = colour + direct label + legend + a 2px surface gap between segments. Table cell = badge, not a coloured dot.

### 7.3 Colour — categorical series

For true categorical data only — currently just Decision Distribution (the five engine actions). Validated palette, **assign in this fixed order, never cycle**:

| Slot | Engine action | Hex |
|---|---|---|
| 1 | `CONTINUE_OPERATION` | `#2A78D6` |
| 2 | `SCHEDULE_MAINTENANCE` | `#EB6834` |
| 3 | `REPLACE_BATTERY` | `#1BAF7A` |
| 4 | `RETIRE_ASSET` | `#EDA100` |
| 5 | `ESCALATE_FOR_REVIEW` | `#E87BA4` |

Validated on `#FFFFFF`: lightness band PASS, chroma PASS, worst adjacent CVD ΔE 9.1 PASS, worst adjacent normal-vision ΔE 19.6 PASS. Three slots fall below 3:1 contrast on white — **direct labels are therefore mandatory** on every mark using this palette. Colour follows the action, never its rank: filtering must not repaint the survivors.

### 7.4 Sequential ramp

Single hue, blue, light → dark. For SoH distribution bins and any magnitude encoding.

`#CDE2FB` · `#9EC5F4` · `#6DA7EC` · `#3987E5` · `#256ABF` · `#184F95` · `#0D366B`

For ordinal use (discrete ordered bins), start no lighter than `#86B6EF`.

Policy band → colour mapping for the SoH distribution chart:

| Band | Label | Rule | Action |
|---|---|---|---|
| ≥90% | Excellent | `SOH-CONT-10` | `CONTINUE_OPERATION` |
| 80–<90% | Good / Healthy | `SOH-CONT-10` | `CONTINUE_OPERATION` |
| 70–<80% | Noticeable wear | `SOH-MAINT-09` | `SCHEDULE_MAINTENANCE` |
| 60–<70% | Significantly worn | `SOH-REPLACE-07` | `REPLACE_BATTERY` |
| <60% | End of useful life | `SOH-RETIRE-05` | `RETIRE_ASSET` |
| ±2.0 pp of any threshold | Boundary risk | `SOH-BOUNDARY-06` | `ESCALATE_FOR_REVIEW` |

### 7.5 Type

`system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. No web font, no display face.

| Token | Size / line | Weight | Letter-spacing | Use |
|---|---|---|---|---|
| `--t-hero` | 34 / 38 | 600 | −0.02em | The one big number on a detail screen |
| `--t-metric` | 28 / 32 | 600 | −0.01em | KPI values, panel headline numbers |
| `--t-h1` | 20 / 26 | 600 | −0.01em | Screen title |
| `--t-h2` | 15 / 20 | 600 | 0 | Panel header |
| `--t-body` | 13 / 18 | 400 | 0 | Body, table cells |
| `--t-body-strong` | 13 / 18 | 600 | 0 | Emphasised cell |
| `--t-label` | 11 / 14 | 600 | 0.06em | UPPERCASE field labels, axis ticks |
| `--t-micro` | 10 / 13 | 600 | 0.06em | Badge text, chips |
| `--t-mono` | 12 / 16 | 500 | 0 | IDs, rule codes, hashes — `ui-monospace, SFMono-Regular, Menlo, monospace` |

Tabular figures (`font-variant-numeric: tabular-nums`) on every table column of numbers and every axis tick. Proportional figures on standalone hero and KPI values.

### 7.6 Spacing, radius, elevation

4px base. `--s1:4 --s2:8 --s3:12 --s4:16 --s5:20 --s6:24 --s8:32`.

- Panel padding: `--s4` (16px). **Not more.**
- Gap between panels: `--s3` (12px).
- Table row height: 34px. Header row 30px.
- Panel header to first content: `--s3`.
- Radius: `--r-sm 4px` (badges, chips) · `--r-md 8px` (panels, cards) · `--r-lg 10px` (the overall result card only).
- Elevation: exactly two. `--e1: 0 1px 2px rgba(15,27,45,.04), 0 0 0 1px var(--rule)` for panels. `--e2: 0 4px 12px rgba(15,27,45,.10)` for popovers and tooltips only. Nothing else casts a shadow.

### 7.7 Motion

| Token | ms | Easing | Use |
|---|---|---|---|
| `--m-fast` | 140 | `cubic-bezier(.2,.8,.2,1)` | Hover, focus, badge states |
| `--m-base` | 220 | `cubic-bezier(.2,.8,.2,1)` | Tab change, panel swap, expand |
| `--m-enter` | 320 | `cubic-bezier(.16,1,.3,1)` | Chart draw-in, panel entrance |
| `--m-rail` | 380 | `cubic-bezier(.16,1,.3,1)` | Layer-to-layer transition |
| `--m-stagger` | 40 | — | Delay step between siblings |

Nothing animates longer than 400ms. Everything respects `prefers-reduced-motion: reduce` by collapsing to a 0ms opacity change — never by disabling the interaction.

---

## 8. Chart specification

### 8.1 Rules that apply to every chart

1. **One axis. Never two y-scales.** Two measures of different scale become two charts.
2. Marks are thin: 2px lines, ≥8px markers, bars with 4px rounded data-ends anchored to the baseline, 2px surface gap between adjacent bars and between stacked segments.
3. Gridlines `--grid` (6% ink), axis/baseline `--rule-strong`. Recessive. No chart junk, no 3D, no drop shadows on marks.
4. Text always wears ink tokens, never the series colour.
5. Two or more series → a legend is always present. One series → no legend; the panel header names it.
6. Every chart has a hover layer: crosshair + tooltip on line/area, per-mark tooltip on bar/dot. Hit target larger than the mark.
7. Direct labels are mandatory on any mark using the categorical palette or a status colour.
8. Every chart panel has a `Table` toggle in its header that swaps the chart for the underlying rows. This is the accessibility relief for low-contrast marks and it is not optional.

### 8.2 The chart inventory

| # | Chart | Screen | Form | Colour | Notes |
|---|---|---|---|---|---|
| C1 | Assurance Result Distribution | Overview | Donut, 4 segments | Status palette | Direct label + legend with counts and %; 2px gaps; centre shows total |
| C2 | SoH Distribution | Overview | Vertical bars, 5 bins | Sequential blue, ordinal | Bin labels on axis, value labels above bars |
| C3 | SoH Trend (fleet mean) | Overview | Line, 1 series | `--primary` | 14 points; no legend; value labels on first, last and any point outside the band |
| C4 | Decision Distribution | Overview | Donut, 5 segments | Categorical slots 1–5 | Direct labels mandatory |
| C5 | Assurance Pipeline Overview | Overview | 5 stat tiles in a row | Status tint per layer | Clear-rate %, derived; connected by a hairline to read as a pipeline |
| C6 | SoH Trend (last 6 decisions) | All 5 detail screens | Line, 1 series | `--primary`, final point in its outcome status colour | Shared component; per-vehicle |
| C7 | Cell Voltage Distribution | Model Assurance | Vertical bars, 14 cells | Sequential blue; any cell outside band in `--escalate` | Valid band 2.50–4.20 V shaded; mean line; σ annotated vs 50 mV limit. **Replaces the scatter.** |
| C8 | Faithfulness Band | Explanation | 3-stop segmented meter | Status: assured / limitation / escalate | No number. Active stop filled, others outlined. |
| C9 | Historical Pattern Comparison | Decision | Grouped horizontal bars, 2 series | Categorical slots 1–2 | This vehicle vs. fleet comparison; direct value labels |
| C10 | Temperature Spread | Input Assurance | Horizontal range bar + 3 markers | Sequential blue; out-of-range in `--escalate` | −20 to +60 °C envelope with min/max/sensor positions |

C7 and C10 are new panels that replace invented ones. Both are built entirely from real UC1 telemetry, and both are more informative than what they replace.

### 8.3 What not to build

No gauges with invented percentages. No sparkline that implies a trend from two points. No pie chart with more than five slices. No stacked bar where the segments are not parts of one whole. No chart at all where a single number would do — a KPI card is the right form for a single measure.

---

## 9. Component library

`src/design/components/` — Phase 0 Track A. Every one appears on `/styleguide` in every state before any screen is built.

| Component | Props (essential) | States |
|---|---|---|
| `Panel` | `title`, `subtitle?`, `actions?`, `provenance?`, `dense?` | default · with table toggle · with provenance line |
| `StatusBadge` | `result \| outcome`, `size: 'sm' \| 'md'` | 5 layer results, 4 outcomes; each = icon + label + tint |
| `OutcomeCard` | `outcome`, `action`, `size: 'rail' \| 'display'` | 4 outcomes |
| `Tabs` | `items`, `active`, `onChange` | default · hover · active · focus-visible |
| `MetricTile` | `label`, `value`, `unit?`, `delta?`, `provenance` | measured · supplied · not measured |
| `KeyValue` | `label`, `value`, `basis?`, `mono?` | value · null → `Not measured` |
| `DataTable` | `columns`, `rows`, `sortable`, `page`, `pageSize`, `onRowClick?` | default · sorted · hover · selected · empty · row-not-clickable |
| `CheckRow` | `check: Check` | clear · limitation · review · breach · with finding |
| `TelemetryTable` | `rows: TelemetryRow[]`, `collapsedCount` | collapsed (first 8) · expanded · flagged row |
| `PipelineRail` | `layers`, `active`, `onSelect` | 5 steps, each in 5 result states; active step |
| `DecisionHeader` | `record` | 11 fields, sticky |
| `ChartFrame` | `title`, `legend?`, `tableView`, `children` | chart · table · empty |
| `ProvenanceLine` | `provenance`, `note?` | supplied · demonstration |
| `FilterBar` | `filters`, `onChange`, `onExport` | default · active filter chips · cleared |
| `Breadcrumb` | `items` | — |
| `EmptyState` | `title`, `detail`, `icon?` | used for `hasFullRecord: false` |
| `Tooltip` | `content`, `placement` | — |
| `DisabledNavItem` | `label`, `reason` | renders "Coming soon" on hover |

**Rule:** if a screen needs something not in this list, it is added to the library in its own PR by its Track owner, reviewed, merged — then used. Never built inline in a screen file.

---

## 10. Layout system

Canvas 1920×1080. Verified working at 1440×900. Degrades acceptably at 1280×800.

```
┌──────────┬──────────────────────────────────────────────────────┐
│  RAIL    │  TOPBAR  (h 56)                                      │
│  w 220   ├──────────────────────────────────────────────────────┤
│  fixed   │  CONTENT  (padding 16, gap 12)                       │
│  full-h  │                                                      │
└──────────┴──────────────────────────────────────────────────────┘
```

- Rail: `--rail`, width 220px expanded / 64px collapsed. Fixed. Logo block h 64. Nav items h 40. Collapse control pinned bottom.
- Topbar: `--surface`, 56px, bottom border `--rule`. Holds breadcrumb (detail) or screen title (overview) on the left; `Auto Execution ON`, as-of timestamp, refresh on the right.
- Content grid: 12 columns, 12px gutter.

**Detail screen grid** (the five layer screens share this exactly):

| Region | Columns | Height |
|---|---|---|
| Decision header strip | 12 | 78px, sticky below topbar |
| Pipeline rail | 3 | fills |
| Layer panel | 9 | fills |
| Historical events table | 7 | 236px |
| SoH trend (C6) | 5 | 236px |

The bottom row is identical on all five screens and is one shared component. Build it once.

**Overview grid:**

| Region | Columns | Height |
|---|---|---|
| Filter bar | 12 | 56px |
| KPI row (5 tiles) | 12 | 92px |
| C1 · C2 · C3 · C4 | 3 each | 250px |
| Recent Decision Events | 7 | 360px |
| Pipeline Overview (C5) + Alerts | 5 | 360px, split 168 / 180 |

---

## 11. Screen specifications

Each screen below lists every panel. A panel's contents are exhaustive — nothing else goes on the screen.

### 11.0 Decision Events Dashboard — `/`

**Filter bar.** Six controls, every one backed by a real field:

| Control | Type | Backed by |
|---|---|---|
| Date range | Preset rows (today / last 7 / last 14 / last 30 days), custom behind a hairline | `timestampUtc` |
| Vehicle type | Multi-select | `vehicleType` |
| Manufacturer | Multi-select | `manufacturer` |
| Engine action | Multi-select | `engineAction` |
| Assurance outcome | Multi-select | `outcome` |
| SoH band | Multi-select over the §7.4 bands | `sohPct` |

Plus `Export` — downloads a CSV of the currently filtered rows, real, not decorative. Active filters render as removable chips below the bar.

> The mockup's "Vehicle group" and "Battery model" controls are **dropped**. There is no battery model field in the source at all, and no vehicle grouping. `vehicleType` replaces the former and is backed by the source vehicle record's `vehicle_type` field. Inventing a filter that filters nothing is worse than having one fewer control.

**KPI row — five tiles.** Each: label, value, delta vs. the previous equal-length window.

1. Total Decision Events — `1,248`
2. Assured — count and share
3. Assured with Limitations — count and share
4. Review Required — count and share
5. Escalate — count and share

All five derived. The mockup's "Overall Assurance Pass Rate" is replaced by the four-state split, because §4.1 has four states and a single "pass rate" would hide the difference between a limitation and an escalation.

**C1 Assurance Result Distribution** · **C2 SoH Distribution** · **C3 SoH Trend (Average)** · **C4 Decision Distribution.** Each in a `Panel` with a `View details` link and a `Table` toggle.

**Recent Decision Events.** Columns: Decision ID (mono, link) · Timestamp · Battery ID · Vehicle ID · SoH % · Engine Action · Assurance Outcome (badge) · Actions. Sortable on Timestamp, SoH, Outcome. 8 rows per page, paged. Rows with `hasFullRecord: true` are clickable and carry a subtle affordance; rows without are not clickable and show a tooltip: *"Detailed assurance record not retained for this event."*

**C5 Assurance Pipeline Overview.** Five tiles, one per layer, each showing the layer name and its clear rate, joined by a hairline. Derived.

**Alerts & Notifications.** Three to five entries, each severity icon + title + detail + time. Generated alongside the fleet and referencing real row IDs.

**Demonstration banner.** Above the filter bar, §14.4.

---

### 11.1 Input Assurance — `/decisions/[id]/input`

Tabs: **Input Features** · Cross-input Consistency · Data Quality · Summary.

- **Input Features** (`TelemetryTable`, 5 cols): Parameter · Value · Unit · Basis · Result. First 8 of 35 rows shown, `+ 27 more parameters` expands. Flagged rows carry a left accent in the failing result's colour. For UC4, 6 rows and the rest render `Not measured` — with a panel note that the source supplied only these.
- **Cross-input Consistency** — the 10 checks from extract §4.2, each as a `CheckRow` with what it compares (e.g. *pack voltage vs. sum of 14 cells*) and its result.
- **Data Quality Overview** — Total parameters · Mandatory present · Optional present · Out of range · Missing values · Inconsistencies. Derived from the telemetry array, never typed in.
- **C10 Temperature Spread** — the −20/+60 °C envelope with min 30.28, max 32.32 and the three sensors positioned.
- **Result strip** (bottom of the panel, 6 cells): the same six counts plus `INPUT ASSURANCE` + badge.

Layer checks driving this screen: `SOH-RANGE-01`, `CYCLE-03`, `AIS-156-SOC`, `CURR-DIR-05`, `POWER-SIGN-06`, `AIS-038-IMB`, `IR-POS-08`, `PACK-V-10`, `TEMP-RANGE-12`, `OVUV-11`.

---

### 11.2 Model Assurance — `/decisions/[id]/model`

Tabs: **Model Identity** · Assurance Checks · Supplied Model Card · Summary.

- **Model Identity** — Incoming model version · Configured production model · Match state · Manufacturer · Assurance engine · Policy set. For UC2 the mismatch is the headline: `DLL:V1` against `DLL:V2`, with the limitation stated in words — *the result cannot be confirmed as generated by the approved production model*.
- **Model Assurance Checks** — `MOD-RNG-01` Output range validation · `MOD-CON-01` Output-to-status consistency · `MOD-VER-01` Model identity and version gate · `MOD-FEA-01` Input feature availability.
- **Supplied Model Card** — the client-supplied catalog text, each entry as a `KeyValue`, under the mandatory provenance line. **No chart. No CCE-computed metric. No accuracy claim presented as verified.**
- **C7 Cell Voltage Distribution** — 14 bars, valid band shaded, mean line, σ 0.06497 V annotated against the 50 mV AIS-038 limit. On UC1/UC2/UC3 this is the panel's centrepiece. On UC4 it renders an `EmptyState`: *"Cell-level telemetry not supplied for this record."*
- A standing one-line statement in the panel footer: *"CCE verifies model identity and output integrity. It does not inspect model internals."* (`vocab.ts:263-264`, verbatim.)

---

### 11.3 Policy Assurance — `/decisions/[id]/policy`

Tabs: **Policy Evaluation** · Threshold Validation · Summary.

- **ChargeUp SoH Policy** — the six bands from §7.4 as a table: Range · Condition · Rule code · Recommended action · Match. The matched band is highlighted with a left accent and a tinted row; all others recede. Below it a resolution strip: `Current SoH 85.4% → Matched band 80–<90% → Continue operation · SOH-CONT-10`.
- **Government / Regulatory Policy** — four rows: `AIS-156` (deep-discharge prevention, OV/UV events) · `AIS-038` (cell imbalance ≤50 mV, ΔV <200 mV) · `IEC 62660-1` (thermal envelope −20 to +60 °C) · `ChargeUp SOH.pdf` (80% replacement review, 60% critical floor). Each: Standard · Scope · Applies · Result.
- **Threshold Validation** — the five policy checks: `SOH-OPER-02`, `IMBAL-THRESH-02`, `DELTAV-INSPECT-03`, `OVUV-ALERT-04`, `SOC-DEEPDIS-05`, each showing the measured value against its threshold.
- On UC3 the imbalance breach is the headline: **64.97 mV against a 50 mV limit**, with the AIS-038 row in breach. On UC4: **76.2% against the 80% replacement-review threshold**.

---

### 11.4 Decision Assurance — `/decisions/[id]/decision`

Tabs: **Decision Evaluation** · Historical Context · Summary.

- **Key Findings** — up to four, each icon + title + one short paragraph, written from the record's own `reason` and layer findings. Never invented. Never longer than 220 characters.
- **Rules Triggered** — the real rule IDs that fired, each with its one-line description. UC3: `SOH-MONO-02` (forecast/observed SoH moved against expected ageing direction). UC4: `DEC-REP-01` (replacement battery repeats degradation on the same vehicle), `SOH-BOUNDARY-06` where applicable. UC1/UC2: an explicit `No contextual rules triggered` state — not an empty panel.
- **C9 Historical Pattern Comparison** — for UC4, this vehicle's two batteries side by side: `BAT-CU-14S-8842` and `BAT-CU-14S-9031`, cycle count and SoH at assessment.
- **Decision Context Snapshot** — Total decisions for this vehicle · Replacement actions taken · Previous battery ID · Cycle count at assessment · Forecast horizon (UC4: 365 days) · Escalation owner. The owner role renders with `(provisional)` appended, because `roles.json:135` marks all ChargeUp role names unconfirmed.
- **Escalation** — when `escalation.required`, a bordered strip naming the assigned role and the basis. UC4 → `Head of Fleet Safety (provisional)`.

---

### 11.5 Explanation Assurance — `/decisions/[id]/explanation`

Tabs: **Explanation Evaluation** · Alignment Checks · Summary.

- **External Explanation** — the supplied explanation text in a quoted card, with `Source` and `Generated on` beneath. UC1's is long; the card scrolls internally rather than growing the panel.
- **C8 Faithfulness Band** — three stops, active one filled. Beneath it, the band's one-line rationale from §7.3 of the extract, verbatim:
  - Faithful — *"Every alignment check is clear: the stated reason matches the model output, the numbers, the governed decision and the policy applied."*
  - Partially faithful — *"The stated reason is accurate as far as it goes, but at least one check found something it does not surface."*
  - Not faithful — *"At least one alignment check found the stated reason contradicting the evidence or the governed decision."*
- **Explanation Alignment Checks** — the eight `EXP-*` checks as `CheckRow`s, each with what it verifies and its result.
- **Check Roll-up** — counts clear / review / breach, the band, and the recommendation where one exists. UC2's recommendation: the explanation does not surface the model-version mismatch.

**Nowhere on this screen is there a percentage.** If a number appears in this panel group during review, it is a bug.

---

## 12. Interaction specification

| Element | Behaviour |
|---|---|
| Rail nav | Click navigates. Active item: `--rail-active` left bar 3px + `--rail-ink`. Disabled items show `Coming soon` on hover and do not navigate. |
| Rail collapse | Toggles 220 ⇄ 64px, animates `--m-base`. Labels fade out before width changes. Persists in component state only. |
| Pipeline rail step | Click navigates to that layer's route. Hover raises the step's tint. Active step: filled card + 2px left accent in its result colour. |
| Layer keyboard | `1`–`5` jump to layers. `←` / `→` step through them. |
| Tabs | Click and `←`/`→` when focused. Active tab underline slides between positions — it does not fade. |
| Table sort | Click a sortable header cycles asc → desc → unsorted. Sort indicator is an arrow, always visible on the active column. |
| Table row | `hasFullRecord` rows: hover lifts background to `--surface-2` and shows a chevron; click navigates to `/decisions/[id]/input`. Others: `cursor: default`, tooltip explains why. |
| Pagination | 8 rows per page. First/prev/numbered/next/last. Page state is local. |
| Filters | Every filter applies immediately to the table, all four charts, the KPI row and the pipeline tiles. No Apply button. |
| Cross-filter | Clicking a donut segment or a distribution bar filters the whole overview to that slice and adds a chip. Clicking it again clears it. |
| Chart hover | Line: crosshair + tooltip with date and value. Bar/donut: per-mark tooltip with label, count, share. |
| Chart table toggle | Swaps the chart for its rows in place. Panel height does not change. |
| Export | Downloads the filtered rows as CSV with a generated filename. |
| Refresh | Re-runs entrance animations and updates the as-of clock. It does not change any data, and it does not pretend to fetch. |
| Focus | 2px `--focus-ring` with 2px offset on every interactive element. Never removed. |
| Escape | Closes any open popover, tooltip or filter panel. |

---

## 13. Motion specification

Motion is added in **Phase 5**, onto finished and correct screens. Never mixed into layout work.

| Moment | Spec |
|---|---|
| Screen entrance | Panels fade + rise 8px, `--m-enter`, staggered `--m-stagger` in reading order. Maximum 8 staggered items; the rest appear with the 8th. |
| Layer-to-layer | The pipeline rail's active accent slides to the new step over `--m-rail`. The layer panel cross-dissolves: outgoing 120ms out, incoming 220ms in with a 6px rise. The header strip and bottom row do not move. This is the product's signature transition — get it right. |
| Tab change | Underline slides `--m-base`. Content cross-fades 140ms with no movement. |
| Chart draw-in | Lines draw left→right over `--m-enter` via stroke-dashoffset. Bars grow from the baseline, staggered `--m-stagger`. Donut segments sweep clockwise from 12 o'clock. Once per mount, and on refresh. |
| KPI values | Count up from 0 over `--m-enter`, easing out. Tabular figures so nothing jitters. |
| Table rows | On page change, rows fade in staggered 20ms, capped at 8. |
| Row hover | Background `--m-fast`. Chevron slides in 4px. |
| Badge / chip | Background and border `--m-fast`. No scale transforms. |
| Rail collapse | Width `--m-base`; labels fade `--m-fast` first. |
| Expand / collapse | Height transition `--m-base` with content fade. |
| Reduced motion | All of the above collapse to a 0ms opacity swap. Interactions all still work. |

Never animate: layout-shifting properties on scroll, anything triggered by hover that moves neighbouring content, anything longer than 400ms, anything that loops.

---

## 14. Content and copy rules

### 14.1 Terminology — binding

| Say | Never say |
|---|---|
| Assured / Assured with limitations / Review required / Escalate | Pass / Fail / Success / Error |
| Clear / Limitation / Review / Breach / Not measured | Passed / Failed / OK / Warning |
| Design partner | Customer |
| Tamper-evident (only where verification actually runs) | Tamper-proof · Immutable |
| Supplied by the source system | Verified · Validated (for supplied values) |
| Not measured · Not supplied | 0 · — · N/A · blank |
| Assurance outcome | Score · Confidence · Accuracy |

**No percentage anywhere expresses confidence, accuracy or faithfulness.** Percentages express SoH, shares of a total, and clear rates. Nothing else.

### 14.2 Capitalisation

Screen and panel titles: sentence case. Field labels: UPPERCASE with `--t-label`. Status badges: sentence case. Rule codes and IDs: exactly as in source, monospace, never re-cased.

### 14.3 Number and date formatting

One formatter module, `lib/format.ts`. No component formats a number itself.

- SoH and shares: one decimal, `85.4%`.
- Voltages: four decimals as supplied, `3.8172 V`. Never rounded for display.
- Resistance: five decimals, `0.00792 Ω`.
- Millivolts: two decimals, `64.97 mV`.
- Temperature: two decimals, `32.32 °C`.
- Counts: locale-grouped, `1,248`.
- Latency: `0.42 s`.
- Dates: `17 May 2026` · Times: `10:30 AM` · Combined: `17 May 2026, 10:30 AM` · UTC timestamps in tooltips as ISO.
- **`null` → `Not measured` in `--ink-3`.** The formatter enforces this; it is asserted by the §6.4 test.

### 14.4 The demonstration banner

Verbatim, on the overview, above the filter bar, in a `--surface-2` strip with an info icon:

> **Demonstration data.** These are controlled demonstration scenarios, not production ChargeUp operational records. The four highlighted decision records are sourced from the ChargeUp CCE UC1–UC4 assurance master; surrounding fleet events are generated for this build.

Dismissible per session, but it renders on every fresh load.

### 14.5 Dates

The fixture's "as-of" date is a single constant, `AS_OF`, in `lib/data/fixture/config.ts`. All timestamps derive from it. Set it to the build date so the demo never looks stale. Changing one constant re-dates the entire fixture — and nothing else may hardcode a date.

---

## 15. Accessibility

- Every status is icon + label + colour. Colour alone carries nothing. Non-negotiable (§7.2).
- Text contrast: body ≥ 4.5:1, large text ≥ 3:1. All tokens in §7 already clear this — do not introduce new colours.
- Chart marks ≥ 3:1 against the surface, or direct-labelled. Every chart has its table view.
- Full keyboard path to every interactive element. Visible focus ring everywhere; never `outline: none` without a replacement.
- Semantic HTML: real `<table>` for tables, real `<button>` for actions, real `<nav>` for the rail. `aria-current="page"` on the active nav and layer.
- `prefers-reduced-motion` honoured throughout.
- Charts carry an accessible name and description; the table view is the text alternative.

---

## 16. Repo structure and file ownership

**A file has exactly one owner. Two people never edit the same file in the same phase.**

```
CCE_v2/
├─ SPEC.md                                   [joint — changes need both]
├─ next.config.js                            [A]
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                          [A]
│  │  ├─ page.tsx                       Overview        [see phase 3 split]
│  │  ├─ decisions/[id]/
│  │  │  ├─ layout.tsx                  DecisionLayout  [A]
│  │  │  ├─ input/page.tsx                            [A]
│  │  │  ├─ model/page.tsx                            [A]
│  │  │  ├─ policy/page.tsx                           [A]
│  │  │  ├─ decision/page.tsx                         [B]
│  │  │  └─ explanation/page.tsx                      [B]
│  │  └─ styleguide/page.tsx                          [A]
│  ├─ design/
│  │  ├─ tokens.css                                   [A]
│  │  └─ components/                     primitives   [A]
│  ├─ features/
│  │  ├─ shell/          Rail, Topbar                 [A]
│  │  ├─ decision/       DecisionHeader, PipelineRail [A]
│  │  ├─ history/        HistoricalEventsTable, C6    [B]
│  │  ├─ overview/       KPI row, FilterBar, tables   [A]
│  │  ├─ charts/         C1–C5, C7–C10                [B]
│  │  └─ layers/         per-layer panel bodies       [owner of that screen]
│  ├─ lib/
│  │  ├─ data/
│  │  │  ├─ types.ts                                  [JOINT — phase 0.0]
│  │  │  ├─ fixture/                                  [B]
│  │  │  ├─ index.ts        accessors                 [B]
│  │  │  └─ __tests__/                                [B]
│  │  ├─ assurance/rollup.ts                          [B]
│  │  └─ format.ts                                    [A]
└─ public/
```

Where a phase needs both of you in one area, the split is stated in §18 and the files are listed separately.

---

## 17. Git workflow

- `main` is always green. Nobody pushes to it directly.
- `develop` is the integration branch. All PRs target it.
- One branch per unit of work: `feat/phase2-policy-screen`, `feat/phase0-fixture`.
- A PR touching `src/design/` or `lib/data/` **requires the other person's review**, because it affects both tracks. A PR touching only your own screen files does not.
- Rebase on `develop` before opening a PR. Never merge `develop` into your branch.
- Commit message: `phase<N>: <what changed>`. One logical change per commit.
- **Never commit a change to `SPEC.md` inside a feature PR.** Spec changes are their own PR, discussed, merged first.
- Screenshot in every screen PR. No screenshot, no review.

---

## 18. Phase plan and the work split

Seven phases. Each has a gate. **A gate is not passed by a claim — it is passed by evidence.**

### Phase 0.0 — The contract · both of you, together, ~45 minutes

Write `lib/data/types.ts` from §5 and commit it to `develop`. Nothing else starts until this is merged. Both tracks depend on it, and if you each write your own version you will spend Phase 2 reconciling them.

**Gate:** `types.ts` on `develop`, `tsc --noEmit` clean.

---

### Phase 0 — Foundation · parallel

| Track A — Yokesh | Track B — Shivanya |
|---|---|
| Repo scaffold: Next 15 App Router, TS strict, Tailwind, Recharts, Framer Motion, port 3002 | Fixture: the four UC records, verbatim from §6.2 |
| `next.config.js` rewrite + `NEXT_PUBLIC_API_BASE` | Demonstration fleet generator per §6.3, seeded |
| `design/tokens.css` — every token in §7 | Accessor layer per §5.1 |
| Primitive library per §9 | `lib/assurance/rollup.ts` per §4.3 |
| App shell: Rail, Topbar, routing skeleton | The consistency test per §6.4 |
| `lib/format.ts` per §14.3 | |
| `/styleguide` showing every token and primitive in every state | |

**Gate — both required, evidence not assertion:**
- A: `/styleguide` screenshot showing all five status states, all four outcomes, every primitive.
- B: `npm test` output showing all eight consistency assertions passing.

**No screen work begins until both are merged.** This is the most important rule in the plan. The previous attempt failed because screens were built on data that changed underneath them.

---

### Phase 1 — Shared decision chrome · parallel

| Track A | Track B |
|---|---|
| `DecisionLayout` — the shared shell for all five detail screens | `HistoricalEventsTable` — the bottom-left panel |
| `DecisionHeader` — the 11-field sticky strip | `C6 SoH Trend (last 6 decisions)` |
| `PipelineRail` — 5 steps, 5 states each, plus the OutcomeCard | `ChartFrame` + the chart table-toggle mechanism |

**Gate:** `/decisions/CRD-2026-UC1-001/input` renders the full chrome with a placeholder in the layer slot, at 1920×1080 and 1440×900, screenshotted.

---

### Phase 2 — The five layer screens · parallel, this is the main split

| Track A — Yokesh | Track B — Shivanya |
|---|---|
| **11.1 Input Assurance** + C10 | **11.4 Decision Assurance** + C9 |
| **11.2 Model Assurance** + C7 | **11.5 Explanation Assurance** + C8 |
| **11.3 Policy Assurance** | |

Track B has two screens to Track A's three because C8 and C9 are both new panels replacing invented ones, and the Decision screen's findings copy needs the most care.

Screens are **assembly from Phase 0/1 primitives**. If you find yourself writing a new styled div, stop — that belongs in the library.

**Gate:** each screen renders correctly for **all four UC records**, including UC4's `Not measured` states and its empty cell-voltage panel. Four screenshots per screen.

---

### Phase 3 — Overview · parallel by section

| Track A | Track B |
|---|---|
| Filter bar + filter state + chips | C1, C2, C3, C4 |
| KPI row (5 tiles) | C5 Pipeline Overview |
| Recent Decision Events table + pagination | Alerts & Notifications |
| Demonstration banner + CSV export | |

**Gate:** every number on the screen traces to the fixture; the §6.4 test still passes; toggling any filter updates all panels coherently.

---

### Phase 4 — Interactivity · parallel

| Track A | Track B |
|---|---|
| Filters applied end to end across every panel | Chart hover layers and tooltips |
| Table sorting, pagination, row navigation | Cross-filter from donut and bar clicks |
| Keyboard map (§12) | Chart table toggles |
| Export CSV | |

**Gate:** the interaction table in §12 walked through item by item, both of you present.

---

### Phase 5 — Motion · parallel

| Track A | Track B |
|---|---|
| Screen entrance and stagger | Chart draw-in (C1–C10) |
| The layer-to-layer rail transition | KPI count-up |
| Tab underline slide, rail collapse | Row and badge micro-interactions |
| `prefers-reduced-motion` across the app | |

**Gate:** a screen recording of a full walkthrough. Nothing janks, nothing exceeds 400ms, reduced-motion verified.

---

### Phase 6 — Hardening · joint

Side-by-side visual diff against all six mockups. 1440×900 and 1280×800 pass. Accessibility sweep per §15. Provenance labels present on every supplied value. A grep check in CI failing the build on forbidden strings: `tamper-proof`, `immutable`, `confidence score`, `accuracy`, `PASS`, `FAIL` (outside the raw-string mapper), and any `%` inside the explanation feature directory.

**Gate:** §19 checklist green on all six screens.

---

## 19. Definition of done

A screen is done when **every** line is true:

1. Every panel from its §11 spec is present, in position, at the specified size.
2. It renders correctly for all four UC records — including UC4's missing telemetry.
3. No number on it is hardcoded in a component. All trace to the fixture.
4. Every `null` renders as `Not measured`, never as `0` or blank.
5. Every supplied value carries its provenance line.
6. Every status is icon + label + colour.
7. Every chart has a hover layer and a table toggle.
8. Density matches the mockup — no added whitespace.
9. Keyboard reaches everything; focus is always visible.
10. It holds at 1920×1080 and 1440×900 with no overflow and no text escaping its container.
11. `tsc --noEmit` and `npm test` are clean.
12. The forbidden-string grep passes.
13. A screenshot at both resolutions is attached to the PR.

---

## 20. Decisions log

| # | Decision | Rationale |
|---|---|---|
| D1 | Fresh repository (`CCE_v2`), not a third frontend in the existing repo | The repo already carries two frontends plus four ChargeUp routes; a third invites the wrong one being served. Clean context also measurably helps the coding agents. |
| D2 | Vocabulary is ASSURED / ASSURED WITH LIMITATIONS / REVIEW REQUIRED / ESCALATE | It is what the engine emits. PASS/FAIL in the mockups would contradict the product. |
| D3 | Mockup layout, engine data | Five mockup panels have no backing data (§3.1). Layout is what the user wants; data must be real. |
| D4 | No faithfulness percentage, no model metrics, no per-layer timings, no anomaly score | All four were invented. The codebase already refuses to render the first. |
| D5 | C7 cell-voltage chart replaces the holdout scatter; C10 replaces nothing, it earns its place | Real data, stronger visual, same footprint. |
| D6 | Demonstration fleet is generated and labelled | Four rows make an overview meaningless. The source file already declares itself demonstration data. |
| D7 | `outcome` is stored, not derived | UC2 and UC3 do not reconcile with a layer-max roll-up (§4.3). The engine's rule engine sets the outcome. |
| D8 | Density unchanged; clarity bought by removing chrome | Explicit instruction. The screens must carry a lot at once. |
| D9 | Escalation role names render `(provisional)` | `roles.json:135` marks them unconfirmed pending ChargeUp. |
| D10 | Light theme only, no dark mode | Scope discipline. One theme, done properly. |

## 21. Open questions

| # | Question | Blocks | Default if unanswered |
|---|---|---|---|
| Q1 | Is the supplied model card text cleared to show to ChargeUp? It quotes accuracy figures from their own documents. | Phase 2, Model screen | Show it under the provenance line as specified. |
| Q2 | Confirmed escalation role titles, replacing the placeholders. | Phase 2, Decision screen | Keep `(provisional)`. |
| Q3 | Does ChargeUp get a co-branding slot in the topbar? | Phase 1 | Credge branding only. |
| Q4 | Delivery date. | Phase sizing | Build all seven phases in order; cut Phase 5 scope first if time is short. |

---
---

# APPENDICES — Source data

Everything below is the source material, reproduced so this document is self-contained. **Copy values verbatim. Do not round, reformat, or fill a `null`.** Original: `ui-next/src/app/chargeup-prototype/chargeup_uc_data.json` in the old repo.

Provenance of this material, from the source file's own header:

> `"scenarioType"`: controlled demonstration data, not production ChargeUp operational records
> `"nullRule"`: null means the supplied source does not provide that field for that scenario; it is not a measured zero.
> `"engine"`: Assurance Engine: CCE-v3.2 | Policy: ChargeUp SOH.pdf + AIS-156 + AIS-038 + IEC 62660-1

---

## Appendix A — The four decision records

### A.1 Shared across all four cases

| Field | Value |
|---|---|
| `vehicleId` | `VEH-CU-4092` |
| `manufacturer` | `LG` |
| `packConfiguration` | `14S` |
| `assuranceEngine` | `CCE-v3.2` |
| `policySet` | `["ChargeUp SOH.pdf", "AIS-156", "AIS-038", "IEC 62660-1"]` |
| `productionModel` | `DLL:V2` |

### A.2 Case-level fields

| Field | UC1 | UC2 | UC3 | UC4 |
|---|---|---|---|---|
| `id` | `CRD-2026-UC1-001` | `CRD-2026-UC2-001` | `CRD-2026-UC3-001` | `CRD-2026-UC4-001` |
| `tab` | UC1 - Assured | UC2 - Assured With Limitations | UC3 - Review Required | UC4 - Escalate |
| `scenario` | Clean evidence | Model version differs from production | Anomalous SoH history and cell imbalance breach | New battery repeats degradation pattern on same vehicle |
| `timestampUtc` | `2026-06-01T09:30:00Z` | `null` | `null` | `null` |
| `batteryId` | `BAT-CU-14S-8842` | `BAT-CU-14S-8842` | `BAT-CU-14S-8842` | `BAT-CU-14S-9031` |
| `previousBatteryId` | `null` | `null` | `null` | `BAT-CU-14S-8842` |
| `modelVersion` | `DLL:V2` | `DLL:V1` | `DLL:V2` | `DLL:V2` |
| `soh` | `85.4` | `85.4` | `87.2` | `76.2` |
| `sohStatus` | `GOOD` | `GOOD` | `GOOD` | `REPLACEMENT REVIEW` |
| `sohPrevious` | `null` | `null` | `85.4` | `null` |
| `cycleCount` | `397` | `397` | `397` | `312` |
| `forecastHorizonDays` | `null` | `null` | `null` | `365` |
| `outcome` | `ASSURED` | `ASSURED WITH LIMITATIONS` | `REVIEW REQUIRED` | `ESCALATE` |
| `action` | `APPROVE WARRANTY — TIER 1 CLEARANCE` | `ONE MODEL VERSION REVIEW` | `HOLD FOR HUMAN REVIEW` | `VEHICLE INSPECTION` |
| `businessAction` | `null` | Conditional warranty use after model-version review | Hold and investigate battery | Inspect vehicle root cause |
| `engineAction` | `CONTINUE_OPERATION` | `CONTINUE_OPERATION` | `ESCALATE_FOR_REVIEW` | `ESCALATE_FOR_REVIEW` |

### A.3 Layer results (raw source verdict → §4.2 mapped result)

| Layer | UC1 | UC2 | UC3 | UC4 |
|---|---|---|---|---|
| Input Assurance | PASS → `clear` | PASS → `clear` | PASS → `clear` | PASS → `clear` |
| Model Assurance | PASS → `clear` | LIMITATION → `limitation` | PASS → `clear` | PASS → `clear` |
| Policy Assurance | PASS → `clear` | PASS → `clear` | FAIL → `breach` | TRIGGERED → `breach` |
| Decision Assurance | PASS → `clear` | PASS → `clear` | FAIL → `breach` | ESCALATE → `breach` |
| Explanation Assurance | PASS → `clear` | REVIEW → `review` | REVIEW → `review` | PASS → `clear` |

Layer summary strings, verbatim:

| Layer | UC1 | UC2 | UC3 | UC4 |
|---|---|---|---|---|
| Input | 10 of 10 Checks Passed | Same clean battery evidence as UC1. | Current SoH remains numerically valid and the evidence is structurally usable. | The supplied scenario describes the new battery data as structurally valid. |
| Model | 4 of 4 Checks Passed | Incoming DLL V1 does not match configured DLL V2. | DLL V2 is the correct model version and current SoH is within 0–100%. | DLL V2 matches configured production version. |
| Policy | 5 of 5 Checks Passed | Battery remains within policy and SoH remains in Good range. | Cell imbalance 64.97 mV exceeds the 50 mV policy threshold. | 76.2% is below the 80% replacement-review threshold. |
| Decision | No anomalous pattern detected | Limitation is non-blocking; model-version review is required before important use. | SoH increased from 85.4% to 87.2%, contrary to expected ageing direction. | A different battery repeats the degradation pattern on the same vehicle. |
| Explanation | Explanation faithful & complete | Explanation does not surface the model-version mismatch. | Explanation must surface the anomalous history and imbalance. | The decision explanation identifies the vehicle-history context. |

### A.4 Telemetry — UC1, UC2 and UC3

All three share this 35-row table. Columns: **Parameter · Value · Unit · Basis**.

| # | Parameter | Value | Unit | Basis |
|---|---|---|---|---|
| 1 | SoH Percentage (Model Output) | `85.4` | % | Range: 0–100% \| Good band: 80–<90% \| Replacement review below 80% |
| 2 | SoH Status | `GOOD` | — | ChargeUp classification; Good band 80–<90% |
| 3 | Charge Cycle Count | `397` | Cycles | Integer ≥ 0 |
| 4 | State of Charge (SoC) | `66.1` | % | Range: 0–100% \| Deep-discharge risk below 10% (AIS-156) |
| 5 | Current | `-20.7269` | A | Negative = discharge (as supplied) |
| 6 | Power | `-1059.7966` | W | Sign must match current |
| 7 | Cell Imbalance (std) | `0.06497` | V | Digital Twin output \| Threshold 0.05 V (50 mV) |
| 8 | Internal Resistance (raw) | `-0.00792` | Ω | As displayed, before CCE ABS preprocessing |
| 9 | Internal Resistance (CCE) | `0.00792` | Ω | Post-ABS; must be > 0 |
| 10 | Cell 01 Voltage | `3.8172` | V | Range: 2.5–4.2 V |
| 11 | Cell 02 Voltage | `3.8142` | V | Range: 2.5–4.2 V |
| 12 | Cell 03 Voltage | `3.8309` | V | Range: 2.5–4.2 V |
| 13 | Cell 04 Voltage | `3.8212` | V | Range: 2.5–4.2 V |
| 14 | Cell 05 Voltage | `3.8324` | V | Range: 2.5–4.2 V |
| 15 | Cell 06 Voltage | `3.8266` | V | Range: 2.5–4.2 V |
| 16 | Cell 07 Voltage | `3.8332` | V | Range: 2.5–4.2 V |
| 17 | Cell 08 Voltage | `3.8333` | V | Range: 2.5–4.2 V |
| 18 | Cell 09 Voltage | `3.9063` | V | Range: 2.5–4.2 V |
| 19 | Cell 10 Voltage | `3.8408` | V | Range: 2.5–4.2 V |
| 20 | Cell 11 Voltage | `3.821` | V | Range: 2.5–4.2 V |
| 21 | Cell 12 Voltage | `3.8352` | V | Range: 2.5–4.2 V |
| 22 | Cell 13 Voltage | `3.8379` | V | Range: 2.5–4.2 V |
| 23 | Cell 14 Voltage | `3.8956` | V | Range: 2.5–4.2 V |
| 24 | Max Cell Voltage (DT) | `4.0098` | V | Digital Twin \| Range: 2.5–4.2 V |
| 25 | Min Cell Voltage (DT) | `3.779` | V | Digital Twin \| Range: 2.5–4.2 V |
| 26 | Max–Min ΔV (DT) | `0.2309` | V | Digital Twin \| Inspection above 200 mV (AIS-038) |
| 27 | Battery Pack Voltage | `53.7459` | V | Range: 35.0–58.8 V (14S) \| Should equal sum of 14 cells |
| 28 | Over/Under Voltage Event | `0` | — | BMS fault flag; 0 = no breach (AIS-156) |
| 29 | Max Cell Temperature | `32.32` | °C | Range: -20 to +60 °C discharge |
| 30 | Min Cell Temperature | `30.28` | °C | Range: -20 to +60 °C discharge |
| 31 | Cell Temp 01 | `31.2` | °C | Within [min, max] cell temperature |
| 32 | Cell Temp 02 | `31.21` | °C | Within [min, max] cell temperature |
| 33 | Cell Temp 03 | `31.82` | °C | Within [min, max] cell temperature |
| 34 | Model Version | `DLL:V2` | — | Must equal configured production model |
| 35 | Configured Production Model | `DLL:V2` | — | Reference value |

**Per-case deltas from the table above — these are the only differences:**

| Case | Changes |
|---|---|
| UC1 | none — the table as written |
| UC2 | row 34 `Model Version` → **`DLL:V1`** |
| UC3 | row 1 `SoH Percentage` → **`87.2`**; payload additionally carries `soh_pct_previous: 85.4` and `cell_imbalance_policy_threshold_mv: 50` |

> Note the deliberate tension in UC1: cell imbalance `0.06497 V` (64.97 mV) already sits above the stated 50 mV threshold, yet UC1's Policy layer is `clear`. That is how the source supplies it. **Reproduce it as supplied.** Do not "correct" UC1's policy result, and do not change the imbalance figure. If it comes up in review, it is a question for the engine team, not a UI fix.

### A.5 Telemetry — UC4 (6 rows only)

| # | Parameter | Value | Unit | Basis |
|---|---|---|---|---|
| 1 | SoH Percentage (Model Output) | `76.2` | % | Range: 0–100% \| Good band: 80–<90% \| Replacement review below 80% |
| 2 | SoH Status | `REPLACEMENT REVIEW` | — | ChargeUp classification; Good band 80–<90% |
| 3 | Charge Cycle Count | `312` | Cycles | Integer ≥ 0 |
| 4 | Model Version | `DLL:V2` | — | Must equal configured production model |
| 5 | Configured Production Model | `DLL:V2` | — | Reference value |
| 6 | Forecast Horizon | `365` | days | Supplied for this scenario |

**Every other parameter is `null` and renders `Not measured`.** The source file states: *"UC4 telemetry fields not supplied by the scenario source are null rather than copied from the previous battery."* Copying UC1's values into UC4 is the single worst mistake available in this build.

### A.6 Reason text — verbatim

**UC1:** All five assurance layers passed. The battery health reading (85.4%, Good) is within range, the approved model version (DLL:V2) was used, and all five policy checks passed against the ChargeUp and government standards. Nothing unusual was found in this vehicle's history, and the explanation matches the model output. This battery is fully assured.

**UC2:** The battery information still passes and the policy still passes. The limitation is prediction provenance: the result cannot be confirmed as generated by the approved production model. Credge therefore reduces assurance rather than blocking the battery.

**UC3:** The evidence is no longer clean enough to support an automatic decision. The SoH history has moved in an unexpected direction and cell imbalance has crossed the permitted policy threshold. Credge does not diagnose the physical cause; it requires investigation.

**UC4:** The new battery has triggered a replacement-review concern, but vehicle history changes the decision context. A different battery is showing a concerning degradation pattern on the same vehicle. Credge therefore avoids automatically recommending another battery replacement and escalates for vehicle inspection.

### A.7 External explanation text — verbatim (Explanation Assurance screen)

**UC1:** The State of Health (SoH) of a battery, estimated here at 85.37%, reflects the overall condition of the battery compared to when it was brand new. It essentially tells us how much of the battery's capacity remains usable. This value is strong, indicating the battery is in good health, but it has slightly aged due to wear and usage, which is normal for a battery with nearly 400 charge-discharge cycles. Key factors influencing SoH include temperature variations, voltage differences among cells, internal resistance, cycle count, and notable operational events like over-voltage or under-voltage occurrences. The absence of such events here suggests that the battery has been mostly operating under stable and controlled conditions. However, minor imbalances in cell voltages and measurable degradation in resistance point to slow natural aging.

**UC2:** The explanation correctly describes the battery as 85.4% and in the Good range, but it does not surface that the prediction came from DLL V1 while the configured production version is DLL V2.

**UC3:** The current 87.2% SoH remains inside the Good band, but the increase from the previous 85.4% reading is not the expected ageing direction. The cell imbalance is 64.97 mV, above the applicable 50 mV policy threshold.

**UC4:** The new battery is showing 76.2% health after only 312 cycles. The ChargeUp policy threshold is 80% for replacement review. The same vehicle previously had battery BAT CU 14S 8842, which also showed abnormal degradation.

> UC1's explanation says **85.37%** while the telemetry says **85.4%**. That discrepancy is real and is exactly the kind of thing `EXP-NUM-03` (numerical consistency) exists to catch. Reproduce both figures as supplied; do not harmonise them.

### A.8 Headline strings

| Case | Headline |
|---|---|
| UC1 | `CCE DECISION: ASSURED \| CREDGE ACTION: APPROVE WARRANTY — TIER 1 CLEARANCE` |
| UC2 | `CCE DECISION: ASSURED WITH LIMITATIONS \| CREDGE ACTION: ONE MODEL VERSION REVIEW` |
| UC3 | `CCE DECISION: REVIEW REQUIRED \| CREDGE ACTION: HOLD FOR HUMAN REVIEW` |
| UC4 | `CCE DECISION: ESCALATE \| CREDGE ACTION: VEHICLE INSPECTION` |

### A.9 Policy context constants

```json
{
  "soh_range_pct": [0, 100],
  "soh_good_band_pct": [80, 90],
  "replacement_review_threshold_pct": 80,
  "critical_alert_threshold_pct": 60,
  "deep_discharge_threshold_soc_pct": 10,
  "cell_imbalance_threshold_v": 0.05,
  "cell_imbalance_threshold_mv": 50,
  "voltage_spread_inspection_threshold_mv": 200,
  "cell_voltage_range_v": [2.5, 4.2],
  "pack_voltage_range_v_14s": [35.0, 58.8],
  "temperature_range_c_discharge": [-20, 60],
  "required_cell_voltage_count": 14,
  "required_temperature_count": 3
}
```

---

## Appendix B — The check register (all 30 checks)

Every check the five layers run. `id` · `label` · what it evaluates · possible results.

### B.1 Input Assurance — 10 checks

| ID | Label | Evaluates | Possible results |
|---|---|---|---|
| `SOH-RANGE-01` | Output Range Validation | SoH output within 0.0–100.0% | clear · breach |
| `CYCLE-03` | Charge Cycle Count | Cycle count is an integer ≥ 0 and within rated cycle life | clear · breach |
| `AIS-156-SOC` | State of Charge (SoC) | SoC ≥ 10.0% to prevent deep-discharge cell reversal | clear · breach |
| `CURR-DIR-05` | Current Direction & Envelope | Current sign aligns with operation; continuous C-rate limits | clear · breach |
| `POWER-SIGN-06` | Power Sign & Identity Consistency | Power sign matches current; P = V × I within tolerance | clear · breach |
| `AIS-038-IMB` | Cell Imbalance Standard | σ of the 14 cell voltages ≤ 0.050 V (50 mV) | clear · breach |
| `IR-POS-08` | Internal Resistance Rectification | Internal resistance strictly > 0 Ω post-rectification | clear · breach |
| `PACK-V-10` | Pack Voltage vs Series Sum | Pack voltage equals the sum of 14 cells; 35.00–58.80 V | clear · breach |
| `TEMP-RANGE-12` | Thermal Spread & Limits | All sensors within −20.0 to +60.0 °C discharge window | clear · breach |
| `OVUV-11` | BMS Fault & Safety Triggers | Latching over/under-voltage fault flags equal 0 | clear · breach |

### B.2 Model Assurance — 4 checks

| ID | Label | Evaluates | Possible results |
|---|---|---|---|
| `MOD-RNG-01` | Output Range Validation | Predicted SoH within 0.0–100.0% | clear · breach |
| `MOD-CON-01` | Output-to-Status Consistency | Status label matches the numeric band (80–<90% = GOOD) | clear · breach |
| `MOD-VER-01` | Model Identity & Version Gate | Incoming model version equals configured production release | clear · limitation · breach |
| `MOD-FEA-01` | Input Feature Availability | All required battery features present, no missing vectors | clear · limitation · breach |

### B.3 Policy Assurance — 5 checks

| ID | Label | Evaluates | Possible results |
|---|---|---|---|
| `SOH-OPER-02` | SoH Operating Band Policy | SoH against ChargeUp operating policy (≥80% Tier 1 clearance) | clear · breach |
| `IMBAL-THRESH-02` | AIS-038 Cell Imbalance Limit | Cell voltage imbalance against the statutory 50 mV ceiling | clear · breach |
| `DELTAV-INSPECT-03` | Voltage Spread Inspection Threshold | Max-to-min cell voltage spread < 200 mV | clear · breach |
| `OVUV-ALERT-04` | BMS Fault Trigger Check | Zero latching over/under-voltage breach events per AIS-156 | clear · breach |
| `SOC-DEEPDIS-05` | Deep-Discharge Prevention Rule | SoC against the ≥10.0% deep-discharge safety floor (AIS-156) | clear · breach |

### B.4 Decision Assurance — 3 layer checks + 7 contextual rules

| ID | Label | Evaluates | Possible results |
|---|---|---|---|
| `DEC-CTX-01` | Contextual Action Alignment | Recommended business action matches the governed evidence | clear · breach |
| `SOH-BOUNDARY-06` | Decision Boundary Proximity | Distance from the nearest policy threshold vs. a 2.0 pp margin | clear · review · breach |
| `DEC-REP-01` | Repeat Action & Historical Context | Whether a previous battery on the same vehicle showed the same pattern | clear · breach |

Contextual rules that can fire (rendered in the **Rules Triggered** panel, §11.4):

| ID | Fires when |
|---|---|
| `SOH-ERR-01` | Upstream prediction is `ERROR` |
| `SOH-MONO-02` | `forecast_soh_pct > state_of_health_pct` — physically impossible |
| `SOH-DEFAULT-03` | Inputs left on pre-filled training averages (`inputs_are_defaults == true`) |
| `SOH-SAFE-04` | `thermal_anomalies_30d >= 2` and `cycle_count > rated_cycles` |
| `SOH-BOUNDARY-06` | Reading within 2.0 pp of any policy threshold (60, 70, 80, 90%) |
| `SOH-UNVALIDATED-08` | `battery_age_months > 2` and `forecast_horizon_days > 330` |
| `DEC-REP-01` | A replacement battery repeats degradation on the same vehicle |

**Which fire per case:** UC1 none · UC2 none · UC3 `SOH-MONO-02` · UC4 `DEC-REP-01`, plus `SOH-UNVALIDATED-08` (forecast horizon 365 > 330).

### B.5 Explanation Assurance — 8 checks

| ID | Label | Evaluates | Possible results |
|---|---|---|---|
| `EXP-AVAIL-01` | Explanation Availability | An explanation string was generated and provided | clear · breach |
| `EXP-FAITH-02` | Output Faithfulness | The explanation accurately states the SoH percentage and status | clear · review · breach |
| `EXP-NUM-03` | Numerical Consistency | Cycle count, voltages and temperatures in the text match ingested values | clear · review · breach |
| `EXP-DEC-04` | Decision Consistency | The narrative supports the governed action | clear · review · breach |
| `EXP-POL-05` | Policy Consistency | Rules, standards and thresholds are quoted correctly | clear · review · breach |
| `EXP-CONTR-06` | Contradiction Detection | The explanation does not contradict telemetry, model identity or policy | clear · breach |
| `EXP-GROUND-07` | Evidence Grounding | Material claims are grounded in ingested telemetry | clear · review |
| `EXP-RAT-08` | Rationale Completeness | The driving governance rationale is articulated, not just the raw prediction | clear · review |

---

## Appendix C — Supplied model card

**This panel carries catalog specifications transcribed from ChargeUp's own documents. CCE did not produce, measure or verify any of it.** There is no model in the codebase — no weights, no inference code. SoH arrives as an input.

Mandatory provenance line above the panel content, verbatim:

> Supplied by the source system. Not measured or verified by CCE.

Known entries from the source (`sheet_data.json:329-661`) include a described architecture (*Deep Learning Neural Network*), an ensemble reference (*XGBoost + LightGBM*), and accuracy claims (*97.87% on held-out test data*, *95.23% at 365 days*).

**Before building this panel:** pull the complete entry list verbatim from `sheet_data.json:329-661` in the old repo and paste it into this appendix. Do not paraphrase, do not round, do not add an entry that is not in that file. Until that is done, build the panel against the entries above and mark it `TODO: complete entry list` in the code.

**Open question Q1 (§21) applies to this panel.** These are ChargeUp's own numbers being shown back to them under a Credge product header. Get the nod before it ships.

Standing footer line on the Model Assurance screen, verbatim from `vocab.ts:263-264`:

> CCE verifies model identity and output integrity. It does not inspect model internals.

---

## Appendix D — Roles and escalation

Default approver: **`Battery Operations Lead`**.

| Role | Assigned for |
|---|---|
| `Head of Fleet Safety` | `OPERATIONAL_CRITICAL`; direct triggers `state_of_health_pct < 60` or `thermal_anomalies_30d >= 2` |
| `Battery Asset Manager` | `OPERATIONAL_HIGH` |
| `Fleet Operations Lead` | `OPERATIONAL_MEDIUM`, `OPERATIONAL_LOW` |
| `Model Risk Reviewer` | `MODEL_RISK_MEDIUM` — e.g. UC2's model-version delta, and boundary risk `SOH-BOUNDARY-06` |
| `Head of Model Risk` | `MODEL_RISK_HIGH` |
| `Finance Director` | `FINANCIAL_HIGH` — e.g. replacement cost exposure `SOH-REPLACE-07` |
| `Compliance Analyst` | `COMPLIANCE_HIGH`, `COMPLIANCE_LOW` — e.g. pre-filled defaults `SOH-DEFAULT-03` |

**Every one of these titles is marked PLACEHOLDER in `roles.json:135`, pending ChargeUp commercial confirmation.** Render each with `(provisional)` appended, in `--ink-3`, until §21 Q2 is answered. This is not optional — showing an unconfirmed role title as though it were agreed is exactly the kind of thing that costs credibility in a partner meeting.

Per-case assignment: UC1 none · UC2 `Model Risk Reviewer (provisional)` · UC3 `Battery Asset Manager (provisional)` · UC4 `Head of Fleet Safety (provisional)`.

---

## Appendix E — Known gaps in the source

Carried forward from the engine audit. None of these block the build; all of them are things not to paper over.

| # | Gap |
|---|---|
| E1 | No ML model exists. SoH is an input. Nothing on any screen may imply CCE predicts it. |
| E2 | No numeric faithfulness score exists. Qualitative bands only. |
| E3 | No continuous anomaly score exists. Boolean rules only. |
| E4 | No relational battery or vehicle tables. Asset data lives inside audit-ledger JSON payloads. |
| E5 | Per-assurance-layer execution timers are not recorded. Only total pipeline latency. |
| E6 | ChargeUp role titles are unconfirmed placeholders. |
| E7 | The audit ledger cannot be queried by asset ID without a full table scan. Relevant when this is wired to live data — not now. |
| E8 | UC1 carries a cell imbalance above the stated 50 mV threshold while its Policy layer reads clear (see A.4). Reproduce as supplied; raise with the engine team. |
