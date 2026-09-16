# Storyboard - HireHospo "$50k Of Equipment For A Coffee & Muffin A Day" - 15s - Motion Graphics + One Product Image (no people)

**Script:** `HireHospo_coffee-and-muffin_script_15s.md` · **Supplied headline, offer-led, Most Aware**
**Total shots:** 8 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**⚠ Pending Credit sign-off** on the `$14.99/day` figure. Build the frames; the rate is a single token.

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:03 | TXT headline L1 | Full-bleed on steel. Nothing else in frame | **$50,000 OF EQUIPMENT** *(mono, flame on the figure)* | "Fifty thousand dollars' worth of equipment." | Music in low (−18dB); single ledger tick | Hold |
| 2 | 0:03-0:05 | PRODUCT flat | A flat white and a muffin fade up beneath the headline, on a dark counter. Shot flat and plain like a menu photo - **held completely still**, no push-in, no drift | *(headline holds above; no new text yet)* | "For the price of..." | Cafe room tone, distant; a soft cup-set on the image | Hold |
| 3 | 0:05-0:07.5 | TXT headline L2 | Line 2 resolves across the frame with the image still beneath it. The two halves of the headline now read as one sentence around the picture | **FOR THE PRICE OF A COFFEE & MUFFIN A DAY** *(display type, flame on `COFFEE & MUFFIN`)* | "...a coffee and a muffin a day." | Room tone holds; music lifts one step | Hard cut (beat of black, 4 frames) |
| 4 | 0:07.5-0:09.5 | GFX HireHospo | **Hard visual reset.** Wordmark resolves centre on steel, lifts to top third; approval timeline draws in below | HireHospo · `FUNDING UP TO $50,000` · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *Subject to credit approval* | "All on our stock list." | Room tone cuts; lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 5 | 0:09.5-0:10.5 | GFX category tiles | Four category tiles light one at a time - what "$50,000 of equipment" actually is | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `CONVECTION OVENS` · `GLASSWASHERS` | *(no VO - let the tiles land)* | Four tile ticks, 150ms apart, warm | Hard cut |
| 6 | 0:10.5-0:11.5 | Serviced badge | Condition badge stamps on over the tiles' lower left | **`FULLY SERVICED · WITH WARRANTY`** *(flame border, stamp settle)* | "Fully serviced. With warranty." | Rack clack (single); stamp settle | Hard cut |
| 7 | 0:11.5-0:12.5 | GFX figure + disclosure | The daily figure resolves with the three-line disclosure block locked beneath it in the same container | **From $14.99/day** · `FUNDING UP TO $50,000 · PACKAGES FROM $14.99/DAY` / `YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` / `SUBJECT TO CREDIT APPROVAL` | "From $14.99 a day" | Till/receipt tick (−16dB) | Hard cut |
| 8 | 0:12.5-0:15 | End card | Wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, fully serviced and warranted, on low weekly payments.* · **Get our latest stock list today** · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Button (−16dB); settle, short tail | Hold to end |

## Frames to build

**Frames 4, 6, 7 and 8 are parameterised components already built - reuse.** Only the headline plate and the product frame are new.

| Frame | Used in | Core content | Key motion | Notes |
|---|---|---|---|---|
| `frame-headline-coffee` | Shots 1-3 | Two-line headline wrapped around a still product image | L1 resolves 0.5s and holds; image fades up at 3.0s over 0.6s and then **does not move at all**; L2 resolves at 5.0s over 0.6s with the flame landing on `COFFEE & MUFFIN` | **NEW - this is the ad.** The stillness of the image under a moving headline is the whole effect. No parallax, no Ken Burns, no drift |
| `frame-approval-timeline` | Shot 4 | Wordmark + ceiling line + 4 mono steps | Wordmark resolves 0.5s; steps draw L→R; APPROVED stamps flame | **REUSED** with the funding-ceiling line enabled |
| `frame-category-grid` | Shot 5 | Four category tiles, real names | Tiles light 150ms apart, warm | **REUSED**, re-parameterised to cafe categories |
| `frame-serviced-badge` | Shot 6 | `FULLY SERVICED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0, 0.25s | **REUSED** unchanged |
| `frame-entry-figure-disclosed` | Shot 7 | Figure + three-line disclosure block | Figure scales 0.94 → 1.0 with a flame underline wipe; disclosure fades in at +0.15s **inside the same container** | **REUSED** from `50k-from-1499` |
| `frame-end-card` | Shot 8 | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0 | **REUSED** unchanged |

## Production notes

- **The headline is the ad.** Line 1 and line 2 wrap around the product image so the whole thing reads as a single sentence with a picture in the middle. That composition is the creative - do not restructure it.
- **The product image must hold completely still** for its full 4 seconds. Every instinct will be to add a slow push-in. Don't - in a feed of motion, a photograph that does not move is what buys the attention the headline needs.
- **Never put a price on the coffee and muffin.** No label, no chip, no tooltip. The comparison is the headline's; the number is the viewer's own.
- **The `$14.99` figure is a single parameterised token** (`--entry-rate`), shared with `50k-from-1499`.
- **No product model named anywhere.** Categories only.
- Flame #FF9B2E is the only "go" fill; **one flame highlight per frame** - shot 2 (the image alone) carries none.
- Money and terms in **JetBrains Mono**; the headline's line 2 is display type, not mono - it is a sentence, not a figure.
- Wordmark at shot 4 + end card only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone. Shot 5 has no VO - no caption.

## Safe-area check (9:16)

Clear the **top 250px** and the **bottom 320px**. Headline L1 at y≈620. Product image y 760-1120 (central, unobstructed). Headline L2 y≈1180-1300. The `$14.99` figure at y≈840 with its disclosure at y≈980-1130. CTA pill y≈1180. Captions y≈1420.

## Hold-rate

Hard reset at **0:07.5** (the wordmark, shot 4), reinforced by the room tone cutting on the same frame. The first seven seconds deliberately run slow on two text beats and a still image - that is the offer-led bet: a Most Aware viewer will hold for a headline that is already telling them what they want to know.

## Audit

Shots: **8** (15s budget = 8-10 ✓). Timing: 3.0 + 2.0 + 2.5 + 2.0 + 1.0 + 1.0 + 1.0 + 2.5 = **15.0s ✓**. Headline verbatim and first ✓. Disclosure locked to the figure ✓. Categories real, no invented model ✓. One flame highlight per frame ✓. No price on the product image ✓. Safe area ✓. End card microcopy complete ✓.

## Aspect variants

- **4:5 (1080×1350):** headline at 88%; image crops to 4:3 within the frame. Disclosure keeps all three lines.
- **1:1 (1080×1080):** headline L1 and L2 sit above and below a smaller image; shot 5 drops to 1.0s. Do not cut shots 1-3 - they are the ad.

## Hand-off

Build order: reuse `shared/` → `frame-headline-coffee` (get the still-image-under-moving-headline composition right; everything else is downstream) → re-parameterise timeline, grid, badge, figure and end card → animatic. Confirm before render: Credit sign-off on the rate, a flat coffee-and-muffin photograph, the four category names against the live catalogue, wordmark asset (else ⚠-flag).
