# Lead + Call Tracker — Schema

One row per **lead**, updated as the lead progresses. Not one row per call: a lead called three
times is still one row, with the call columns reflecting the most recent contact and the transcript
paths accumulating.

Designed for Google Sheets first. The column order is the reading order — identity, then origin,
then what happened on the call, then the coaching, then the outcome.

---

## Columns

### Identity — from HubSpot

| # | Column | Example | Source |
|---|---|---|---|
| 1 | `lead_id` | `247108494981` | HubSpot `hs_object_id` — the stable key |
| 2 | `first_name` | `Richard` | `firstname` |
| 3 | `last_name` | `Anthony` | `lastname` |
| 4 | `company` | `Sitel` | `company` |
| 5 | `phone` | `+642108803411` | `phone` — E.164, the **join key to the call** |
| 6 | `email` | `richardbabu20@gmail.com` | `email` |
| 7 | `hubspot_url` | `https://app.hubspot.com/contacts/47462529/record/0-1/247108494981` | built from id |

### Origin — from HubSpot, with ids that reach into Meta

| # | Column | Example | Source |
|---|---|---|---|
| 8 | `submitted_at` | `2026-09-08 06:12` NZT | `createdate` |
| 9 | `form_name` | `Brochure Form (Instant Access)` | `recent_conversion_event_name` |
| 10 | `form_answer_equipment` | `Kitchen cookware, refrigerator and icebox` | `what_type_of_equipment_are_you_after` |
| 11 | `campaign_name` | `HH Brochure Campaign 28/08 2026 (#2)` | `hs_analytics_source_data_2` |
| 12 | `campaign_id` | `120250963609460748` | `hsa_cam` in `hs_analytics_first_url` |
| 13 | `adset_id` | `120250963609550748` | `hsa_grp` |
| 14 | `ad_id` | `120250963609470748` | `hsa_ad` |
| 15 | `cost_per_lead_nzd` | `10.21` | Meta Ads MCP, campaign-level ÷ leads |

### The call

| # | Column | Example | Source |
|---|---|---|---|
| 16 | `first_called_at` | `2026-09-08 09:40` NZT | recording mtime |
| 17 | `speed_to_lead_hours` | `3.5` | col 16 − col 8. **The number to watch** |
| 18 | `call_count` | `2` | incremented per recording matched |
| 19 | `call_duration_min` | `9.2` | transcript `duration_seconds` ÷ 60 |
| 20 | `contact_made` | `TRUE` | did they actually pick up |
| 21 | `transcript_path` | `~/HireHospo/calls/processed/2026-09-08-0940-richard-anthony/` | capture.py |
| 22 | `match_confidence` | `high` | how the call was matched to the lead (below) |

### Qualification — extracted from the transcript

| # | Column | Values | Notes |
|---|---|---|---|
| 23 | `business_type` | cafe / restaurant / caterer / cloud kitchen / food truck / bakery / bar-pub / other | one of the 7 ICPs |
| 24 | `trading_months` | `8` | **the fact that decides the product.** Blank = qualification miss |
| 25 | `equipment_wanted` | `commercial dishwasher` | catalogue category, per `hirehospo-products` |
| 26 | `timeframe` | `4 weeks` | when they want it in |
| 27 | `decision_maker` | `sole` / `partner` / `spouse` / `unknown` | |
| 28 | `deposit_capacity` | `standard` / `needs_alternative` / `unknown` | never a promised tier |
| 29 | `qualification_complete` | `4/6` | count of cols 23–28 established |

### Coaching — from `hirehospo-sales-coach`

| # | Column | Example | Notes |
|---|---|---|---|
| 30 | `score_total` | `72` | /100 |
| 31 | `score_band` | `solid` | strong / solid / leaking / costly / lost |
| 32 | `compliance_breach` | `G1` | blank when clean; **conditional-format red** |
| 33 | `weakest_dimension` | `next_step` | where to coach |
| 34 | `top_fix` | `Ask trading history before positioning the product` | one line |
| 35 | `reviewed_at` | `2026-09-09` | |

### Outcome

| # | Column | Values |
|---|---|---|
| 36 | `credit_check_sent` | TRUE / FALSE |
| 37 | `credit_outcome` | approved / declined / pending / not_run |
| 38 | `product_offered` | Rent 12m / Lease-to-Own 36m / none |
| 39 | `quote_sent` | TRUE / FALSE |
| 40 | `stage` | new / contacted / qualified / credit_pending / quoted / proposal / won / lost / unreachable |
| 41 | `lost_reason` | price / timing / bought_elsewhere / not_qualified / no_contact / other |
| 42 | `weekly_value_nzd` | `184.50` — ex-GST, once signed |
| 43 | `next_action` | free text |
| 44 | `next_action_date` | date |
| 45 | `notes` | free text |

---

## Matching a call to a lead

In confidence order. **Never overwrite an existing match with a lower-confidence one.**

| Confidence | Rule |
|---|---|
| **high** | Phone number in the recording filename or spoken in the call matches HubSpot `phone` (compare last 8 digits — `+64211751881`, `0211751881` and `21 175 1881` are the same number) |
| **high** | Filename contains a name or company matching exactly one HubSpot lead |
| **medium** | Exactly one `hs_is_unworked = true` PAID_SOCIAL lead created in the 72 h before the recording |
| **low** | Company or first name spoken early in the transcript matches one lead |
| **none** | Leave `match_confidence` blank and `lead_id` empty — do **not** guess |

Rename recordings in Voice Memos to the lead's name or number before they sync and every match is
`high`. That habit is worth more than any matching heuristic.

Unmatched calls stay in the tracker with the call columns filled and identity blank, so nothing is
silently dropped.

---

## Sheet setup

- **Freeze** row 1 and columns A–D.
- **Conditional formatting:**
  - `compliance_breach` (32) non-empty → red fill. This is the one that must never be missed.
  - `speed_to_lead_hours` (17) > 4 → amber; > 24 → red.
  - `trading_months` (24) empty where `contact_made` is TRUE → amber. A call that never established
    trading history could not have recommended the right product.
  - `stage` (40) = `won` → green; `lost` → grey.
- **Data validation** on 23, 27, 28, 31, 37, 38, 40, 41 from the value lists above.
- **Protect** columns 1–15: they are system-of-record from HubSpot and Meta, not hand-editable.

## Derived views worth keeping

| View | Reveals |
|---|---|
| Median `speed_to_lead_hours` by week | Whether follow-up is degrading. The highest-leverage number in the pipeline |
| Contact rate by `speed_to_lead_hours` bucket (<1 h, 1–4, 4–24, >24) | The real cost of a slow callback, in your own data |
| `score_total` over time | Whether coaching is landing |
| Won rate by `campaign_id` | Which ads produce leads that *close* — not just cheap leads. A campaign at NZ$10.21 CPL that never converts is more expensive than one at NZ$25 that does |
| Count of `compliance_breach` by gate | Which rule keeps slipping |
| Won rate by `business_type` | Which of the 7 ICPs to weight the ad spend toward |

That fourth view is the one that pays for the whole build: it closes the loop from ad spend to
signed weekly revenue, which neither HubSpot nor Meta can show you on its own.
