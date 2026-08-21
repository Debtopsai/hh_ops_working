# Claude Code Prompt - HireHospo 20s Ad "You Can Afford The Oven": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with `HireHospo_rational-without-20k_script_20s.md`,
> `HireHospo_rational-without-20k_storyboard.md`, `HireHospo_rational-without-20k_audio-brief.md`, and any
> HireHospo brand assets (UI kit, wordmark SVG, product photography, catalogue export) present.
> **If `ad/fitout-quote-shock/` already exists, read its `shared/` folder first - you are reusing it, not rebuilding it.**
> Paste everything below the line.

---

## 1. Role

You are a front-end motion engineer who designs. You build self-contained animated HTML frames - no build step, no framework, no bundler. Everything runs by opening the file.

## 2. Mandate

Build the animated frames and a stitched **20.0s animatic** at **1080×1920 (9:16)** for the HireHospo ad "You Can Afford The Oven". **Person-free motion graphics + real equipment imagery** - no faces, no hands, no stock people. The subjects are type, a ledger, a runway bar, and one combi oven.

## 3. Inputs

- `HireHospo_rational-without-20k_script_20s.md` and `HireHospo_rational-without-20k_storyboard.md` - **the build spec.** The storyboard's "Frames to build" table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` if present - **reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the approval timeline, the hero plinth and the refurb badge.** Four of eleven shots are re-parameterised versions of frames that already exist. Do not fork them; extend their parameters.
- Any HireHospo UI kit, brand book, wordmark asset, or SwipePages export in the folder - **if present, these are the source of truth and override §4 entirely.**
- Any catalogue export (`active-products.csv`) - to confirm the Rational combi is active and to get its real product-page handle.

## 4. Design system (provisional - a real kit in the folder WINS)

```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / panels ("steel")
line      #2A2E37   hairlines
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text
mute      #838896   captions / de-emphasis / dimmed statement line
flame     #FF9B2E   the ONLY "go" fill: CTA, APPROVED, the key figure highlight
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface (benefit chips, footnote bands)
approve   #58C97B   small approval ticks only (NEVER a fill)
accentink #14161A   text on a flame surface - always
```

- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for all money, terms and chips** (uppercase, 0.08em tracking).
- **One flame highlight per frame.** Frames `02-capital-hit`, `03-pause` and `06-capital-ledger` carry **none**. The capital hit gets no "go" colour; the ledger frame's confirmation is `approve` green, small, and never a fill. Do not "improve" this.
- Brushed-stainless gradient permitted **only** on the plinth frame.
- **Motion:** transform + opacity only. Settles ~0.5s ease-out. Respect `prefers-reduced-motion`.
- **Logo: never redraw or invent a logomark.** Use the wordmark asset, or set "HireHospo" in Space Grotesk semibold and **⚠-flag it in the README**.

## 5. What to build - per-frame contract

Copy below is **verbatim and locked**. Do not rewrite, shorten, "improve", or add to it.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-statement.html` | Shots 1-2 · 0:00-0:04 | 4.0s | `You can afford the oven.` · `That's not the problem.` | Line 1 resolves over 0.5s and **holds, alone, for 1.5s on an otherwise empty frame**. At 2.0s it dims `ink` → `mute` and lifts 40px as line 2 lands beneath it in flame. Nothing else is on this frame at any point |
| `frames/02-capital-hit.html` | Shots 3-4 · 0:04-0:07.5 | 3.5s | `$20,000` · `26 WEEKS` · `SIX MONTHS` | Ledger figure decrements in 4 discrete steps over 1.4s. At 2.0s a 26-segment horizontal bar contracts left→right over 1.2s, segments extinguishing one by one; `26 WEEKS` cross-fades to `SIX MONTHS`. **No flame in this frame** |
| `frames/03-pause.html` | Shot 5 · 0:07.5-0:09 | 1.5s | *(no text - deliberate)* | The contracted bar holds. **Everything stops.** 1% scale drift over the full 1.5s and nothing else. **No flame** |
| `frames/04-approval-timeline.html` | Shot 6 · 0:09-0:11 | 2.0s | `HireHospo` · `APPLY` · `CREDIT CHECK` · `APPROVED` · `DELIVERED 1-3 BUSINESS DAYS` · `Subject to credit approval` | **Hard reset** - full layout change. **REUSE** the `fitout-quote-shock` component unchanged |
| `frames/05-hero-plinth.html` | Shots 7-8 · 0:11-0:14 | 3.0s | `RATIONAL SCC WE101` / `COMBI OVENS` · `REFURBISHED · WITH WARRANTY` | **REUSE** the plinth component. Plinth push-in 2%; a warm reflection travels the door glass over 1.2s; badge stamps on at 1.5s (scale 1.08 → 1.0, 0.25s, 2° rotate correction) |
| `frames/06-timeline-compact.html` | Shot 9 · 0:14-0:15.5 | 1.5s | `APPROVED IN 24 TO 48 HOURS` | **NEW variant** of the timeline component: collapsed to a single line with `APPROVED` pre-lit; the hours resolve beneath it at 0.3s |
| `frames/07-capital-ledger.html` | Shot 10 · 0:15.5-0:17.5 | 2.0s | `OVEN IN THE KITCHEN` · `CAPITAL IN THE BUSINESS` | **NEW.** Two mono ledger lines. A small `approve` tick lands on line 1 at 0.3s and line 2 at 0.7s; both hold to the cut. **No VO over this frame - no caption either.** Ticks are small marks, never fills |
| `frames/08-end-card.html` | Shot 11 · 0:17.5-0:20 | 2.5s | `HireHospo` · `Premium kitchen equipment, refurbished and warranted, on low weekly payments.` · `low weekly payments + GST` · `Apply now` · `APPROVED IN 24 TO 48 HOURS · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** with the `low weekly payments + GST` line enabled. Pill scales 0.96 → 1.0; microcopy fades at +0.2s; holds still from 1.0s |

**The hardest frame is `01-statement`, and it is the one that matters most.** Its power comes from restraint: 1.5 seconds of a single sentence on an empty dark frame. Do not add a product shot, a background texture, a gradient sweep, an equipment silhouette, or any secondary motion. If it feels too empty while you are building it, it is correct.

## 6. Deliverable structure

```
ad/rational-without-20k/
  index.html                 contact sheet (all frames, static) + the 20s animatic player
  frames/01-statement.html … 08-end-card.html
  shared/ -> ../fitout-quote-shock/shared/   (reuse; copy only if a relative link is impractical)
  README.md
```

## 7. Constraints

- **Self-contained:** Tailwind CDN + Google Fonts + vanilla JS only. No build step, no npm, no framework.
- **On-system:** dark steel, flame as the only go-fill, mono for money, one flame highlight per frame - and **none** on frames 02, 03 and 07.
- **NZ English** throughout.
- **Compliance - non-negotiable, check every frame:**
  - **This ad contains no daily and no weekly payment figure, anywhere, in any frame.** Premium equipment leads with capital preservation, never a small number. If a frame seems to need a figure, it needs the ledger frame instead. **Do not generate "$4.66/day" or any other rate in this build** - that figure belongs only to the cheapest categories and only to the sibling ad `friday-glasswasher`.
  - `$20,000` is the **outright-purchase cost** - the thing the ad argues against. Never style it as a HireHospo price, never place it in flame, never put it near the CTA treatment.
  - **"+ GST"** appears on the end card, attached to the payment-model line.
  - **"Subject to credit approval"** appears on frame 04 and frame 08.
  - **`RATIONAL SCC WE101` must be an active catalogue product.** Verify before building. If it is not active, substitute another **active Rational combi from the catalogue** and update the chip - **never fall back to a generic "commercial combi oven"**, and never invent a model number, capacity, tray count, or spec.
  - No approval hype ("guaranteed", "instant", "everyone approved"), no pressure ("act now", "limited time", countdowns), no discount-shop language ("cheap", "bargain", "slashed"). **"Refurbished" is never apologised for or softened** - it appears only in the locked pair `REFURBISHED · WITH WARRANTY`.
  - **Roles clean:** HireHospo finances. Washpro sources, refurbishes, delivers, installs and services.
- **Recordable:** `?record` renders a true 1080×1920 stage with no chrome, no scrollbars, no cursor, and starts the timeline on load.
- **Original work:** build the type and layout yourself.

## 8. Process

1. Read the script, storyboard and `ad/fitout-quote-shock/shared/` if it exists. **Confirm in the README which token set you used** and **which frames you reused rather than rebuilt**.
2. **Verify the Rational SCC WE101 is active on the live catalogue before you build frame 05.** Note the outcome in the README.
3. Confirm the copy locks and the compliance gates in §7 before writing any frame.
4. Reuse `shared/`; build `01-statement` first and get the dim-and-lift timing exactly right - every other frame is downstream of whether that interrupt lands.
5. Build `02-capital-hit`, `03-pause`, `06-timeline-compact`, `07-capital-ledger`; then re-parameterise 04, 05 and 08.
6. Build the animatic in `index.html`: frames in sequence at the exact durations in §5, summing to **20.0s**.
7. Write `README.md`: tokens used, frames reused vs new, the ⚠ items still needing verification (Rational SCC WE101 active status and product-page handle, the Combi Ovens price band against the live site, combi product photo availability, wordmark asset availability), and screen-record instructions.
8. **Self-review before you finish:** animatic totals exactly 20.0s · every copy string matches §5 character-for-character · **no daily or weekly figure appears in any frame** · "+ GST" on frame 08 · "Subject to credit approval" on frames 04 and 08 · `$20,000` is never flame-styled and never adjacent to the CTA · the combi is a real active catalogue product with no invented spec · one flame highlight per frame, none on 02, 03 and 07 · frame 01 still has nothing on it but the sentence · frame 07 has no caption · all content inside the safe area (clear top 250px / bottom 320px) · `?record` renders clean at 1080×1920 · `prefers-reduced-motion` degrades to fades.
