# Storyboard - HireHospo "The Fit-Out Quote" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_fitout-quote-shock_script_15s.md` · **Hook** (high-stakes warning, new cafe owner, Problem Aware) · **PAS**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Get our latest stock list today

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02 | GFX quote-shock | Black-steel canvas, mono figure counts 0 → 16,800, hairline rule snaps beneath on lock | **$16,800** *(flame highlight under the last three digits)* | "The fit-out quote came back." | Music in low (−18dB); count-up tick | Hard cut |
| 2 | 0:02-0:04 | GFX quote detail | The figure shrinks to the top third; three mono line items type in beneath it | `DISHWASHER  $2,000-$20,000` / `CONVECTION OVEN  $2,800-$8,300` / `GLASSWASHER  $2,300-$4,000` | "Sixteen thousand, eight hundred." | Line-item tick ×3 | Hard cut |
| 3 | 0:04-0:05.5 | GFX category grid | Three steel tiles, equal weight, none lit - deliberately flat | `THREE MACHINES` | "Three machines." | Low service ambience enters | Hard cut |
| 4 | 0:05.5-0:07 | GFX one-cheque | The three tiles slide together and collapse into one bar; $16,800 desaturates to #838896 | **ONE CHEQUE** *(mono, no flame - this frame stays cold)* | "One cheque. Before you've opened." | Ambience + music duck to near-silence on "opened" | Hard cut (beat of black, 4 frames) |
| 5 | 0:07-0:09 | GFX bridge / **hard reset** | HireHospo wordmark resolves centre on steel, then lifts to the top third; approval timeline draws in below, four mono steps | HireHospo · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *microcopy: Subject to credit approval* | "All on our stock list." | Lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 6 | 0:09-0:10.5 | EQUIP hero plinth | Starline M2 undercounter dishwasher cut out on a brushed-steel plinth, warm key from upper left | `STARLINE M2` / `COMMERCIAL DISHWASHERS` *(mono chips)* | "Refurbished Starline..." | Single rack clack (−16dB) | Match cut (plinth holds) |
| 7 | 0:10.5-0:12 | EQUIP hero plinth + refurb badge | Plinth swaps to Turbofan E31D4 convection oven; condition badge stamps on over the lower left | `TURBOFAN E31D4` / `CONVECTION OVENS` · **`REFURBISHED · WITH WARRANTY`** *(flame border, stamp settle)* | "...and Turbofan, with warranty." | Stamp settle; light steel ring | Hard cut |
| 8 | 0:12-0:13.5 | GFX big-number-vs-weekly split | Vertical split. Top: $16,800 in mono, greying and dropping 4px. Bottom: "low weekly payments **+ GST**" lifting in flame | `$16,800` *(grey)* ↓ / **low weekly payments + GST** *(flame)* | "Low weekly payments, plus GST." | Till/receipt tick on the flip (−16dB) | Hard cut |
| 9 | 0:13.5-0:15 | End card | HireHospo wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, refurbished and warranted, on low weekly payments.* · **Get our latest stock list today** *(flame pill, #14161A text)* · `REFURBISHED · WITH WARRANTY · + GST · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Button (−16dB); music settles, short tail | Hold to end |

## Frames to build (Claude Code hand-off)

Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuse the standard frames - **frames 1, 5, 7, 8 and 9 are shared with `friday-glasswasher` and `rational-without-20k`; build them parametrically once.**

| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| `frame-quote-shock` | Shots 1-2 | #12141A | Mono price count-up + flame underline + three line items | Number 0→16,800 in 0.7s ease-out; flame underline snaps on lock; line items type in at 120ms stagger | Thumbnail frame. Price band values ⚠-verified; $16,800 is the outright-purchase cost, never a HireHospo figure |
| `frame-category-grid` | Shots 3-4 | #12141A | 3 steel tiles → collapse to one bar | Tiles slide to centre 0.4s; figure desaturates over 0.3s | **No flame in this frame** - the cold beat carries the agitation |
| `frame-approval-timeline` | Shot 5 | #1C1F26 on #12141A | Wordmark + 4 mono steps | Wordmark resolves 0.5s; steps draw L→R 150ms apart; APPROVED stamps flame | The bridge reset. "Subject to credit approval" microcopy lives here **and** on the end card |
| `frame-hero-plinth` | Shots 6-7 | #12141A + brushed-steel gradient plinth | Real catalogue product cut-out, brand + category chips | Plinth push-in 2%; product cross-dissolve on the swap | Equipment = **real active product**. Link `hirehospo.com/products/<handle>` in the hand-off |
| `frame-refurb-badge` | Shot 7 | (overlay) | `REFURBISHED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0 in 0.25s, 2° rotate correction | The objection-killer beat. This is the frame's one flame highlight |
| `frame-split` | Shot 8 | #12141A | Grey price above / flame payment model below | Top block drops 4px + desaturates; bottom lifts 8px + flame fill wipes | **Never a fabricated weekly figure** - the *model*, not a number |
| `frame-end-card` | Shot 9 | #12141A | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0; microcopy fades at +0.2s | The one place all required microcopy is guaranteed present |

## Production notes

- Dark frames throughout (#12141A). Flame #FF9B2E = the only "go" fill. **One flame highlight per frame, key beats only** - shots 3 and 4 deliberately carry none.
- Money and terms in **JetBrains Mono**, uppercase 0.08em tracking on chips.
- Equipment shots use real catalogue products (real brand + category chip; link the product page in the hand-off). Never invent models, capacities, or specs.
- Wordmark at the bridge (shot 5) + end card (shot 9) only; **never redraw the logo** - use the wordmark asset from hirehospo.com, or set "HireHospo" in the display face and ⚠-flag it.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone. 85% of Reels play muted - the ad must read silent.

## Safe-area check (9:16)

Clear the **top 250px** (Reels UI) and the **bottom 320px** (caption mask). Hero elements sit in the central 60% (y 480-1400). The $16,800 figure centres at y≈820; the CTA pill at y≈1180; the URL at y≈1560 (inside the mask zone, decorative only - never load-bearing). Burned-in captions sit at y≈1420, above the mask.

## Hold-rate

Hard visual reset at **0:07** (the bridge, shot 5) - full palette, layout and motion-direction change. Body cuts every ~1.5-2s. The 4-frame black beat before the reset is the hold-rate device: it breaks the scroll rhythm at the exact moment attention usually goes.

## Audit

Shots: **9** (15s budget = 8-10 ✓). Timing: 2.0 + 2.0 + 1.5 + 1.5 + 2.0 + 1.5 + 1.5 + 1.5 + 1.5 = **15.0s ✓**. Cuts land on emphasis and reveals ✓. Bridge reset at 0:07 (within 7-9s ✓). Equipment is real catalogue gear with plausible tags ✓. One flame highlight per frame ✓. Money in mono ✓. Safe area ✓. Wordmark at bridge + end card only ✓. End card carries the full required microcopy ✓.

## Aspect variants

- **4:5 (1080×1350):** drop the URL line; move the CTA pill up to y≈1000; the split frame (shot 8) becomes a left/right split rather than top/bottom.
- **1:1 (1080×1080):** cut shot 3 (the flat category grid) and give the 1.5s to the bridge; category line items go from three stacked to a single row.

## Hand-off

Build order: `shared/tokens.css` → `frame-end-card` → `frame-approval-timeline` → `frame-quote-shock` → remaining frames → animatic. Before render, confirm: Starline M2 and Turbofan E31D4 are **active** on the live catalogue; the three price bands match the live site; a wordmark asset is available (else ⚠-flag).
