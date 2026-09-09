# Pulling Lead Context Before a Review

A call cannot be scored blind. *"He never asked about trading history"* is only a finding once you
know the lead is a six-week-old food truck. Pull the record first.

Verified against the live HubSpot portal (47462529) and Meta ad account **2139666836427566**
(HireHospo NZ, business FlexiHospo) in September 2026.

---

## Where the data actually lives

| What | Where | Why not elsewhere |
|---|---|---|
| Lead identity, phone, email, company, form answers | **HubSpot** | Meta lead-form submissions sync into HubSpot as contacts with `hs_analytics_source = PAID_SOCIAL` |
| Which campaign / ad set / ad produced the lead | **HubSpot** (IDs embedded in the URL fields) | The IDs are stamped into `hs_analytics_first_url` at sync time |
| Spend, CPL, impressions, ad creative | **Meta Ads MCP** | Aggregate performance only |
| Call recording / transcript | Voice Memos → `pipeline/` | Not in either system |

**The Meta Ads MCP cannot retrieve individual lead-form submissions.** It is an ads *management*
surface — campaigns, ad sets, creatives, audiences, catalogues, insights. There is no per-lead
endpoint. Do not go looking for one; go to HubSpot for the person and to Meta for the ad.

---

## Step 1 — Find the lead in HubSpot

Search `CONTACT` by phone (E.164, e.g. `+64278913665`), email, or name.

Properties worth pulling:

```
firstname, lastname, phone, email, company,
hs_analytics_source, hs_analytics_source_data_2, hs_latest_source,
createdate, lifecyclestage, hs_lead_status, hs_is_unworked,
recent_conversion_event_name, first_conversion_date,
hs_analytics_first_url, hs_facebook_click_id,
what_type_of_equipment_are_you_after,
are_you_interested_in_our_products_or_services,
company_size, industry
```

Reading them:

- **`hs_analytics_source: PAID_SOCIAL`** + **`hs_analytics_source_data_1: Facebook`** — a Meta lead
- **`recent_conversion_event_name`** — e.g. `Facebook Lead Ads: Brochure Form (Instant Access)`.
  **Read this before anything else.** It tells you what the lead actually did, and therefore what
  a realistic call outcome was. A brochure form is a lead magnet, not an application
- **`hs_analytics_source_data_2`** — the campaign name in lower case, e.g.
  `hh brochure campaign 28/08 2026 (#2)`
- **`what_type_of_equipment_are_you_after`** — the free-text form answer, e.g. *"Kitchen cookware,
  refrigerator and icebox"*. Often blank. Treat as a hint, never as a brief
- **`hs_is_unworked: true`** — nobody has logged an activity. If it is still `true` after a call,
  the CRM is out of date and that is its own finding
- **`createdate` vs the call time** — **speed to lead**, the highest-leverage number in the whole
  pipeline. Compute it every review and state it in hours

---

## Step 2 — Extract the Meta IDs

`hs_analytics_first_url` is a Facebook URL with the ad IDs in its query string:

```
hsa_acc=2139666836427566        → ad account (HireHospo NZ)
hsa_cam=120250963609460748      → campaign id
hsa_grp=120250963609550748      → ad set id
hsa_ad=120250963609470748       → ad id
utm_campaign=HH+Brochure+Campaign+28/08+2026+(%232)
```

These are the exact ids the Meta Ads MCP uses. No mapping table needed — HubSpot hands you the
join key.

Known campaigns on this account:

| Campaign id | Name | State | Result |
|---|---|---|---|
| `120250963609460748` | HH Brochure Campaign 28/08 2026 (#2) | ACTIVE | NZ$298.53 spent, 19,373 impressions |
| `120250374716300748` | HH Brochure Campaign 01/08 2026 | PAUSED | 67 leads @ NZ$10.21 |

---

## Step 3 — Pull the ad from Meta

With `hsa_cam` / `hsa_ad`, use `ads_get_ad_entities` (`object_ids`, level `ad` or `campaign`) for
spend and results, and `ads_get_creatives` / `ads_get_ad_preview` for what the lead actually saw.

**Read the ad creative before scoring the call.** If the ad promised something the call
contradicted — a capability, a tone, an implied price point — that mismatch is always one of the
three moments in the debrief. It is also the most actionable finding available, because it can be
fixed once in the ad and never recur on a call.

Cost context worth carrying into the debrief: at roughly **NZ$10 a lead**, a call that burns a lead
through a bad opener has a nameable price. Say the number.

---

## Step 4 — Assemble the pre-read

Before opening the transcript, write down:

```
Lead           Keryn Goldsmith · Waiapu RSA · +64278913665
Form           Brochure Form (Instant Access)  ← lead magnet, not an application
Form answer    "Kitchen cookware, refrigerator and icebox"
Campaign       HH Brochure Campaign 28/08 2026 (#2) · ad 120250963609470748
Submitted      6 Sep 19:21
Called         [from the recording timestamp]
Speed to lead  [hours]
Worked before  hs_is_unworked = true → first contact
Unknowns       trading history, business type, timeframe, decision maker, deposit capacity
```

That last line is the scoring baseline for D2. Anything still unknown *after* the call was a
qualification miss.

---

## Writing back

After a review, the lead record should not still read `hs_is_unworked: true`. Whether the write-back
is manual, via the tracker, or via the HubSpot MCP, flag a stale record in the debrief — an
uncontactable pipeline is a more expensive problem than any single call.
