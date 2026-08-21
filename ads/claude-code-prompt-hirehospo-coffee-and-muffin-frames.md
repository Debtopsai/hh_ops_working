# Claude Code Prompt - HireHospo 15s Ad "One Of Them Pays For The Kitchen": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_coffee-and-muffin_script_15s.md`,
> `HireHospo_coffee-and-muffin_storyboard.md`, `HireHospo_coffee-and-muffin_audio-brief.md`, and any HireHospo
> brand assets present. **If `ad/fitout-quote-shock/` and `ad/50k-from-1499/` exist, read their `shared/` and
> frame folders first - you are reusing components, not rebuilding them.** Paste everything below the line.

---

## 1. Role

You are a front-end motion engineer who designs. You build self-contained animated HTML frames - no build step, no framework, no bundler.

## 2. Mandate

Build the animated frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad "One Of Them Pays For The Kitchen". **Person-free** - one flat product photograph (a coffee and a muffin), a tile grid, category tiles, and type. No faces, no hands.

**⚠ Pending Credit sign-off** on the `$14.99/day` entry rate. Build it; parameterise the rate per §7.

## 3. Inputs

- `HireHospo_coffee-and-muffin_script_15s.md` and `HireHospo_coffee-and-muffin_storyboard.md` - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline and the refurb badge.**
- `ad/50k-from-1499/frames/05-entry-figure.html` - **reuse the disclosed-figure component**, re-parameterised.
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export - **if present, these override §4 entirely.**
- Any catalogue export (`active-products.csv`) - to confirm the three category names.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / panels ("steel") / unlit tiles
line      #2A2E37   hairlines
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text / the fifteen tiles before the interrupt
mute      #838896   captions / de-emphasis / the fourteen tiles after
flame     #FF9B2E   the ONLY "go" fill
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface (disclosure band)
approve   #58C97B   small approval ticks only (never a fill)
accentink #14161A   text on a flame surface - always
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for all money, counters, terms, chips and the disclosure block**.
- **One flame highlight per frame.** Frames `01-product-flat` and the first state of `02-tile-grid` carry **none** - which is precisely what gives the single lit tile its force.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.**

## 5. What to build - per-frame contract

Copy below is **verbatim and locked**.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-product-flat.html` | Shots 1-2 · 0:00-0:04 | 4.0s | *(no text for the first 1.5s)* → `×15 BEFORE NOON` | The product image holds **completely still** for the full 4.0s - no push-in, no drift, no parallax. A mono counter beside it increments 1→15, 130ms apart, starting at 1.5s, resolving to `×15 BEFORE NOON` |
| `frames/02-tile-grid.html` | Shots 3-4 · 0:04-0:07.5 | 3.5s | `ONE OF THEM` | Fifteen identical tiles fade up together in a 5×3 grid at 0.3s, all `ink2`. At 1.5s **exactly one tile fills flame** and the other fourteen drop to `mute`. `ONE OF THEM` fades in beneath at 1.8s. **Nothing else moves at any point** |
| `frames/03-approval-timeline.html` | Shot 5 · 0:07.5-0:09 | 1.5s | `HireHospo` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **Hard reset.** **REUSE** unchanged |
| `frames/04-category-tiles.html` | Shots 6-7 · 0:09-0:11.5 | 2.5s | `COMMERCIAL DISHWASHERS` · `CONVECTION OVENS` · `GLASSWASHERS` · `REFURBISHED · WITH WARRANTY` | Three tiles light 150ms apart, warm; badge stamps on at 1.5s (scale 1.08 → 1.0, 0.25s) |
| `frames/05-entry-figure.html` | Shot 8 · 0:11.5-0:13 | 1.5s | `From $14.99/day` · `PACKAGE RATE · YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` · `+ GST · SUBJECT TO CREDIT APPROVAL` | **REUSE** the `50k-from-1499` component, re-parameterised. Figure scales 0.94 → 1.0 with a flame underline wipe; disclosure fades in at +0.15s **inside the same container** |
| `frames/06-end-card.html` | Shot 9 · 0:13-0:15 | 2.0s | `HireHospo` · `Premium kitchen equipment, refurbished and warranted, on low weekly payments.` · `Apply now` · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged |

**`02-tile-grid` is the whole ad and it is one property changing on one element.** Do not animate the other fourteen tiles. Do not add a counter, labels, icons, a second highlight, a hover state, or a background treatment. Do not stagger the flame fill across neighbours. Fourteen tiles doing nothing is what makes one tile mean something - if you find yourself adding motion here, delete it.

## 6. Deliverable structure

```
ad/coffee-and-muffin/
  index.html                 contact sheet + the 15s animatic player
  frames/01-product-flat.html … 06-end-card.html
  shared/ -> ../fitout-quote-shock/shared/
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS only. No build step, no npm, no framework.
- **NZ English** throughout.
- **Compliance - non-negotiable:**
  - **Parameterise the entry rate.** `$14.99` reads from the **same** `--entry-rate` token as `50k-from-1499` - define it once, in `shared/tokens.css`, so one edit updates both ads. **State in the README exactly which line to edit.**
  - **The disclosure block is inseparable from the figure** - a DOM child of the same container, no independent animation, no reflow that can separate them at any aspect ratio, minimum 26px type at 1080 width. It leads with **`PACKAGE RATE`**, which is what keeps this a package rate rather than a product quote.
  - **"From" must appear in the on-screen figure line** (`From $14.99/day`), never a bare figure.
  - **Never state the price of the coffee and muffin, on screen or anywhere.** The equivalence is implied by the single lit tile. Stating it would be a claim about third-party retail pricing HireHospo has no basis to make. **Do not add a price label to the product image, the counter, or any tile.**
  - **No product model name anywhere in this ad.** Categories only.
  - **"+ GST"** in the disclosure block and on the end card. **"Subject to credit approval"** on frames 03, 05 and 06.
  - No approval hype, no pressure, no discount-shop language. **"Refurbished" is never softened** - only the locked pair `REFURBISHED · WITH WARRANTY`.
  - **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
  - **Build a figure-free variant** as `frames/05-alt-no-figure.html` reading `low weekly payments + GST`, wired into the animatic behind a `?alt` flag, so the ad can be recut if Credit rejects the rate.
- **Product image:** if no coffee-and-muffin photograph is in the folder, build the frame with a labelled placeholder box at the correct dimensions and **⚠-flag it in the README**. Do not substitute a stock image, an illustration, an emoji, or a CSS drawing - the frame depends on the object reading as real and ordinary.
- **Recordable:** `?record` renders a true 1080×1920 stage with no chrome, no scrollbars, no cursor.
- **Original work.**

## 8. Process

1. Read the script, storyboard and the existing `shared/` and frame folders. **Confirm in the README which token set you used** and **which frames you reused**.
2. Confirm the copy locks and §7 - especially the rate parameterisation, the disclosure lock, and the no-price-on-the-product rule - before writing any frame.
3. Reuse `shared/`; build **`02-tile-grid` first**. Get the single-tile flame timing exactly right - it is the creative core and every other frame is downstream of whether that moment lands.
4. Build `01-product-flat`, then `04-category-tiles`; re-parameterise 03, 05 (plus `05-alt-no-figure`) and 06.
5. Build the animatic in `index.html`: exact durations from §5, summing to **15.0s**.
6. Write `README.md`: tokens used, frames reused vs new, **the exact file and line to edit to change the entry rate (shared with `50k-from-1499`)**, how to render the `?alt` cut, and the ⚠ items outstanding (Credit sign-off on the rate, category names against the live catalogue, product photograph availability, wordmark asset).
7. **Self-review:** animatic totals exactly 15.0s · every copy string matches §5 character-for-character · **the rate is defined in exactly one place and shared with `50k-from-1499`** · **the disclosure is inseparable from the figure at 9:16, 4:5 and 1:1, legible at 26px+, and leads with `PACKAGE RATE`** · `From` present in the on-screen figure line · **no price appears anywhere near the product image** · no model name anywhere · "Subject to credit approval" on frames 03, 05 and 06 · **frame 02 has exactly one flame element and no other motion after the tiles appear** · frame 01 holds completely still and carries no text for its first 1.5s · safe area clear (top 250px / bottom 320px) · `?record` clean at 1080×1920 · `?alt` renders the figure-free cut · `prefers-reduced-motion` degrades to fades.
