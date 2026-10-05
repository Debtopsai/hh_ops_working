# HireHospo · "Rational Without the $20K" · 15s animated frames

Person-free motion graphics, 9:16 at 1080×1920. Self-contained HTML (Google Fonts CDN plus vanilla JS). There is no build step.

```
index.html                     contact sheet + 15.0s animatic player
frames/01-quote-shock.html     Hook         0:00.0–0:03.0  3.0s
frames/02-bank-ledger.html     Agitate      0:03.0–0:07.0  4.0s
frames/03-hero-plinth.html     Bridge       0:07.0–0:08.5  1.5s
frames/04-refurb-badge.html    Bridge       0:08.5–0:10.0  1.5s
frames/05-capital-ledger.html  Proof        0:10.0–0:12.5  2.5s
frames/06-approval-timeline.html CTA lead-in 0:12.5–0:13.5 1.0s
shared/frame-end-card.html     CTA          0:13.5–0:15.0  1.5s
shared/tokens.css              provisional tokens, type, motion keyframes
shared/stage.js                stage fit, timeline clock, play/seek, URL flags
shared/hero-oven-placeholder.svg  neutral silhouette (swap for the real cut-out)
```

## ⚠ Blockers and flags (fix before paid use)

1. **BLOCKER: the hero oven is unverified.** The folder has no `active-products.csv`, no catalogue export and no product photo. Frames 03 and 04 therefore show a neutral placeholder silhouette labelled `HERO RATIONAL COMBI - TBC`. No model name or spec has been invented.
   - `data/machines.csv` lists Rational units on customer contracts (for example SCC WE101). These are contract records, not active catalogue listings, and carry no sale price, so they were **not** used.
   - The `hirehospo-products` skill gives a combi-oven band of $2,700–$33,000. That makes $20,000 plausible, but it does not verify a real unit.
   - **To clear the blocker:** pick an *active* Rational combi priced near $20,000 from the live catalogue. Replace `shared/hero-oven-placeholder.svg`, or swap the `<img>` in frames 03 and 04 for the cut-out photo. Remove the `.tbc` label and record the product-page link (`https://www.hirehospo.com/products/<handle>`) here. If the unit is not near $20,000, the hook figure in frames 01 and 02 has to change too.
2. **⚠ Wordmark is set type, not the logo.** No wordmark asset is in the repo, so "HireHospo" is set in Space Grotesk 600 on frame 03 and the end card. Replace it with the live-site wordmark asset. Do not redraw it.
3. **⚠ Provisional design system.** No HireHospo UI kit exists. The tokens come from the prompt and match `.claude/skills/hirehospo-ad-factory/references/hirehospo-brand.md` §10. A real kit wins.
4. **⚠ Missing inputs.** `HireHospo_rational-without-20k_script_15s.md`, `HireHospo_rational-without-20k_storyboard.md` and the audio brief are not in the repo. Timing and copy were built from the frame contract table in the Claude Code prompt. Re-check both against the storyboard once it is committed.
5. **⚠ Approved claim.** The $20,000 capital-preservation frame is on the approved-claims table, but it stays flagged until item 1 is cleared.

## Decisions where the brief and the brand reference differ

- **No GST suffix anywhere.** The brief forbids it, and the ad shows no payment figure, so nothing requires one. ("low weekly payments" is a phrase, not a figure.)
- **APPROVED on frame 06 uses a green tick, not flame.** The brief says "no flame" on that frame. The brand reference's reusable timeline lights APPROVED in flame, and the brief wins here.
- **Tailwind is not loaded.** It is permitted, not required. Plain CSS with tokens keeps frames deterministic for recording and avoids a runtime JIT.

## Compliance self-review

| Check | Result |
|---|---|
| Animatic length | 15.0s. Cuts measured in headless Chromium at 3.02 / 7.02 / 8.52 / 10.02 / 12.52 / 13.52, done at 15.02 (±1 display frame) |
| Copy verbatim | Every frame's copy matches the contract table. Captions are burned in, bottom-centre |
| "Subject to credit approval" | On the end card (subline and caption) |
| GST suffix / payment figure | Neither appears. The only figure is the $20,000 hook |
| Banned words | None of instant / guaranteed / no credit checks / urgency wording. No "glasswasher" (no dishwasher appears) |
| Roles | "HireHospo finances…" (frame 03); "DELIVERED, INSTALLED & SERVICED BY WASHPRO" (frame 05) |
| Flame per frame | 01 underline · 02 `−$20,000` · 03 none · 04 badge · 05 "low weekly payments" · 06 none · end pill |
| Money in mono | `$20,000` and `−$20,000` in JetBrains Mono |
| Steel gradient | Plinth frames 03 and 04 only |
| Safe area | All copy sits between y=384 and y=1570. Captions end 350px above the bottom edge (top 250 and bottom 320 kept clear). Check with `?guides` |
| Motion | transform and opacity only. ~0.5s ease-out settles, stamp settle on the badge, `prefers-reduced-motion` jumps to end states |
| Hero oven | ⚠ Placeholder (blocker 1) |

## Viewing

Open `index.html` in Chrome. It works straight from `file://`.

- **Play / Pause** (or Space), **Restart**, click the bar to scrub, and click a contact-sheet card to jump to that shot.
- **Safe area** overlays the keep-clear bands (red) and the central 60% (dashed).
- Open any frame on its own. It autoplays, and a click, R or Space replays it.

URL flags (on any frame, and `record` also on `index.html`):

| Flag | Effect |
|---|---|
| `?record` | No UI chrome, no cursor, true 1080×1920. `index.html?record` autoplays the 15.0s once after every frame has loaded, then sets `window.ANIMATIC_DONE = true` and `document.title = "DONE"` |
| `?t=1.2` | Freeze a frame at 1.2s, for stills and thumbnails (`frames/01-quote-shock.html?t=3` is the thumbnail) |
| `?guides` | Draw the safe area |
| `?embed` | Wait for the parent player (used internally) |

## Recording the 15.0s master

**Option A: screen recorder.** Set a 1080×1920 browser window (Chrome DevTools device mode at 1080×1920, DPR 1). Open `index.html?record` and record from load until the title shows DONE. Trim to 15.0s from the first frame.

**Option B: Playwright (headless, repeatable).**

```js
// record.mjs - node record.mjs  → ./out/*.webm  (convert: ffmpeg -i in.webm -r 30 -c:v libx264 -pix_fmt yuv420p -t 15 out.mp4)
import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1080, height: 1920 }, recordVideo: { dir: 'out', size: { width: 1080, height: 1920 } } });
const p = await ctx.newPage();
await p.goto('file://' + process.cwd() + '/index.html?record');
await p.waitForFunction(() => window.ANIMATIC_DONE === true, null, { timeout: 30000 });
await p.waitForTimeout(300);
await ctx.close(); await b.close();
```

Trim the lead-in (font and frame loading) so the master starts on the first frame of 01. For frame-perfect stills, use `?t=` on each frame.

Fonts load from Google Fonts with `display=block`, and the player waits for `document.fonts.ready` before it starts. Record online, or self-host the three families if you have to record offline.
