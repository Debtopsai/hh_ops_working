# 07 — Price-led × industry campaign — $40/day

*A separate campaign from the launch (`01`–`05`) and the Top Hospo social-proof set (`06`). Concept: the price-led creative — **"Commercial kitchen equipment from $X/day"** (Ad 4) — run across the industry segments from `06`, one industry per ad set. Budget **$40/day (~$280/week, ~$1,216/month)**. Auckland, NZD, ex-GST. Destination = the stock list / brochure (same funnel as the launch). CTA: "Get our latest stock list today."*

---

## The one trap to avoid: don't test price AND industry at once

You have two things you could test — **price** ($6.99/day vs $3.99/day) and **industry** (café vs restaurant vs bakery…). At $40/day you **cannot test both at the same time** — industry × price = too many cells, each starved, no readable result.

**So: lock one price for this campaign, and test industry only.** Run the $6.99-vs-$3.99 price test *separately* (it only needs one audience — do it in the launch value campaign or a single broad ad set). 

**Which price to lock:** for a price-led acquisition campaign the goal is cheap enquiries, so **start at $3.99/day +GST** — it's the strongest hook and sits closest to the real catalogue floor. Keep an eye on lead *quality* (a lower number can pull more but less-qualified enquiries); if quality dips, move to $6.99/day. (This campaign = one price. The price A/B is its own small test.)

---

## Campaign structure (enter this)

### Campaign
- **Objective:** Sales (conversions) · **Conversion location:** Website · **Destination:** the stock list/brochure.
- **Budget: Advantage Campaign Budget (CBO), $40/day at campaign level.** With multiple industry ad sets, CBO lets Meta push budget to the industries that respond — which is exactly the discovery you want ("which industries bite on the price hook?"). Don't fix per-ad-set budgets.
- **Special Ad Category:** None (correct for NZ — `00` §4). Watch for an auto-applied credit flag.

### Ad sets — one per industry, **start with 3, cap at 4**
$40/day only stretches so far. Across **3 ad sets** CBO can give each a real shot; beyond 4, Meta starves the extras and never tests them. Start with your **3 priority industries**, let CBO find the winner over ~2 weeks, then prune the loser and rotate the next industry in.

- **Recommended starting three:** Cafés · Restaurants · Bakeries. (Swap in Bars / Takeaways / Caterers as you rotate.)
- **Each ad set:** Auckland · age 25–65 · **audience expansion ON** · one light interest signal from `06` (Café/Coffeehouse, Restaurant/Foodservice, Bakery/Baker…) · **exclude** existing customers (customer-list Custom Audience) + enquirers-last-60-days.
- **Optimisation event:** start on **ViewContent** (frequent enough to learn at this budget), move to **Add to Enquiry** once it's delivering steadily. Lead stays the measured outcome.
- **Attribution:** 7-day click / 1-day view. **Placements:** Advantage+ (automatic); supply 9:16 + 4:5.
- **Creative per ad set:** the localised price-led ad for that industry (copy below). If the video itself is the generic "from $X/day" cut, that's fine — the **localised primary text + headline** still self-selects the industry; a localised video is better but not required.

### What to expect
At $40/day CBO across 3 ad sets, Meta will likely concentrate spend on **1–2 winning industries** — that's the campaign doing its job (discovery). Judge at campaign level and by which industry CBO favours on cost-per-enquiry, over 14-day windows. Still expect "learning limited"; it's better funded than the $20/day launch but not by much.

---

## Localised ad copy (one champion per industry)

Shown at **$6.99/day**; for the locked price, use **$3.99/day** (swap the figure everywhere). "+GST" stays glued to the number. Shared **CTA:** button *Learn More*, on-ad line *"Get our latest stock list today."* Shared **link descriptions:** `Get our latest stock list` (25) · `Minimal upfront cost` (20) · `Subject to credit approval` (26).

| Industry | Headline (≤40) | Primary text (⟨~125⟩ = See-more cut) |
|---|---|---|
| **Cafés** | `Café equipment from $6.99/day +GST` | Everything your café runs on — dishwasher, oven, glasswasher, prep — from $6.99/day +GST.⟨~125⟩ Low weekly payments, minimal upfront cost, and it pays for itself while your cash stays in the business. Get our latest stock list today. |
| **Restaurants** | `Restaurant equipment $6.99/day +GST` | Restaurant kitchen equipment from $6.99/day +GST — combi ovens, ranges, dishwashers and more.⟨~125⟩ Low weekly payments, minimal upfront cost, so your capital keeps working in the business. Get our latest stock list today. |
| **Bakeries** | `Bakery equipment from $6.99/day +GST` | Bakery equipment from $6.99/day +GST — mixers, provers, deck ovens, the lot.⟨~125⟩ Low weekly payments, minimal upfront cost, and it pays for itself while your cash stays put. Get our latest stock list today. |
| **Bars** | `Bar equipment from $6.99/day +GST` | Bar equipment from $6.99/day +GST — glasswashers, ice makers, back-bar fridges.⟨~125⟩ Low weekly payments, minimal upfront cost, cash still working behind the bar. Get our latest stock list today. |
| **Caterers** | `Catering equipment $6.99/day +GST` | Catering equipment from $6.99/day +GST — combi ovens, holding cabinets, banquet carts.⟨~125⟩ Low weekly payments, minimal upfront cost, ready for the next big job. Get our latest stock list today. |
| **Takeaways** | `Takeaway equipment $6.99/day +GST` | Takeaway kitchen equipment from $6.99/day +GST — fryers, griddles, salamanders.⟨~125⟩ Low weekly payments, minimal upfront cost, so a breakdown never stops service for long. Get our latest stock list today. |
| **Pizzerias** | `Pizza equipment from $6.99/day +GST` | Pizzeria equipment from $6.99/day +GST — deck and conveyor ovens, dough rollers, prep.⟨~125⟩ Low weekly payments, minimal upfront cost, cash still working in the business. Get our latest stock list today. |
| **Food trucks** | `Food truck equipment $6.99/day +GST` | Food truck equipment from $6.99/day +GST — compact fryers, griddles, hot plates.⟨~125⟩ Low weekly payments, minimal upfront cost, every dollar stays in the truck. Get our latest stock list today. |

*Equipment named per industry is real catalogue category-true. For the $3.99/day version, only the number changes.*

---

## Compliance (same locks)
"+GST" on every price figure (and on the video's price super); both $3.99 and $6.99 are true "from" claims against live stock (`00` §2 launch-day check); "Subject to credit approval" in a link description + end card; real catalogue equipment only; no Washpro on screen; Auckland; approval never implied guaranteed; "kitchen equipment," never "gear."

## Naming
| Level | Convention | Example |
|---|---|---|
| Campaign | `HH_PRICE-IND_Sales_AKL_2026-08` | one CBO campaign |
| Ad set | `HH_PI_{Industry}_AKL_ViewContent_v{n}` | `HH_PI_Cafes_AKL_ViewContent_v1` |
| Ad | `HH_PI_{Industry}_9x16_Price399_v{n}` | `HH_PI_Bakeries_9x16_Price399_v1` (price in the ad name = your log of which point ran) |

## Note on running three campaigns at once
You'd now have three campaigns live: the **launch** ($20/day, broad, value/speed/social videos), the **Top Hospo social-proof** set (`06`), and **this** price-led one ($40/day). That's a lot of small budgets spread thin for one Auckland operator. **Consider either** (a) sequencing them (prove one, then the next), **or** (b) folding the social-proof and price creatives in as *additional ads inside the same industry ad sets* rather than separate campaigns — that concentrates budget and lets Meta pick the best creative per industry. Happy to restructure into one consolidated industry campaign if you'd prefer.
