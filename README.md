# HireHospo acquisition dashboard

A self refreshing dashboard showing HireHospo's paid acquisition performance end
to end, from Meta ad spend through to funded contracts and unit economics.

The point of it: nobody could previously answer "what does a funded deal cost
us" without a person manually joining three systems. This makes that join
continuous.

All figures ex GST, NZD.

## Status

| Build step | State |
|---|---|
| 1. HubSpot schema discovery | **Done.** Schema discovered 26 August 2026. See `docs/hubspot-schema.md` |
| 2. Meta ingestion, validated against section 9 | **Done.** 25 of 26 baselines exact, 1 brief error found. See `docs/validation-baselines.md` |
| 3. HubSpot ingestion, stage map, funnel | **Ingestion done. Funnel blocked by CRM data**, not by code |
| 4. Unit economics with configurable margin | **Done.** Live contract revenue blocked by a missing term |
| 5. Data health panel | **Done** |
| 6. GoCardless, signed against funded | **Not started.** Phase 2 |

## What the CRM discovery found

The brief asked one question above all others: does a reliable join key exist
between HubSpot deals and Meta leads? The answer is split, and the split is the
finding.

| Join | Works? | Evidence |
|---|---|---|
| Meta lead to HubSpot **contact** | **Yes, 98.5%** | 66 of 67 lead records matched by campaign |
| HubSpot contact to HubSpot **deal** | **No, 0%** | Zero of those 66 has an associated deal |

Three things block the funnel, and none of them is a code problem:

1. **Deals carry no contact.** 48 of 49 deals have no contact attached at all,
   so there is nothing to join a lead to.
2. **Deal stages are never advanced.** 47 of 49 sit in "Prospect Inquiry" and
   **zero** have ever reached Closed Won, for a business with 24 active paying
   customers. `dealstage` cannot count signed or won.
3. **Term length is empty on every deal.** `finance_term` and
   `finance_custom_term_weeks` exist and are unpopulated, so contract revenue
   cannot be computed from live deals.

What this does unlock, and it is real: the lead cohort, and the demand panel
built from 58 actual equipment enquiries.

Until the CRM issues and GoCardless are resolved, contract counts are labelled
"signed, funding unconfirmed" and every funnel figure past "lead" shows `[TBC]`.

## Two things need Raj before go live

1. **Gross margin on equipment.** Without it, LTV:CAC is a sensitivity range,
   not a figure. The slider is a workaround, not an answer. Set
   `grossMargin.default` and `grossMargin.confirmed: true` in
   `config/assumptions.json`.
2. **Daily rate claim.** Live ads claim "From $3.99/day", the approved marketing
   copy says "$4.66/day", and a paused variant says "$6.99/day". Confirmed
   against live spend: the $3.99 ads are delivering, the $6.99 variant has spent
   $0.14. The dashboard displays the live claim so the discrepancy stays
   visible. This is a Fair Trading Act exposure independent of the dashboard.

## Running locally

```bash
npm install
npm test                 # full suite
npm run validate         # section 9 baselines only
node scripts/build-sample.mjs   # regenerate the sample from the fixtures
```

To view the dashboard without credentials, serve `public/` and it will fall back
to `public/sample-snapshot.json`. That sample is real campaign data from 1 to 25
August 2026, verified against the section 9 baselines, and is labelled as a
sample wherever it appears.

```bash
npx http-server public -p 8899
```

## Deploying

Netlify. The front end is static, the data layer is a scheduled function, and
the cache is Netlify Blobs.

```
Front end     public/, static, no framework
Refresh       netlify/functions/refresh.mjs, hourly, writes to Blobs
Read          netlify/functions/dashboard-data.mjs, serves the cache
```

The front end reads the cache. It never calls a third party API and never sees
a token.

Hourly is ample. Meta reporting lags anyway and the sales cycle is 16 to 18
days.

### Environment variables

Set these in the Netlify UI, entered by Raj directly. **Do not put any token in
the repository, in a config file, or in client side code.**

| Variable | Required | Notes |
|---|---|---|
| `META_ACCESS_TOKEN` | Yes | |
| `META_AD_ACCOUNT_ID` | Yes | `2139666836427566` |
| `META_CAMPAIGN_ID` | Yes | `120250374716300748`. Also gates lead record retrieval |
| `META_BUSINESS_ID` | No | FlexiHospo, `3749476771982294`. Enables pixel health |
| `META_PIXEL_IDS` | No | Comma separated. `1677961872820124,1336169581641781` |
| `APPROVED_DAILY_RATE_CLAIM` | No | For example `$4.66/day`. Drives the compliance banner |
| `DASHBOARD_WINDOW_DAYS` | No | Defaults to 30 |
| `HUBSPOT_ACCESS_TOKEN` | Yes | Private app token. Read only scopes, see `docs/hubspot-schema.md` |
| `GOCARDLESS_ACCESS_TOKEN` | Phase 2 | |

### Access control, not optional

**The site must sit behind Netlify password protection or SSO before it holds
live data.** Site settings, Access control, Visitor access.

The read endpoint returns aggregates only, and there is no lead level record in
the cache for it to return. That is a property of the design, not a substitute
for access control: spend, CAC and contract values are still commercial data.

### Personal information

Lead records contain names, emails, phone numbers and business names of real
customers.

Personal information is **stripped at ingestion**, inside the refresh function,
before anything is written. What survives is a salted hash used only for
deduplication within that refresh, plus the equipment category. Names, emails,
phone numbers, company names and the free text enquiry are discarded and never
reach the cache, the read endpoint, a log, or the browser.

The free text enquiry is dropped too, not just the obvious fields, because it is
where someone writes "call me on 021...".

`test/snapshot.test.mjs` asserts that no PII bearing field name appears anywhere
in the generated payload.

## Configuration, editable without a redeploy

| File | Purpose |
|---|---|
| `config/stage-map.json` | Stage name to funnel bucket. Section 8.2 |
| `config/assumptions.json` | Gross margin, failure rate, terms, thresholds |
| `config/equipment-catalogue.json` | In and out of catalogue keywords. Section 8.4 |
| `config/hubspot-mapping.json` | HubSpot property names, pipeline and the campaign match value |

If a stage name changes in the CRM, correct `config/stage-map.json`, which is
keyed on stage **ID** rather than label for exactly that reason. The unmapped
count on panel 7 is the alarm that tells you to.

If the Meta campaign is renamed, update `joinKey.matchValue` in
`config/hubspot-mapping.json` or the lead cohort silently empties. Panel 7
reports the cohort size so a drop to zero is visible.

## Known data faults being handled

| Fault | Handling |
|---|---|
| Two live pixels (8.1) | Both read, deduplicated by id, warning banner shown |
| Duplicated stage names (8.2) | Stage map as config, unmapped surfaced as an alarm |
| Sync gap (8.3) | Freshness indicator, alerts past 48 hours |
| Out of catalogue leads (8.4) | Keyword classifier tuned on all 58 real enquiries. 19.6% out of catalogue, against the brief's estimate of roughly 19% |
| Duplicate submissions (8.5) | Deduplicated on hashed phone or email, raw count kept visible |

Three traps found during the build and handled, none of them in the brief:

1. Meta returns **two different shapes** for the same `results` field depending
   on whether the period had leads.
2. The datasets endpoint returns **duplicate rows per pixel**, some carrying a
   `last_fired_time` of unix zero as a null sentinel.
3. There are **zero custom conversions** on the ad account, so the stage labels
   cannot be enumerated from that endpoint. The Meta stage event names
   (QUALIFIED, Quote Sent, CONVERTED) are also **not** HubSpot deal stage
   labels, so that feed comes from somewhere else entirely and cannot yet be
   reconciled against the CRM.
4. The standard HubSpot `amount` property on these deals carries the **weekly**
   figure, not the contract value. Mapping it to contract value would
   understate every contract by roughly 156 times.

## Layout

```
config/                 editable configuration
docs/                   metric definitions, validation, HubSpot blocker
netlify/functions/      refresh (scheduled) and dashboard-data (read)
public/                 static front end and the validated sample
scripts/                HubSpot discovery, sample generation
src/lib/                money, meta, hubspot, revenue, funnel, stage-map, equipment, leads, health, snapshot
test/                   baselines, revenue rule, pipeline, equipment corpus, end to end
```

## House rules

No em dashes. New Zealand English. NZD with "+ GST" stated explicitly, never GST
inclusive. Dates as 26 August 2026. Never invent a figure: unavailable values
show `[TBC]` and the gap is listed.
