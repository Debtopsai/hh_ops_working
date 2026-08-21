# Storyboard - HireHospo "One Of Them Pays For The Kitchen" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_coffee-and-muffin_script_15s.md` · **Hook** (curiosity gap, new cafe owner, Solution Aware) · **PPI+P**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07.5 (50%) · **CTA:** Apply now
**⚠ Pending Credit sign-off** on the `$14.99/day` figure. **No `$50,000` claim in this ad**, so no ceiling-and-floor risk - this is the safer figure-led cut.

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:015 | PRODUCT flat | A flat white and a muffin on a dark counter. Shot flat, plain, unstyled - deliberately like a menu photo, not food porn. **No text at all** | *(none - deliberate)* | "You sell this..." | Music in low (−20dB); cafe room tone, distant | Hold (no cut) |
| 2 | 0:01.5-0:04 | GFX counter | A mono counter ticks up beside the image: 1, 2, 3... to 15. The image holds still throughout | `×15 BEFORE NOON` *(mono, resolving at 15)* | "...about fifteen times before noon." | Soft counter tick per increment, 130ms apart | Hard cut |
| 3 | 0:04-0:05.5 | GFX fifteen tiles | The counted row resolves as fifteen small tiles in a 5×3 grid, all identical, all `ink2` | *(none)* | *(beat of silence)* | **Near-silence.** Ticks stop dead | Hard cut |
| 4 | 0:05.5-0:07.5 | GFX one lights | **One tile lights flame.** The other fourteen hold in `mute`. Nothing else moves | **ONE OF THEM** *(beneath the grid)* | "One of them pays for the kitchen." | A single low sub hit on the flame (−18dB) | Hard cut (beat of black, 4 frames) |
| 5 | 0:07.5-0:09 | GFX bridge / **hard reset** | HireHospo wordmark resolves centre on steel, lifts to top third; approval timeline draws in below | HireHospo · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *microcopy: Subject to credit approval* | "HireHospo finances it." | Lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 6 | 0:09-0:10.5 | GFX category tiles | Three category tiles light in sequence - the cafe starter package | `COMMERCIAL DISHWASHERS` · `CONVECTION OVENS` · `GLASSWASHERS` | "Refurbished equipment..." | Three tile ticks, warm | Hard cut |
| 7 | 0:10.5-0:11.5 | Refurb badge | Condition badge stamps on over the tiles' lower left | **`REFURBISHED · WITH WARRANTY`** *(flame border, stamp settle)* | "...with warranty." | Stamp settle; light metallic ring | Hard cut |
| 8 | 0:11.5-0:13 | GFX entry figure + disclosure | The daily figure resolves large and mono, disclosure block locked beneath it in the same container | **From $14.99/day** · `PACKAGE RATE · YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` / `+ GST · SUBJECT TO CREDIT APPROVAL` | "From $14.99 a day plus GST." | Till/receipt tick (−16dB) | Hard cut |
| 9 | 0:13-0:15 | End card | HireHospo wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, refurbished and warranted, on low weekly payments.* · **Apply now** *(flame pill, #14161A text)* · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Apply now." | Button (−16dB); music settles, short tail | Hold to end |

## Frames to build (Claude Code hand-off)

**Frames 5, 7 and 9 are the parameterised components from `fitout-quote-shock` - reuse.** Frame 8 reuses `frame-entry-figure-disclosed` from `50k-from-1499` with different disclosure text. Frames 1-4 and 6 are new.

| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| `frame-product-flat` | Shots 1-2 | #12141A | Coffee + muffin image, mono counter | Image holds **completely still**; counter increments 1→15, 130ms apart | **NEW.** The stillness is the design. This is the only food image in the whole ad library - shoot it flat and plain, like a menu photo, never styled |
| `frame-tile-grid-15` | Shots 3-4 | #12141A | 5×3 grid of fifteen identical tiles | All fade up together at 0.3s; at 1.5s **one tile lights flame** and the other fourteen drop `ink2` → `mute`. Nothing else moves | **NEW - and this is the ad.** The entire concept is one tile changing colour. Do not animate the other fourteen, do not add a counter, do not label the tiles |
| `frame-approval-timeline` | Shot 5 | #1C1F26 on #12141A | Wordmark + 4 mono steps | Wordmark resolves 0.5s; steps draw L→R 150ms apart; APPROVED stamps flame | **REUSED** unchanged |
| `frame-category-tiles-3` | Shot 6 | #12141A | Three category tiles, real names | Tiles light 150ms apart, warm | **NEW variant** of the grid component, three tiles |
| `frame-refurb-badge` | Shot 7 | (overlay) | `REFURBISHED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0 in 0.25s | **REUSED** unchanged. This frame's one flame highlight |
| `frame-entry-figure-disclosed` | Shot 8 | #12141A | Large mono figure + two-line disclosure block | Figure scales 0.94 → 1.0 with a flame underline wipe; disclosure fades in at +0.15s **inside the same container** | **REUSED** from `50k-from-1499`, re-parameterised. Disclosure leads with `PACKAGE RATE` |
| `frame-end-card` | Shot 9 | #12141A | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0; microcopy fades at +0.2s | **REUSED** unchanged |

## Production notes

- **Shot 1 gets 1.5 seconds of a photograph and no text.** This will feel wrong while editing. It is correct - the viewer has to recognise the object as theirs before any words arrive, and text in that window turns it into an ad before the interrupt can work.
- **The one lit tile in shot 4 is the entire creative idea.** Resist every instinct to add motion, labels, a counter, or a second highlight. Fourteen tiles doing nothing is what makes one tile mean something.
- **The `$14.99/day` figure must be a single parameterised token** (`--entry-rate`) shared with `50k-from-1499`, not typed into this ad separately. Credit may change it once for both ads.
- **The coffee-and-muffin price is never on screen.** The equivalence is implied by the lit tile, never stated as a number.
- **No product model named anywhere.** Categories only.
- Dark frames throughout. Flame #FF9B2E = the only "go" fill. **One flame highlight per frame** - shots 1, 2 and 3 carry none, which is what gives shot 4 its force.
- Money and terms in **JetBrains Mono**. Wordmark at bridge + end card only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone. Shot 3 has no VO - no caption.

## Safe-area check (9:16)

Clear the **top 250px** and the **bottom 320px**. The product image occupies y 620-1120 (central, unobstructed). The counter sits at y≈1220. The 5×3 tile grid spans y 760-1180 with `ONE OF THEM` at y≈1280. The `$14.99/day` figure at y≈840 with its disclosure at y≈980-1090. CTA pill at y≈1180. Captions at y≈1420.

## Hold-rate

Hard visual reset at **0:07.5** (the bridge, shot 5) - exactly 50% of runtime. Body cuts every ~1.5s, except shots 1-2 which deliberately run 4s on a still image with only a counter moving. That stillness is the hold device: in a feed of motion, a photograph that does not move reads as a pause and buys the four seconds the interrupt needs.

## Audit

Shots: **9** (15s budget = 8-10 ✓). Timing: 1.5 + 2.5 + 1.5 + 2.0 + 1.5 + 1.5 + 1.0 + 1.5 + 2.0 = **15.0s ✓**. Bridge reset at 0:07.5 = 50% ✓. Categories real, no invented model ✓. One flame highlight per frame ✓. Money in mono with disclosure locked ✓. Safe area ✓. End card microcopy complete ✓. **⚠ Pending Credit sign-off on the entry rate - but the rate and the package size do reconcile in this cut.**

## Aspect variants

- **4:5 (1080×1350):** drop the URL line; CTA pill up to y≈1000. The tile grid becomes 5×3 at reduced tile size - **keep fifteen tiles**, the number is the hook.
- **1:1 (1080×1080):** the tile grid becomes 5×3 compressed; shot 1 shortens to 1.0s. Do not cut shots 3 or 4 - they are the concept.

## Hand-off

Build order: reuse `shared/` and the components from `fitout-quote-shock` and `50k-from-1499` → `frame-tile-grid-15` **first** (it is the creative core; get the single-tile flame timing right and everything else follows) → `frame-product-flat` → `frame-category-tiles-3` → re-parameterise timeline, badge, entry figure and end card → animatic. Before render, confirm: **Credit sign-off on the entry rate** (recommend this cut is put forward first - the figure and the package size reconcile here), the three category names match the live catalogue, a flat coffee-and-muffin image exists or is shot, and the wordmark asset exists (else ⚠-flag).
