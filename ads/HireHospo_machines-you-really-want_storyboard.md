# Storyboard - HireHospo "Get The Machines You Really Want" - 16s - Comparison, fast cut (no people)

**Script:** `HireHospo_machines-you-really-want_script_16s.md` · **Hero line:** *"Get the machines you really want. Without the $30k."*
**Total shots:** 10 · **Aspect:** 9:16 (1080×1920) · **Theme:** dark steel (canvas #12141A) · **Cut rate:** every 1.0-2.5s, nothing dwells
**Product:** Rational SCC101 10 Tray Electric Combi Oven · **CTA:** Get our latest stock list today

## Shot list

| # | Time | Shot | Visual | On screen | VO | SFX | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01 | EQUIP hero | SCC101 cut-out centre on a brushed-steel plinth. Hard light-up, not a fade | `RATIONAL SCC101` | "Same oven." | Oven-door thunk (−15dB) | Hard cut |
| 2 | 0:01-0:02.5 | GFX split | The oven duplicates and the copies snap apart, 180ms. **Same asset both sides, never mirrored** | - | "Two ways to pay." | Snap ×2 (−16dB) | Hard cut |
| 3 | 0:02.5-0:04 | GFX price A | **$30,000** slams into the left head. Right column still empty | **$30,000** *(mono)* | "Thirty thousand today." | Till tick (−16dB) | Hard cut |
| 4 | 0:04-0:06 | GFX price B | **FROM $27.00/DAY** slams into the right head, flame. Both heads now set, table frame draws | **FROM $27.00/DAY** | "Or twenty-seven a day." | Till tick, warmer (−16dB) | Hard cut |
| 5 | 0:06-0:06.75 | **Row 1 (same)** | Both sides fire together, both ticked `approve` | `OWN IT DAY ONE` ✓ ‖ `OWN IT AT END OF TERM` ✓ | - | Double tick (−18dB) | Hard cut |
| 6 | 0:06.75-0:07.5 | **Row 2 (differs)** | Left cross `mute`, right tick `approve` | `30K OUT OF YOUR POCKET` ✗ ‖ `KEEP 30K IN YOUR POCKET` ✓ | - | Dry tick / warm tick | Hard cut |
| 7 | 0:07.5-0:08.25 | **Row 3 (differs)** | Left cross, right tick | `LARGE UPFRONT` ✗ ‖ `LOW WEEKLY PAYMENTS` ✓ | - | Dry tick / warm tick | Hard cut |
| 8 | 0:08.25-0:09 | **Row 4 (same)** | Both ticked. Disclaimer resolves beneath the table in `mute` | `TAX DEDUCTIBLE*` ✓ ‖ `TAX DEDUCTIBLE*` ✓ · *\*Seek independent tax advice for your circumstances* | - | Double tick (−18dB) | Hard cut |
| 9 | 0:09-0:11.5 | **TXT hero** | **The whole table clears.** The line takes full width on bare steel. Only frame in the ad with nothing else on it | **GET THE MACHINES YOU REALLY WANT** *(display)* | "Get the machines you really want." | Bed lifts one step, percussion pulls out. **No SFX** | Hard cut |
| 10 | 0:11.5-0:13.5 | **TXT payoff** | `$30K` strikes through L→R | **WITHOUT THE ~~$30K~~** *(flame)* | "Without the thirty thousand." | Strike (−14dB) | Hard cut |
| 11 | 0:13.5-0:16 | End card | Wordmark, CTA pill, microcopy, URL | HireHospo · **Get our latest stock list today** · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Button (−16dB); settle, tail | Hold |

## Table design

Four rows, both columns visible throughout. **Rows 1 and 4 match on both sides; rows 2 and 3 differ.**
That symmetry is the design: conceding half the rows makes the card read as analysis, so attention
lands on the two rows carrying the argument. Do not "improve" it into a clean sweep.

- Left column carries **no flame at any point**, including its two ticks. Ticks are `approve`, crosses `mute`.
- Right column's only flame is the rate in the head.
- Rows fire **both sides simultaneously**, 750ms apart from each other. The rhythm is same / differ / differ / same.
- The tax disclaimer is a DOM child of the table block, minimum 24px at 1080 width, and cannot be cropped away at any aspect ratio.

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

Shots: **11**. Timing: 1.0 + 1.5 + 1.5 + 2.0 + 0.75 + 0.75 + 0.75 + 0.75 + 2.5 + 2.0 + 2.5 = **16.0s ✓**. Hero line verbatim at 0:09 ✓. Left column flame-free ✓. Conceded tick present ✓. No arithmetic ✓. Money in mono ✓. Safe area ✓. End card microcopy complete ✓.

## Aspect variants

- **4:5 (1080×1350):** columns narrow, hero line wraps to two lines at 88% scale. Drop the URL.
- **1:1 (1080×1080):** merge shots 6 and 7 into one 1.5s outcome beat. **Do not cut shot 8.**

## Hand-off

Build order: reuse `shared/` → `frame-hero-line` first (get the empty frame and the hold right) → `frame-payoff` → `frame-compare-columns` → `frame-oven-split` → end card → animatic. Confirm before render: the $27.00/day figure matches the portal brochure, an SCC101 cut-out exists, and the wordmark asset is available (else ⚠-flag).
