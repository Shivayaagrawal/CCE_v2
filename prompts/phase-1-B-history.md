# Phase 1 · Track B — History & trend
**Owner:** Shivanya · **Branch:** `feat/phase1-history` from `develop`
**Gate:** shared with Track A — your two components render correctly inside
his `DecisionLayout` bottom row, for all four UC records, at 1920×1080.
Screenshot from inside `/decisions/CRD-2026-UC1-001/input` (or whichever route
exists when you check) once his layout is merged, or against a local stub
layout if you get here first.

---

Read `SPEC.md` again before writing code — specifically **§5** (`types.ts`,
`DecisionContext.historyPoints`, `getVehicleHistory`), **§7.4** (sequential
ramp — C6 is a *sequential* line, not categorical), **§9** (`ChartFrame` row),
**§14.2** (null formatting), **§16** (file ownership), **§18** Phase 1 row. If
anything below appears to conflict with SPEC.md, SPEC.md wins — stop and
report the conflict instead of choosing.

Phase 0 is merged. Branch from `develop` as `feat/phase1-history`.

You own **Track B** of Phase 1. Yokesh is simultaneously building **Track A**
(`DecisionLayout`, `DecisionHeader`, `PipelineRail`) in
`src/app/decisions/[id]/layout.tsx` and `src/features/decision/`. **DO NOT
create, edit, or copy anything under those paths, `src/design/`, or
`src/features/shell/`.** You may import from `src/lib/data/index.ts` and
`src/lib/data/types.ts` but must not change either. You own `src/lib/data/`
and `src/lib/assurance/` from Phase 0 already — no changes needed there for
this phase.

**One ownership nuance to flag, not resolve yourself:** §16's file tree marks
all of `src/design/components/` (including `ChartFrame.tsx`) as Track A's,
built in Phase 0 — and it's already in the styleguide as a shell (chart /
table / empty states). §18's Phase 1 row then assigns you *"`ChartFrame` + the
chart table-toggle mechanism."* Read that as: you are **not** editing
`ChartFrame.tsx` itself — you're building the reusable toggle *behaviour*
(the hook/state pattern that swaps a chart for its table view using
`ChartFrame`'s existing `tableView` prop) that C6 uses now and that C1–C5,
C7–C10 will reuse in Phase 3. If in practice you find `ChartFrame.tsx` itself
needs a change to support this, that's a cross-boundary edit — stop and get
Yokesh's review on it rather than editing his file solo (§17 already requires
this for anything under `src/design/`).

## SCOPE — build ONLY these

1. `src/features/history/HistoricalEventsTable.tsx`
2. `src/features/history/C6.tsx` — SoH Trend (last 6 decisions)
3. The chart table-toggle hook/pattern (e.g.
   `src/features/charts/useChartTableToggle.ts` or wherever fits — your call,
   report where you put it), wired into `C6` via `ChartFrame`

**Do NOT build:** any of C1–C5 or C7–C10 (Phase 3/2), the decision or
explanation screens (Phase 2), or anything in `src/lib/`.

---

## 1. `HistoricalEventsTable` — the bottom-left panel

7 columns wide, 236px tall, per **§10**. SPEC.md doesn't give this table an
explicit column list the way it does for the Overview's Recent Decision
Events table (§11.0) — the closest fit is `getVehicleHistory(vehicleId):
Promise<DecisionEvent[]>` (§5.1), which returns full `DecisionEvent` rows
(`id`, `timestampUtc`, `batteryId`, `vehicleId`, `vehicleType`, `manufacturer`,
`sohPct`, `sohStatus`, `engineAction`, `outcome`, `layerResults`,
`hasFullRecord`).

Recommended: reuse the Recent Decision Events column set minus Vehicle ID
(redundant — it's already in the header above, for the vehicle this whole
screen is about): **Decision ID (mono) · Timestamp · Battery ID · SoH % ·
Engine Action · Outcome (badge)**. Use the existing `DataTable` primitive from
Phase 0, not a new table component. If you make a different call on the
columns, that's fine — **report exactly what you chose and why**, same as
Track A is doing for the header's 11 fields. This is a spec gap, not a spec
conflict — don't silently paper over it either way.

## 2. `C6` — SoH Trend (last 6 decisions)

Per **§9**: *"Shared component; per-vehicle,"* appears on all five detail
screens. Line chart, 1 series, `--primary`, **final point rendered in its
outcome's status colour** (not the line series colour — the last point breaks
the sequential-blue convention deliberately, to show *this* decision's
result).

Data source: `record.context.historyPoints` — `{ label, sohPct, decisionId
}[]` (§5, `DecisionContext`). This field already lives on every
`DecisionRecord`, joint Phase 0.0 contract, so no new accessor call is needed
for this component. Take the last 6 points. `sohPct: null` in any point means
that decision has no SoH value — per §14.2, gap the line rather than plotting
a zero, and the point itself should not render as a mark.

Wrap it in `ChartFrame` with the `Table` toggle wired (see the shared hook
above) — its table view is the same 6 points as rows: Decision ID · SoH %.

## 3. The table-toggle mechanism

One reusable pattern, not one bespoke `useState` per chart. It needs to:
- Swap `ChartFrame`'s `children` between the chart render and a `DataTable`
  (or plain table) of the same underlying series
- Preserve panel height across the swap (§9: *"Panel height does not
  change"* — this is stated for chart↔table toggles generally, confirm it
  holds for C6's compact 236px frame too)
- Be trivially reusable by the Phase 3 charts (C1–C5) and the Phase 2 charts
  you own (C8, C9) without copy-paste

---

## RULES

- No hardcoded colour, size, spacing or duration — tokens only.
- **`sohPct: null` is never plotted as `0`.** This is the same class of bug as
  the fixture's null-handling rule from Phase 0 — it will look identical to a
  real zero-SoH battery if you get it wrong, and that's a false alarm nobody
  will catch by eye.
- **Do not start a blocking dev server and wait on it.** Verify with
  `npm run build` and `npx tsc --noEmit`; screenshot by starting the server,
  capturing, then stopping it.

## VERIFICATION — paste actual output, not a summary

```
npx tsc --noEmit
npm run build
```

Then screenshot both components rendering for all four UC records
(`CRD-2026-UC1-001` through `UC4-001`) — inside Track A's layout once it's
merged, or in a minimal local stub route if you get there first and note that
you did. UC4 is the one to look at hardest: confirm its `historyPoints`
(if any are null) gap correctly rather than drawing through zero.

## REPORT BACK

1. Output of both commands.
2. Screenshots for all four UC records.
3. The exact `HistoricalEventsTable` columns you chose.
4. Where you put the table-toggle hook, and confirmation it's the same code
   path C6 and (later) C1–C5/C7–C10 will share.
5. Whether `ChartFrame.tsx` itself needed any change, and if so, that you
   flagged it for Yokesh's review rather than merging it solo.
6. Anything you wanted to add that isn't in the spec — say so, don't add it.

Do not report the task complete without the command output and every
screenshot.