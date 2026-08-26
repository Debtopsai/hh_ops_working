# Validation baselines

Section 9 of the brief, checked against the live Meta Marketing API on
26 August 2026.

> "Your pipeline must reproduce these before you trust it."
> "Do not skip step 2's validation. Every figure downstream inherits it."

Campaign `120250374716300748` "HH Brochure Campaign 01/08 2026", ad account
`2139666836427566`, 1 to 25 August 2026 unless stated. All figures ex GST, NZD.

## Result

**25 of 26 baselines reproduce exactly. One baseline in the brief is wrong by a
cent, and the pipeline has not been bent to match it.** See "The one departure"
below.

The captured API responses are committed as test fixtures
(`test/fixtures/meta-aug-2026.json` and `test/fixtures/meta-daily-aug-2026.json`)
and the assertions live in `test/baselines.test.mjs`. They run on every build.

## Headline

| Metric | Brief | API | Status |
|---|---|---|---|
| Spend | NZ$656.01 | NZ$656.01 | Exact |
| Impressions | 39,707 | 39,707 | Exact |
| Clicks | 884 | 884 | Exact |
| CTR | 2.23% | 2.23% | Exact |
| CPM | NZ$16.52 | NZ$16.52 | Exact |
| Form leads | 63 | 63 | Exact |
| CPL | NZ$10.41 | NZ$10.41 | Exact |

Result indicator confirmed as `actions:leadgen.other`, matching the brief.

Additional figures not in the brief but captured: reach 10,220, CPC NZ$0.74,
**frequency 3.885225**.

## Platform split, must sum to NZ$656.01

| Platform | Spend | Impressions | Leads | CPL |
|---|---|---|---|---|
| Facebook | NZ$572.26 | 35,516 | 58 | NZ$9.87 |
| Instagram | NZ$83.75 | 4,191 | 5 | NZ$16.75 |
| **Sum** | **NZ$656.01** | **39,707** | **63** | |

Sums to campaign spend, impressions and leads. Exact on all three.

## Region split, must sum to NZ$656.01

| Region | Spend | Impressions | Leads |
|---|---|---|---|
| Auckland Region | NZ$654.49 | 39,638 | 63 |
| Waikato | NZ$1.39 | 61 | 0 |
| Northland Region | NZ$0.13 | 8 | 0 |
| **Sum** | **NZ$656.01** | **39,707** | **63** |

Auckland is 99.8% of spend, matching the brief. All 63 leads are attributed to
Auckland. The NZ$1.52 spent outside Auckland produced no leads, which is worth
noting given Rent and Lease to Own are Auckland only.

## Weekly trend

| Week | Brief spend | API spend | Brief CTR | API CTR | Brief leads | API leads | Brief CPL | API CPL |
|---|---|---|---|---|---|---|---|---|
| 1 to 7 Aug | $220.38 | $220.38 | 2.71% | 2.71% | 24 | 24 | $9.18 | $9.18 |
| 8 to 14 Aug | $210.85 | $210.85 | 2.17% | 2.17% | 16 | 16 | $13.18 | $13.18 |
| 15 to 21 Aug | $144.83 | $144.83 | 1.79% | 1.79% | 14 | 14 | $10.34 | **$10.35** |

## The one departure

**The brief gives week 3 CPL as $10.34. The correct figure is $10.35.**

- $144.83 / 14 = exactly 10.345
- Meta's own `cost_per_result` for 15 to 21 August returns **NZ$10.35**
- Exact decimal arithmetic rounded half up gives 10.35
- Only banker's rounding or truncation gives 10.34, and Meta uses neither

Both inputs reconcile exactly against the live API: spend $144.83 and 14 leads
are confirmed. Only the derived figure in the brief is off, by one cent, at an
exact rounding tie.

The pipeline reports 10.35. Matching 10.34 would have meant adopting a rounding
convention that disagrees with the source system on every future tie, to make
one historical cent line up. The test at `test/baselines.test.mjs` pins the
unrounded value of 10.345 so this cannot be quietly reverted.

## Unit economics

The one signed contract: $115 a week, 156 weeks, $895 delivery and install,
6+6 deposit.

| Metric | Brief | Pipeline | Status |
|---|---|---|---|
| Contract revenue | NZ$18,835 | NZ$18,835.00 | Exact |
| CAC, media only | NZ$656.01 | NZ$656.01 | Exact |
| LTV:CAC at 25% margin | 7.2 : 1 | 7.18 : 1 | Exact to the stated precision |
| Payback | 22.8 weeks | 22.8 weeks | Exact |

The wrong figure of $20,215 is asserted against in `test/revenue.test.mjs` and
does not appear anywhere in the generated payload.

## Additional splits checked, not in the brief

Both sum to NZ$656.01 and to 63 leads.

**Age band.** 45-54 delivers the most leads (22 on $212.06). **65+ has the
lowest CPL at $4.53**, less than half the campaign average, on 4.1% of the
budget. 18-24 produced no leads on $3.92.

**Ad level.** Seven ads, summing to NZ$656.01 and 63 leads. One creative,
"Low Weekly Payment #3", carries **74.6% of spend** (NZ$489.31) and 47 of the 63
leads, at a frequency of 3.38. That is a concentration risk and it is surfaced
on panel 4.

## Live findings worth acting on

These came out of the validation rather than the brief.

1. **Frequency is 3.885 over the period, above the 3.0 amber threshold** and
   approaching the 4.0 red line. CTR falls monotonically week on week, 2.71% to
   2.17% to 1.79%, while frequency accumulates. That is the fatigue pattern
   panel 4 exists to show, and it is already present.
2. **74.6% of spend sits on one creative.** If it fatigues, the campaign does.
3. **The datasets endpoint returns four rows for two distinct pixel IDs**, and
   some rows carry `last_fired_time` of `1969-12-31T16:00:00-0800`, which is
   unix zero used as a null sentinel. Read naively that reports a pixel as 56
   years stale. Handled in `src/lib/health.mjs` and tested.
4. **There are zero custom conversions on the ad account.** The stage labels in
   section 8.2 are therefore not custom conversion definitions, so they cannot
   be enumerated from that endpoint. The stage map has to be maintained by hand
   in `config/stage-map.json` until the HubSpot schema is known.
5. **The daily rate claim discrepancy is confirmed.** Ads named "From $3.99/day"
   spent NZ$132.53 and are delivering. "From $6.99/day (B)" spent NZ$0.14 on 11
   impressions, so it is effectively not running. No ad carries the approved
   $4.66/day. Note this is read from ad names, which are a proxy for the
   creative body text and should be confirmed against the creative itself before
   any external use.

## Reproducing

```bash
npm test                  # the whole suite
npm run validate          # section 9 baselines only
```

Reconciliation is also computed live on every refresh, not just at build time.
If a future date range or filter breaks a split, the dashboard reports it on
panel 7 rather than quietly showing a wrong number.
