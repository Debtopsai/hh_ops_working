# Storyboard - HireHospo "Sitting In A Quote" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_fifty-thousand_script_15s.md` · **Hook** (high-stakes warning, restaurant / caterer scaling, Product Aware) · **PAS**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07.5 (50%) · **CTA:** Get our latest stock list today
**✅ CLEARED TO PRODUCE** - zero unapproved claims, no daily or weekly figure anywhere. This is the control cut and the one to build first if Credit sign-off is slow.

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02 | GFX ceiling number | Mono figure resolves on steel, flame underline snapping on lock | **$50,000** *(flame underline)* | "Fifty thousand dollars of equipment." | Music in low (−18dB); single ledger tick | Hard cut |
| 2 | 0:02-0:04 | GFX quote traps it | A supplier quote document assembles around the figure - header rule, line items, a reference number - then the whole plate desaturates ink → mute | `QUOTE #` *(mono, greying)* · line items in `line` | "Sitting in a quote." | Paper-settle (dry, close); the flame underline extinguishes | Hard cut |
| 3 | 0:04-0:06 | GFX dark kitchen | The quote holds still, slightly reduced. Behind it, four category tiles sit dark and unlit | `NOT IN YOUR KITCHEN` *(mono, mute)* | "Not in your kitchen." | Dip; low service ambience | Hard cut |
| 4 | 0:06-0:07.5 | GFX the number | The quote holds. The figure inside it dims one further step - the only change in frame | *(no new text - the quote and tiles hold)* | "Because of the number." | **Near-silence.** Ambience and music drop to a low sustain | Hard cut (beat of black, 4 frames) |
| 5 | 0:07.5-0:10 | GFX bridge / **hard reset** | The quote plate clears frame upward; HireHospo wordmark resolves centre on steel, lifts to top third; approval timeline draws in below | HireHospo · `FUNDING UP TO $50,000` · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *microcopy: Subject to credit approval* | "Up to fifty thousand dollars." | Lift; paper clears (a single sweep); clean UI tick on APPROVED (−12dB) | Hard cut |
| 6 | 0:10-0:11.5 | GFX tiles light | The same four category tiles from shot 3 light one at a time - the kitchen happening | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` | "Refurbished..." | Four tile ticks, warm, 150ms apart | Hard cut |
| 7 | 0:11.5-0:12.5 | Refurb badge | Condition badge stamps on over the tiles' lower left | **`REFURBISHED · WITH WARRANTY`** *(flame border, stamp settle)* | "...with warranty." | Stamp settle; light metallic ring | Hard cut |
| 8 | 0:12.5-0:13.5 | GFX payment model | The payment model resolves in flame. **No figure - the model, not a number** | **low weekly payments + GST** | "Low weekly payments plus GST." | Till/receipt tick (−16dB) | Hard cut |
| 9 | 0:13.5-0:15 | End card | HireHospo wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, refurbished and warranted, on low weekly payments.* · **Get our latest stock list today** *(flame pill, #14161A text)* · `REFURBISHED · WITH WARRANTY · + GST · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Button (−16dB); music settles, short tail | Hold to end |

## Frames to build (Claude Code hand-off)

**Frames 5, 7, 8 and 9 are parameterised components already built** (`fitout-quote-shock` supplies the timeline, badge, split and end card; the four-tile grid comes from `50k-from-1499`). Only `frame-quote-plate` is genuinely new - **this is the cheapest of the six ads to produce.**

| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| `frame-quote-plate` | Shots 1-4 | #12141A | Mono figure → supplier quote document assembling around it → desaturating | Figure resolves 0.5s with flame underline; at 2.0s the quote plate assembles around it (header rule, three line items, `QUOTE #`) over 0.6s; whole plate desaturates ink → mute over 0.4s and the underline extinguishes; at 6.0s the figure dims one further step | **NEW - the only new frame in this ad.** The quote is a *container* that closes around the number. Build it so the figure is a child of the plate, so the trapping reads structurally, not just visually |
| `frame-category-grid` | Shots 3, 6 | #12141A | Four category tiles, real names | Dark and unlit behind the quote in shot 3; light one at a time, warm, 150ms apart in shot 6 | **REUSED** from `50k-from-1499`. Same four tiles, same positions in both shots - the relight is the payoff |
| `frame-approval-timeline` | Shot 5 | #1C1F26 on #12141A | Wordmark + `FUNDING UP TO $50,000` + 4 mono steps | Quote plate clears upward 0.4s; wordmark resolves 0.5s; steps draw L→R 150ms apart; APPROVED stamps flame | **REUSED** with the funding-ceiling line enabled |
| `frame-refurb-badge` | Shot 7 | (overlay) | `REFURBISHED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0 in 0.25s | **REUSED** unchanged. This frame's one flame highlight |
| `frame-split` | Shot 8 | #12141A | Payment model in flame, **no figure** | Flame fill wipes left→right over 0.35s | **REUSED** from `fitout-quote-shock` in its model-only state - the state that carries no number |
| `frame-end-card` | Shot 9 | #12141A | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0; microcopy fades at +0.2s | **REUSED** unchanged |

## Production notes

- **This ad contains no daily and no weekly figure and must never acquire one.** If a rate is added beside the $50,000 ceiling, the ad inherits the ceiling-and-floor juxtaposition problem it exists to avoid, and it stops functioning as the clean control for the other two cuts.
- **"Up to" must survive everywhere.** On screen it is `FUNDING UP TO $50,000`, never a bare `$50,000 FUNDED`. The `$50,000` in shots 1-4 is the supplier's quote - the thing sitting still - and only becomes a HireHospo claim at shot 5, where "up to" is attached.
- **The four category tiles in shots 3 and 6 must be identical and co-located.** Dark behind the quote, lit after the bridge. Nothing else changes between them; the relight is the entire mechanism, shown rather than said.
- Dark frames throughout. Flame #FF9B2E = the only "go" fill. **One flame highlight per frame** - shots 3 and 4 carry none, and shot 2 deliberately *extinguishes* the flame from shot 1, which is the only place in the whole library where flame is taken away rather than given.
- **No product model named anywhere.** Categories only.
- Money and terms in **JetBrains Mono**. Wordmark at bridge + end card only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)

Clear the **top 250px** and the **bottom 320px**. `$50,000` centres at y≈820; the quote plate spans y 660-1180. The four dark tiles sit behind at y 700-1140. `FUNDING UP TO $50,000` at y≈700 under the wordmark. The payment-model line at y≈880. CTA pill at y≈1180. Captions at y≈1420.

## Hold-rate

Hard visual reset at **0:07.5** (the bridge, shot 5) - exactly 50%. Body cuts every ~1.5-2s. The hold device is shot 2's extinguishing underline: the viewer sees a bright number go dull inside a document, which registers as loss before it registers as design.

## Audit

Shots: **9** (15s budget = 8-10 ✓). Timing: 2.0 + 2.0 + 2.0 + 1.5 + 2.5 + 1.5 + 1.0 + 1.0 + 1.5 = **15.0s ✓**. Bridge reset at 0:07.5 = 50% ✓. Categories real, no invented model ✓. One flame highlight per frame ✓. Payment model in mono, **no figure anywhere** ✓. Safe area ✓. End card microcopy complete ✓. **Every claim on the approved table - cleared to produce ✓.** **Only one new frame to build ✓.**

## Aspect variants

- **4:5 (1080×1350):** drop the URL line; CTA pill up to y≈1000. The quote plate narrows; keep three line items minimum so it still reads as a document.
- **1:1 (1080×1080):** merge shots 3 and 4 into a single 2.5s beat (the tiles stay dark, the figure dims once). Everything else unchanged.

## Hand-off

Build order: reuse `shared/` and all components from `fitout-quote-shock` and `50k-from-1499` → build `frame-quote-plate` (the only new frame) → re-parameterise the grid, timeline, badge, split and end card → animatic. Before render, confirm: the four category names match the live catalogue, and the wordmark asset exists (else ⚠-flag). **No claim in this ad needs sign-off** - if the other two cuts are held up, ship this one.
