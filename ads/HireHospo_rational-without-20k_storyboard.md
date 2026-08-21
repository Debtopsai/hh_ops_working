# Storyboard - HireHospo "You Can Afford The Oven" - 20s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_rational-without-20k_script_20s.md` · **Hook** (contrarian truth, restaurant owner, Product Aware) · **PPI+P**
**Total shots:** 11 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:09 (45%) · **CTA:** Get our latest stock list today

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02 | TXT statement | Single line resolves centre on steel. Nothing else on frame - no equipment, no device | **You can afford the oven.** *(Space Grotesk semibold, ink)* | "You can afford the oven." | Music in low (−20dB); **no SFX** | Hold (no cut) |
| 2 | 0:02-0:04 | TXT pattern interrupt | The first line dims to `mute` and lifts 40px; the second lands beneath it in flame | *That's not the problem.* *(flame - this frame's single highlight)* | "That's not the problem." | A single low sub hit on the second line (−18dB) | Hard cut |
| 3 | 0:04-0:06 | GFX capital hit | Mono ledger line. A balance figure steps **down** in four decrements, landing on the withdrawal | `$20,000` *(mono, stepping down; no flame)* | "The problem is $20,000..." | Dip; soft ledger tick per step (−20dB) | Hard cut |
| 4 | 0:06-0:07.5 | GFX runway bar | A horizontal 26-segment bar contracts left→right, week by week | `26 WEEKS` → `SIX MONTHS` *(mono, mute)* | "...leaving your account..." | Ticks continue, slowing | Hard cut |
| 5 | 0:07.5-0:09 | GFX the pause | The contracted bar holds. Frame goes almost entirely still and dark - the only "empty" frame in the set | *(no text - deliberate)* | "...and the six months after that." | **Near-total drop.** Low sustain only | Hard cut (beat of black, 4 frames) |
| 6 | 0:09-0:11 | GFX bridge / **hard reset** | HireHospo wordmark resolves centre on steel, lifts to top third; approval timeline draws in below, four mono steps | HireHospo · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *microcopy: Subject to credit approval* | "It's on our stock list." | Lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 7 | 0:11-0:12.5 | EQUIP hero plinth | Rational SCC WE101 combi oven on a brushed-steel plinth, warm key from upper left, door glass catching light | `RATIONAL SCC WE101` / `COMBI OVENS` *(mono chips)* | "A fully serviced Rational combi." | Single rack clack; low oven-door thunk (−16dB) | Match cut (plinth holds) |
| 8 | 0:12.5-0:14 | Serviced badge | Condition badge stamps on over the plinth's lower left | **`FULLY SERVICED · WITH WARRANTY`** *(flame border, stamp settle)* | "With warranty." | Stamp settle; light metallic ring | Hard cut |
| 9 | 0:14-0:15.5 | GFX approval timeline (return) | The timeline from shot 6 returns, compressed to a single line, `APPROVED` already lit; the hours resolve beneath it | `APPROVED IN 24 TO 48 HOURS` *(mono)* | "Approved in 24 to 48 hours." | Soft approval tick | Hard cut |
| 10 | 0:15.5-0:17.5 | GFX capital-preservation ledger | Two mono ledger lines, each with a `#58C97B` tick landing in turn. **The only frame in the set where both sides win** | `OVEN IN THE KITCHEN` ✓ · `CAPITAL IN THE BUSINESS` ✓ | *(no VO - let the frame land)* | Two soft approval ticks, 400ms apart (−16dB) | Hard cut |
| 11 | 0:17.5-0:20 | End card | HireHospo wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, fully serviced and warranted, on low weekly payments.* · **low weekly payments** · **Get our latest stock list today** *(flame pill, #14161A text)* · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Till/receipt tick; button (−16dB); settle, short tail | Hold to end |

## Frames to build (Claude Code hand-off)

Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). **Frames 6, 8 and 11 are the parameterised components already built for `fitout-quote-shock` - reuse, do not rebuild.** The plinth is reused with a new product. Frames 1-5, 9 and 10 are new.

| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| `frame-statement` | Shots 1-2 | #12141A | Two-line typographic interrupt | Line 1 resolves 0.5s and holds 1.5s; at 2.0s it dims to `mute` and lifts 40px as line 2 lands in flame beneath | **NEW.** The whole concept lives here. No imagery, no device - the restraint is what makes the interrupt work |
| `frame-capital-hit` | Shots 3-4 | #12141A | Ledger figure stepping down + 26-segment runway bar | Figure decrements in 4 steps over 1.4s; bar contracts left→right over 1.2s, segments extinguishing | **NEW. No flame in this frame** - the capital hit gets no "go" colour |
| `frame-pause` | Shot 5 | #12141A | The contracted bar, holding | Everything stops. 1% drift only | **NEW.** 1.5s of near-stillness is the hold-rate device - it breaks the scroll rhythm before the reset |
| `frame-approval-timeline` | Shots 6, 9 | #1C1F26 on #12141A | Wordmark + 4 mono steps; compressed single-line variant for shot 9 | Wordmark resolves 0.5s; steps draw L→R 150ms apart; APPROVED stamps flame. Shot 9 replays it collapsed with APPROVED pre-lit | **REUSED** from `fitout-quote-shock`, plus a new `compact` variant |
| `frame-hero-plinth` | Shot 7 | #12141A + brushed-steel gradient plinth | Rational SCC WE101 cut-out, brand + category chips | Plinth push-in 2%; a warm reflection travels the door glass over 1.2s | **REUSED**, re-parameterised. Product must be **active** on the live catalogue |
| `frame-serviced-badge` | Shot 8 | (overlay) | `FULLY SERVICED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0 in 0.25s, 2° rotate correction | **REUSED** unchanged. This frame's one flame highlight |
| `frame-capital-ledger` | Shot 10 | #12141A | Two ledger lines with `approve` ticks | Line 1 ticks at 0.3s, line 2 at 0.7s; both hold to the cut | **NEW.** The promise, stated as arithmetic. Ticks are `#58C97B` and **small - never a fill** |
| `frame-end-card` | Shot 11 | #12141A | Wordmark, value line, payment model, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0; microcopy fades at +0.2s | **REUSED**, with the `low weekly payments` line enabled |

## Production notes

- Dark frames throughout (#12141A). Flame #FF9B2E = the only "go" fill. **One flame highlight per frame, key beats only** - shots 3, 4, 5 and 10 deliberately carry none. Shot 10's ticks are `approve` green, small, and never a fill.
- **This ad has no daily or weekly figure anywhere.** Premium gear leads with capital preservation. If a frame seems to want a number, it wants the ledger frame instead.
- Money and terms in **JetBrains Mono**, uppercase 0.08em tracking on chips.
- Shot 1 must be allowed its full two seconds of near-nothing. The instinct to add a product shot behind it will kill the ad - the hook works because the viewer has nothing to look at except a sentence that contradicts what they expected.
- Wordmark at the bridge (shot 6) + end card (shot 11) only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone. Shot 10 has no VO - no caption, let the frame breathe.

## Safe-area check (9:16)

Clear the **top 250px** (Reels UI) and the **bottom 320px** (caption mask). Statement lines centre at y≈860 and y≈980. The `$20,000` ledger at y≈880; the runway bar spans x 140-940 at y≈1040. The capital-preservation ledger lines at y≈880 and y≈1000. CTA pill at y≈1180. URL at y≈1560 (decorative only). Burned-in captions at y≈1420.

## Hold-rate

Hard visual reset at **0:09** (the bridge, shot 6) - 45% of runtime, correct for a 20s cut. Body cuts every ~1.5s. The 1.5s stillness of shot 5 immediately before the reset is the primary hold device: after five seconds of falling numbers, a frame that stops moving is more arresting than one that moves faster. The 4-frame black beat after it sharpens the reset.

## Audit

Shots: **11** (20s budget = 9-12 ✓). Timing: 2.0 + 2.0 + 2.0 + 1.5 + 1.5 + 2.0 + 1.5 + 1.5 + 1.5 + 2.0 + 2.5 = **20.0s ✓**. Cuts land on emphasis and reveals ✓. Bridge reset at 0:09 = 45% ✓. Equipment is real catalogue gear with a real brand and category, no invented spec ✓. One flame highlight per frame ✓. Money in mono ✓. **No daily/weekly figure anywhere ✓.** Safe area ✓. Wordmark at bridge + end card only ✓. End card carries the full required microcopy ✓. **4 of 11 shots reuse frames from `fitout-quote-shock`** ✓.

## Aspect variants

- **4:5 (1080×1350):** drop the URL line; CTA pill up to y≈1000. The runway bar shortens to 13 segments (fortnights) so it still reads at width - relabel `26 WEEKS` → `SIX MONTHS` only.
- **1:1 (1080×1080):** cut shot 5 (the pause) and give 1.0s of it to shot 4 and 0.5s to the bridge. This is the one cut where losing the stillness is acceptable - at 1:1 the ad is usually in-feed with sound off, where the reset carries on its own.

## Hand-off

Build order: reuse `shared/` and the three components from `fitout-quote-shock` → `frame-statement` (get the timing of the dim-and-lift exactly right; everything else is downstream of it) → `frame-capital-hit` → `frame-pause` → `frame-capital-ledger` → re-parameterise plinth, timeline (plus the compact variant) and end card → animatic. Before render, confirm: **Rational SCC WE101 is active on the live catalogue** (substitute another active Rational combi if not - never a generic oven); the Combi Ovens band matches the live site; a combi product photo is available; the wordmark asset exists (else ⚠-flag).
