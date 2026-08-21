# Claude Code Prompt - HireHospo 15s Ad "$50k Of Equipment For A Coffee & Muffin A Day": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_coffee-and-muffin_script_15s.md`,
> `HireHospo_coffee-and-muffin_storyboard.md`, `HireHospo_coffee-and-muffin_audio-brief.md`, and any HireHospo
> brand assets present. **If `ad/fitout-quote-shock/` and `ad/50k-from-1499/` exist, read their `shared/` and
> frame folders first - reuse, don't rebuild.** Paste everything below the line.

---

## 1. Role

Front-end motion engineer who designs. Self-contained animated HTML frames - no build step, no framework, no bundler.

## 2. Mandate

Build the frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad **"$50k worth of equipment for the price of a coffee & muffin a day."** **Person-free** - one flat product photograph, category tiles, and type. No faces, no hands.

**This is an offer-led ad and the supplied headline is the creative.** The headline is spoken and on screen from frame one, wrapped around a still product image. Do not restructure it, tease it, delay it, or convert it into a narrative.

**⚠ Pending Credit sign-off** on the `$14.99/day` rate - parameterise it per §7.

## 3. Inputs

- The script and storyboard - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline, the category grid and the serviced badge.**
- `ad/50k-from-1499/frames/01-headline.html` - reuse its disclosure-block component.
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export - **if present, these override §4 entirely.**
- Any catalogue export (`active-products.csv`) - to confirm the four category names.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas #12141A · surface #1C1F26 · line #2A2E37 · ink #F4F4F2 · ink2 #B9BDC7
mute #838896 · flame #FF9B2E (the ONLY "go" fill) · flamedark #D97C14
warmtint #2A2318 (disclosure band) · approve #58C97B (small ticks only) · accentink #14161A
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for money, terms, chips and the disclosure block**. **Headline line 2 is display type, not mono** - it is a sentence, not a figure.
- **One flame highlight per frame.** Frame `01`'s L1 highlight is the figure; on L2 it is the words `COFFEE & MUFFIN`. The image-alone beat carries none.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.**

## 5. What to build - per-frame contract

Copy is **verbatim and locked**.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-headline.html` | Shots 1-3 · 0:00-0:07.5 | 7.5s | `$50,000 OF EQUIPMENT` · `FOR THE PRICE OF A COFFEE & MUFFIN A DAY` | L1 resolves over 0.5s, full-bleed, alone in frame, and **holds for 2.5s**. The product image fades up beneath it at 3.0s over 0.6s and then **does not move again — no push-in, no drift, no parallax**. L2 resolves at 5.0s over 0.6s with the flame landing on `COFFEE & MUFFIN`. The two lines wrap above and below the image so the whole frame reads as one sentence with a picture in the middle |
| `frames/02-approval-timeline.html` | Shot 4 · 0:07.5-0:09.5 | 2.0s | `HireHospo` · `FUNDING UP TO $50,000` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **Hard reset** — full layout change. **REUSE** with the funding-ceiling line enabled |
| `frames/03-category-grid.html` | Shot 5 · 0:09.5-0:10.5 | 1.0s | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `CONVECTION OVENS` · `GLASSWASHERS` | Four tiles light 150ms apart, warm. **REUSE**, re-parameterised to cafe categories |
| `frames/04-serviced-badge.html` | Shot 6 · 0:10.5-0:11.5 | 1.0s | `FULLY SERVICED · WITH WARRANTY` | **REUSE** unchanged. Stamp settle 1.08 → 1.0, 0.25s |
| `frames/05-entry-figure.html` | Shot 7 · 0:11.5-0:12.5 | 1.0s | `From $14.99/day` · `FUNDING UP TO $50,000 · PACKAGES FROM $14.99/DAY` · `YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` · `+ GST · SUBJECT TO CREDIT APPROVAL` | **REUSE** the disclosed-figure component from `50k-from-1499`. Figure scales 0.94 → 1.0 with a flame underline wipe; disclosure fades in at +0.15s **inside the same container** |
| `frames/06-end-card.html` | Shot 8 · 0:12.5-0:15 | 2.5s | `HireHospo` · `Premium kitchen equipment, fully serviced and warranted, on low weekly payments.` · `Get our latest stock list today` · `FULLY SERVICED · WITH WARRANTY · + GST · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged |

**Frame 01 is the ad and it is half the runtime.** Two text beats and a photograph that does not move. It will feel slow while you build it — that is the offer-led bet, and it is deliberate. Do not add motion to fill the time.

## 6. Deliverable structure

```
ad/coffee-and-muffin/
  index.html · frames/01-headline.html … 06-end-card.html
  shared/ -> ../fitout-quote-shock/shared/
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS. No build step, no npm, no framework.
- **NZ English.**
- **Compliance:**
  - **Parameterise the rate.** `$14.99` reads from the **same** `--entry-rate` token as `50k-from-1499` — defined once in `shared/tokens.css`, so one edit updates both ads. **State in the README which line to edit.**
  - **The three-line disclosure block is mandatory and inseparable from the figure** — a DOM child of the same container, no independent animation, no reflow that separates them at any aspect ratio, minimum 26px at 1080 width.
  - **"From" must appear in the on-screen figure line**, never a bare figure.
  - **Never put a price on the coffee and muffin.** No label, no chip, no caption, no tooltip, anywhere in the build. The headline makes the comparison; putting a dollar figure on the food would be a claim about third-party retail pricing HireHospo has no basis to make.
  - **"+ GST"** in the disclosure and on the end card. **"Subject to credit approval"** in the disclosure and on frames 02 and 06.
  - **No product model name anywhere.** Categories only.
  - No approval hype, no pressure, no discount-shop language. **"Fully serviced" is never softened** — only the locked pair `FULLY SERVICED · WITH WARRANTY`.
  - **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
  - **Build `frames/05-alt-rate.html`** with a `[RATE]` placeholder, wired behind `?alt`.
- **Product image:** if no coffee-and-muffin photograph is in the folder, build the frame with a labelled placeholder box at the correct dimensions and **⚠-flag it in the README**. Do not substitute a stock image, an illustration, an emoji, or a CSS drawing — the frame depends on the object reading as real and ordinary.
- **Recordable:** `?record` renders a true 1080×1920 stage, no chrome, no scrollbars, no cursor.
- **Original work.**

## 8. Process

1. Read the script, storyboard and the existing `shared/` and frame folders. Confirm in the README which token set you used and which frames you reused.
2. Confirm the copy locks and §7 — especially the rate parameterisation, the disclosure lock, and the no-price-on-the-food rule — before writing any frame.
3. Build `01-headline` first. Get the composition right: L1 above, still image centre, L2 below, reading as one sentence. The stillness of the image under the resolving headline is the entire effect.
4. Re-parameterise 02-06 from existing components.
5. Build the animatic: exact durations from §5, summing to **15.0s**.
6. `README.md`: tokens used, frames reused vs new, **the exact line to edit for the rate (shared with `50k-from-1499`)**, how to render `?alt`, and outstanding ⚠ items (Credit sign-off, product photograph, category names, wordmark asset).
7. **Self-review:** animatic totals exactly 15.0s · copy matches §5 character-for-character · **rate defined in exactly one place and shared with `50k-from-1499`** · **disclosure inseparable from the figure at 9:16, 4:5 and 1:1, legible at 26px+** · `From` present in the figure line · **no price appears anywhere near the product image** · the image does not move at any point after it fades up · no model name anywhere · one flame highlight per frame · safe area clear (top 250px / bottom 320px) · `?record` clean · `?alt` renders · `prefers-reduced-motion` degrades to fades.
