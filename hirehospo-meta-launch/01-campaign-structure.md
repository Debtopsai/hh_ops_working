# 01 — Campaign Structure

*Specified tightly enough to enter into Ads Manager without further decisions. Built on **Assumption 1 (NZD $2,000/month ≈ $66/day)** and **Assumption 2 (nationwide NZ)** — see `00`. Where a decision changes above a spend threshold, that threshold is stated.*

---

## The one decision that shapes everything: how many ad sets?

The textbook rule is one concept per ad set for a clean A/B read. **At $66/day that rule is wrong here, and following it would sink the launch.** Here is the maths that drives the call.

Meta needs roughly **50 optimisation events per ad set per week** to exit the learning phase and deliver stably. Work backwards from the budget:

| Step | Figure | Basis |
|---|---|---|
| Weekly budget | ~$460/week | $2,000/mo ÷ 4.33 |
| Est. CPM (NZ, B2B) | $8–15 | conservative first-account range |
| Impressions/week @ $12 CPM | ~38,000 | $460 ÷ $12 × 1,000 |
| Landing-page views @ ~1% outbound CTR | ~300–380/week | demanding catalogue destination |
| **Add to Enquiry** @ ~8% of LPVs | **~24–30/week** | the best mid-funnel signal available |
| **Enquiry submits (Lead)** @ ~30% of adds | **~7–9/week** | the true outcome |

**Read the two bold rows.** Even the *upstream* Add-to-Enquiry event lands around 24–30/week — **below the 50/week learning threshold on a single ad set.** The Lead event is nowhere near it. Now split that budget across two ad sets and each one is trying to exit learning on ~12–15 adds/week: both stall, both stay in permanent learning, both under-deliver, and you *still* don't get a clean read because the volume is too low to be significant. Splitting halves already-thin signal for a read you can't trust.

**Decision: launch with a SINGLE ad set holding BOTH creatives**, and let Meta allocate delivery between them. You sacrifice a clean A/B read — accepted, because at this budget a "clean read" would be noise dressed up as data anyway. You gain: one audience pool, one budget, the best possible shot at accumulating enough signal to deliver efficiently. Read the two ads *directionally* (which is getting the impressions Meta chose to give it, and which is producing enquiries), not as a controlled test.

**Switch to a two-ad-set A/B split when — and only when — each ad set can realistically hit ~50 optimisation events/week.** At ~$19 per Add-to-Enquiry, 50/week ≈ $950/week ≈ **~$135/day per ad set → ~$270/day total ≈ ~$8,000/month.** So:

> **Structure rule of thumb: single ad set below ~$250/day (~$7.5k/month). Split-test structure at or above ~$300/day (~$9k/month).** Between those, use judgement based on your actual cost-per-Add-to-Enquiry.

---

## Account build (enter exactly this)

### Campaign
- **Objective:** Sales (conversions). *Not* the Leads/instant-form objective — the destination is an on-site browsable enquiry, not a native form, so we optimise for a website conversion event. *Not* Traffic — Traffic buys cheap clicks, not intent; we would rather optimise on a real upstream conversion event (below) than on raw clicks.
- **Conversion location:** Website.
- **Budget:** set at the **ad-set level (ABO)** while there is a single ad set — it gives you direct control and there is nothing for CBO to allocate *between* yet. Move to **Advantage Campaign Budget (CBO)** when you go to the two-ad-set split.
- **Special Ad Category:** **None** (correct for NZ-only targeting today — see `00` §4). Watch for an auto-applied credit flag in the first 48 hours.
- **Advantage+ / manual:** run this as a **manual (original) Sales campaign**, not an Advantage+ Shopping Campaign — ASC assumes catalogue-sales maturity and pixel history this account doesn't have.

### Ad set
- **Daily budget:** ~$66/day (the full $2,000/month in one ad set).
- **Optimisation event:** **start on "Add to Enquiry" (mapped to AddToCart).** Rationale in `04` — it is the best available balance of genuine intent and enough frequency to feed the algorithm. **If in the first 5–7 days delivery is starved or CPMs spike because the event is too rare, drop the optimisation to "ViewContent" (product view)** to let the ad set actually spend and gather signal, then climb back up. **Move optimisation down to the "Lead" (enquiry submit) event only once you're seeing ~15–25 Leads/week consistently** (see `04`). Expect to run **learning-limited** at this budget — that is normal here, not a failure.
- **Attribution setting:** **7-day click, 1-day view.** A financed equipment purchase is considered — a 7-day click window captures the browse-then-return behaviour; the 1-day view credit suits short video.
- **Placements:** **Advantage+ Placements (automatic).** At $66/day, do not hand-restrict placements — let Meta find the cheapest qualified inventory (Reels and Stories video is usually cheap and suits 9:16). Supply 9:16 **and** 4:5 assets so every placement renders a proper crop (see `03`).
- **Schedule:** run continuously; do not dayparting at this budget (too little data to justify it).

### Targeting — take a position, because the pool is small
The NZ hospitality-operator audience is small. **Narrow detailed-interest *stacking* (interest AND interest AND interest) will starve delivery** and push CPMs up. The right move at launch:

- **Location:** New Zealand (Assumption 2). Tighten to Auckland + main centres if fulfilment is Auckland-weighted.
- **Age / gender:** 25–65, all genders. (Do not exclude by age/gender — no reason to, and it keeps you clean should a credit flag ever apply.)
- **Audience:** use **Advantage+ Audience with a light interest *suggestion*** rather than a hard-locked narrow stack. Meta treats the suggestion as a starting signal and expands when it finds converters — which is exactly what you want with zero pixel history. Suggested interest signals (broad, OR-logic, not stacked): *Restaurant · Foodservice · Catering · Commercial kitchen · Coffeehouse/Café · Bar · Bakery · Restaurant management · Small business owners · Entrepreneurship.* Behaviours: *Small business owners · Facebook Page admins.*
- **If you prefer maximum control over Advantage+ Audience:** run a single **original audience** with the interests above as an OR-stack (any one qualifies) and **audience expansion ON**. Do not AND them together.
- **My call:** start on **Advantage+ Audience with the interest suggestion**. Broad + creative-led beats narrow + starved in a market this size.

### Exclusions (build and apply from day one)
- **Existing customers** — upload the customer list (`data/customers.csv`, ~29 accounts) as a **Customer List Custom Audience** and exclude it. Small, but it stops wasting spend on people already financed.
- **Recent converters** — exclude "Submitted enquiry in the last 60 days" once the pixel is live.
- **Staff / internal** — exclude a small staff custom audience if practical.

### Retargeting audiences — build now, switch on ~week 3
Create these on day one so they are populated and past their minimum size when you need them. Retargeting doesn't *run* until you have enough top-of-funnel traffic pooled (~week 3), but the audiences must be **accruing from launch**.

| Audience | Definition | Use |
|---|---|---|
| Website visitors | portal.hirehospo.com visitors, 30 / 60 / 90-day | Broad retargeting pool |
| Enquiry-starters | Added to Enquiry, did **not** Submit, 14 / 30-day | Highest-value: warm, deposit-conversation ready |
| Product-category viewers | ViewContent by category (e.g. dishwasher viewers), 30-day | Category-matched retargeting creative |
| Video viewers | 25% / 50% / 75% ThruPlay, 30 / 60-day | Cheap re-engagement; feeds a mid-funnel ad |
| Social engagers | FB Page + IG account engagers, 90 / 365-day | Backup pool while the pixel warms |
| Lookalike (later) | 1–3% LAL of Enquiry-submitters **and** of the customer list | Only once you have ≥100 seed events — not at launch |

---

## Naming conventions (use verbatim)

Pattern: `{Brand}_{Stage}_{Objective}_{Event}_{Geo}_{YYYY-MM}` → drill down consistently.

| Level | Convention | Example |
|---|---|---|
| **Campaign** | `HH_{Stage}_{Objective}_{Geo}_{YYYY-MM}` | `HH_PROSPECT_Sales_NZ_2026-08` |
| **Ad set** | `HH_{StageShort}_{Audience}_{Age}_{Geo}_{OptEvent}_v{n}` | `HH_PS_ADV-AUD_25-65_NZ_AddToEnquiry_v1` |
| **Ad** | `HH_{Concept}_{Format}_{HookID}_v{n}` | `HH_C1-Value_9x16_H-Under25wk_v1` · `HH_C2-Speed_9x16_H-2448hr_v1` |

Conventions in use elsewhere in the pack: **Concept tags** `C1-Value` / `C2-Speed`; **Format** `9x16` / `4x5`; **HookID** = a short slug of the winning hook from `03` (e.g. `H-Under25wk`, `H-2448hr`, `H-RefurbWhy`, `H-FryerDies`). Keep `v{n}` moving every time you refresh creative so fatigue tracking in `04` stays legible.

**When you split to two ad sets (≥ ~$9k/month):** duplicate the ad set, put one concept in each, rename `..._AddToEnquiry_C1_v1` / `..._AddToEnquiry_C2_v1`, and switch the campaign to CBO.
