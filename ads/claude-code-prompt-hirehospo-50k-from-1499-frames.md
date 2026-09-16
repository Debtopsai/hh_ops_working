# Claude Code Prompt - HireHospo 15s Ad "$50k Of Equipment From $14.99/Day": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_50k-from-1499_script_15s.md`,
> `HireHospo_50k-from-1499_storyboard.md`, `HireHospo_50k-from-1499_audio-brief.md`, and any HireHospo brand
> assets present. **If `ad/fitout-quote-shock/` exists, read its `shared/` folder first - reuse, don't rebuild.**
> Paste everything below the line.

---

## 1. Role

Front-end motion engineer who designs. Self-contained animated HTML frames - no build step, no framework, no bundler.

## 2. Mandate

Build the frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad **"$50k worth of equipment from $14.99/day"**. **Person-free motion graphics + real equipment imagery.**

**This is an offer-led ad and the supplied headline is the creative.** The headline is spoken and on screen from frame one, and it stays on screen until the end card. Do not restructure it, tease it, delay it, or replace it with a narrative setup.

**⚠ Pending Credit sign-off** on the `$14.99/day` rate - parameterise it per §7.

## 3. Inputs

- The script and storyboard - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline, the category grid, the hero plinth and the serviced badge.**
- `ad/rational-without-20k/frames/06-timeline-compact.html` - reuse for the approval line.
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export - **if present, these override §4 entirely.**
- Any catalogue export (`active-products.csv`) - to confirm the four category names.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas #12141A · surface #1C1F26 · line #2A2E37 · ink #F4F4F2 · ink2 #B9BDC7
mute #838896 · flame #FF9B2E (the ONLY "go" fill) · flamedark #D97C14
warmtint #2A2318 (disclosure band) · approve #58C97B (small ticks only) · accentink #14161A
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for the headline figures, all money, terms, chips and the disclosure block**.
- **One flame highlight per frame.** In the headline frames that is the figure itself.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.**

## 5. What to build - per-frame contract

Copy is **verbatim and locked**.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-headline.html` | Shots 1-3 · 0:00-0:05.5 | 5.5s | `$50,000 OF EQUIPMENT` · `FROM $14.99/DAY` · `FUNDING UP TO $50,000 · PACKAGES FROM $14.99/DAY` · `YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` · `SUBJECT TO CREDIT APPROVAL` | L1 resolves over 0.5s, full-bleed, alone in frame. L2 lands beneath at 2.0s. The three-line disclosure fades in at 3.5s **and persists**. At 5.0s the whole block scales to 0.42 and moves to the top third - **it stays there for the rest of the ad** |
| `frames/02-category-grid.html` | Shots 4-5 · 0:05.5-0:07.5 | 2.0s | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` | Four tiles light 150ms apart in two pairs, beneath the persisted headline. **REUSE** the grid component |
| `frames/03-approval-timeline.html` | Shot 6 · 0:07.5-0:09.5 | 2.0s | `HireHospo` · `FUNDING UP TO $50,000` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **REUSE** with the funding-ceiling line enabled |
| `frames/04-plinth-badge.html` | Shot 7 · 0:09.5-0:11.5 | 2.0s | `FULLY SERVICED · WITH WARRANTY` | **REUSE** plinth + badge. Plinth push-in 2%; badge stamp settle (1.08 → 1.0, 0.25s) |
| `frames/05-approval-compact.html` | Shot 8 · 0:11.5-0:12.5 | 1.0s | `APPROVED IN 24 TO 48 HOURS` | **REUSE** from `rational-without-20k` |
| `frames/06-end-card.html` | Shot 9 · 0:12.5-0:15 | 2.5s | `HireHospo` · `Premium kitchen equipment, fully serviced and warranted, on low weekly payments.` · `Get our latest stock list today` · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged |

**The headline persists.** After the 5.0s shrink it remains in the top third through frames 02-05 - render it as a persistent layer in `stage.js`, not as a copy pasted into each frame.

## 6. Deliverable structure

```
ad/50k-from-1499/
  index.html · frames/01-headline.html … 06-end-card.html
  shared/ -> ../fitout-quote-shock/shared/
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS. No build step, no npm, no framework.
- **NZ English.**
- **Compliance:**
  - **Parameterise the rate.** `$14.99` defined **once** as `--entry-rate` in `shared/tokens.css`, read by the headline, the disclosure and the end card. **State in the README which line to edit.**
  - **The three-line disclosure block is mandatory and inseparable from the headline** - a DOM child of the same container, no independent animation, no reflow that separates them at any aspect ratio, minimum 26px at 1080 width. It is on screen from 0:02 to 0:13. **It is what makes the ceiling-and-floor pairing lawful - not decoration.**
  - **"FROM" must appear in the on-screen rate line**, never a bare figure.
  - **No GST line appears anywhere** - removed by client direction. Do not reinstate it. **"Subject to credit approval"** in the disclosure and on frames 03 and 06.
  - **No product model name anywhere.** Categories only - a model beside a rate reads as a per-product quote and breaches the credit gate.
  - No approval hype, no pressure, no discount-shop language. **"Fully serviced" is never softened** - only the locked pair `FULLY SERVICED · WITH WARRANTY`.
  - **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
  - **Build `frames/01-alt-rate.html`** with the rate slot empty and a `[RATE]` placeholder, wired behind `?alt`, so a Credit-revised figure can be previewed instantly.
- **Recordable:** `?record` renders a true 1080×1920 stage, no chrome, no scrollbars, no cursor.
- **Original work.**

## 8. Process

1. Read the script, storyboard and `shared/`. Confirm in the README which token set you used and which frames you reused.
2. Confirm the copy locks and §7 before writing any frame.
3. Build `01-headline` first - it is the ad, and the persistent-layer behaviour is the thing most likely to go wrong.
4. Re-parameterise 02-06 from existing components.
5. Build the animatic: exact durations from §5, summing to **15.0s**.
6. `README.md`: tokens used, frames reused vs new, **the exact line to edit for the rate**, how to render `?alt`, and outstanding ⚠ items (Credit sign-off, category names, wordmark asset).
7. **Self-review:** animatic totals exactly 15.0s · copy matches §5 character-for-character · **rate defined in exactly one place** · **disclosure inseparable from the headline at 9:16, 4:5 and 1:1, legible at 26px+, on screen 0:02-0:13** · headline persists in the top third through frames 02-05 · `FROM` present in the rate line · no model name anywhere · one flame highlight per frame · safe area clear (top 250px / bottom 320px) · `?record` clean · `?alt` renders · `prefers-reduced-motion` degrades to fades.
