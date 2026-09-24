# Phase 0 · Track A — Foundation
**Owner:** Yokesh · **Branch:** `feat/phase0-foundation` from `develop`
**Gate:** `/styleguide` screenshots at 1920×1080 and 1440×900, plus clean build.

---

Read `SPEC.md` at the repo root end to end before writing code. It is the single
source of truth. If anything below appears to conflict with SPEC.md, SPEC.md wins —
stop and report the conflict instead of choosing.

Branch from `develop` as `feat/phase0-foundation`.

You own **Track A** of Phase 0. Another developer is simultaneously building Track B
(the data layer) in `src/lib/data/`. **DO NOT create, edit, or copy anything under
`src/lib/data/` or `src/lib/assurance/`.** You may import from
`src/lib/data/types.ts` but must not change it — it is a shared contract and she is
building against it right now.

## SCOPE — build ONLY these

1. `src/design/tokens.css`
2. The primitive component library in `src/design/components/`
3. The app shell (navigation rail + topbar) in `src/features/shell/`
4. `src/lib/format.ts`
5. The `/styleguide` route

**Do NOT build:** any of the six product screens, any chart, any fixture data, the
decision header, or the pipeline rail. Those are Phase 1 and Phase 2. If you find
yourself creating a file not covered by the five items above, stop.

---

## 1. Tokens — `src/design/tokens.css`

Transcribe every token in **SPEC.md §7** exactly:

- §7.1 surfaces and ink
- §7.2 status colours — all five states, all four values each (mark, ink, bg, border)
- §7.3 the categorical series palette
- §7.4 the sequential ramp
- §7.5 the type scale
- §7.6 spacing, radius, elevation
- §7.7 motion durations and easings

These hex values were contrast-validated against the surfaces they render on. **Do
not substitute, do not round, do not add a colour.** There is no colour in this
product that is not in §7.

Expose them as CSS custom properties on `:root` and wire them into the Tailwind
theme so they are usable as utility classes.

## 2. Formatters — `src/lib/format.ts`

Implement every rule in **SPEC.md §14.3**. One module; no component ever formats a
number itself.

The null rule is the important one: **`null` renders the string `Not measured`** —
never `0`, never `—`, never blank. Write unit tests for the null rule and for each
numeric format (SoH, voltage to 4dp, resistance to 5dp, millivolts, temperature,
counts, latency, dates, times).

## 3. Primitives — `src/design/components/`

Build every component in the **SPEC.md §9** table, with the listed props and every
listed state. Type all props against `src/lib/data/types.ts`.

Binding rules while building these:

- **Every status display is icon + label + tint.** Colour never carries meaning
  alone. SPEC §7.2 explains why — the middle two states are indistinguishable under
  deuteranopia. This is not negotiable and it applies to badges, table cells, chart
  legends and the pipeline rail alike.
- **Panel padding is 16px. Gap between panels is 12px. Table rows are 34px.** Do not
  increase any of these. The density is deliberate — see SPEC §1.5. Where something
  feels crowded, remove chrome, never add space.
- **Exactly two elevation levels exist.** Nothing else casts a shadow.
- **Every interactive element has a visible focus ring.** Never `outline: none`
  without a replacement.
- Tabular figures on every column of numbers; proportional on standalone values.

## 4. App shell — `src/features/shell/`

Per **SPEC.md §10**:

- Navigation rail: 220px expanded, 64px collapsed, colour `--rail`, logo block 64px,
  nav items 40px, collapse control pinned bottom. Active item: `--rail-active` 3px
  left bar plus `--rail-ink`.
- Topbar: 56px, `--surface`, bottom border `--rule`.

Nav items: **Decision Events** (active), Reports, Alerts, Settings. Reports, Alerts
and Settings are **out of scope for this build** — render them with the
`DisabledNavItem` component showing "Coming soon" on hover. They must not navigate
and must not 404.

## 5. Styleguide — `src/app/styleguide/page.tsx`

Every token rendered with its name and its value. Every primitive rendered in every
state listed in §9. All five status states side by side. All four outcomes side by
side.

This page is your gate, and it is also how the other developer checks her work
against yours. Make it **complete**, not representative.

---

## RULES

- No hardcoded colour, size, spacing or duration anywhere. Tokens only.
- No data. Primitives take props; the styleguide passes literal props inline. Do not
  import fixture data and do not invent any.
- **Do not start a blocking dev server and wait on it.** Verify with `npm run build`
  and `npx tsc --noEmit`, both of which terminate. If you need a screenshot, start
  the server, capture, and stop it — never block on a process that does not exit.

## VERIFICATION — paste actual output, not a summary

```
npx tsc --noEmit    # must be clean
npm run build       # must succeed
npm test            # format tests must pass
```

Then screenshot `/styleguide` at **1920×1080** and at **1440×900**.

## REPORT BACK

1. The output of all three commands.
2. Both screenshots.
3. A list of every component you built and the states each one renders.
4. Any token in §7 you did not implement, and why.
5. Any moment you wanted to add something not in the spec — **say so rather than
   adding it.** That is a spec change and it goes through its own PR.

Do not report the task complete without the command output and the screenshots.
