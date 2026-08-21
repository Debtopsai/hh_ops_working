# Claude Code Prompt - HireHospo 15s Ad "Friday, Seven O'Clock": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_friday-glasswasher_script_15s.md`,
> `HireHospo_friday-glasswasher_storyboard.md`, `HireHospo_friday-glasswasher_audio-brief.md`, and any
> HireHospo brand assets (UI kit, wordmark SVG, product photography, catalogue export) present.
> **If `ad/fitout-quote-shock/` already exists, read its `shared/` folder first - you are reusing it, not rebuilding it.**
> Paste everything below the line.

---

## 1. Role

You are a front-end motion engineer who designs. You build self-contained animated HTML frames - no build step, no framework, no bundler. Everything runs by opening the file.

## 2. Mandate

Build the animated frames and a stitched **15.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad "Friday, Seven O'Clock". **Person-free motion graphics + real equipment imagery** - no faces, no hands, no stock people. A bar interior may appear as environment; the subjects are a clock, a counter, a glasswasher and type.

## 3. Inputs

- `HireHospo_friday-glasswasher_script_15s.md` and `HireHospo_friday-glasswasher_storyboard.md` - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` if present - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline, the hero plinth and the refurb badge.** Six of nine shots in this ad are re-parameterised versions of frames that already exist. Do not fork them; extend their parameters.
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export in the folder - **if present, these are the source of truth and override §4 entirely.**
- Any catalogue export (`active-products.csv`) - for the real glasswasher category name, price band and product-page handles.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / panels ("steel")
line      #2A2E37   hairlines
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text
mute      #838896   captions / de-emphasis
flame     #FF9B2E   the ONLY "go" fill: CTA, APPROVED, the key figure highlight
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface (benefit chips, footnote bands)
approve   #58C97B   small approval ticks only (never a fill)
accentink #14161A   text on a flame surface - always
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for all money, terms and chips** (uppercase, 0.08em tracking).
- **One flame highlight per frame.** In this ad the flame logic is strict and meaningful: **a dead machine and a rising problem count get no flame.** Frames `02-dead-machine` and `03-count-up` carry none. Do not "improve" this.
- Brushed-stainless gradient permitted **only** on the plinth frame.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.** Use the wordmark asset, or set "HireHospo" in Space Grotesk semibold and **⚠-flag it in the README**.

## 5. What to build - per-frame contract

Copy below is **verbatim and locked**. Do not rewrite, shorten, "improve", or add to it.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-timestamp.html` | Shot 1 · 0:00-0:02 | 2.0s | `FRI 19:04` | Clock sets on load; the flame colon blinks **once** at 0.6s and then stops. Nothing else moves. The stillness is the design |
| `frames/02-dead-machine.html` | Shot 2 · 0:02-0:03.5 | 1.5s | *(no text; one dead indicator dot in `mute`)* | Slow 1% push-in only. **No flame in this frame** |
| `frames/03-count-up.html` | Shots 3-4 · 0:03.5-0:07 | 3.5s | `240 GLASSES` · `HAND-WASH` | Counter runs 0→240 over 2.2s and **keeps incrementing past the end of the VO line**; `HAND-WASH` resolves in `mute` at 2.0s. **No flame in this frame** |
| `frames/04-approval-timeline.html` | Shot 5 · 0:07-0:09 | 2.0s | `HireHospo` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS · AFTER DEPOSIT` · `Subject to credit approval` | **Hard reset** - full layout change. **REUSE** the `fitout-quote-shock` component with the DELIVERED step re-parameterised to carry `· AFTER DEPOSIT` |
| `frames/05-hero-plinth.html` | Shots 6-7 · 0:09-0:11.5 | 2.5s | `GLASSWASHERS` / `$2,300-$4,000` · `REFURBISHED · WITH WARRANTY` | **REUSE** the plinth component. Plinth push-in 2%; wash-cycle indicator lights come up over 0.4s; badge stamps on at 1.5s (scale 1.08 → 1.0, 0.25s) |
| `frames/06-entry-figure.html` | Shot 8 · 0:11.5-0:13 | 1.5s | `From $4.66/day` · `+ GST · SUBJECT TO CREDIT APPROVAL` | **NEW.** Figure scales 0.94 → 1.0 with a flame underline wipe; footnote fades in at +0.15s. **The footnote must be a DOM child of the figure block** - see §7 |
| `frames/07-end-card.html` | Shot 9 · 0:13-0:15 | 2.0s | `HireHospo` · `Premium kitchen equipment, refurbished and warranted, on low weekly payments.` · `Get our latest stock list today` · `REFURBISHED · WITH WARRANTY · + GST · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged. Pill scales 0.96 → 1.0; microcopy fades at +0.2s; holds still from 1.0s |

**Continuity requirement:** the glasswasher in `05-hero-plinth` must be **the same machine** as the unlit one in `02-dead-machine`, now lit and running. Use the same source image, relit - not a different product shot. This visual rhyme is the ad's payoff and it works with the sound off.

## 6. Deliverable structure

```
ad/friday-glasswasher/
  index.html                 contact sheet (all frames, static) + the 15s animatic player
  frames/01-timestamp.html … 07-end-card.html
  shared/ -> ../fitout-quote-shock/shared/   (reuse; copy only if a relative link is impractical)
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS only. No build step, no npm, no framework.
- **On-system:** dark steel, flame as the only go-fill, mono for money, one flame highlight per frame - and **none** on frames 02 and 03.
- **NZ English** throughout.
- **Compliance - non-negotiable, check every frame:**
  - **The `$4.66/day` figure and its `+ GST · SUBJECT TO CREDIT APPROVAL` footnote are one indivisible block.** Render the footnote as a DOM child of the same container as the figure, with no independent animation, no separate opacity timeline, and no reflow that could separate them at any aspect ratio. If the figure is visible, the footnote is visible. Assert this in your self-review.
  - **Do not name a glasswasher model anywhere near the figure.** The plinth chip shows the **category** (`GLASSWASHERS`) and the price band only. A model name beside a daily figure reads as a per-product price quote and breaches HireHospo's credit gate: pricing is only shared after credit approval.
  - **"$4.66/day" is the only approved daily figure and it belongs to this ad only** - glasswashers are one of the three cheapest categories where it is believable. Never generate a different daily or weekly figure, for any product, in any frame.
  - **"Delivered in 1 to 3 business days" keeps its "after deposit" qualifier** - timing is load-bearing in this ad. Do not drop it in any cut or aspect variant.
  - **"Subject to credit approval"** appears on frame 04, frame 06 and frame 07.
  - No approval hype ("guaranteed", "instant", "everyone approved"), no pressure ("act now", "limited time", countdowns, and **no ticking-clock urgency device beyond the single static timestamp in frame 01**), no discount-shop language ("cheap", "bargain", "slashed").
  - **Roles clean:** HireHospo finances. Washpro sources, refurbishes, delivers, installs and services.
  - **Never invent a model number, capacity, or spec.**
- **Recordable:** `?record` renders a true 1080×1920 stage with no chrome, no scrollbars, no cursor, and starts the timeline on load.
- **Original work:** build the type and layout yourself.

## 8. Process

1. Read the script, storyboard, and `ad/fitout-quote-shock/shared/` if it exists. **Confirm in the README which token set you used** and **which frames you reused rather than rebuilt**.
2. Confirm the copy locks and the compliance gates in §7 - especially the footnote lock - before writing any frame.
3. Reuse `shared/`; build `06-entry-figure` first (it carries the compliance risk, so get it right while you have the most attention).
4. Build the remaining new frames 01 → 03, then re-parameterise 04, 05 and 07.
5. Build the animatic in `index.html`: frames in sequence at the exact durations in §5, summing to **15.0s**.
6. Write `README.md`: tokens used, frames reused vs new, the ⚠ items still needing verification (glasswasher price band against the live site, glasswasher product photo availability, wordmark asset availability, client sign-off on the illustrative "240 glasses" scene device), and screen-record instructions.
7. **Self-review before you finish:** animatic totals exactly 15.0s · every copy string matches §5 character-for-character · **the `+ GST · SUBJECT TO CREDIT APPROVAL` footnote is inseparable from the figure at 9:16, 4:5 and 1:1** · "Subject to credit approval" on frames 04, 06 and 07 · "after deposit" present on frame 04 · no model name adjacent to the figure · no weekly figure anywhere · one flame highlight per frame, none on 02 and 03 · the shot-2 and shot-6 glasswasher are the same machine · all content inside the safe area (clear top 250px / bottom 320px) · `?record` renders clean at 1080×1920 · `prefers-reduced-motion` degrades to fades.
