# Claude Code Prompt - HireHospo 15s Ad "Up To Fifty Thousand": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_50k-from-1499_script_15s.md`,
> `HireHospo_50k-from-1499_storyboard.md`, `HireHospo_50k-from-1499_audio-brief.md`, and any HireHospo
> brand assets present. **If `ad/fitout-quote-shock/` exists, read its `shared/` folder first - you are
> reusing it, not rebuilding it.** Paste everything below the line.

---

## 1. Role

You are a front-end motion engineer who designs. You build self-contained animated HTML frames - no build step, no framework, no bundler.

## 2. Mandate

Build the animated frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad "Up To Fifty Thousand". **Person-free motion graphics + real equipment imagery.** The subjects are two numbers, a category grid, and type.

**⚠ This ad is blocked from publication pending Credit sign-off on the `$14.99/day` entry rate.** Build it; do not treat it as approved creative. Section 7 explains what that means for how you build.

## 3. Inputs

- `HireHospo_50k-from-1499_script_15s.md` and `HireHospo_50k-from-1499_storyboard.md` - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` if present - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline, the quote-shock frame and the refurb badge.**
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export - **if present, these override §4 entirely.**
- Any catalogue export (`active-products.csv`) - to confirm the four category names.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / panels ("steel")
line      #2A2E37   hairlines / dimmed tiles
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text
mute      #838896   captions / de-emphasis / the departing figure
flame     #FF9B2E   the ONLY "go" fill
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface (disclosure band)
approve   #58C97B   small approval ticks only (never a fill)
accentink #14161A   text on a flame surface - always
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for all money, terms, chips and the disclosure block**.
- **One flame highlight per frame.** Frames `03-figure-exit` carries **none**.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.**

## 5. What to build - per-frame contract

Copy below is **verbatim and locked**.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-ceiling.html` | Shots 1-2 · 0:00-0:04 | 4.0s | `$50,000` · `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` · `EVERYTHING ON THE LIST` | Figure counts 0→50,000 over 0.7s ease-out, flame underline snaps on lock; at 2.0s the figure lifts to the top third and four category tiles light behind it 150ms apart |
| `frames/02-figure-exit.html` | Shots 3-4 · 0:04-0:07 | 3.0s | `$50,000` · `OUT OF THE BUSINESS` | Figure desaturates `ink` → `mute` over 0.3s, then translates −1400px over 1.2s ease-in and leaves frame; tiles dim to `line`. **No flame.** The frame ends visibly emptier than it started - **do not fill the space** |
| `frames/03-approval-timeline.html` | Shot 5 · 0:07-0:09 | 2.0s | `HireHospo` · `FUNDING UP TO $50,000` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **Hard reset.** **REUSE** the component with the funding-ceiling line enabled |
| `frames/04-grid-relight.html` | Shots 6-7 · 0:09-0:11.5 | 2.5s | `COMBI OVENS` · `COMMERCIAL DISHWASHERS` · `RANGES` · `FOOD PREP` · `REFURBISHED · WITH WARRANTY` | The same four tiles relight one at a time, warmer than frame 01; badge stamps on at 1.5s (scale 1.08 → 1.0, 0.25s) |
| `frames/05-entry-figure.html` | Shot 8 · 0:11.5-0:13 | 1.5s | `Packages from $14.99/day` · `FUNDING UP TO $50,000 · PACKAGES FROM $14.99/DAY` · `YOUR PAYMENT DEPENDS ON EQUIPMENT VALUE AND TERM` · `+ GST · SUBJECT TO CREDIT APPROVAL` | Figure scales 0.94 → 1.0 with a flame underline wipe; the three-line disclosure fades in at +0.15s **inside the same container**. See §7 |
| `frames/06-end-card.html` | Shot 9 · 0:13-0:15 | 2.0s | `HireHospo` · `Premium kitchen equipment, refurbished and warranted, on low weekly payments.` · `Apply now` · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged |

**The category tiles in frames 01 and 04 must be the same four tiles in the same positions.** The relight is a visual rhyme that pays off the dimming in frame 02, and it only works if nothing moves between them.

## 6. Deliverable structure

```
ad/50k-from-1499/
  index.html                 contact sheet + the 15s animatic player
  frames/01-ceiling.html … 06-end-card.html
  shared/ -> ../fitout-quote-shock/shared/
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS only. No build step, no npm, no framework.
- **NZ English** throughout.
- **Compliance - non-negotiable:**
  - **Parameterise the entry rate.** `$14.99` must be defined **once**, as `--entry-rate` in `shared/tokens.css` (or a single JS constant), and read from there by frames 05 and 06. It must NOT be typed literally into more than one place. Credit is expected to change this number and changing it must be a one-line edit. **State in the README exactly which line to edit.**
  - **The three-line range disclosure block is mandatory and inseparable from the figure.** Render it as a DOM child of the same container as `Packages from $14.99/day`, with no independent animation, no separate opacity timeline, and no reflow that can separate them at any aspect ratio. Minimum 26px type at 1080 width. If the figure is visible, all three lines are visible. **This block is what makes the ceiling-and-floor juxtaposition lawful - it is not decoration.**
  - **"Packages from"** must appear in the on-screen figure line, not just the disclosure. The ad must never state or imply that $50,000 of equipment costs $14.99 a day.
  - **No product model name anywhere in this ad.** Categories only. A model beside a rate reads as a per-product quote and breaches the credit gate.
  - **"+ GST"** in the disclosure block and on the end card. **"Subject to credit approval"** on frames 03, 05 and 06.
  - No approval hype, no pressure, no discount-shop language. **"Refurbished" is never softened** - it appears only in the locked pair `REFURBISHED · WITH WARRANTY`.
  - **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
  - **Build a figure-free variant of frame 05** as `frames/05-alt-no-figure.html`, reading `low weekly payments + GST` instead of the rate, so the ad can be recut in minutes if Credit rejects the number. Wire it into the animatic behind a `?alt` flag.
- **Recordable:** `?record` renders a true 1080×1920 stage with no chrome, no scrollbars, no cursor.
- **Original work.**

## 8. Process

1. Read the script, storyboard and `ad/fitout-quote-shock/shared/`. **Confirm in the README which token set you used** and **which frames you reused**.
2. Confirm the copy locks and §7 - especially the rate parameterisation and the disclosure lock - before writing any frame.
3. Reuse `shared/`; build `05-entry-figure` **first** (it carries this ad's entire compliance risk) plus its `05-alt-no-figure` sibling.
4. Build `02-figure-exit`, then `01-ceiling` and `04-grid-relight` (build the tile grid once, use it in both), then re-parameterise 03 and 06.
5. Build the animatic in `index.html`: exact durations from §5, summing to **15.0s**.
6. Write `README.md`: tokens used, frames reused vs new, **the exact file and line to edit to change the entry rate**, how to render the `?alt` figure-free cut, and the ⚠ items outstanding (Credit sign-off on the rate, category names against the live catalogue, wordmark asset).
7. **Self-review:** animatic totals exactly 15.0s · every copy string matches §5 character-for-character · **the rate is defined in exactly one place** · **all three disclosure lines are inseparable from the figure at 9:16, 4:5 and 1:1, and legible at 26px+** · "Packages from" present in the on-screen figure line · no model name anywhere · "Subject to credit approval" on frames 03, 05 and 06 · one flame highlight per frame, none on 02 · the four tiles are identical and co-located in frames 01 and 04 · safe area clear (top 250px / bottom 320px) · `?record` clean at 1080×1920 · `?alt` renders the figure-free cut · `prefers-reduced-motion` degrades to fades.
