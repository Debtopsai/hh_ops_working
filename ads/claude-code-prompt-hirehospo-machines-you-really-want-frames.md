# Claude Code Prompt - HireHospo 16s Comparison Ad "Get The Machines You Really Want": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo folder with the script, storyboard and audio brief for
> `machines-you-really-want`, plus any HireHospo brand assets and an SCC101 product cut-out.
> **If `ad/fitout-quote-shock/` exists, read its `shared/` folder first - reuse, don't rebuild.**
> Paste everything below the line.

---

## 1. Role
Front-end motion engineer who designs. Self-contained animated HTML frames, no build step, no framework.

## 2. Mandate
Build the frames and a stitched **16.0s animatic** at **1080×1920 (9:16)** for the HireHospo comparison ad **"Get the machines you really want. Without the $30k."** Person-free motion graphics plus one real product cut-out.

**This ad is beating a specific competitor:** a silent, static comparison card. We win on **rate of change** and on **sound**. Ten cuts in sixteen seconds, numbers that slam rather than count.

## 3. Inputs
- Script and storyboard - **the build spec.** The storyboard's frames table is the contract; the script's copy column is verbatim law.
- `ad/fitout-quote-shock/shared/` - reuse `tokens.css`, `stage.js`, `frame-end-card.html`, the hero plinth.
- Any HireHospo UI kit, brand book or wordmark asset - **if present, these override §4 entirely.**
- An SCC101 cut-out on transparent background. If absent, use a labelled placeholder at correct dimensions and **⚠-flag it** - do not substitute stock, an illustration, or a CSS drawing.

## 4. Design system (provisional - a real kit WINS)
```
canvas #12141A · surface #1C1F26 · line #2A2E37 · ink #F4F4F2 · ink2 #B9BDC7
mute #838896 · flame #FF9B2E (the ONLY "go" fill) · flamedark #D97C14
warmtint #2A2318 · approve #58C97B (small ticks only) · accentink #14161A
```
- **Type:** Space Grotesk (display) · Inter (body) · **JetBrains Mono for money, chips and terms**. The **hero line is display type, not mono** - it is a sentence.
- **The left column carries no flame at any point.** Not on `$30,000`, not on the conceded tick. Flame belongs to the right column's rate and to the payoff.
- **Motion:** transform + opacity only. **Elements slam in over 120ms - no easing in, no count-ups.** Respect `prefers-reduced-motion`.
- **Never redraw the logo.**

## 5. Per-frame contract (copy verbatim and locked)

| File | Shots | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-oven-split.html` | 1-2 · 0:00-0:02.5 | 2.5s | `RATIONAL SCC101` | Hard light-up at 0.0s, no fade. At 1.0s the cut-out duplicates and the two copies snap apart over 180ms. **Same source asset both sides, never mirrored** |
| `frames/02-compare.html` | 3-7 · 0:02.5-0:09 | 6.5s | `$30,000` · `✓ OWN IT DAY ONE` · `CAPITAL GONE` · `ONE MODEL` · `YOUR REPAIR RISK` · `FROM $27.00/DAY` · `CONSISTENT RESULTS, EVERY SERVICE` · `THE MENU YOU ACTUALLY WANT TO RUN` | Every element **slams** in over 120ms. `$30,000` at 0.0s, tick at 0.6s, three crosses at 1.5s 200ms apart, `FROM $27.00/DAY` at 2.5s in flame, outcome lines at 4.5s and 5.5s |
| `frames/03-hero-line.html` | 8 · 0:09-0:11.5 | 2.5s | `GET THE MACHINES YOU REALLY WANT` | **Both columns clear the frame first.** Line resolves over 0.4s, then holds **dead still** for 2.1s. **Nothing else is in this frame at any point** |
| `frames/04-payoff.html` | 9 · 0:11.5-0:13.5 | 2.0s | `WITHOUT THE $30K` · `KEEP YOUR CAPITAL` · `KEEP YOUR CASHFLOW` · `OWN IT AT END OF TERM` | `$30K` strikes through, draw L→R over 0.3s, in flame. Three benefit chips fire beneath, 200ms apart |
| `frames/05-end-card.html` | 10 · 0:13.5-0:16 | 2.5s | `HireHospo` · `Get our latest stock list today` · `FULLY SERVICED · WITH WARRANTY · SUBJECT TO CREDIT APPROVAL` · `hirehospo.com` | **REUSE** unchanged. Pill scales 0.96 → 1.0 |

**`03-hero-line` is the ad.** It will feel wrong to leave the frame that empty for two and a half seconds. It is correct. Do not add the oven behind it, a background texture, a chip, a gradient sweep, or any secondary motion. The line lands precisely because everything else just left.

## 6. Deliverable
```
ad/machines-you-really-want/
  index.html · frames/01-oven-split.html … 05-end-card.html
  shared/ -> ../fitout-quote-shock/shared/
  README.md
```

## 7. Constraints
- Tailwind CDN + Google Fonts + vanilla JS. No build step, no npm, no framework.
- **NZ English.**
- **Compliance:**
  - **No arithmetic, totals or working anywhere.** No term maths, no "36 months × $189". Sales does the maths after credit approval.
  - **No GST line anywhere** - removed by client direction. Do not reinstate.
  - **`from $27.00/day`** must keep **"from"** and match the HireHospo portal brochure exactly.
  - **`$30,000` is the buy-outright price** - the thing the ad argues against. Never style it as a HireHospo figure, never in flame.
  - **`✓ OWN IT DAY ONE` must stay** on the left column. Conceding one true point is what stops the comparison reading as rigged.
  - **`CONSISTENT RESULTS, EVERY SERVICE`** is a capability statement, not a results guarantee. Do not escalate the wording.
  - **Never add** "stays off your balance sheet" or "change or upgrade at any time" - both are excluded, and why is in the script's claim check.
  - **"Subject to credit approval"** on the end card. Single CTA. No approval hype, no pressure, no discount language.
  - **Roles clean:** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
- **Recordable:** `?record` renders a true 1080×1920 stage, no chrome, no scrollbars, no cursor.
- **Original work.** Do not trace the reference ad's layout - we are beating it, not copying it.

## 8. Process
1. Read the script, storyboard and `shared/`. Note in the README which tokens and which reused frames.
2. Confirm copy locks and §7 before writing any frame.
3. Build **`03-hero-line` first** - get the empty frame and the dead-still hold right, because everything else is downstream of whether that lands.
4. Then `04-payoff` (the strike-through is the ad's key motion), then `02-compare`, then `01-oven-split`, then reuse the end card.
5. Animatic: exact durations from §5, summing to **16.0s**.
6. `README.md`: tokens, reused vs new frames, and the ⚠ items (rate matches the portal, SCC101 cut-out availability, wordmark asset, GST-inclusive decision pending).
7. **Self-review:** animatic totals exactly 16.0s · copy matches §5 character-for-character · **frame 03 contains nothing but the line** · left column carries no flame anywhere · conceded tick present · **no arithmetic or GST line anywhere** · "from" present on the rate · "Subject to credit approval" on the end card · elements slam rather than ease · safe area clear (top 250px / bottom 320px) · `?record` clean · `prefers-reduced-motion` degrades to fades.
