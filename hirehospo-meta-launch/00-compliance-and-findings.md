# HireHospo Meta Launch — Findings, Assumptions & Compliance

*First Meta campaign. No pixel history, no past creative, no benchmarks. Every recommendation in this pack is built to be robust to zero signal on day one. New Zealand English, NZD, ex-GST pricing throughout.*

Read this file first. It sets the four operator assumptions the rest of the plan is built on, resolves the price claim against live stock, fixes the two concepts, and records what I found on the two compliance questions the brief asked me to verify rather than assume.

---

## 1. Operator inputs were left blank — here are my assumptions

The four inputs at the top of the brief were not supplied. Per the brief's own instruction I have **not guessed silently**: each assumption below is stated in bold, set to the most conservative reasonable value, and carried through the whole plan. **Confirm or correct these before launch — three of the five deliverables branch on them.**

> **ASSUMPTION 1 — Monthly budget: NZD $2,000 / month (≈ $66/day, ≈ $460/week).** The brief's own example figure and a realistic first-launch number. It is deliberately conservative because the low-budget case is the *hardest* case: it is what forces the single-ad-set structure and the upstream-event optimisation call. If the real budget is higher, `01-campaign-structure.md` states the exact daily-spend thresholds at which the structure should change.
>
> **ASSUMPTION 2 — Geography: nationwide New Zealand.** Washpro services NZ-wide, and the hospitality-operator pool is small; restricting to Auckland at $66/day would starve delivery and worsen the central signal problem. **If Washpro's install capacity is Auckland-weighted, tighten to Auckland + main centres (Wellington, Christchurch, Hamilton, Tauranga)** — this is the one assumption most likely to be wrong, so confirm fulfilment reach first.
>
> **ASSUMPTION 3 — Launch date: gated by the pre-launch checklist, not the calendar.** With no date given, treat launch as "the day `05-prelaunch-checklist.md` is fully green," and plan a **~2-week runway from today (26 July 2026), i.e. on or around 9 August 2026**. The blocking item most likely to slip that date is pixel + Conversions API verification on the portal.
>
> **ASSUMPTION 4 — Inbox owner: not yet assigned → treated as a blocking risk.** With no named responder, the plan assumes **no dedicated inbox owner exists yet** and makes "assign an enquiry owner with a documented response SLA of under two business hours during trading hours" a **blocking** pre-launch item (`05`, item 5.1). A lead that waits two days for a reply is a wasted lead regardless of how good the ad was — at this budget you cannot afford to waste any.

---

## 2. The price claim vs live stock — resolve before it runs

**The problem (brief item a).** The ad says *"from $4.66 per day"*. That is **$32.62/week**. The live catalogue shows items from roughly **$22.82/week ex GST (≈ $3.26/day)** and offers an **"Under $25/wk" filter**. So the claim is not *inflated* — it is *understated* and it *mismatches what the visitor sees on arrival*. A cold viewer who is sold "$4.66/day" and lands on a page headed by sub-$25/week stock has been under-promised; worse, the two numbers don't line up, which reads as sloppy rather than generous.

**Recommended claim — lead weekly, match the page.**

| | Original | Recommended champion | Round variant | Daily-frame variant (test only) |
|---|---|---|---|---|
| Claim | "from $4.66 per day" | **"from $22.82/week +GST"** | **"from under $25/week +GST"** | "from under $3.50/day +GST" |
| Why | mixes units, understates, mismatches page | exact live floor; mirrors the per-product "from $X/wk Ex GST" display | maps to the site's own **"Under $25/wk" filter** — a round, credible number the visitor will actually click | keeps a daily anchor for the audience that thinks in daily covers; rounded *up* from $3.26 so it stays true |

I would **ship "from under $25/week +GST"** as the headline value claim: it is the strongest number that is (a) true against live stock, (b) consistent with the landing page, and (c) memorable. Use the exact "$22.82/week +GST" where precision adds credibility (long-form primary text). Retire "$4.66/day" — it is the weakest of the four because it both understates and mismatches.

> **HARD GATE (guardrail 4).** Whatever number ships **must be verified against live stock on the morning of launch** and **re-verified whenever Washpro changes stock**. If the sub-$25 item sells and the new floor is $27.90/week, the ad must change the same day. This is a blocking checklist item (`05`, item 5.4), and it is the single claim most likely to drift out of compliance over time. Assign an owner to it.

---

## 3. The two concepts — problems fixed, corrected lines shown

The two concepts are locked in intent. Below, each flagged problem is shown with the original line and my recommended fix. Sharpened execution, same ideas.

### Concept 1 — Low Weekly Payment / Value

**(b) Unit mixing.** *"Premium equipment at low weekly prices, from $4.66 per day"* asks the reader to hold weekly and daily in one sentence. **Fix: one unit per ad, test the other as a variant.**

- Original: "Premium equipment at low weekly prices, from $4.66 per day."
- **Weekly frame (champion):** "Premium commercial kitchen equipment, from under $25/week +GST."
- **Daily frame (variant):** "Premium kitchen equipment, from under $3.50/day +GST."

**(c) GST not stated.** The site quotes ex-GST; the ads must say so. For a B2B audience ex-GST is normal and expected — but **unstated it is a Fair Trading Act exposure** (see §5). **Fix: every price carries "+GST".** Applied to every line in `02` and every price frame in `03`.

**(e) "Let your equipment pay for itself" is a financial-performance claim.** It implies the revenue generated will cover the payments — unsubstantiated, and category-risky for a finance product. **Fix: keep the emotional promise, drop the asserted outcome.**

- Original: "Let your equipment pay for itself."
- **Softer options (all shippable):** "Put premium equipment to work — keep your capital free." · "Get the gear working in your kitchen, not a $20,000 hole in your account." · "Fully equipped kitchen. Cash still in the business." · "Premium equipment, working from week one."
- **Do not ship the original.** My pick: *"Fully equipped kitchen. Cash still in the business."*

### Concept 2 — Quick Process / Speed

**(d) The timeline is the single biggest legal and operational risk in the plan.** *"Monday, apply. Tuesday, approved. Thursday, delivered"* implies **automatic approval** and omits the **20-weeks-upfront deposit** that must clear before dispatch. As written it is both a misleading-conduct risk under the Fair Trading Act **and** a lead-quality problem: it attracts applicants who cannot fund the deposit, wasting credit-assessment time and frustrating people who were effectively mis-sold the speed.

Three rewrites, increasing caution:

| Level | Rewrite | What it does |
|---|---|---|
| **1 — least cautious (needs legal sign-off)** | "Apply Monday. Credit decision in 24–48 hours. Approved and deposit paid? Washpro can deliver in 1–3 business days. +GST · subject to credit approval." | Keeps the day rhythm but makes approval conditional and puts the deposit in the sentence. Only ship if the client's advisor is comfortable the day structure reads as illustrative, not promised. |
| **2 — mid (my pick to ship)** | "From application to installed can move fast: a **24–48 hour credit decision**, then delivery **1–3 business days after your deposit clears**. We're credit-led — approval isn't guaranteed. +GST." | Shifts the speed story onto the parts that are *reliably* fast (the decision and the post-deposit delivery), states conditionality and the deposit plainly, and still feels like momentum. Defensible under the FTA and self-selects for deposit-capable leads. |
| **3 — most cautious** | "A credit decision in **24–48 hours**. Once you're approved and your deposit's paid, Washpro delivers in **1–3 business days**. +GST · subject to credit approval · normal lending criteria apply." | Drops the day-of-week narrative entirely; sells only the two facts that are always true. Ship this if legal wants maximum caution. |

**I would ship Level 2.** It preserves the emotional point of Concept 2 — *things move quickly here* — without a promise the funnel can't keep. Level 3 is the safe fallback; Level 1 only with explicit legal comfort.

**Note on Concept 2's tagline "Get our latest stock list today."** This is clean — no fix needed. It also happens to be the lowest-friction ask on the page ("browse the stock"), which is why `02` leans on it as the CTA framing for the speed concept.

---

## 4. Meta Special Ad Category — what I found (verify in-account at build)

**The question:** does Meta apply the **Credit** Special Ad Category (SAC) to this advertiser and geography, which would sharply narrow targeting?

**What current Meta policy says (checked July 2026, not from memory):** the credit SAC is enforced for **advertisers located in — or targeting — the United States, Canada, and parts of the European Union.** Ads that promote a credit opportunity (loans, financing, long-term financing of goods) in those geographies must self-identify as Special Ad Category: Credit, which removes age/gender exclusions, limits detailed-interest targeting, and forces a minimum ~15-mile/geographic radius.

**What that means for HireHospo (NZ-only targeting):** New Zealand is **not** currently in the credit-SAC enforcement set, so an NZ-targeted HireHospo campaign should **retain full detailed-interest and exclusion targeting** — which is why `01` is able to recommend an interest-led broad audience with customer exclusions. Two caveats that make this a **verify-at-build** item, not a settled fact:

1. **Meta has expanded SAC geography before**, and policy can change between now and launch. Check the Special Ad Category field in Ads Manager when you create the campaign.
2. **Since 2026, Meta's classifiers auto-detect "credit imagery/claims"** and can apply SAC-style restrictions *even if the advertiser did not self-select the category.* Finance-heavy copy or imagery could trip this. If targeting silently narrows or the campaign gets auto-flagged, that is this mechanism — not an error.

**Recommendation:** at build, leave the Special Ad Category set to **none** (correct for NZ today), but have the account owner watch for an auto-applied credit flag in the first 48 hours and be ready to operate under SAC constraints if one appears. Sources below.

Separately: Meta's **Financial Products & Services** ad policy applies **globally**, SAC or not. It requires that finance claims be accurate and non-misleading and that terms not be obscured — which is the platform-policy reason (on top of NZ law) that the copy discipline in this pack matters.

## 5. NZ disclosure obligations — the question to put to the client's advisor

**I am not giving legal advice — I am flagging the question and recommending sign-off before launch.**

- **Fair Trading Act (applies to all trade, including B2B).** The FTA prohibits misleading or deceptive conduct in trade. Two live exposures this plan already addresses: (i) **advertising ex-GST prices without clearly stating they exclude GST** can breach the FTA and has been prosecuted — hence "+GST" on every price; (ii) the **Concept 2 timeline** implying guaranteed approval / no deposit — hence the §3(d) rewrite. Fine print cannot cure a misleading overall impression.
- **CCCFA (consumer credit).** The Credit Contracts and Consumer Finance Act governs **consumer** credit — credit for personal, domestic or household use. HireHospo finances **commercial kitchen equipment to businesses**, which generally falls **outside** the CCCFA's consumer regime. **Do not treat this as settled.** The question for the client's advisor: *does any financial-services advertising or disclosure obligation (CCCFA, FMCA, responsible-lending, or FSPR/financial-advice rules) attach to how HireHospo advertises B2B equipment finance in NZ, and are there mandatory disclosures for the ads or the landing page?* Confirm before the first dollar is spent (`05`, item 5.7).

---

## Sources
- [Meta Special Ad Categories rules (2025/26)](https://www.data-axle.com/resources/blog/meta-special-ad-categories-rules/) · [Special Ad Categories guide — Jon Loomer](https://www.jonloomer.com/special-ad-categories-meta-ads/) · [Meta ad policy updates 2026](https://www.auditsocials.com/blog/meta-ad-policy-updates-2026-guide) · [Meta financial-services ad restrictions](https://wolf.financial/blog/meta-ads-financial-services-restrictions-targeting-workarounds)
- [Advertised pricing & the Fair Trading Act — Sprintlaw NZ](https://sprintlaw.co.nz/articles/advertised-pricing-laws-in-new-zealand-fair-trading-act-compliance/) · [Misleading prices — Consumer Protection NZ](https://www.consumerprotection.govt.nz/general-help/common-consumer-issues/misleading-prices-or-advertising) · [Fine print — Commerce Commission](https://www.comcom.govt.nz/business/dealing-with-typical-situations/advertising-your-product-or-service/fine-print/) · [CCCFA — Commerce Commission](https://www.comcom.govt.nz/business/credit-providers/)

*Web sources are point-in-time (July 2026). Confirm Meta policy in-account and NZ obligations with the client's advisor before launch.*
