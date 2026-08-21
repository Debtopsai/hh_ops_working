# Storyboard - HireHospo "$50k Of Equipment From $14.99/Day" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_50k-from-1499_script_15s.md` · **Supplied headline, offer-led, Most Aware**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**⚠ Pending Credit sign-off** on the `$14.99/day` figure. Build the frames; the rate is a single token.

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02 | TXT headline L1 | Full-bleed on steel. Nothing else in frame - no equipment, no device | **$50,000 OF EQUIPMENT** *(mono, flame on the figure)* | "Fifty thousand dollars' worth of equipment." | Music in low (−18dB); single ledger tick | Hold |
| 2 | 0:02-0:03.5 | TXT headline L2 | Line 2 lands beneath line 1; both hold at full size | **FROM $14.99/DAY + GST** *(mono, flame)* | "From fourteen ninety-nine a day..." | Till/receipt tick on the figure (−16dB) | Hold |
| 3 | 0:03.5-0:05 | GFX disclosure resolves | The three-line disclosure block fades in beneath the headline and **stays on screen until 0:13** | `FUNDING UP TO $50,000 · PACKAGES FROM $14.99/DAY` / `YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` / `+ GST · SUBJECT TO CREDIT APPROVAL` | "...plus GST." | Soft settle | Hard cut |
| 4 | 0:05-0:06.5 | GFX category tiles | The headline shrinks to the top third **and stays**; two category tiles light beneath it | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` | "Ovens, dishwashers..." | Two tile ticks, 150ms apart | Match cut |
| 5 | 0:06.5-0:07.5 | GFX category tiles | Two more tiles light, completing the grid | `RANGES` · `FOOD PREP` | "...ranges, prep." | Two tile ticks | Hard cut |
| 6 | 0:07.5-0:09.5 | GFX HireHospo | Wordmark resolves centre on steel, lifts to top third; approval timeline draws in below | HireHospo · `FUNDING UP TO $50,000` · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS` · *Subject to credit approval* | "HireHospo funds it." | Lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 7 | 0:09.5-0:11 | EQUIP hero plinth + badge | Real catalogue equipment on a brushed-steel plinth; condition badge stamps on over the lower left | **`REFURBISHED · WITH WARRANTY`** *(flame border, stamp settle)* | "Refurbished, with warranty." | Rack clack (single); stamp settle | Hard cut |
| 8 | 0:11-0:13 | GFX approval line | Four mono steps collapse to a single lit line | `APPROVED IN 24 TO 48 HOURS` | "Approved in 24 to 48 hours." | Soft approval tick | Hard cut |
| 9 | 0:13-0:15 | End card | Wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, refurbished and warranted, on low weekly payments.* · **Apply now** · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Apply now." | Button (−16dB); settle, short tail | Hold to end |

## Frames to build

**Frames 6, 7, 8 and 9 are parameterised components from `fitout-quote-shock` - reuse.** Only the headline plate and the four-tile grid are new.

| Frame | Used in | Core content | Key motion | Notes |
|---|---|---|---|---|
| `frame-headline-plate` | Shots 1-3 | Two-line headline + persistent disclosure block | L1 resolves 0.5s; L2 lands at 2.0s; disclosure fades in at 3.5s and **persists to 0:13**; whole block scales to 0.42 and moves to the top third at 5.0s | **NEW.** The headline never leaves the screen until the end card. The disclosure is a DOM child of the headline block |
| `frame-category-grid` | Shots 4-5 | Four category tiles, real names | Tiles light 150ms apart in two pairs | **REUSED** from the earlier build |
| `frame-approval-timeline` | Shot 6 | Wordmark + ceiling line + 4 mono steps | Wordmark resolves 0.5s; steps draw L→R; APPROVED stamps flame | **REUSED** with the funding-ceiling line enabled |
| `frame-hero-plinth` + `frame-refurb-badge` | Shot 7 | Equipment cut-out + condition badge | Plinth push-in 2%; badge stamp settle (scale 1.08 → 1.0, 0.25s) | **REUSED** |
| `frame-approval-compact` | Shot 8 | Single lit approval line | Collapses from the timeline, hours resolve at 0.3s | **REUSED** from `rational-without-20k` |
| `frame-end-card` | Shot 9 | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0 | **REUSED** unchanged |

## Production notes

- **The headline is the ad and it stays on screen.** It sets full-bleed for five seconds, then shrinks to the top third and holds through the body. Do not cut away from it, do not animate it out, do not replace it with a product shot.
- **The disclosure block is locked to the headline** - same container, no independent animation, no reflow that can separate them at any aspect ratio. Minimum 26px at 1080 width.
- **The `$14.99` figure is a single parameterised token** (`--entry-rate`) read from `shared/tokens.css` by the headline plate, the disclosure and the end card. Credit changing it must be a one-line edit.
- **No product model named anywhere.** Categories only.
- Flame #FF9B2E is the only "go" fill; **one flame highlight per frame** - in shots 1-3 that is the figure itself.
- Money and terms in **JetBrains Mono**. Wordmark at shot 6 + end card only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)

Clear the **top 250px** and the **bottom 320px**. Headline L1 at y≈780, L2 at y≈900, disclosure block y≈1000-1150 - all central. After the 5.0s shrink the headline sits at y≈340-420 and the disclosure at y≈440-520, still clear of the Reels UI. Category tiles y 700-1150. CTA pill y≈1180. Captions y≈1420.

## Hold-rate

Reset at **0:07.5** (the wordmark, shot 6). Body cuts every ~1.5s. In an offer-led cut the hold device is the headline itself - a Most Aware viewer who wants the offer has no reason to scroll while the offer is still resolving on screen.

## Audit

Shots: **9** (15s budget = 8-10 ✓). Timing: 2.0 + 1.5 + 1.5 + 1.5 + 1.0 + 2.0 + 1.5 + 2.0 + 2.0 = **15.0s ✓**. Headline verbatim and first ✓. Disclosure on screen 0:02-0:13 ✓. Categories real, no invented model ✓. One flame highlight per frame ✓. Money in mono ✓. Safe area ✓. End card microcopy complete ✓.

## Aspect variants

- **4:5 (1080×1350):** headline sets at 88% scale; disclosure keeps all three lines. If it will not fit legibly, cut the ad, not the disclosure.
- **1:1 (1080×1080):** merge shots 4-5 into one 2.5s tile beat; headline shrinks at 4.5s instead of 5.0s.

## Hand-off

Build order: reuse `shared/` → `frame-headline-plate` (the ad lives here) → re-parameterise grid, timeline, plinth, badge, compact approval and end card → animatic. Confirm before render: Credit sign-off on the rate, the four category names against the live catalogue, wordmark asset (else ⚠-flag).
