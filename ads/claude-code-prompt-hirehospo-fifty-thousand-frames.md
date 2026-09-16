# Claude Code Prompt - HireHospo 15s Ad "Sitting In A Quote": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_fifty-thousand_script_15s.md`,
> `HireHospo_fifty-thousand_storyboard.md`, `HireHospo_fifty-thousand_audio-brief.md`, and any HireHospo brand
> assets present. **If `ad/fitout-quote-shock/` and `ad/50k-from-1499/` exist, read their `shared/` and frame
> folders first - this ad reuses almost everything and has only one new frame to build.**
> Paste everything below the line.

---

## 1. Role

You are a front-end motion engineer who designs. You build self-contained animated HTML frames - no build step, no framework, no bundler.

## 2. Mandate

Build the animated frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad "Sitting In A Quote". **Person-free motion graphics + real equipment imagery.** The subjects are a number, a quote document, a category grid, and type.

**✅ This ad is cleared to produce - every claim is on the approved table and no daily or weekly figure appears anywhere.** It is the control cut for the two figure-led ads. If the others are blocked, this one still ships.

## 3. Inputs

- `HireHospo_fifty-thousand_script_15s.md` and `HireHospo_fifty-thousand_storyboard.md` - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline, the serviced badge and the split frame.**
- `ad/50k-from-1499/frames/` - **reuse the four-tile category grid.**
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export - **if present, these override §4 entirely.**
- Any catalogue export (`active-products.csv`) - to confirm the four category names.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / panels ("steel") / the quote plate
line      #2A2E37   hairlines / quote line items / unlit tiles
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text
mute      #838896   captions / de-emphasis / the desaturated quote
flame     #FF9B2E   the ONLY "go" fill
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface
approve   #58C97B   small approval ticks only (never a fill)
accentink #14161A   text on a flame surface - always
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for all money, terms and chips**.
- **One flame highlight per frame.** Frames `02-dark-kitchen` carries **none**, and `01-quote-plate` is the only frame in the entire HireHospo library where flame is **taken away** rather than given - the underline extinguishes as the quote closes. Build that deliberately.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.**

## 5. What to build - per-frame contract

Copy below is **verbatim and locked**.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-quote-plate.html` | Shots 1-2 · 0:00-0:04 | 4.0s | `$50,000` · `QUOTE #` | Figure resolves over 0.5s with a flame underline snapping on lock. At 2.0s a quote plate assembles **around** it - header rule, three `line`-coloured line items, `QUOTE #` - over 0.6s. The whole plate then desaturates `ink` → `mute` over 0.4s and **the flame underline extinguishes**. The figure must be a DOM child of the plate so the trapping reads structurally |
| `frames/02-dark-kitchen.html` | Shots 3-4 · 0:04-0:07.5 | 3.5s | `NOT IN YOUR KITCHEN` | The quote plate holds, scaled to 0.94. Four category tiles sit behind it, dark and unlit (`line`). At 2.0s the figure inside the quote dims one further step - **the only change in frame**. **No flame** |
| `frames/03-approval-timeline.html` | Shot 5 · 0:07.5-0:10 | 2.5s | `HireHospo` · `FUNDING UP TO $50,000` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **Hard reset.** The quote plate clears frame upward over 0.4s, then **REUSE** the timeline component with the funding-ceiling line enabled |
| `frames/04-tiles-light.html` | Shots 6-7 · 0:10-0:12.5 | 2.5s | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` · `FULLY SERVICED · WITH WARRANTY` | **REUSE** the four-tile grid from `50k-from-1499`, **in the same positions as frame 02**. Tiles light one at a time, warm, 150ms apart; badge stamps on at 1.5s (scale 1.08 → 1.0, 0.25s) |
| `frames/05-payment-model.html` | Shot 8 · 0:12.5-0:13.5 | 1.0s | `low weekly payments` | **REUSE** the split component in its **model-only state** - the state that carries no number. Flame fill wipes left→right over 0.35s |
| `frames/06-end-card.html` | Shot 9 · 0:13.5-0:15 | 1.5s | `HireHospo` · `Premium kitchen equipment, fully serviced and warranted, on low weekly payments.` · `Get our latest stock list today` · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged |

**Only `01-quote-plate` is genuinely new.** Everything else is a component you already have. If you find yourself writing a second new frame, check the existing ad folders first.

**The four category tiles must be in identical positions in frames 02 and 04** - dark behind the quote, lit after the bridge. The relight is the ad's mechanism shown rather than said, and it only works if nothing moves between them.

## 6. Deliverable structure

```
ad/fifty-thousand/
  index.html                 contact sheet + the 15s animatic player
  frames/01-quote-plate.html … 06-end-card.html
  shared/ -> ../fitout-quote-shock/shared/
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS only. No build step, no npm, no framework.
- **NZ English** throughout.
- **Compliance - non-negotiable:**
  - **This ad contains no daily and no weekly payment figure, anywhere, in any frame, and must never acquire one.** Frame 05 shows the payment *model*, never a number. **Do not import `--entry-rate` into this ad.** If a rate appears beside the `$50,000` ceiling, the ad inherits the ceiling-and-floor juxtaposition problem it exists to avoid and stops working as the control.
  - **"Up to" must survive everywhere.** On screen it is `FUNDING UP TO $50,000`, never a bare `$50,000 FUNDED`.
  - The `$50,000` in frames 01-02 is the **supplier's quote** - the thing sitting still. Do not style it as a HireHospo price. It becomes a HireHospo claim only in frame 03, with "up to" attached.
  - **No GST line appears anywhere** - removed by client direction. Do not reinstate it. **"Subject to credit approval"** on frames 03 and 06.
  - **No product model name anywhere.** Categories only. Never invent a model number, capacity, or spec.
  - No approval hype, no pressure, no discount-shop language. **"Fully serviced" is never softened** - only the locked pair `FULLY SERVICED · WITH WARRANTY`.
  - **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
- **Recordable:** `?record` renders a true 1080×1920 stage with no chrome, no scrollbars, no cursor.
- **Original work.**

## 8. Process

1. Read the script, storyboard and the existing `shared/` and frame folders. **Confirm in the README which token set you used** and **which frames you reused** - this ad should reuse five of six.
2. Confirm the copy locks and §7 before writing any frame.
3. Build `01-quote-plate` - the only new frame. Get the assemble-then-desaturate-then-extinguish sequence right; the whole ad turns on a bright number going dull inside a document.
4. Re-parameterise 02 (grid, dark state), 03, 04, 05 (model-only state) and 06 from existing components.
5. Build the animatic in `index.html`: exact durations from §5, summing to **15.0s**.
6. Write `README.md`: tokens used, frames reused vs new, confirmation that **no claim in this ad requires sign-off**, and the ⚠ items outstanding (category names against the live catalogue, wordmark asset availability).
7. **Self-review:** animatic totals exactly 15.0s · every copy string matches §5 character-for-character · **no daily or weekly figure appears in any frame** · `--entry-rate` is not imported anywhere · "up to" present in both the VO caption and the on-screen ceiling line · `$50,000` never styled as a HireHospo price in frames 01-02 · "Subject to credit approval" on frames 03 and 06 · no model name anywhere · one flame highlight per frame, none on 02, and frame 01 **extinguishes** its flame · the four tiles are identical and co-located in frames 02 and 04 · safe area clear (top 250px / bottom 320px) · `?record` clean at 1080×1920 · `prefers-reduced-motion` degrades to fades.
