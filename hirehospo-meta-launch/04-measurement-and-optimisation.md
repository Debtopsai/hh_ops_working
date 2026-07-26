# 04 — Measurement & Optimisation: the first 90 days

*Targets are ranges, not promises. This is a cold NZ B2B account with no history at ~$66/day (Assumption 1). Treat the first 30 days as buying data, not conversions. Everything here assumes the pixel + CAPI are verified before spend (`05`).*

---

## The funnel, and why the last number takes weeks

Traffic doesn't convert in one step. It lands → filters → browses → adds one or more items → submits an enquiry list. Then the *real* business funnel begins, off-platform and slow:

```
Impression → Landing-page view → ViewContent → Add to Enquiry → SUBMIT ENQUIRY (Lead)
                                                                     ↓
                          credit application → credit decision (24–48h) → APPROVED
                                                                     ↓
                              quote → contract signed → DEPOSIT CLEARS (20 wks upfront)
                                                                     ↓
                                                          FUNDED CONTRACT ← the number that matters
```

The Meta-side events (up to Lead) you can read within days. Everything below Lead runs on the credit-and-deposit cycle and **will not produce a reliable cost-per-funded-contract for roughly 4–8 weeks** — the deposit is 20 weeks of payments upfront and is the slowest, highest-friction gate in the whole chain. Do not wait for that number to make early decisions; watch the leading indicators instead.

## Event mapping (set these in Events Manager)

| Funnel step | Meta standard event | Role |
|---|---|---|
| Lands on /brochure | PageView | Traffic sanity only |
| Views a product | ViewContent | Fallback optimisation event (week 1 if AddToEnquiry starves) |
| **Add to Enquiry** | **AddToCart** | **Launch optimisation event** — best intent/frequency balance |
| **Submit enquiry list** | **Lead** | The true on-platform outcome; the KPI you judge on |
| (optional) enquiry value | attach a value param | Lets you read cost-per-lead by category later |

Why not optimise for Lead from day one: see the volume maths in `01`. At $66/day you land ~7–9 Leads/week — far below the ~50/week an ad set needs to exit learning, so Lead-optimisation would leave the algorithm starved. Start on AddToCart (Add to Enquiry), keep Lead as the *measured* outcome, and move optimisation down to Lead only once you're seeing **~15–25 Leads/week consistently.**

---

## KPI set with target ranges (cold NZ B2B, ~$66/day)

Ranges are first-account expectations, not benchmarks — you are *building* the benchmarks. "Investigate" = look, don't act yet (see decision rules).

| Metric | Target range | Investigate if | Notes |
|---|---|---|---|
| CPM | $8–15 NZD | > $20 | Small market; Reels/Stories cheaper |
| Hook rate (3s/ThruPlay) | 25–35% | < 20% | Muted-first creative problem if low |
| Hold rate (ThruPlay/impr) | 10–20% | < 8% | Body pacing problem if low |
| Outbound CTR (link) | 0.8–1.5% | < 0.6% | Demanding destination caps this |
| Cost / landing-page view | $1.20–$2.50 | > $4 | |
| Add-to-Enquiry rate (of LPV) | 5–12% | < 3% | Landing-experience lever (see below) |
| Cost / Add to Enquiry | $12–$30 | > $45 | The launch optimisation KPI |
| Enquiry-submit rate (of LPV) | 1.5–4% | < 1% | |
| **Cost per enquiry (Lead)** | **$40–$100** | **> $130** | **The headline KPI. Aim < $75.** |
| Enquiry → credit application | 40–60% | < 30% | Off-platform; inbox-owner dependent |
| Application → approval | 35–60% | — | Credit-led: many declines are *correct*, not a failure |
| Approval → signed contract | 40–60% | < 30% | Deposit conversation happens here |
| Contract → deposit cleared (funded) | 50–70% | < 40% | The 20-week deposit is the drop-off |
| **Cost per funded contract** | **$600–$1,500** | after 8 wks, > $2,500 | Not measurable for 4–8 wks |

**On cost per funded contract:** at the midpoints (~7 enquiries/wk × ~50% to application × ~50% approval × ~50% contract × ~60% funded ≈ **~0.5 funded/week ≈ 2/month**), CAC lands near **~$1,000 per funded contract.** Against a contract that bills weekly for 12–36 months (funding up to $50k, ~30% equipment margin), that is very likely acceptable — but confirm it against real contract economics once the first cohort funds. **Until then, watch these leading indicators:** cost per enquiry, enquiry→application rate, and *application quality* (are enquirers deposit-capable — 20 weeks upfront?). If cost-per-enquiry is on target but application quality is poor, the problem is the message setting a false expectation (revisit the Concept 2 timeline / deposit framing), not the media.

---

## Learning phase & review cadence

- **Learning phase:** an ad set needs ~50 optimisation events in 7 days to exit. At this budget you will likely sit in **"Learning limited"** — that is expected here, not a fault. Don't chase learning-phase exit you can't afford; instead judge on cost-per-outcome across rolling **14-day** windows.
- **Don't touch the ad set for the first 7 days.** Every meaningful edit (budget >20%, audience, creative, optimisation event) **resets learning**. Batch changes; make them at the weekly review, not daily.
- **Cadence:** check *delivery and spend* daily (health only — is it spending, any policy flags, any broken link). Make *decisions* weekly. Formal reviews at **day 14, 30, 60, 90.**

## Decision rules — and the mistake that breaks first launches

> **The first-time-advertiser mistake: judging creative on three days of data.** In the first 72 hours an ad set is in learning, daily results swing wildly, and the numbers are noise. Acting on them — killing the "loser," dumping budget on the "winner" — resets learning and throws away the launch. **The rule that prevents it: no kill or scale decision inside the first 7 days, and never before the minimums below are met.**

**Minimum evidence before ANY creative decision:** ≥ 7 days live **and** ≥ ~3,000 impressions on that ad **and** ≥ ~15 optimisation events (or ≥ ~8 enquiries) at the ad-set level. Below that you are reading variance.

| Decision | Rule |
|---|---|
| **Kill an ad** | After ≥7 days & ≥3,000 impressions: kill it only if it is *clearly* worse — e.g. outbound CTR below half the other ad **and** cost-per-Add-to-Enquiry ≥50% higher, with zero enquiries while the other is producing them. One bad metric is not enough. |
| **Scale** | Only after ≥14 days of cost-per-enquiry stable and within target. Raise budget by **≤20% every 3–4 days** (bigger jumps reset learning). Prefer gradual increases over duplication early. |
| **Change optimisation event** | Move AddToCart → Lead only after ~15–25 Leads/week for 2 straight weeks. Drop AddToCart → ViewContent in week 1 only if delivery is starved (spend not clearing, CPM spiking). |
| **Do nothing** | The correct call most days in the first fortnight. Boredom is not a data point. |

---

## Creative fatigue plan — two ads is a thin rotation

Two creatives will not last. In a small NZ audience, frequency climbs and the same operators see the same two ads quickly.

- **Watch frequency** over a rolling 7-day window. **Fatigue signal: frequency > ~2.5–3** *and* rising cost-per-enquiry / falling CTR at the same time. Frequency alone isn't fatigue; frequency **plus** decaying efficiency is.
- **Expected burn-out: ~3–5 weeks** at this budget and audience size. The two launch ads are a starting hand, not a season.
- **Production rhythm — the $1k rule:** produce roughly **one new ad per $1,000 of monthly spend** → at $2,000/month, **~2 fresh ads per month, minimum.** Have the **next 2–3 variants in production by week 3**, before the first pair fatigues, so there is never a gap. Cheapest refreshes: new hooks (you have ranked spares in `03`) over the same proven body and end card; new catalogue stills; a 4:5 cut you haven't run yet.
- **Refresh, don't just add:** when a new variant beats an old one on cost-per-enquiry over 14 days, retire the old one. Keep the rotation at 2–4 live ads, not an ever-growing pile.

## What a good first 90 days looks like
Day 0–14: spending cleanly on AddToCart, cost-per-enquiry finding its range, no decisions made. Day 14–30: first read on which concept/hook the algorithm favours; kill the clear loser if minimums are met; first enquiries moving into credit. Day 30–60: cost-per-enquiry stable, optimisation possibly moved to Lead, second creative wave live, first funded contracts appearing. Day 60–90: a real (if small) cost-per-funded-contract number, a validated champion angle, and a decision on whether budget justifies the two-ad-set split (`01`).
