# HubSpot schema discovery

Build step 1 of the acquisition dashboard brief.

**Status: BLOCKED, not started. No HubSpot field names are recorded in this document
because none could be observed.**

Last updated 26 August 2026.

---

## 1. Why this document is empty

The brief instructs: "I could not query HubSpot in the session that produced this brief.
**Do not assume field names.** Section 5 is your first task."

That instruction still stands, unchanged. The build session on 26 August 2026 also had no
HubSpot access:

| Access route | Result |
|---|---|
| HubSpot MCP server | Not connected to the session |
| `HUBSPOT_ACCESS_TOKEN` environment variable | Not present |
| Any other HubSpot credential | Not present |

Every field name in sections 2 to 5 below is therefore a **question to be answered**, not a
finding. Nothing here has been observed, and nothing has been guessed. Writing plausible
property names into this file would be the single most damaging thing that could be done to
this build, because every downstream transformation would inherit them silently.

## 2. The blocking question, escalated

> "**If no reliable join key exists, that is the single biggest finding and it needs flagging
> to Raj immediately**, because attribution beyond aggregate counts becomes impossible
> without it."

**This question is unanswered, and it cannot be answered without HubSpot access.**

It is worth being exact about what is at risk, because the answer changes what the dashboard
can honestly claim:

- **If a reliable join key exists**, the funnel in Panel 2 is a true per lead funnel. A lead can
  be followed from a Meta form submission to a qualified stage to a quote to a signed contract,
  and cost per stage is a real cost per stage.
- **If no reliable join key exists**, every stage count past "lead" is an *aggregate count over
  a period*, not a traced cohort. Cost per qualified lead becomes spend in a window divided by
  qualified deals in the same window, which is a different and weaker measure. It cannot handle
  the 16 to 18 day sales cycle, so leads and the deals they became sit in different windows.
  Sales cycle median, lead to close rate and quote to close rate all become unavailable at lead
  level rather than merely imprecise.

The dashboard has been built so that this distinction is visible rather than hidden. Until the
join key is confirmed, the funnel reports `attribution_mode: "aggregate"` and the front end
labels the affected figures accordingly. See `src/lib/funnel.mjs`.

## 3. What to run once access exists

`scripts/discover-hubspot.mjs` performs the whole of section 5 of the brief and writes its
findings into this file. It is read only. It calls no write endpoint.

```bash
export HUBSPOT_ACCESS_TOKEN='...'      # private app token, never committed
node scripts/discover-hubspot.mjs      # prints a report
node scripts/discover-hubspot.mjs --write   # rewrites sections 4 to 7 of this document
```

Required private app scopes, all read only:

```
crm.objects.deals.read
crm.objects.contacts.read
crm.schemas.deals.read
crm.schemas.contacts.read
crm.pipelines.read     (usually implied by crm.objects.deals.read)
```

The script deliberately does **not** print contact names, emails or phone numbers. It reports
property names, types, and fill rates only. Lead PII must not end up in a committed document.

## 4. Pipelines, TO BE DISCOVERED

Which pipeline holds HireHospo deals, its ID, and its stage IDs with labels.

| Field | Value |
|---|---|
| Pipeline label | `[TBC]` |
| Pipeline ID | `[TBC]` |
| Stage IDs and labels | `[TBC]` |

Note that HubSpot deal stages carry an opaque internal ID and a display label that a user can
rename at will. The stage map in `config/stage-map.json` must be keyed on the **stage ID**,
never the label, or an ordinary CRM rename will silently break the funnel. The labels observed
arriving at Meta (section 8.2 of the brief) are almost certainly display labels, which is
consistent with them being duplicated and inconsistent.

## 5. Deal properties, TO BE DISCOVERED

Record the **actual internal property names**, not the display labels.

| Concept | Internal property name | Type | Notes |
|---|---|---|---|
| Contract value | `[TBC]` | | |
| Weekly payment amount | `[TBC]` | | Drives contract revenue. See the revenue rule. |
| Term length | `[TBC]` | | Rent 52 weeks, Lease to Own 156 weeks. Read it, do not assume. |
| Product type (Rent or Lease to Own) | `[TBC]` | | |
| Deposit structure | `[TBC]` | | Expect 10+10, 8+8, 6+6, 4+4, 4+3 |
| Deposit cleared date | `[TBC]` | | Separates signed from funded. The most important one. |
| Delivery date | `[TBC]` | | |
| Delivery and install charge | `[TBC]` | | Part of contract revenue |
| Closed won date | `[TBC]` | | Needed for sales cycle median |

Two warnings for whoever runs the discovery:

1. **Deposit structure may be a single string** such as "6+6" rather than two numbers. The
   parser in `src/lib/deposit.mjs` accepts the string forms listed in the brief and rejects
   anything it does not recognise rather than guessing.
2. **Deposit cleared date may not exist as a HubSpot property at all.** It may only exist in
   GoCardless. If so, that is a finding in its own right: contracts funded cannot be computed
   from HubSpot alone, and the dashboard correctly falls back to "signed, funding unconfirmed"
   until GoCardless is wired in as phase 2.

## 6. Association to source, TO BE DISCOVERED

This is the blocking question from section 2. Check all of the following, in this order of
preference:

| Candidate join key | Present | Fill rate | Verdict |
|---|---|---|---|
| A Meta lead ID property on the deal or contact | `[TBC]` | `[TBC]` | Strongest. A direct key. |
| `hs_analytics_source` and `hs_analytics_source_data_1` / `_2` | `[TBC]` | `[TBC]` | Channel level only, usually not lead level |
| Form submission association (`hs_form_submissions`) | `[TBC]` | `[TBC]` | Good if the Instant Form writes through |
| `hs_object_source` / `hs_object_source_detail_1` | `[TBC]` | `[TBC]` | Sometimes carries the integration origin |
| Email address match, contact to Meta lead | `[TBC]` | `[TBC]` | Fallback. Fragile, see below |
| Phone number match, contact to Meta lead | `[TBC]` | `[TBC]` | Fallback. Fragile, see below |

**A fill rate matters as much as existence.** A Meta lead ID property that is populated on 8% of
deals is not a reliable join key, and reporting it as one would produce a funnel that
undercounts by more than it counts. The discovery script reports fill rate for exactly this
reason. Treat below roughly 90% as unreliable and say so on the dashboard.

**On the email and phone fallback.** It is the weakest option and it is the one most likely to
be reached for. Known hazards, from the customer database already in this repository
(`data/README.md`): nine phone numbers exported as `#ERROR!`, phone formats mixed across `64...`,
`021...` and `09...`, and at least one concatenation typo. Meta Instant Form phone numbers will
not match HubSpot phone numbers without aggressive normalisation, and normalisation across
those formats loses information. If email or phone matching is the only route, the dashboard
must report a match rate and treat unmatched deals as a visible gap, not as zero.

## 7. Contact properties, TO BE DISCOVERED

Carrying the equipment enquiry text and the company name.

| Concept | Internal property name | Notes |
|---|---|---|
| Equipment enquiry text | `[TBC]` | Meta side field is `what_type_of_equipment_are_you_after:` including the trailing colon |
| Company name | `[TBC]` | Meta side field is `company_name` |
| Region or address | `[TBC]` | Needed to flag out of region leads, Auckland only for Rent and Lease to Own |

## 8. What is already built and waiting on this

These are complete and tested, and will read live HubSpot data the moment the schema is
confirmed. None of them contain guessed field names. All of them take the property names from
`config/hubspot-mapping.json`, which currently holds nulls.

- `src/lib/stage-map.mjs`, stage mapping with an unmapped bucket, configuration driven
- `src/lib/funnel.mjs`, the funnel, including the aggregate versus traced distinction above
- `src/lib/metrics.mjs`, conversion and unit economics, including the revenue rule
- `netlify/functions/refresh.mjs`, the HubSpot fetch, currently short circuited and reporting
  `hubspot: { available: false, reason: "schema not discovered" }`

Filling in `config/hubspot-mapping.json` is the only code change needed to switch HubSpot on.
No transformation logic has to be rewritten.
