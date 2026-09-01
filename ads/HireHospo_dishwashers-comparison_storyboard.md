# Storyboard - HireHospo "Get The Dishwasher You Really Want" - 16s - Comparison, fast cut (no people)

**Script:** `HireHospo_dishwashers-comparison_script_16s.md` · **Restaurant / bar / high-volume operator, Product Aware, offer-led comparison**
**Total shots:** 11 · **9:16 (1080×1920)** · dark steel (provisional system; canvas #12141A)
**Product:** Starline M2 · Commercial Dishwashers · buy **~$8,730** ⚠ · **from $7.86/day** ⚠

## Shot list

| # | Time | Shot | Visual | On screen | VO | SFX | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01 | EQUIP hero | Starline M2 cut-out centre on a brushed-steel plinth. **Hard light-up, not a fade** | `STARLINE M2` | "Same dishwasher." | Rack clack, single (−15dB) | Hard cut |
| 2 | 0:01-0:02.5 | GFX split | The unit duplicates and the copies snap apart over 180ms. **Same asset both sides, never mirrored** | - | "Two ways to pay." | Snap ×2 (−16dB) | Hard cut |
| 3 | 0:02.5-0:04 | GFX price A | **$8,730** slams into the left head. Right column still empty | **$8,730** *(mono)* | *(price line)* | Till tick (−16dB) | Hard cut |
| 4 | 0:04-0:06 | GFX price B | **FROM $7.86/DAY** slams into the right head in flame. Table frame draws between the columns | **FROM $7.86/DAY** | *(price line)* | Till tick, warmer (−16dB) | Hard cut |
| 5 | 0:06-0:06.75 | **Row 1 (same)** | Both sides fire together, both ticked `approve` | `OWN IT DAY ONE` ✓ ‖ `OWN IT AT END OF TERM` ✓ | - | Double tick (−18dB) | Hard cut |
| 6 | 0:06.75-0:07.5 | **Row 2 (differs)** | Left cross `mute`, right tick `approve` | `8.7K OUT OF YOUR POCKET` ✗ ‖ `KEEP 8.7K IN YOUR POCKET` ✓ | - | Dry / warm tick | Hard cut |
| 7 | 0:07.5-0:08.25 | **Row 3 (differs)** | Left cross, right tick | `LARGE UPFRONT` ✗ ‖ `LOW WEEKLY PAYMENTS` ✓ | - | Dry / warm tick | Hard cut |
| 8 | 0:08.25-0:09 | **Row 4 (same)** | Both ticked. Disclaimer resolves beneath the table in `mute` | `TAX DEDUCTIBLE*` ✓ ‖ `TAX DEDUCTIBLE*` ✓ · *\*Seek independent tax advice for your circumstances* | - | Double tick (−18dB) | Hard cut |
| 9 | 0:09-0:11.5 | **TXT hero** | **The whole table clears.** Line takes full width on bare steel, then the two outcome lines fire beneath it 400ms apart | **GET THE DISHWASHER YOU REALLY WANT** · `STAFF ON THE FLOOR, NOT AT THE SINK` · `NO PILE-UP AT THE PASS` | "Get the dishwasher you really want." | Bed lifts one step, percussion pulls out. **No SFX under the line** | Hard cut |
| 10 | 0:11.5-0:13.5 | **TXT payoff** | `$8.7K` strikes through L→R as two benefit chips fire | **WITHOUT THE ~~$8.7K~~** *(flame)* · `KEEP YOUR CAPITAL` · `KEEP YOUR CASHFLOW` | *(payoff line)* | Strike (−14dB); two ticks | Hard cut |
| 11 | 0:13.5-0:16 | End card | Wordmark, CTA pill, microcopy, URL | HireHospo · **Get our latest stock list today** · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | "Get our latest stock list today." | Button (−16dB); settle, tail | Hold |

## Table design

Four rows, both columns visible from 0:06. **Rows 1 and 4 match; rows 2 and 3 differ.** Rhythm is same / differ / differ / same, 750ms apart. Do not convert it to a clean sweep - conceding half the rows is where the credibility comes from.

- Left column carries **no flame at any point**, including its two ticks. Ticks `approve` and small; crosses `mute`. Never a fill.
- Right column's only flame is the rate in the head.
- Rows fire **both sides simultaneously**.
- The tax disclaimer is a DOM child of the table block, min 24px at 1080 width, uncroppable at any aspect ratio.

## Frames to build

Reuses the SCC101 comparison build wholesale - `frame-compare-table`, `frame-hero-line`, `frame-payoff`, `frame-end-card` are all parameterised. **Only the product cut-out, the two figures and the two outcome lines change.** This ad should cost one photo and a config file, nothing more.

## Safe area (9:16)

Top 250px and bottom 320px clear. Product plinth y 560-980. Table y 700-1240 once built. Hero line y≈820 with outcome lines y≈980-1080. CTA pill y≈1180. Captions y≈1420.

## Hold-rate

11 cuts in 16s, nothing over 2.5s. The reset is the table clearing at **0:09** - the only frame in the ad with nothing on it but a sentence, landing straight after the busiest frame. That contrast is the hold device.

## Audit

Shots **11**. Timing: 1.0 + 1.5 + 1.5 + 2.0 + 0.75 + 0.75 + 0.75 + 0.75 + 2.5 + 2.0 + 2.5 = **16.0s ✓**. Both figures ⚠ pending portal confirmation. `OWN IT AT END OF TERM` on the right ✓. No arithmetic on screen ✓. No GST line ✓. Credit-approval microcopy on the end card ✓.

## Aspect variants

- **4:5:** drop the URL; CTA to y≈1000. Table keeps all four rows and the disclaimer. If it will not fit legibly, drop row 4, never the disclaimer.
- **1:1:** rows fire in 2 pairs rather than 4 singles (1+2, then 3+4) to hold the 3s table window.

## Hand-off

Reuse `ad/machines-you-really-want/` shared components and config. Confirm before render: **the buy price and daily rate against the portal brochure**, the product photo, and the wordmark asset.
