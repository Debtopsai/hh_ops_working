# 01 — Campaign Structure

*Specified tightly enough to enter into Ads Manager without further decisions. Built on the confirmed inputs: **$20/day (≈ $140/week, ≈ $600/month)** and **Auckland only** (targets Auckland, services Auckland) — see `00`.*

---

## The structure call: one ad set, one ad at a time

At $20/day in a single metro, the textbook "one concept per ad set for a clean A/B read" isn't just wrong — you can't even afford to run *two ads at once*, let alone two ad sets. Here's the maths.

Meta needs ~50 optimisation events per ad set per week to exit the learning phase. Work back from the budget:

| Step | Figure | Basis |
|---|---|---|
| Weekly budget | ~$140/week | $20 × 7 |
| Est. CPM (Auckland, B2B) | $10–16 | metro, small niche |
| Impressions/week @ $12 CPM | ~11,700 | $140 ÷ $12 × 1,000 |
| Landing-page views @ ~1% outbound CTR | ~90–100/week | demanding catalogue destination |
| Product views (ViewContent) | ~50–70/week | of those who land |
| **Add to Enquiry** @ ~8% of LPVs | **~7–8/week** | the best mid-funnel signal |
| **Enquiry submits (Lead)** @ ~30% of adds | **~2–3/week** | the true outcome |

Read the bottom rows. You get **~2–3 enquiries a week**, and even the upstream Add-to-Enquiry event lands ~7–8/week — a fraction of the ~50/week needed to exit learning. Split that budget across two ad sets, or even rotate two ads in one ad set, and each ad is fighting over ~1 enquiry a week: pure noise, no read, no learning. So:

> **Decision: ONE ad set, ONE ad live at a time.** Run your strongest ad, give it a clean two weeks, read it, then swap in the next. You are not A/B testing at this budget — you're sequentially learning which *angle* pulls. Expect to sit **"Learning limited"** permanently; that's the honest reality of $20/day, not a fault. Judge on cost-per-outcome over 14-day windows (see `04`), never on a few days.

**When would that change?** Only at genuinely higher spend. A clean two-ad-set A/B needs each ad set to have a shot at ~50 optimisation events/week ≈ ~$135/day *per ad set* ≈ **~$270/day (~$8k/month) total.** You are ~13× below that. Until you're spending several thousand a month, single ad set, one ad at a time — full stop.

---

## Account build (enter exactly this)

### Campaign
- **Objective:** Sales (conversions), conversion location Website. *Not* the Leads instant-form (the destination is an on-site browsable enquiry), *not* Traffic (buys cheap clicks, not intent).
- **Budget:** **ABO — set the ~$20/day at the ad-set level.** There's a single ad set; there's nothing for CBO to allocate.
- **Special Ad Category:** None (correct for NZ/Auckland — see `00` §4). Watch for an auto-applied credit flag in the first 48h.
- **Type:** manual Sales campaign, not Advantage+ Shopping (no pixel history to justify ASC).

### Ad set
- **Daily budget:** ~$20/day.
- **Optimisation event:** at this volume, **start on ViewContent (product view)** — it's the only event frequent enough (~50–70/week) to give the algorithm anything to learn from. Move up to **Add to Enquiry (AddToCart)** once ViewContent is delivering steadily and you want tighter intent; **Lead (enquiry submit) is not a viable optimisation event at $20/day** (~2–3/week) — keep it as the *measured* outcome only.
- **Attribution:** 7-day click, 1-day view.
- **Placements:** Advantage+ Placements (automatic). Do not hand-restrict at this budget. Supply 9:16 **and** 4:5 assets.
- **Schedule:** continuous; no dayparting (nowhere near enough data).

### Targeting — Auckland, broad, creative-led
The addressable pool (Auckland hospitality operators) is **small**, and $20/day sees only a sliver of it. Narrow interest-*stacking* would starve delivery outright.

- **Location:** Auckland region. (Confirm whether to include the wider Auckland fringe or hold to the metro based on where Washpro installs.)
- **Age / gender:** 25–65, all genders.
- **Audience:** **Advantage+ Audience with a light interest *suggestion*** — Meta treats it as a starting signal and widens as it finds converters, which is what you want with zero history in a small pool. Suggested signals (broad, OR-logic, never AND-stacked): *Restaurant · Foodservice · Catering · Commercial kitchen · Café · Bar · Bakery · Restaurant management · Small business owners.* Do not narrow further — in Auckland at $20/day, narrower = starved.
- **My call:** broad + one strong creative beats any clever targeting here. The creative is your targeting.

### Exclusions (from day one)
- **Existing customers** — upload the customer list (`data/customers.csv`) as a Customer List Custom Audience and exclude.
- **Recent enquirers** — exclude "Submitted enquiry in the last 60 days" once the pixel is live.

### Retargeting — build now, but temper expectations
At ~90 landing-page views/week, website-visitor pools accrue **slowly** — retargeting won't be meaningfully sized for several weeks. Build these on day one so they start filling; switch on only once a pool clears Meta's minimum (~1,000):

| Audience | Definition | Note |
|---|---|---|
| Enquiry-starters | Added to Enquiry, didn't Submit, 30/60-day | Highest value; slowest to fill |
| Website visitors | portal.hirehospo.com, 30/60/90-day | Weeks to size at this traffic |
| Video viewers | 25%/50%/75% ThruPlay, 30/60-day | **Fills fastest and cheapest — your first usable RT pool** |
| Social engagers | FB + IG engagers, 90/365-day | Backup while the pixel warms |

Lookalikes need ~100 seed events — not realistic for months at this volume; park them.

---

## Naming conventions (use verbatim)

| Level | Convention | Example |
|---|---|---|
| **Campaign** | `HH_{Stage}_{Objective}_{Geo}_{YYYY-MM}` | `HH_PROSPECT_Sales_AKL_2026-08` |
| **Ad set** | `HH_{StageShort}_{Audience}_{Age}_{Geo}_{OptEvent}_v{n}` | `HH_PS_ADV-AUD_25-65_AKL_ViewContent_v1` |
| **Ad** | `HH_{Video}_{Format}_{CopyID}_v{n}` | `HH_V1-Value_9x16_P1_v1` · `HH_V2-Speed_9x16_P1_v1` |

Video tags `V1-Value` / `V2-Speed` (the two fixed videos, `03`); Format `9x16` / `4x5`; **CopyID** = which primary/headline variant from `02` (`P1`–`P5`). Move `v{n}` on every refresh so fatigue tracking in `04` stays legible. Since you run one ad at a time, the ad name's CopyID is your running log of which copy you've tested against each video.
