# Storyboard - HireHospo "Up To Fifty Thousand" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_50k-from-1499_script_15s.md` · **Hook** (specific truth, restaurant / scaling operator, Solution Aware) · **PAS**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now
**⚠ BLOCKED PENDING CREDIT SIGN-OFF** on the `$14.99/day` figure - see the script's claim check. Build the frames; do not publish.

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02 | GFX ceiling number | Mono figure counts 0 → 50,000 on steel, flame underline snapping on lock | **$50,000** *(flame underline)* | "Fifty thousand dollars of kitchen equipment." | Music in low (−18dB); count-up tick | Hard cut |
| 2 | 0:02-0:04 | GFX category grid lights | The figure lifts to the top third; four category tiles light behind it in sequence | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` · `EVERYTHING ON THE LIST` | *(line continues)* | Four soft tile ticks, 150ms apart | Hard cut |
| 3 | 0:04-0:055 | GFX the figure leaves | The same `$50,000` desaturates ink → mute and begins sliding left | `$50,000` *(mute, moving)* | "Or fifty thousand..." | Dip; single ledger tick | Match cut (motion continues) |
| 4 | 0:05.5-0:07 | GFX empty kitchen | The figure exits frame left; the category tiles behind it dim to `line`. The frame is left visibly emptier than shot 2 | `OUT OF THE BUSINESS` *(mono, mute - this frame stays cold)* | "...out of the business." | Ambience and music duck to near-silence | Hard cut (beat of black, 4 frames) |
| 5 | 0:07-0:09 | GFX bridge / **hard reset** | HireHospo wordmark resolves centre on steel, lifts to top third; approval timeline draws in below | HireHospo · `FUNDING UP TO $50,000` · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *microcopy: Subject to credit approval* | "HireHospo funds it instead." | Lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 6 | 0:09-0:10.5 | GFX category grid relights | The same four tiles from shot 2 relight one at a time - the visual rhyme that pays off shot 4 | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` | "Refurbished..." | Four tile ticks, warmer than shot 2 | Hard cut |
| 7 | 0:10.5-0:11.5 | Refurb badge | Condition badge stamps on over the grid's lower left | **`REFURBISHED · WITH WARRANTY`** *(flame border, stamp settle)* | "...with warranty." | Stamp settle; light metallic ring | Hard cut |
| 8 | 0:11.5-0:13 | GFX entry figure + **range disclosure** | The daily figure resolves large and mono, with the three-line disclosure block locked beneath it in the same container | **Packages from $14.99/day** · `FUNDING UP TO $50,000 · PACKAGES FROM $14.99/DAY` / `YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` / `+ GST · SUBJECT TO CREDIT APPROVAL` | "Packages from $14.99 a day plus GST." | Till/receipt tick (−16dB) | Hard cut |
| 9 | 0:13-0:15 | End card | HireHospo wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, refurbished and warranted, on low weekly payments.* · **Apply now** *(flame pill, #14161A text)* · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Apply now." | Button (−16dB); music settles, short tail | Hold to end |

## Frames to build (Claude Code hand-off)

**Frames 5, 7 and 9 are the parameterised components from `fitout-quote-shock` - reuse.** Frame 1 is the quote-shock frame re-parameterised. Frames 2/6 and 8 are new.

| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| `frame-quote-shock` | Shot 1 | #12141A | Mono figure count-up + flame underline | Number 0→50,000 in 0.7s ease-out; underline snaps on lock | **REUSED**, re-parameterised. Here the figure is the *want*, so the flame is permitted - unlike `fitout-quote-shock` where it is the enemy |
| `frame-category-grid` | Shots 2, 6 | #12141A | Four category tiles, real names | Tiles light 150ms apart (shot 2, cool); relight warmer in shot 6 | **NEW variant** of the `fitout-quote-shock` grid, extended to four tiles and given a relight state |
| `frame-figure-exit` | Shots 3-4 | #12141A | The same figure, desaturating and translating out of frame | Desaturate over 0.3s; translate −1400px over 1.2s ease-in; tiles dim to `line` | **NEW. No flame in this frame.** The emptiness at the end of the move is the agitation - do not fill it |
| `frame-approval-timeline` | Shot 5 | #1C1F26 on #12141A | Wordmark + `FUNDING UP TO $50,000` + 4 mono steps | Wordmark resolves 0.5s; steps draw L→R 150ms apart; APPROVED stamps flame | **REUSED**, with the funding-ceiling line enabled |
| `frame-refurb-badge` | Shot 7 | (overlay) | `REFURBISHED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0 in 0.25s | **REUSED** unchanged. This frame's one flame highlight |
| `frame-entry-figure-disclosed` | Shot 8 | #12141A | Large mono figure + **three-line range disclosure block** | Figure scales 0.94 → 1.0 with a flame underline wipe; disclosure fades in at +0.15s **inside the same container** | **NEW - and the compliance-critical frame in this ad.** The disclosure is a DOM child of the figure block. See the note below |
| `frame-end-card` | Shot 9 | #12141A | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0; microcopy fades at +0.2s | **REUSED** unchanged |

## Production notes

- **The `$14.99/day` figure must be a single parameterised token** (`--entry-rate`) read from one place in `shared/tokens.css`, not typed into frames 8 and 9 separately. Credit is expected to change this number; changing it must be a one-line edit, not a re-render of the storyboard.
- **The range disclosure block is not optional and not decorative.** It is the thing that makes the ceiling-and-floor juxtaposition lawful. It must be legible at thumbnail scale (minimum 26px at 1080 width), inside the safe area, and locked to the figure in the same container so no crop, reflow or aspect variant can separate them.
- Dark frames throughout (#12141A). Flame #FF9B2E = the only "go" fill. **One flame highlight per frame** - shots 3 and 4 carry none.
- **No single product model is named anywhere in this ad.** Categories only. A model name adjacent to a daily rate reads as a per-product quote and breaches the credit gate.
- Money and terms in **JetBrains Mono**. Wordmark at bridge + end card only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)

Clear the **top 250px** and the **bottom 320px**. `$50,000` centres at y≈820. The category grid spans y 980-1320. The `$14.99/day` figure sits at y≈820 with its three-line disclosure block at y≈960-1120 - **deliberately high in the central 60%** so the disclosure can never be pushed toward the caption mask at any aspect ratio. CTA pill at y≈1180. Captions at y≈1420.

## Hold-rate

Hard visual reset at **0:07** (the bridge, shot 5). Body cuts every ~1.5s. The hold device here is shot 4's deliberate emptiness - the frame is visibly less full than it was two seconds earlier, which registers before the viewer can name why.

## Audit

Shots: **9** (15s budget = 8-10 ✓). Timing: 2.0 + 2.0 + 1.5 + 1.5 + 2.0 + 1.5 + 1.0 + 1.5 + 2.0 = **15.0s ✓**. Bridge reset at 0:07 ✓. Categories real, no invented model ✓. One flame highlight per frame ✓. Money in mono with the disclosure locked ✓. Safe area ✓. End card microcopy complete ✓. **⚠ Publication blocked pending Credit sign-off on the entry rate.**

## Aspect variants

- **4:5 (1080×1350):** drop the URL line; CTA pill up to y≈1000. **The disclosure block keeps all three lines** - if it will not fit legibly, cut the ad, not the disclosure.
- **1:1 (1080×1080):** cut shot 3 and let the figure exit within shot 4 (2.5s); the category grid drops to a 2×2 at reduced type. Disclosure block unchanged.

## Hand-off

Build order: reuse `shared/` from `fitout-quote-shock` → `frame-entry-figure-disclosed` **first** (it carries the entire compliance risk of this ad) → `frame-figure-exit` → the four-tile grid variant → re-parameterise quote-shock, timeline, badge and end card → animatic. Before render, confirm: **Credit has signed off the entry rate**, the four category names match the live catalogue, and the wordmark asset exists (else ⚠-flag).
