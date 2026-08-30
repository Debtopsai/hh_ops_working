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

---

## HubSpot validation, 26 August 2026

Added after the CRM was connected. Full findings in `docs/hubspot-schema.md`.

### The equipment classifier, validated against real text

All 58 real enquiries were retrieved and classified.

**The catalogue definition was corrected on 27 August 2026.** The owner
confirmed that refrigeration and food prep & slicing are NOT supplied, along
with coffee machines, ice makers (only very occasionally), slushie and smoothie
machines, sinks and plumbing, and extraction and ventilation. Section 8.4 of the
brief and the July 2026 business overview both counted refrigeration and food
prep as in catalogue. They were wrong.

| Outcome | On the brief's catalogue | **Corrected** |
|---|---|---|
| In catalogue | 38 | **32** |
| Mixed, named supplied and unsupplied kit | 3 | **5** |
| **Out of catalogue** | 10 | **14** |
| Stated but not specific | 7 | 7 |
| Unclassified | 0 | **0** |
| **Share out of catalogue** | 19.6% | **27.5%** |
| **Estimated wasted spend** | NZ$104.10 | **NZ$145.74** |

**More than a quarter of classified leads want equipment HireHospo does not
supply**, not the roughly 19% the brief estimated. That is a 40% relative
increase, and it was hidden by a stale catalogue definition rather than by a
classifier fault.

Nine of the 58 enquiries touch refrigeration or food prep. Six mention
refrigeration, five mention food prep, and two of each are pure enquiries that
cannot be filled at all. The rest are mixed: someone wanting an oven and a
fridge is still worth a call, they just cannot get everything.

The corpus is committed at `test/fixtures/equipment-enquiries.json`, equipment
text only, and the assertions are in `test/equipment-corpus.test.mjs`.

### Four classifier defects that only real text exposed

Every one of these passed the original synthetic tests and failed on live data.

1. **A bare "Oven" matched nothing.** Six of the 58 leads said exactly that.
2. **"lpg griller" missed**, because a strict word boundary rejects the `er`
   suffix on `grill`. Matching now tolerates `s`, `es`, `er` and `ers` but not
   `ing`, so `sinks` still matches `sink` and `sinking` still does not.
3. **A mixed enquiry was written off.** One lead named eleven items plus one
   range hood and was classified out of catalogue on the range hood alone.
   Mixed enquiries are now their own outcome and count as worth having.
   Charging those five leads to wasted spend would overstate it by 36% and
   argue for narrowing ad copy that is working.
4. **`"filling  machine"` has a double space** and failed a literal keyword
   match. Whitespace is now collapsed before matching. This was the last
   unclassified enquiry.

Real submissions also include `speed owen`, `Gas hop`, `slushi machines` and
`comercial indin cooking cook top`. A classifier tuned on tidy invented examples
scores well on tidy invented examples.

### The one contract, confirmed and unattributable

The section 9 signed contract is confirmed in HubSpot as
`CIAO CUSINA LIMITED (9343046) Registered - Lease agreement`, created
19 August 2026:

| Field | HubSpot value | Section 9 |
|---|---|---|
| `weekly_total_cost` | 115 | $115/wk |
| `rent_in_advance__weeks_` / `product_upfront_rental` | 6 / 690 | 6 weeks advance |
| `security_deposit_weeks` / `security_deposit_amount` | 6 / 690 | 6 weeks security |
| Term | **empty** | 156 weeks |
| Delivery and install | **no such property** | $895 |

The weekly payment and the 6+6 deposit reconcile exactly. The term and the
install charge do not exist in the CRM, so the $18,835 contract revenue figure
rests on section 9 of the brief, not on CRM data. The dashboard labels it.

**The deal has no associated contact**, and there is no contact record for Ciao
Cusina in the portal. So the attribution of that contract to the Meta campaign
is a human judgement. It may well be right. The dashboard cannot verify it and
does not claim to.

### What cannot be validated, and why

| Metric | Blocked by |
|---|---|
| Qualified leads, quotes issued | No deal carries a contact, so no deal is attributable to a lead |
| Contracts signed, contracts funded | `dealstage` never advances. Zero deals have reached Closed Won, for a business with 24 active paying customers |
| Contract revenue from live deals | Term empty on all 49 deals |
| Sales cycle median | Requires the lead to deal join |
