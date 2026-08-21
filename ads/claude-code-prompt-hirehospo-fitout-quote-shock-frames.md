# Claude Code Prompt - HireHospo 15s Ad "The Fit-Out Quote": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_fitout-quote-shock_script_15s.md`,
> `HireHospo_fitout-quote-shock_storyboard.md`, `HireHospo_fitout-quote-shock_audio-brief.md`, and any
> HireHospo brand assets (UI kit, wordmark SVG, product photography, catalogue export) present.
> Paste everything below the line.

---

## 1. Role

You are a front-end motion engineer who designs. You build self-contained animated HTML frames - no build step, no framework, no bundler. Everything runs by opening the file.

## 2. Mandate

Build the animated frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad "The Fit-Out Quote". **Person-free motion graphics + real equipment imagery** - no faces, no hands, no stock people. Commercial kitchens may appear as environment; the subjects are numbers, equipment and type.

## 3. Inputs

- `HireHospo_fitout-quote-shock_script_15s.md` and `HireHospo_fitout-quote-shock_storyboard.md` - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export in the folder - **if present, these are the source of truth and override §4 entirely.** Say in the README which you used.
- Any catalogue export (`active-products.csv`) - for real product names, brands, categories, prices and product-page handles.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / panels ("steel")
line      #2A2E37   hairlines
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text
mute      #838896   captions / de-emphasis / greyed-out figures
flame     #FF9B2E   the ONLY "go" fill: CTA, APPROVED, the key figure highlight
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface (benefit chips, footnote bands)
approve   #58C97B   small approval ticks only (never a fill)
accentink #14161A   text on a flame surface - always
```

- **Type:** Space Grotesk (display; semibold headings, bold figures, tight tracking) · Inter (body) · **JetBrains Mono for all money, terms and chips** (prices, "+ GST", "REFURBISHED · WITH WARRANTY", category labels - uppercase, 0.08em tracking). Money always in mono; it reads like a ledger, which is the brand.
- **One flame highlight per frame**, on the key beat only. Frames `frame-category-grid` (shots 3-4) carry **none** - the cold beat is deliberate.
- Brushed-stainless gradient permitted **only** on the plinth frame. No dot-grid, no neo-brutalist borders - those belong to sibling brands.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. A "stamp" settle for the refurb badge (scale 1.08 → 1.0, 0.25s). Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.** Use the wordmark asset from the folder or hirehospo.com. If none exists, set "HireHospo" in Space Grotesk semibold and **⚠-flag it in the README**.

## 5. What to build - per-frame contract

Copy below is **verbatim and locked**. Do not rewrite, shorten, "improve", or add to it.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-quote-shock.html` | Shots 1-2 · 0:00-0:04 | 4.0s | `$16,800` · `DISHWASHER  $2,000-$20,000` · `CONVECTION OVEN  $2,800-$8,300` · `GLASSWASHER  $2,300-$4,000` | Figure counts 0→16,800 over 0.7s ease-out; flame underline snaps beneath the last three digits on lock; figure scales to top third at 2.0s; three mono line items type in at 120ms stagger |
| `frames/02-category-grid.html` | Shots 3-4 · 0:04-0:07 | 3.0s | `THREE MACHINES` → `ONE CHEQUE` | Three equal steel tiles fade up 150ms apart; at 1.5s they slide together (0.4s) and collapse into a single bar; `$16,800` desaturates ink → mute over 0.3s. **No flame in this frame.** |
| `frames/03-approval-timeline.html` | Shot 5 · 0:07-0:09 | 2.0s | `HireHospo` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **Hard reset** - full layout change. Wordmark resolves 0.5s and lifts to top third; four mono steps draw left→right 150ms apart; `APPROVED` fills flame with a stamp settle; microcopy fades in at +0.2s |
| `frames/04-hero-plinth.html` | Shots 6-7 · 0:09-0:12 | 3.0s | `STARLINE M2` / `COMMERCIAL DISHWASHERS` → `TURBOFAN E31D4` / `CONVECTION OVENS` · `REFURBISHED · WITH WARRANTY` | Brushed-steel plinth push-in 2% across the whole beat; product cross-dissolves at 1.5s; condition badge stamps on at 2.0s (scale 1.08 → 1.0, 0.25s, 2° rotate correction) |
| `frames/05-split.html` | Shot 8 · 0:12-0:13.5 | 1.5s | `$16,800` · `low weekly payments + GST` | Top block drops 4px and desaturates to mute; bottom block lifts 8px as a flame fill wipes left→right over 0.35s |
| `frames/06-end-card.html` | Shot 9 · 0:13.5-0:15 | 1.5s | `HireHospo` · `Premium kitchen equipment, refurbished and warranted, on low weekly payments.` · `Get our latest stock list today` · `REFURBISHED · WITH WARRANTY · + GST · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | CTA pill scales 0.96 → 1.0 with a flame fill; microcopy fades at +0.2s; everything holds still from 1.0s (this frame is the thumbnail-safe hold) |

**Build `frame-end-card`, `frame-approval-timeline`, `frame-quote-shock` and `frame-split` as parameterised, reusable components** - the sibling ads `friday-glasswasher` and `rational-without-20k` reuse all four with different content. Take the copy, figures and chip labels as data, not hard-coded strings.

## 6. Deliverable structure

```
ad/fitout-quote-shock/
  index.html                 contact sheet (all frames, static) + the 15s animatic player
  frames/01-quote-shock.html … 06-end-card.html
  shared/
    tokens.css               the design tokens above, as CSS custom properties
    stage.js                 1080×1920 stage, timeline runner, ?record mode, reduced-motion guard
    frame-end-card.html      the shared end card, parameterised
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS only. No build step, no npm, no framework. Every frame opens standalone in a browser.
- **On-system:** dark steel throughout, flame as the only go-fill, mono for money, one flame highlight per frame.
- **NZ English** throughout.
- **Compliance - non-negotiable, check every frame:**
  - Approved claims only. Nothing invented, nothing added.
  - **"+ GST"** appears wherever a payment is referenced (frames 05 and 06).
  - **"Subject to credit approval"** appears on frame 03 and frame 06.
  - **No specific weekly or daily payment for a specific product.** Frame 05 shows the payment *model*, never a number.
  - `$16,800` is the **outright-purchase cost** - the thing the ad is arguing against. Never style it as a HireHospo price or place it near the flame CTA treatment.
  - No approval hype ("guaranteed", "instant", "everyone approved"), no pressure ("act now", "limited time", countdowns), no discount-shop language ("cheap", "bargain", "slashed").
  - **Roles clean:** HireHospo finances. Washpro sources, refurbishes, delivers, installs and services. Never imply HireHospo holds stock.
  - Equipment names catalogue-true: `Starline M2` and `Turbofan E31D4` only, with their real categories. **Never invent a model number, capacity, or spec.**
- **Recordable:** `?record` renders a true 1080×1920 stage with no chrome, no scrollbars, no cursor, and starts the timeline on load for a clean screen capture.
- **Original work:** build the type and layout yourself. Do not trace or copy another brand's frames.

## 8. Process

1. Read the script, storyboard and any brand assets in the folder. **Confirm in the README which token set you used** (real kit vs the provisional set above).
2. Confirm the copy locks and the compliance gates in §7 before writing any frame.
3. Build `shared/` first - tokens, stage, the parameterised end card.
4. Build frames in order 01 → 06.
5. Build the animatic in `index.html`: frames in sequence at the exact durations in §5, summing to **15.0s**.
6. Write `README.md`: which tokens were used, which frames are reusable and how to parameterise them, the ⚠ items still needing verification (the $16,800 composite total, the three price bands, active status of Starline M2 and Turbofan E31D4, wordmark asset availability), and the screen-record instructions.
7. **Self-review before you finish:** animatic totals exactly 15.0s · every copy string matches §5 character-for-character · "+ GST" present on frames 05 and 06 · "Subject to credit approval" present on frames 03 and 06 · no weekly/daily figure anywhere · gear catalogue-true · one flame highlight per frame (and none on frame 02) · all content inside the safe area (clear top 250px / bottom 320px) · `?record` renders clean at 1080×1920 · `prefers-reduced-motion` degrades to fades.
