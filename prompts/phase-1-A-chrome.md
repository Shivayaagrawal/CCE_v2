# Phase 1 · Track A — Decision chrome
**Owner:** Yokesh · **Branch:** `feat/phase1-chrome` from `develop`
**Gate:** `/decisions/CRD-2026-UC1-001/input` renders the full chrome with a
placeholder in the layer slot, at 1920×1080 and 1440×900, screenshotted.

---

Read `SPEC.md` again before writing code — specifically **§4** (vocabulary,
roll-up), **§5** (`types.ts`, especially `DecisionRecord` and `DecisionContext`),
**§9** (component table), **§10** (layout system), **§16** (file ownership),
**§18** Phase 1 row. If anything below appears to conflict with SPEC.md, SPEC.md
wins — stop and report the conflict instead of choosing.

Phase 0 is merged. Branch from `develop` as `feat/phase1-chrome`.

You own **Track A** of Phase 1. Shivanya is simultaneously building **Track B**
(`HistoricalEventsTable`, `C6`, the chart table-toggle mechanism) in
`src/features/history/` and `src/features/charts/`. **DO NOT create, edit, or
copy anything under those two directories, `src/lib/data/`, or
`src/lib/assurance/`.** You may import from `src/lib/data/index.ts` and
`src/lib/data/types.ts` but must not change either.

## SCOPE — build ONLY these

1. `src/app/decisions/[id]/layout.tsx` — `DecisionLayout`
2. `src/features/decision/DecisionHeader.tsx` (+ subcomponents as needed)
3. `src/features/decision/PipelineRail.tsx`
4. Wiring `OutcomeCard` (built in Phase 0, styleguide-only so far) to real record
   data inside the rail
5. `src/app/decisions/[id]/input/page.tsx` — **placeholder only**, to satisfy the
   gate

**Do NOT build:** `model/page.tsx`, `policy/page.tsx`, `decision/page.tsx`,
`explanation/page.tsx`, or any real layer-panel content. Those are Phase 2. If
you find yourself filling in actual Input Assurance content, stop — this phase
proves the chrome renders, not the screen.

---

## 1. `DecisionLayout` — `src/app/decisions/[id]/layout.tsx`

Per **SPEC.md §10**, detail-screen grid (identical on all five layer screens):

| Region | Columns | Height |
|---|---|---|
| Decision header strip | 12 | 78px, sticky below topbar |
| Pipeline rail | 3 | fills |
| Layer panel (`children`) | 9 | fills |
| Historical events table | 7 | 236px |
| SoH trend (C6) | 5 | 236px |

The bottom row is **one shared component, built once, here** — not per screen.
Import Shivanya's `HistoricalEventsTable` and `C6` from `src/features/history/`.
**If they don't exist yet when you reach this step, stub both slots with the
`EmptyState` primitive and say so in your report — do not invent fixture data
or fake charts to fill them yourself.**

Fetch the `DecisionRecord` for `[id]` via the accessor in `lib/data/index.ts`
(§5.1 — confirm the exact function name there) and pass it to `DecisionHeader`
and `PipelineRail`. `children` renders in the 9-column layer-panel slot.

Topbar breadcrumb for this route family: `Decision Events / [id] / [current
layer name]`, built on the existing `Breadcrumb` primitive.

Per **§12**'s signature-transition note: only the layer panel cross-dissolves
between layers. **The header strip and the bottom row do not move.**

## 2. `DecisionHeader` — the 11-field sticky strip

§9 specifies *"11 fields, sticky"* but does not enumerate them anywhere in the
document — I checked. Derive the 11 from `DecisionRecord` (§5): fields that
identify *this decision*, not layer-detail fields (those live in the layer
panels). Recommended set, in this order:

1. Decision ID (`id`, mono)
2. Timestamp (`timestampUtc` — null for UC2/UC3/UC4; render per your §14.3 null
   rule)
3. Battery ID
4. Previous Battery ID (null except UC4 — `Not measured` via the `KeyValue`
   null handling you already built in Phase 0)
5. Vehicle ID
6. Manufacturer
7. Pack Configuration
8. SoH % + SoH Status
9. Cycle Count
10. Pipeline Latency (`pipelineLatencySeconds` — per line 117 of SPEC.md, this
    is "the only timing figure that is measured" and belongs in the header,
    nowhere else)
11. Overall Assurance Outcome, as a `StatusBadge` size `md`

If SoH%/Status as one field vs. two changes your count to 10 or 12, that's
fine — **report your exact final list** so it can be checked against intent
rather than guessed at twice.

## 3. `PipelineRail` + `OutcomeCard`

Five steps in `LayerKey` order (§5): `input`, `model`, `policy`, `decision`,
`explanation`. Each step:

- Layer display name (Input / Model / Policy / Decision / Explanation
  Assurance)
- `record.layers[key].result`, rendered icon + label + tint per **§7.2** —
  colour never carries meaning alone, anywhere, including here
- Active step (matches current route): filled card + 2px left accent in its
  result colour (§9 interaction table)
- Click navigates to `/decisions/[id]/[layer]`; hover raises the step's tint

Below the rail steps: `OutcomeCard` at `size="rail"` — the overall outcome
plus its recommended action string (`record.action`), matching the four
outcome/action pairs already confirmed in the styleguide review (`APPROVE
WARRANTY — TIER 1 CLEARANCE` / `ONE MODEL VERSION REVIEW` / `HOLD FOR HUMAN
REVIEW` / `VEHICLE INSPECTION`).

**Known, expected gap:** clicking a rail step whose route has no `page.tsx`
yet (model/policy/decision/explanation) will 404 until Phase 2 lands those
files. That's correct for this phase — do not build placeholder pages for the
other four layers to paper over it. Report it; don't route around it.

## 4. Placeholder page — `src/app/decisions/[id]/input/page.tsx`

Minimal. Renders inside `DecisionLayout` with an `EmptyState` (or a plain
placeholder panel, e.g. *"Input Assurance — Phase 2"*) filling the 9-column
layer slot. This file exists only so the gate route resolves end to end.

---

## RULES

- No hardcoded colour, size, spacing or duration — tokens only, same as Phase 0.
- `outcome` is a **stored** field (§4.3). Never call `rollup.ts` to compute or
  override what the header/rail display — that function is for the
  consistency test and styleguide only.
- **Do not start a blocking dev server and wait on it.** Verify with
  `npm run build` and `npx tsc --noEmit`; screenshot by starting the server,
  capturing, then stopping it.

## VERIFICATION — paste actual output, not a summary

```
npx tsc --noEmit
npm run build
```

Then screenshot `/decisions/CRD-2026-UC1-001/input` at **1920×1080** and
**1440×900**. Also screenshot `CRD-2026-UC2-001`, `CRD-2026-UC3-001`, and
`CRD-2026-UC4-001` at one size each — this checks the header/rail against a
null timestamp, a null previous-battery-id, and all four outcome colours
while it's cheap, rather than discovering a break during Phase 2.

## REPORT BACK

1. Output of both commands.
2. Screenshots: UC1 at both sizes, UC2/UC3/UC4 at one size each.
3. Your final 11-field `DecisionHeader` list, exactly as rendered.
4. How you handled the history/C6 slots if Track B's components weren't ready
   when you got there.
5. Anything you wanted to add that isn't in the spec — say so, don't add it.

Do not report the task complete without the command output and every
screenshot.