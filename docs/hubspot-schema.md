# HubSpot schema discovery

Build step 1 of the acquisition dashboard brief. Completed 26 August 2026
against portal `47462529`.

---

## The headline

The brief asked one question above all others:

> "**If no reliable join key exists, that is the single biggest finding and it
> needs flagging to Raj immediately**, because attribution beyond aggregate
> counts becomes impossible without it."

**The answer is split, and the split is the finding.**

| Join | Works? | Evidence |
|---|---|---|
| Meta lead to HubSpot **contact** | **Yes, 98.5%** | 66 of the 67 lead records appear as contacts carrying the campaign name |
| HubSpot contact to HubSpot **deal** | **No, 0%** | Zero of those 66 contacts has an associated deal |

So the leads are traceable and the deals are not. Attribution stops dead at the
contact. Everything the dashboard wants to say about qualified, quoted, signed
and funded depends on the second join, and that join does not exist.

**This is not a configuration problem that a property mapping fixes.** It is
that deals arrive in HubSpot from a separate integration with no contact
attached, so there is nothing to join to.

## What that costs

Available now, and real:

- Lead volume, CPL and lead quality by campaign
- The equipment demand panel, in catalogue against out of catalogue, from the
  real enquiry text on 58 contacts
- Deduplication and the raw against unique lead counts

Not available, and shown as `[TBC]`:

- Qualified leads, cost per qualified lead
- Quotes issued, cost per quote
- Contracts signed and funded, as a traced figure
- Lead to close rate, quote to close rate
- Sales cycle median

## Three findings that are worse than the join key

### 1. Deal stages are never advanced

All 49 deals sit in the Contract Pipeline. Their stage distribution:

| Stage | ID | Deals |
|---|---|---|
| Prospect Inquiry | `251084371` | 47 |
| Contract Sent | `251084375` | 1 |
| Closed Won | `251084376` | **0** |

**Zero deals have ever reached Closed Won**, while the customer database in this
repository shows 24 active paying customers and roughly $4,382 a week in
billings. Deals with payment start dates, cleared deposits and live contracts
are still sitting in "Prospect Inquiry".

The single deal in "Contract Sent" is SELWYN CONTRACTORS, which
`data/README.md` already flags as `arrears`, non-paying.

**`dealstage` cannot be used to count signed or won.** Any funnel built on it
would report zero conversions for a business that converts.

### 2. Term length is missing, so contract revenue cannot be computed

| Property | Exists | Populated |
|---|---|---|
| `finance_term` (12 months / 36 Months / Custom) | Yes | **0 of 49** |
| `finance_custom_term_weeks` | Yes | **0 of 49** |
| `finance_option` (Rental / Lease / Custom) | Yes | **0 of 49** |

Contract revenue is `weekly payment x term weeks + delivery and install`. The
weekly payment is there on every deal. The term is on none of them.

The brief is explicit: "Read the term from the deal, do not assume." So contract
revenue reports `[TBC]` for live deals rather than defaulting to 52 or 156
weeks. A property that exists but is always empty is worse than one that does
not exist, because a mapping to it looks like it works.

### 3. There is no delivery and install charge property, and no deposit cleared date

`delivery and install` is part of contract revenue (`$895` in the worked
example) and has no home in the CRM at all.

`deposit cleared date` is the field that separates **signed** from **funded**,
the distinction the brief calls "the single most important" in the dashboard. It
does not exist in HubSpot. It will have to come from GoCardless in phase 2.

## The one contract, and why it cannot be attributed

The deal `CIAO CUSINA LIMITED (9343046) Registered - Lease agreement`, created
19 August 2026, matches the section 9 signed contract exactly:

```
weekly_total_cost         115
rent_in_advance__weeks_     6      product_upfront_rental    690
security_deposit_weeks      6      security_deposit_amount   690
```

That is the $115 a week, 6+6 deposit contract from the revenue rule, confirmed
in live data.

**It has no associated contact.** There is no contact record for Ciao Cusina in
the portal. So the attribution of that contract to the Meta campaign, which
section 9 of the brief states as fact, is a human judgement rather than
something the data supports. It may well be correct. The dashboard cannot
verify it, and does not claim to.

---

## 1. Pipelines

| Pipeline | ID | Holds |
|---|---|---|
| Sales Pipeline | `default` | Nothing relevant |
| **Contract Pipeline** | **`148114589`** | All 49 deals |

Contract Pipeline stages, in display order:

| Stage ID | Label | Mapped bucket |
|---|---|---|
| `251084371` | Prospect Inquiry | `inquiry` |
| `251084372` | Qualified To Buy | `qualified` |
| `251084373` | Presentation Scheduled | `qualified` |
| `251084374` | Decision Maker Bought-In | `qualified` |
| `251084375` | Contract Sent | `quoted` |
| `251084376` | Closed Won | `won` |
| `251084377` | Closed Lost | `dead` |

Recorded in `config/stage-map.json` under `byStageId`, keyed on the **ID**, not
the label. A CRM user renaming "Contract Sent" must not break the funnel.

### The Meta stage events are a different feed

Section 8.2 of the brief lists the stage names arriving at Meta:

```
QUALIFIED, QualifiedLead, Quote Sent, Send Quote, Unqualified, Blocked, BAD, CONVERTED, LEADS
```

**Not one of these is a HubSpot deal stage label.** HubSpot's labels are the
stock defaults. So the stage events reaching Meta are not coming from HubSpot
deal stages. They come from somewhere else, most likely Zoho or a mapping
inside the sync itself.

There are also **zero custom conversions** defined on the Meta ad account, so
those event names cannot be enumerated from that end either.

Until the source of that feed is identified, the Meta stage events cannot be
reconciled against the CRM, and the section 8.2 duplicate stage name problem
cannot be fixed at source. The `byLabel` map still handles the duplicates so
the feed is usable if it resumes.

## 2. Deal properties

Real internal names. Fill rates observed over all 49 deals.

| Concept | Internal name | Type | Fill |
|---|---|---|---|
| Weekly payment | `weekly_total_cost` | number | 100% |
| Rent in advance, weeks | `rent_in_advance__weeks_` | number | 85% |
| Rent in advance, dollars | `product_upfront_rental` | number | 100% |
| Security deposit, weeks | `security_deposit_weeks` | number | 96% |
| Security deposit, dollars | `security_deposit_amount` | number | 100% |
| Term, preset | `finance_term` | enum | **0%** |
| Term, custom weeks | `finance_custom_term_weeks` | number | **0%** |
| Product type | `finance_option` | enum | **0%** |
| Payment start date | `payment_start_date` | date | 88% |
| Contract start date | `contract_start_date` | date | **0%** |
| Closed won date | `closedate` | date | **0%** |
| Stage | `dealstage` | enum | 100%, but see above |
| Original traffic source | `hs_analytics_source` | enum | **0%** |
| Contract value | none | | |
| Delivery and install charge | none | | |
| Deposit cleared date | none | | |

Enum values, for the two that are empty but will matter once populated:

- `finance_term`: `12 months`, `36 Months`, `Custom`
- `finance_option`: `Rental`, `Lease`, `Custom`

**A trap worth naming.** The standard `amount` property on these deals carries
the **weekly** figure, not the contract value. Ciao Cusina has `amount: 115` and
`weekly_total_cost: 115`. Mapping `amount` to contract value would understate
every contract by a factor of roughly 156.

### Data quality in the deal records

Visible in a 40 record sample:

- `rent_in_advance__weeks_` of `123` and `121` on two iWise records, alongside a
  weekly payment of `123` and `121`. The weekly figure has been copied into the
  weeks field.
- `security_deposit_weeks` of `36` on one deal, against a 6 week norm.
- One deal with `product_upfront_rental: 7` and `security_deposit_amount: 490`.
- Test records still live: `SIMPLE TEST HH`, `PABBLY CONNECT`, `rajurman co`,
  three deals with a blank name, and four deals belonging to iWise itself.
- Duplicates: Homely Flavors, Sugar Spice, BlueMoonSkyNZZ and Selwyn Contractors
  each appear twice.

Roughly 12 of the 49 deals are test or duplicate records. Any deal count taken
from this portal needs filtering before it means anything.

## 3. The join, in detail

Every one of the 58 contacts carrying an equipment enquiry has all of:

| Property | Value |
|---|---|
| `hs_analytics_source` | `PAID_SOCIAL` |
| `hs_analytics_source_data_1` | `Facebook` |
| `hs_analytics_source_data_2` | `hh brochure campaign 01/08 2026` |
| `hs_object_source_detail_1` | `Brochure Form (Instant Access)` |
| `hs_object_source_label` | `FORM` |
| `lifecyclestage` | `lead` |

`hs_analytics_source_data_2` is the Meta campaign name, lowercased. Meta campaign
`120250374716300748` is "HH Brochure Campaign 01/08 2026". **66 contacts** carry
it, against 67 Meta lead records to 26 August. That is a 98.5% match.

There is no Meta lead ID property, and no form submission association, so the
join is **campaign level, not lead level**. For lead counting and lead quality
that is enough. For tracing an individual lead to an individual deal it is not,
and the deal side has nothing to join to anyway.

**If the campaign is renamed in Meta, this join silently empties.** The match
value is in `config/hubspot-mapping.json` so it can be corrected without a
redeploy, and the dashboard reports the cohort size on panel 7 so a drop to zero
is visible rather than quiet.

Every one of the 66 sits at `lifecyclestage: lead`. None has progressed.

## 4. Contact properties

| Concept | Internal name | Note |
|---|---|---|
| Equipment enquiry | `what_type_of_equipment_are_you_after` | **No trailing colon.** The Meta field is `what_type_of_equipment_are_you_after:` with one, and it survives in the HubSpot label but not the property name |
| Company name | `company` | 90% populated on the cohort |
| Region | `state` | Sparse |
| Country | `country` | |
| Lifecycle stage | `lifecyclestage` | `lead` on all 66 |

---

## What to do about it

In rough order of how much each unlocks.

1. **Associate deals with contacts.** This is the one that matters. Without it
   there is no funnel, no CAC per funded contract, and no way to tell which
   marketing spend produced which customer. Everything else on this list is
   smaller.
2. **Advance deal stages, or stop using them.** A pipeline where 47 of 49 deals
   sit in the first stage is not tracking anything. If stages are not going to
   be maintained, the funnel needs a different signal and the dashboard should
   be told which one.
3. **Populate `finance_term` and `finance_option`.** Both properties already
   exist. Filling them makes contract revenue computable immediately, and the
   revenue rule is already built and tested against the worked example.
4. **Add a delivery and install charge property.** Part of contract revenue,
   currently homeless.
5. **Identify the source of the Meta stage events.** They are not HubSpot deal
   stages. Until that is known, section 8.2 cannot be fixed at source.
6. **Clean out the test and duplicate deals.** Roughly 12 of 49.
7. **Deposit cleared date** comes from GoCardless in phase 2. Nothing to do in
   HubSpot.

## Reproducing this

```bash
node scripts/discover-hubspot.mjs          # read only, prints the report
node scripts/discover-hubspot.mjs --json   # machine readable
```

The script reports property names, types and fill rates. It never prints contact
names, emails or phone numbers.
