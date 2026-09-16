# Building the HireHospo Master Prospect List

*Plan for consolidating Databar scraping, the purchased database, and the
HubSpot paid-media leads into one cold-email-ready list. Written 16 Sep 2026.*

## The decision that shapes everything else

**Do not merge these three sources inside HubSpot.** HubSpot stays the CRM of
record for people who have *engaged*; the cold prospect pool lives in this repo
as flat files and is pushed to the sending tool (SalesBlink) in segments. Three
reasons: cold prospects at 20k–50k rows inflate HubSpot's marketing-contact
billing, they pollute lifecycle-stage reporting on your paid-media funnel, and a
cold list needs a consent/provenance audit trail that HubSpot's contact model
does not natively hold. Engaged replies get promoted *into* HubSpot; nothing
flows the other way in bulk.

Pipeline shape:

```
Databar scrape  ─┐
Purchased DB    ─┼─→ staged/  ──→ identity resolution ──→ master.csv ──→ segments ──→ SalesBlink
HubSpot export  ─┘    (per-source,      (dedupe +          (one row      (tier +
                       normalised)       precedence)        per email)    ICP)
                                              ↑                               │
                                       suppression.csv ←─── replies/bounces/unsubs
                                              ↑                               │
                                    customers.csv (built)          HubSpot ←──┘ (engaged only)
```

## 1. Legal basis — decide this per source, before you scrape anything

NZ's **Unsolicited Electronic Messages Act 2007** (administered by DIA) governs
this. Commercial email to a NZ address needs one of three consent types, plus
accurate sender identification and a working unsubscribe in every message.
Penalties run to $200k for a company, so the consent basis is a data field, not
a footnote.

| Consent type | What it means | Which source |
|---|---|---|
| **Express** | They ticked a box / asked to be contacted | HubSpot form fills |
| **Inferred** | Existing business relationship, message relevant to it | HubSpot enquirers who went cold |
| **Deemed** | Address **conspicuously published** in a business capacity, no "no unsolicited messages" notice alongside it, and the message is **relevant to that role** | Databar-scraped venue contacts |

Two consequences people get wrong:

- **A Gmail address can still be deemed-consent eligible.** What matters is
  *where it was published*, not the domain. `kodurskitchen@gmail.com` listed as
  the contact on a restaurant's own website is published in a business capacity.
  Given 20 of your 29 customers and ~55% of your HubSpot leads use consumer
  domains, a rule that drops non-business domains would delete most of your
  real market. Keep them — just record where you found them.
- **What defends deemed consent is provenance, not the address.** Every scraped
  row must carry `source_url`, `captured_at`, and the page context. Databar
  should be configured to emit these; if a row can't carry them, it isn't
  mailable under deemed consent.

Equipment finance offered to a hospitality operator is squarely relevant to
their business role, so the relevance limb is satisfied for your offer.

**The purchased list is the problem child.** A bought list carries no
provenance, so you cannot evidence deemed consent for any row in it, and bought
lists are the single most common cause of a torched sending domain (stale
addresses → spam traps → blocklisting). Recommended treatment: **do not mail it
as-is.** Use it as a *seed and enrichment* source — feed its business names and
addresses into Databar, re-discover each venue's currently published contact
details, and mail the re-scraped record with fresh provenance. The purchased
list then contributes coverage (names you'd never have found) without
contributing legal or deliverability risk. Rows that cannot be re-found are
almost certainly closed venues — exactly the rows that generate hard bounces.

## 2. Canonical schema

Two levels, because one venue can have several contacts and the same person can
run several venues (you already have this: Julian Baleli holds HH005 and HH024;
Dil Bahadur Barala holds HH009 and HH030).

**`businesses`** — one row per physical venue

| Field | Notes |
|---|---|
| `business_id` | Stable hash of the matched identity keys |
| `trading_name`, `legal_name`, `nzbn` | NZBN where available — the only true unique key |
| `category` | Maps to the 7 ICPs: cafe, restaurant, caterer, cloud_kitchen, food_truck, bakery, bar_pub (+ takeaway, retail_food, other) |
| `website`, `domain` | Apex domain, nullable and often empty |
| `phone_e164`, `address`, `suburb`, `city`, `region`, `postcode` | |
| `google_rating`, `review_count`, `price_level`, `first_seen_date` | Sizing and freshness signals |
| `chain_flag`, `parent_group` | Multi-site operators need a different approach than owner-operators |
| `status` | `prospect` / `suppressed` / `customer` / `in_crm` |
| `sources[]`, `first_seen`, `last_seen` | |

**`contacts`** — one row per email (this is what gets mailed)

| Field | Notes |
|---|---|
| `contact_id`, `business_id` | `business_id` nullable — most HubSpot leads won't match one |
| `email_norm`, `email_raw`, `email_domain`, `is_role_account`, `is_business_domain` | |
| `first_name`, `last_name`, `job_title`, `phone_e164` | |
| `consent_basis` | `express` / `inferred` / `deemed_published` / `none` |
| `source`, `source_url`, `source_record_id`, `captured_at` | The audit trail |
| `verify_status`, `mx_ok`, `verified_at` | `valid` / `catch_all` / `risky` / `invalid` / `unknown` |
| `send_tier` | A / B / C — see §5 |
| `last_sent_at`, `last_reply_at`, `bounced_at`, `unsubscribed_at` | Written back from SalesBlink |

## 3. Identity resolution — the matching waterfall

Run in this order; first match wins and stops the cascade. Confidence drops as
you descend, so the last two tiers should be reviewed before auto-merging.

1. **Exact `email_norm`** — after lowercasing, stripping `+tags` and Gmail dots.
   Highest confidence, works across all three sources.
2. **`phone_e164`** — normalised to `+64…`. This is your best cross-source key
   for consumer-domain contacts, and it is the one the purchased list and
   Databar will most reliably share.
3. **`domain` + name-token overlap** — only meaningful for the ~30% on real
   business domains.
4. **`norm_business_name` + `suburb`** — legal suffixes, punctuation, `t/a` and
   noise words stripped. "The Curry Leaf Limited (NZ)" and "Curry Leaf" both
   reduce to `curry leaf`.
5. **Address + name-token Jaccard ≥ 0.6** — manual-review queue, not auto-merge.

**Field-level precedence when merging** (which source wins a conflict):

```
express consent (HubSpot form) > existing customer record > HubSpot lead
    > Databar scrape (most recent capture) > purchased list
```

…with one inversion: for *freshness-sensitive* fields (phone, address, whether
the venue still trades), the most recent Databar capture beats an older HubSpot
record. A lead who enquired 18 months ago is a worse source of truth about
today's phone number than a scrape from last week.

`scripts/hh_norm.py` implements all of the normalisers and the name-similarity
function these rules depend on.

## 4. Suppression — build this before the list, not after

Generated by `scripts/build_suppression.py` into
`data/prospecting/suppression.csv`. It matches on three independent keys —
email, phone, business name — because no single key survives every source. A
prospect hitting **any** key is dropped.

Currently generated from `data/customers.csv`: **70 keys covering 28
customers** (60 current-customer, 7 past-customer, 3 arrears). Note `HH001
Selwyn Contractors` is flagged `arrears_do_not_market` — a non-paying customer
receiving a cold finance pitch is a real and avoidable embarrassment.

Still to be added as inputs:
- HubSpot contacts with an open deal or active sales sequence (don't let cold
  outreach cut across a live sales conversation)
- Every unsubscribe and hard bounce from SalesBlink, written back continuously
- Manual exclusions: competitors, equipment finance brokers, Washpro's own
  suppliers, anyone who has complained
- Ex-customers who left unhappily

Worth knowing: **HubSpot currently shows 0 opted-out contacts** across all 884.
That means no opt-out history exists to inherit — but it also means the
suppression list has no safety net from the CRM side. Every unsubscribe from
day one of cold sending has to be captured by the write-back loop.

## 5. Verification and send tiers

Never mail an unverified list. Run the merged output through a verification
service (ZeroBounce / NeverBounce / MillionVerifier), then tier it — tier
determines send order, because the first sends off a new domain set the
reputation that everything after depends on.

| Tier | Definition | Treatment |
|---|---|---|
| **A** | Databar-scraped, `verify_status=valid`, deemed consent with `source_url`, venue confirmed trading | Send first. Best personalisation, lowest bounce risk. |
| **B** | HubSpot leads, no open deal, express/inferred consent | **Not a cold sequence** — a re-engagement sequence referencing their original enquiry. Different copy entirely. |
| **C** | Purchased-list rows re-verified through Databar | Send last, small batches, watch bounce rate. Rows that never passed re-scrape are dropped, not mailed. |

Hard rule: keep total bounce rate under 2% per campaign. If a batch exceeds it,
stop and re-verify rather than pushing through.

**Sending infrastructure** (this matters as much as the list): use dedicated
cold-sending domains (e.g. `hirehospo-team.co.nz`), never `hirehospo.co.nz`
itself — a blocklisting on your primary domain takes your quotes, contracts and
GoCardless notifications down with it. Budget ~25–30 sends/day per mailbox after
a 2–3 week warm-up, so 1,000 sends/day needs roughly 35–40 warmed mailboxes
across several domains. SPF, DKIM and DMARC on every one.

## 6. Segmentation — build it into the merge, not afterwards

Segment on `category` × `region` × `signal`, because the ad-factory ICPs already
give you seven distinct message angles and the equipment recommendation differs
per segment (a food truck and a bakery want nothing alike from the catalogue).

The highest-value signals to capture while scraping, in rough order:
- **Newly opened / recently consented venues** — pre-revenue, capital-poor,
  and precisely who "preserve your cashflow" is written for
- **Venue category** — drives which catalogue items the email names
- **Region** — delivery lead time and the NZ-local support angle
- **Chain vs owner-operator** — different decision-maker, different cycle
- **Equipment-visible signals** where scrapeable (a pizzeria implies a deck oven)

## 7. Write-back loop

Non-negotiable, and the piece most cold-email builds skip:

1. SalesBlink replies, bounces and unsubscribes → `suppression.csv`, daily
2. Positive replies → created in HubSpot as a lead with source tagged
   `cold_email`, so paid-media and cold-email attribution stay separable
3. Anyone who converts → `customers.csv` → automatically suppressed on the next
   build

## 8. Build order

| Phase | Work | Blocked on |
|---|---|---|
| 0 | ✅ Normalisers, suppression builder, repo structure | — |
| 1 | Source audits: row counts, column maps, overlap estimate for each of the three inputs | Getting the purchased file + a Databar sample |
| 2 | Per-source adapters → `staged/*.csv` in canonical schema | Phase 1 |
| 3 | Identity resolution → `master.csv`, with a manual-review queue for tier-4/5 matches | Phase 2 |
| 4 | Verification pass, tier assignment | Phase 3 |
| 5 | Sending domains + mailbox warm-up (start this in parallel at phase 1 — it takes 2–3 weeks of calendar time regardless) | Nothing — start now |
| 6 | Segment exports → SalesBlink lists; write-back loop live | Phases 4–5 |

Phase 5 is the long pole. Start the domain warm-up while the list is still
being assembled, or a finished list will sit idle for three weeks.

## Known source characteristics (measured 16 Sep 2026)

**HubSpot** — 884 contacts, 249 companies.
- 107 directly attributed to paid social/search; the rest are `OFFLINE` source
  (form/import) and will need attribution reconstructed from create dates
- **483 (55%) are `@gmail.com`** — consumer domains, no company match possible
- **Only 126 of 884 (14%) have a company name populated** — so ~86% cannot be
  matched to a business record by name at all, only by email or phone
- 0 opt-outs recorded
- Many records have the email address stuffed into `firstname`, which will
  produce "Hi asko.kaf@gmail.com" if merge tags are used naively — clean this in
  the adapter and require a validated `first_name` before any personalised send

**HireHospo customers** — 29 records, 20 on consumer domains, 9 phone numbers
exported as `#ERROR!` (see `data/README.md`), one malformed phone that the
normaliser correctly rejects rather than guessing.

**Databar and the purchased list** — not yet audited; phase 1.
