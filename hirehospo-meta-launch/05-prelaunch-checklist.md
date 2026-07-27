# 05 — Pre-Launch Checklist

*Everything that must be true before the first dollar is spent, in order. **Blocking** items gate launch — do not spend until every blocking item is green. **Non-blocking** items should be done but won't sink the launch if they slip a few days. Owners are roles (Assumption 4: no inbox owner is assigned yet — 5.1 fixes that). Nothing here is optional theatre; each item maps to a real failure mode this account is exposed to.*

Launch is gated by this list, not the calendar (Assumption 3). The item most likely to slip the date is **1.1–1.3** (pixel + CAPI verification).

---

## Section 1 — Tracking & data foundation
*If this section isn't right, you are flying blind and optimising on nothing. This is the true launch gate.*

| # | Item | Blocking? | Owner |
|---|---|---|---|
| 1.1 | **Meta Pixel installed on portal.hirehospo.com** and firing on all pages (verify with Meta Pixel Helper) | **BLOCKING** | Dev / Web |
| 1.2 | **Conversions API (CAPI) installed** and deduplicating against the pixel (event_id match) — server-side is essential post-iOS for a considered B2B funnel | **BLOCKING** | Dev / Web |
| 1.3 | **Events verified in Events Manager:** `ViewContent` (product view), `AddToCart` (**Add to Enquiry**), `Lead` (**enquiry submit**) all showing green/active test events | **BLOCKING** | Dev / Web |
| 1.4 | **Add-to-Enquiry event confirmed as the launch optimisation event** and selectable in the ad set; `Lead` selectable for the later move-down | **BLOCKING** | Marketing |
| 1.5 | **Domain verified** (portal.hirehospo.com / hirehospo.com) in Business Settings → Brand Safety | **BLOCKING** | Dev / Web |
| 1.6 | **Aggregated Event Measurement configured:** rank the 8 web events with `Lead` #1, `AddToCart` #2, `ViewContent` #3 | **BLOCKING** | Marketing |
| 1.7 | Optional enquiry **value parameter** on `Lead`/`AddToCart` for later cost-per-category reads | non-blocking | Dev / Web |
| 1.8 | Retargeting & exclusion audiences created so they accrue from hour one (website visitors, Add-to-Enquiry-no-submit, video viewers, customer-list exclusion) — see `01` | non-blocking | Marketing |

## Section 2 — Account, billing & access
| # | Item | Blocking? | Owner |
|---|---|---|---|
| 2.1 | **Meta Business Manager** exists and owns the ad account, page and pixel (not a personal profile) | **BLOCKING** | Account owner |
| 2.2 | **Payment method added and verified**, billing threshold set, currency **NZD**, timezone **Pacific/Auckland** (timezone/currency can't be changed later — get it right now) | **BLOCKING** | Account owner |
| 2.3 | **Facebook Page + Instagram account** connected and admin access confirmed | **BLOCKING** | Account owner |
| 2.4 | **Roles assigned** (admin + marketer) via Business Manager, 2FA on all admins | **BLOCKING** | Account owner |
| 2.5 | Ad account **spending limit** set as a runaway-spend backstop (e.g. monthly cap = budget +10%) | non-blocking | Account owner |

## Section 3 — Creative & landing experience
| # | Item | Blocking? | Owner |
|---|---|---|---|
| 3.1 | **Two champion ads built** (Concept 1 + Concept 2 champions, `02`/`03`) in **9:16 and 4:5**, with **burned-in captions**, passing the muted-first test | **BLOCKING** | Marketing / Creative |
| 3.2 | **On-screen text inside Reels safe zones** (top 250px / bottom 420px clear) | **BLOCKING** | Creative |
| 3.3 | **Landing URL confirmed live** and the destination loads fast on mobile | **BLOCKING** | Dev / Web |
| 3.4 | **Category-filtered landing URLs** built and tested (e.g. dishwasher creative → dishwasher-filtered view) so creative matches the page it lands on — a first-order conversion lever (`01`/`04`) | non-blocking (do by week 2) | Dev / Web |
| 3.5 | UTM parameters on all destination links for GA/CRM attribution | non-blocking | Marketing |
| 3.6 | Next creative wave (2–3 variants) briefed into production for the week-3 fatigue refresh (`04`) | non-blocking | Marketing / Creative |

## Section 4 — Compliance sign-offs
*These are the guardrails from the brief, turned into gates. A launch that skips these is a Fair Trading Act exposure.*

| # | Item | Blocking? | Owner |
|---|---|---|---|
| 4.1 | **Price claim verified against live stock this week** — confirm live stock exists at or below "$4.66/day +GST" on the day of launch (`00` §2); owner assigned for ongoing re-verification whenever stock changes | **BLOCKING** | Marketing + Washpro |
| 4.2 | **"+GST" glued to every dollar figure** (on the number, not floated in a sentence or on a non-numeric phrase); ads with no price carry none | **BLOCKING** | Marketing |
| 4.3 | **"Subject to credit approval" present** wherever finance/speed is implied; **no copy implies guaranteed/automatic approval** (esp. Concept 2 — ship the `00` §3d Level-2 rewrite) | **BLOCKING** | Marketing |
| 4.4 | **No specific weekly payment for a named product** beyond the verified "from" entry price; **"let your equipment pay for itself" removed** (`00` §3e) | **BLOCKING** | Marketing |
| 4.5 | **Only real catalogue brands/categories/equipment** on screen and in copy — no invented models, specs or non-stocked equipment (guardrail 6) | **BLOCKING** | Marketing + Product |
| 4.6 | **NZ English throughout**, NZD, ex-GST convention consistent | **BLOCKING** | Marketing |
| 4.7 | **Meta Special Ad Category checked in-account:** set to None (correct for NZ today), and owner briefed to watch for an auto-applied credit flag in the first 48h (`00` §4) | **BLOCKING** | Marketing |
| 4.8 | **NZ disclosure question put to the client's advisor** and answered: does any financial-services/CCCFA/FMCA obligation attach to advertising B2B equipment finance, and are mandatory disclosures required (`00` §5) | **BLOCKING** | Legal / advisor |

## Section 5 — Operations (the wasted-lead guard)
*The best ad in the world is wasted if the enquiry sits unanswered. At $20/day you cannot afford a single cold lead.*

| # | Item | Blocking? | Owner |
|---|---|---|---|
| 5.1 | **Enquiry owner assigned** with a documented **response SLA: under 2 business hours during trading hours** (resolves Assumption 4) | **BLOCKING** | Account owner |
| 5.2 | **Enquiry-submit routing tested end-to-end** — a real test enquiry lands in the inbox/CRM (HubSpot/Zoho) and alerts the owner | **BLOCKING** | Dev / Ops |
| 5.3 | **First-response template ready** that (a) thanks them, (b) sets up the Checkmate credit check, and (c) gently surfaces the deposit reality early, so unqualified leads self-select before they consume credit-assessment time | **BLOCKING** | Sales / Ops |
| 5.4 | **After-hours / weekend fallback** defined (auto-acknowledgement + next-business-day promise) so a Friday-night enquiry isn't dead by Monday | non-blocking | Ops |
| 5.5 | **Deposit-capability qualification** built into the first call/email (20 weeks upfront, reduced structures by credit tier — never advertised) so the funnel filters for fundable leads | non-blocking | Sales |
| 5.6 | **Weekly review owner + reporting view** set up in Ads Manager (the KPI columns from `04`) before spend, so day-14 decisions have a home | non-blocking | Marketing |

---

## Launch gate
**Do not spend until every BLOCKING item above is green.** The critical path is Section 1 (tracking) and items 4.1, 4.3, 4.8 and 5.1 — those are the four most likely to be skipped under time pressure and the four most expensive to get wrong. When they're done, launch the single ad set with both champions (`01`), then leave it alone for seven days (`04`).
