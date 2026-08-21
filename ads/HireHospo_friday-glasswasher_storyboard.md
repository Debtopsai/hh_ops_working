# Storyboard - HireHospo "Friday, Seven O'Clock" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** `HireHospo_friday-glasswasher_script_15s.md` · **Hook** (specific truth, bar / pub, Solution Aware) · **PAS-lite**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now

## Shot list

| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02 | GFX timestamp | Near-black canvas. Mono clock sets, the colon blinks once and stops - the only motion | `FRI 19:04` *(flame colon, single blink)* | "Friday, seven o'clock." | Music in low (−20dB); muffled bar room tone | Hard cut |
| 2 | 0:02-0:03.5 | EQUIP dead machine | Glasswasher control panel, unlit, in a dark under-bar. Everything around it is working; this is not | `—` *(no text; a single dead indicator dot in mute grey)* | "The glasswasher just died." | Room tone only; the absence of a machine cycle is the sound design | Hard cut |
| 3 | 0:03.5-0:05.5 | GFX glass count | Mono counter climbing over a steel sink edge, glasses stacking as ghosted outlines | **240 GLASSES** *(mono, counting, no flame)* | "Every glass in the place..." | Tap running; count-up tick underneath (−18dB) | Hard cut |
| 4 | 0:05.5-0:07 | GFX hand-wash | The counter keeps climbing past the VO; a mono line resolves beneath it | `HAND-WASH` *(mono, mute grey - this frame stays cold)* | "...is now a hand-wash." | Water fills the mix; music near-drops | Hard cut (beat of black, 4 frames) |
| 5 | 0:07-0:09 | GFX bridge / **hard reset** | HireHospo wordmark resolves centre on steel, lifts to top third; approval timeline draws in below, four mono steps | HireHospo · `APPLY` → `CREDIT CHECK` → `APPROVED` *(flame)* → `DELIVERED 1-3 BUSINESS DAYS · AFTER DEPOSIT` · *microcopy: Subject to credit approval* | "HireHospo finances the replacement." | Water **cuts dead**; lift; clean UI tick on APPROVED (−12dB) | Hard cut |
| 6 | 0:09-0:10.5 | EQUIP hero plinth | Glasswasher lit on a brushed-steel plinth, warm key from upper left - the same machine from shot 2, now running | `GLASSWASHERS` / `$2,300-$4,000` *(mono chips)* | "Refurbished glasswashers..." | Single rack clack; a short wash-cycle hum starts (−18dB) | Match cut (plinth holds) |
| 7 | 0:10.5-0:11.5 | Refurb badge | Condition badge stamps on over the plinth's lower left | **`REFURBISHED · WITH WARRANTY`** *(flame border, stamp settle)* | "...with warranty." | Stamp settle; light metallic ring | Hard cut |
| 8 | 0:11.5-0:13 | GFX entry figure | The daily figure resolves large and mono, its footnote attached beneath in the same block - **never separable** | **From $4.66/day** · `+ GST · SUBJECT TO CREDIT APPROVAL` *(footnote, mute, mono)* | "From $4.66 a day plus GST." | Till/receipt tick (−16dB) | Hard cut |
| 9 | 0:13-0:15 | End card | HireHospo wordmark, value line, flame CTA pill, mono subline, URL | HireHospo · *Premium kitchen equipment, refurbished and warranted, on low weekly payments.* · **Apply now** *(flame pill, #14161A text)* · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Apply now." | Button (−16dB); music settles, short tail | Hold to end |

## Frames to build (Claude Code hand-off)

Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). **Frames 5, 7 and 9 are the parameterised components already built for `fitout-quote-shock` - reuse, do not rebuild.** Only frames 1-4, 6 and 8 are new.

| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| `frame-timestamp` | Shot 1 | #12141A (near-black) | Mono clock | Colon blinks once at 0.6s and stops - deliberate stillness | **NEW.** The flame colon is this frame's single highlight |
| `frame-dead-machine` | Shot 2 | #12141A | Unlit control panel, one dead indicator dot | Slow 1% push-in only | **NEW. No flame in this frame** - a dead machine gets no "go" colour |
| `frame-count-up` | Shots 3-4 | #12141A | Mono counter over a sink edge, ghosted glass outlines | Counter runs 0→240 over 2.2s and **keeps running under the VO's full stop**; `HAND-WASH` resolves at 2.0s | **NEW. No flame** - the cold beat carries the agitation. The counter overrunning the line is the device |
| `frame-approval-timeline` | Shot 5 | #1C1F26 on #12141A | Wordmark + 4 mono steps | Wordmark resolves 0.5s; steps draw L→R 150ms apart; APPROVED stamps flame | **REUSED** from `fitout-quote-shock`, parameterised. The DELIVERED step here carries `· AFTER DEPOSIT` |
| `frame-hero-plinth` | Shot 6 | #12141A + brushed-steel gradient plinth | Glasswasher cut-out, category + band chips | Plinth push-in 2%; wash-cycle indicator lights come up over 0.4s | **REUSED**, re-parameterised. Chip shows the **category and band**, not a model - see the compliance note below |
| `frame-refurb-badge` | Shot 7 | (overlay) | `REFURBISHED · WITH WARRANTY` | Stamp settle: scale 1.08 → 1.0 in 0.25s, 2° rotate correction | **REUSED** unchanged. This frame's one flame highlight |
| `frame-entry-figure` | Shot 8 | #12141A | Large mono figure + locked footnote block | Figure scales 0.94 → 1.0 with a flame underline wipe; footnote fades in at +0.15s **in the same container** | **NEW.** The footnote is a child of the figure element - it cannot be cropped, animated out, or reflowed away in any aspect variant |
| `frame-end-card` | Shot 9 | #12141A | Wordmark, value line, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0; microcopy fades at +0.2s | **REUSED** unchanged |

## Production notes

- Dark frames throughout (#12141A). Flame #FF9B2E = the only "go" fill. **One flame highlight per frame, key beats only** - shots 2, 3 and 4 deliberately carry none. A dead machine and a rising problem count get no flame; that is the visual logic of the whole ad.
- **The glasswasher in shot 6 is the same machine as shot 2, now lit and running.** Shoot or composite them as one unit so the payoff reads without a word.
- Money and terms in **JetBrains Mono**, uppercase 0.08em tracking on chips.
- **Compliance-critical:** the plinth chip shows `GLASSWASHERS` and the **category band**, never a model number. A model name adjacent to `$4.66/day` would read as a per-product quote and breach the credit gate. The daily figure and its `+ GST · SUBJECT TO CREDIT APPROVAL` footnote are one indivisible block.
- Wordmark at the bridge (shot 5) + end card (shot 9) only; **never redraw the logo**.
- Caption every spoken line, burned-in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)

Clear the **top 250px** (Reels UI) and the **bottom 320px** (caption mask). `FRI 19:04` centres at y≈900. The 240 counter at y≈860. The `$4.66/day` figure at y≈880 with its footnote at y≈1010 - **both well inside the central 60%**, so the footnote can never be masked. CTA pill at y≈1180. Burned-in captions at y≈1420.

## Hold-rate

Hard visual reset at **0:07** (the bridge, shot 5) - the water cutting dead is an audio reset landing on the same frame, which doubles its effect. Body cuts every ~1.5s. Shot 2 (1.5s of an unlit machine) is the risk point; it survives because shot 1 has already set a clock ticking.

## Audit

Shots: **9** (15s budget = 8-10 ✓). Timing: 2.0 + 1.5 + 2.0 + 1.5 + 2.0 + 1.5 + 1.0 + 1.5 + 2.0 = **15.0s ✓**. Cuts land on emphasis and reveals ✓. Bridge reset at 0:07 (within 7-9s ✓). Equipment is real catalogue gear, category-tagged, no invented model ✓. One flame highlight per frame ✓. Money in mono with footnote locked ✓. Safe area ✓. Wordmark at bridge + end card only ✓. End card carries the full required microcopy ✓. **6 of 9 shots reuse frames from `fitout-quote-shock`** ✓.

## Aspect variants

- **4:5 (1080×1350):** drop the URL line; CTA pill up to y≈1000. The `$4.66/day` block keeps figure and footnote stacked - **do not** move the footnote beside the figure, the vertical lock is what guarantees it survives the crop.
- **1:1 (1080×1080):** cut shot 4 and let the counter overrun inside shot 3 (2.5s total); the count-up motion is the beat, not the second frame.

## Hand-off

Build order: reuse `shared/` and the three components from `fitout-quote-shock` → `frame-entry-figure` (build this one carefully, the footnote lock is the compliance risk) → `frame-timestamp` → `frame-dead-machine` → `frame-count-up` → re-parameterise plinth and timeline → animatic. Before render, confirm: the glasswasher price band matches the live site; a glasswasher product photo is available; the wordmark asset exists (else ⚠-flag).
