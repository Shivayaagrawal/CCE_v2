# Phase 0 · Track B — Data layer
**Owner:** Shivanya · **Branch:** `feat/phase0-data` from `develop`
**Gate:** `npm test` green on all eight consistency assertions.

---

Read `SPEC.md` at the repo root end to end before writing code — **including
Appendices A through E**, which contain all the source data you need. It is the
single source of truth and it is self-contained; you do not need the old repo. If
anything below appears to conflict with SPEC.md, SPEC.md wins — stop and report the
conflict instead of choosing.

Branch from `develop` as `feat/phase0-data`.

You own **Track B** of Phase 0. Another developer is simultaneously building Track A
(tokens, components, shell). **DO NOT create or edit anything under `src/design/`,
`src/features/`, or `src/app/`.** You own `src/lib/data/` and `src/lib/assurance/`
only. You may import from `src/lib/data/types.ts` but must not change it — he is
building against it right now.

## SCOPE — build ONLY these

1. The four decision records, from SPEC.md **Appendix A**
2. The demonstration fleet generator, per SPEC.md **§6.3**
3. The accessor layer, per SPEC.md **§5.1**
4. The roll-up function, per SPEC.md **§4.3**
5. The consistency test, per SPEC.md **§6.4**

**Do NOT build:** any screen, component, chart or style.

---

## 1. The four records — `src/lib/data/fixture/cases.ts`

Transcribe UC1, UC2, UC3 and UC4 from **Appendix A** into `DecisionRecord` objects.
These rules are absolute:

- **Copy every value verbatim. Do not round.** `3.8172` stays `3.8172`. `-0.00792`
  stays `-0.00792`. `0.06497` stays `0.06497`.
- **UC1, UC2 and UC3 each have 35 telemetry rows. UC4 has 6.** Every other UC4 field
  is `null` and must stay `null`. **Do NOT copy UC1's telemetry into UC4** — the
  source explicitly states those fields are not supplied for that scenario. This is
  the single most damaging mistake available in this task.
- **`null` means "the source does not supply this". It is never zero.**
- **UC2 and UC3 will NOT reconcile with the roll-up function.** That is correct and
  expected — see SPEC §4.3. `outcome` is a *stored* field taken from Appendix A.
  Do not change UC2 or UC3 to satisfy the roll-up, and do not change the roll-up to
  satisfy them.
- **UC1's cell imbalance (64.97 mV) sits above the stated 50 mV threshold while its
  Policy layer reads clear.** Reproduce exactly as supplied. Do not correct it.
- **UC1's explanation text says 85.37% while its telemetry says 85.4%.** Reproduce
  both. Do not harmonise them — that discrepancy is exactly what check `EXP-NUM-03`
  exists to catch.

Attach the check definitions from **Appendix B** to each layer, with per-case results
consistent with **Appendix A.3**.

## 2. The fleet generator — `src/lib/data/fixture/fleet.ts`

Implement **SPEC.md §6.3** exactly:

- **mulberry32 PRNG seeded `20260924`. No `Math.random` anywhere in this repo.**
  The fixture must be byte-identical on every machine.
- **1,248 events** over a 14-day window ending at `AS_OF`.
- Outcome counts exactly: `ASSURED` **1080** · `ASSURED WITH LIMITATIONS` **97** ·
  `REVIEW REQUIRED` **51** · `ESCALATE` **20**.
- **312 vehicles**, each with 1–2 batteries over the window.
- Each vehicle gets one `VehicleType` at creation and keeps it for every event.
  Distribution: Last Mile Delivery **128** · Intercity Cargo **71** · Passenger
  Shuttle **54** · Municipal Fleet **35** · Rental Pool **24**.
- `manufacturer` drawn from LG **198** · Samsung SDI **68** · Exide **46**.
- `VEH-CU-4092` — the vehicle in all four real records — is **Last Mile Delivery**
  and **LG**.
- SoH drawn per outcome within the bands stated in §6.3.
- **`engineAction` is DERIVED from SoH** via the §7.4 policy bands, never assigned
  independently. A row whose action contradicts its SoH is a bug the test must catch.
- `hasFullRecord: false` on every generated row.
- The four UC records are injected as the four most recent events, with
  `hasFullRecord: true`.

`AS_OF` lives in `src/lib/data/fixture/config.ts` as a single exported constant.
**Nothing else in the repo hardcodes a date.**

## 3. Accessors — `src/lib/data/index.ts`

Exactly the six functions in **SPEC.md §5.1**, no more. All `async`, all returning
after a resolved promise tick. This is the seam where live API calls will later
replace fixture reads, so the signatures must not leak fixture concepts.

`getEvents` and `getAggregates` accept `EventFilters` (SPEC §5). Arrays are OR within
a key, AND across keys.

**Aggregates are COMPUTED from the event array on every call.** Do not precompute
and store them. **Do not hardcode a single count, percentage or rate anywhere.**

## 4. Roll-up — `src/lib/assurance/rollup.ts`

The function in **SPEC.md §4.3**. It is used by the consistency test and the
styleguide only. It must never be called to override a stored outcome on a screen.

## 5. Consistency test — `src/lib/data/__tests__/fixture.test.ts`

All eight assertions in **SPEC.md §6.4**, each named individually so the output is
readable. Assertion 7 must check telemetry row counts are exactly **35 / 35 / 35 / 6**.

---

## RULES

- No `Math.random`.
- **No hardcoded aggregate.** If a number appears in your code that is not a source
  value from Appendix A or a parameter from §6.3, it is a bug.
- **Do not start a blocking dev server and wait on it.** Verify with `npm test` and
  `npx tsc --noEmit`, both of which terminate.

## VERIFICATION — paste actual output, not a summary

```
npx tsc --noEmit    # must be clean
npm test            # all eight assertions pass, named individually
```

## REPORT BACK

1. The full test output showing all eight assertions by name.
2. **The computed aggregates:** outcome counts, the five SoH bin counts, the five
   per-layer clear rates, and the assurance rate.
3. Confirmation that UC4 has exactly 6 telemetry rows and that the rest are `null`.
4. Anything in Appendix A you could not transcribe faithfully, and why.

Do not report the task complete without the test output.
