# Storyboard - HireHospo "Get The Machines You Really Want" - 16s - Comparison, fast cut (no people)

**Script:** `HireHospo_machines-you-really-want_script_16s.md` · **Hero line:** *"Get the machines you really want. Without the $30k."*
**Total shots:** 10 · **Aspect:** 9:16 (1080×1920) · **Theme:** dark steel (canvas #12141A) · **Cut rate:** every 1.0-2.5s, nothing dwells
**Product:** Rational SCC101 10 Tray Electric Combi Oven · **CTA:** Get our latest stock list today

## Shot list

| # | Time | Shot | Visual | On screen | VO | SFX | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01 | EQUIP hero | SCC101 cut-out, centre, on a brushed-steel plinth. Hard light-up rather than a fade - the frame arrives already lit | `RATIONAL SCC101` *(mono chip)* | "Same oven." | Low oven-door thunk (−15dB) | Hard cut |
| 2 | 0:01-0:02.5 | GFX split | The single oven duplicates and the two copies snap apart, left and right, 180ms. **Same asset both sides, not flipped** | - | "Two ways to pay." | Snap ×2 (−16dB) | Hard cut |
| 3 | 0:02.5-0:04 | GFX side A | **$30,000** slams into the left column, mono, no count-up. One tick resolves beneath it | **$30,000** · `✓ OWN IT DAY ONE` *(tick in `approve`)* | "Thirty thousand today." | Till tick (−16dB) | Hard cut |
| 4 | 0:04-0:05 | GFX side A cons | Three crosses fire down the left column, 200ms apart, all in `mute`. **No flame anywhere on this side** | `CAPITAL GONE` · `ONE MODEL` · `YOUR REPAIR RISK` | - | Three dry ticks (−18dB) | Hard cut |
| 5 | 0:05-0:07 | GFX side B | **FROM $27.00/DAY** slams into the right column in flame | **FROM $27.00/DAY** | "Or twenty-seven a day." | Till tick, warmer (−16dB) | Hard cut |
| 6 | 0:07-0:08 | GFX outcome 1 | First outcome line fires under the right column | `CONSISTENT RESULTS, EVERY SERVICE` | - | Soft tick (−18dB) | Hard cut |
| 7 | 0:08-0:09 | GFX outcome 2 | Second outcome line fires 400ms later | `THE MENU YOU ACTUALLY WANT TO RUN` | - | Soft tick (−18dB) | Hard cut |
| 8 | 0:09-0:11.5 | **TXT hero** | **Both columns clear the frame.** The hero line takes the full width on bare steel. This is the only frame in the ad with nothing else on it | **GET THE MACHINES YOU REALLY WANT** *(display, full width)* | "Get the machines you really want." | Bed lifts one step; no SFX (−) | Hard cut |
| 9 | 0:11.5-0:13.5 | **TXT payoff** | `$30K` appears and strikes through; three benefit chips fire beneath, 200ms apart | **WITHOUT THE ~~$30K~~** *(flame)* · `KEEP YOUR CAPITAL` · `KEEP YOUR CASHFLOW` · `OWN IT AT END OF TERM` | "Without the thirty thousand." | Strike (−14dB); three ticks (−18dB) | Hard cut |
| 10 | 0:13.5-0:16 | End card | Wordmark, CTA pill, microcopy, URL | HireHospo · **Get our latest stock list today** *(flame pill, #14161A text)* · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Button (−16dB); settle, short tail | Hold to end |

## Frames to build

**Reuses the plinth and end card from `ad/fitout-quote-shock/shared/`.** Three genuinely new frames.

| Frame | Shots | Core content | Key motion | Notes |
|---|---|---|---|---|
| `frame-oven-split` | 1-2 | One SCC101 cut-out that becomes two | Hard light-up at 0.0s; duplicate and snap apart over 180ms at 1.0s | **NEW.** Same source asset both sides, never mirrored. The identical-ness is the argument |
| `frame-compare-columns` | 3-7 | Two columns: price, tick, crosses / rate, outcome lines | Every element **slams** in over 120ms. No easing in, no count-ups | **NEW.** Left column carries **no flame at any point**. Right column's only flame is the rate |
| `frame-hero-line` | 8 | The hero line alone on bare steel | Line resolves over 0.4s, holds dead still for 2.1s | **NEW - and this is the ad.** Nothing else in frame. Do not add the oven, a chip, or a background texture |
| `frame-payoff` | 9 | `$30K` struck through + three benefit chips | Strike draws L→R over 0.3s; chips fire 200ms apart | **NEW.** The strike-through is the single most important motion in the ad |
| `frame-end-card` | 10 | Wordmark, CTA pill, microcopy, URL | Pill scales 0.96 → 1.0 | **REUSED** unchanged |

## Production notes

- **Beat the reference on rate of change, not on information.** Ten cuts in sixteen seconds against a static card. Numbers slam, they never count up.
- **Shot 8 must be allowed its empty frame.** The instinct will be to keep the oven on screen behind the hero line. Don't - the line lands because everything else has just left.
- **The left column never carries flame.** Not on the price, not on the conceded tick. Flame is the right column and the payoff only.
- **`✓ OWN IT DAY ONE` stays.** Conceding one true point to buy-outright is what stops this reading as a rigged comparison, which is the reference ad's biggest weakness.
- **No arithmetic on screen.** No totals, no working, no term maths. That is Sales' job after credit approval.
- Money and terms in **JetBrains Mono**; the hero line is **display type**, not mono - it is a sentence.
- Wordmark on the end card only; **never redraw the logo**.
- Caption every spoken line, burned in, bottom-centre, inside the safe zone. Shots 4, 6, 7 have no VO - no caption.

## Safe-area check (9:16)

Clear the **top 250px** and the **bottom 320px**. Oven centres at y≈700. Columns span y 620-1300, left x 90-520, right x 560-990. Hero line sits y≈820-1060, full width inside x 80-1000. Payoff block y≈760-1180. CTA pill y≈1180. Captions y≈1420.

## Hold-rate

No single reset - the whole ad is resets. The structural beat is **shot 8 at 0:09**, where both columns clear and the frame empties. After eight seconds of dense two-column motion, an empty frame with one sentence is the strongest possible attention device, and it lands exactly where a 16s ad usually loses people.

## Audit

Shots: **10**. Timing: 1.0 + 1.5 + 1.5 + 1.0 + 2.0 + 1.0 + 1.0 + 2.5 + 2.0 + 2.5 = **16.0s ✓**. Hero line verbatim at 0:09 ✓. Left column flame-free ✓. Conceded tick present ✓. No arithmetic ✓. Money in mono ✓. Safe area ✓. End card microcopy complete ✓.

## Aspect variants

- **4:5 (1080×1350):** columns narrow, hero line wraps to two lines at 88% scale. Drop the URL.
- **1:1 (1080×1080):** merge shots 6 and 7 into one 1.5s outcome beat. **Do not cut shot 8.**

## Hand-off

Build order: reuse `shared/` → `frame-hero-line` first (get the empty frame and the hold right) → `frame-payoff` → `frame-compare-columns` → `frame-oven-split` → end card → animatic. Confirm before render: the $27.00/day figure matches the portal brochure, an SCC101 cut-out exists, and the wordmark asset is available (else ⚠-flag).
