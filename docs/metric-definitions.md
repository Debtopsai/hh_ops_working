# Metric definitions

Section 6 of the brief. "The metric definitions in section 6 are the
deliverable. The code is straightforward. The definitions are where this goes
wrong, and it already did once."

Every currency calculation uses `Decimal`, never floats. All figures ex GST.
All currency NZD. Implemented in `src/lib/revenue.mjs`, `src/lib/funnel.mjs`
and `src/lib/meta.mjs`.

Where a value cannot be computed honestly the pipeline returns `null` and the
dashboard shows `[TBC]`. It never substitutes zero, because zero is a claim.

## Acquisition

| Metric | Definition | Implementation |
|---|---|---|
| Spend | Meta `amount_spent` (Graph API `spend`), campaign scope | `meta.normaliseRow` |
| Leads | Instant Form submissions. Meta `results` where the indicator is `leadgen.other` | `meta.parseResults` |
| CPL | Spend / Leads | `meta.normaliseRow` |
| CTR | Clicks / Impressions | Meta's own value where present, derived only when absent |
| Frequency | Meta `frequency`. Amber above 3.0, red above 4.0 | `snapshot.headline.frequencyStatus` |
| Qualified leads | Deals reaching a qualified stage, per the stage map | `stage-map.cumulativeCounts` |
| Cost per qualified lead | Spend / Qualified leads | `funnel.buildFunnel` |
| Quotes issued | Deals at quote stage **or beyond** | `stage-map.cumulativeCounts` |
| Cost per quote | Spend / Quotes issued | `funnel.buildFunnel` |

Two notes on leads:

- **Zero is a shape, not an absence.** Meta returns `{ value: "Not available" }`
  for a period with no leads and `{ values: [{ value: "63" }] }` for one with
  leads. Both parse. A parser handling only the second silently drops every zero
  day.
- **The funnel uses the deduplicated count**, the headline shows both. Section
  8.5: repeat submissions suggest the confirmation step is not landing, so the
  raw count stays visible.

## Conversion

| Metric | Definition |
|---|---|
| Contracts signed | Deals in a closed won stage |
| **Contracts funded** | Closed won **AND** deposit cleared. This is the real number |
| CAC | Spend / Contracts funded. Falls back to signed only when funding data is unavailable, and says so |
| Lead to close rate | Contracts funded / Leads |
| Quote to close rate | Contracts funded / Quotes issued |
| Sales cycle | Median days from lead `created_time` to closed won date |

**Signed is not funded.** A contract with no cleared deposit is not a deal.
While GoCardless is not connected, `contractsFunded` is `null`, the label reads
"signed, funding unconfirmed", and lead to close and quote to close stay `null`
rather than quietly recomputing on the signed basis. A separate
`leadToCloseSignedBasis` is provided, named so it cannot be mistaken.

## Unit economics

| Metric | Definition |
|---|---|
| Contract revenue | `weekly_payment x term_weeks` **plus** delivery and install |
| LTV | Contract revenue x gross margin. Margin is a configurable input, default 25% |
| LTV:CAC | LTV / CAC |
| Payback weeks | CAC / (weekly payment x gross margin) |
| Risk adjusted revenue | Contract revenue with the **weekly stream** discounted by the payment failure rate |

Terms: Rent is 52 weeks, Lease to Own is 156 weeks. **The term is read from the
deal.** `contractRevenue` returns `null` on a missing term rather than assuming
one, and reports which default was used if one ever is.

Risk adjustment discounts the weekly stream only. Delivery and install is
collected once, up front, and is not exposed to weekly direct debit failure.

## The revenue rule

Section 7. This was got wrong once and produced a 7% overstatement.

For $115 a week, 156 weeks, 6+6 deposit, $895 install:

```
Weekly payments   156 x $115  =  $17,940   REVENUE
Delivery/install                =     $895   REVENUE
                                   --------
Contract revenue                =  $18,835

Rent in advance     6 x $115  =     $690   NOT ADDITIONAL
                                              Prepayment of weeks 1 to 6,
                                              already inside the 156 above
Security bond       6 x $115  =     $690   NOT REVENUE
                                              Refundable, balance sheet only
```

`$18,835 + $1,380 = $20,215` is **wrong**. It double counts six weeks of rent
and books a refundable bond as income.

The rule does not change with the deposit structure. 10+10 is standard, with
8+8, 6+6, 4+4 and 4+3 in defined cases. The first number is weeks of rent in
advance, the second is weeks of security. Advance is prepayment, security is a
bond, neither is incremental revenue.

**The cleanest statement of the rule is that contract revenue is invariant to
the deposit structure.** `test/revenue.test.mjs` asserts exactly that across all
five structures, and separately asserts that $20,215 is never produced and never
appears in the payload.

Cash upfront is still shown, as a separate cash flow figure, clearly outside
revenue and marked `isRevenue: false`.

## Attribution mode

Not in the brief as a metric, but it governs how every stage figure should be
read. See `docs/hubspot-schema.md`.

| Mode | Meaning |
|---|---|
| `traced` | A reliable lead level join key exists. Stage counts are cohorts |
| `aggregate` | No reliable join key. Stage counts are period totals |

In `aggregate` mode a lead and the deal it became can fall in different windows,
because the sales cycle is 16 to 18 days. Cost per stage is an approximation and
sales cycle median, lead to close and quote to close are unavailable at lead
level. The mode is carried on **every stage**, not mentioned once, so a caller
cannot render a traced looking funnel from aggregate data.

## Rounding

Half up, at two decimal places, at display time only. Intermediate values keep
20 significant digits.

This differs from the brief in one place, deliberately. See
`docs/validation-baselines.md`, "The one departure".
