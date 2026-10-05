# Claude Code Prompt - HireHospo 15s Ad "Lease Signed, Kitchen Empty": Animated Visual Frames

> How to use: open Claude Code in the HireHospo folder with the script, storyboard, audio brief,
> and any HireHospo brand assets (kit, wordmark, product photos, `active-products.csv`) present.
> Paste everything below the line.

---

## 1. Role
You are a front-end motion engineer who designs. You build self-contained animated HTML with no build step.

## 2. Mandate
Build the animated frames and a stitched **15.0s animatic at 1080×1920** for the HireHospo "Lease Signed, Kitchen Empty" ad. Person-free motion graphics plus real equipment imagery.

## 3. Inputs
- `HireHospo_cloud-kitchen-empty-lease_script_15s.md` and `HireHospo_cloud-kitchen-empty-lease_storyboard.md` (the build spec; the storyboard's shot list is authoritative for timing).
- Any HireHospo kit or brand asset in the folder. If one exists it is the source of truth and overrides section 4.
- No named product in this ad: equipment is drawn as simple category icons (fryer, griddle) in the token palette. Never label an icon with a brand or model.

## 4. Design system (provisional; a real kit wins)
Tokens: canvas `#12141A` · surface `#1C1F26` · line `#2A2E37` · ink `#F4F4F2` · ink2 `#B9BDC7` · mute `#838896` · flame `#FF9B2E` (the only "go" fill) · flamedark `#D97C14` · warmtint `#2A2318` · approve `#58C97B` (ticks only) · accentink `#14161A` (text on flame).
Type: Space Grotesk (display) · Inter (body) · **JetBrains Mono for money, terms and chips** (uppercase, 0.08em tracking).
Rules: one flame highlight per frame at most. Brushed-steel gradient only on plinth frames. Motion uses transform and opacity only, ~0.5s ease-out settles, a stamp settle for badges, and respects `prefers-reduced-motion`. **Never redraw the logo.** Use the wordmark asset; if none exists, set "HireHospo" in Space Grotesk 600 and ⚠-flag it in the README.

## 5. What to build - per-frame contract (copy locked verbatim)
| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-empty-kitchen.html` | Hook | 0:00-0:02.5 (2.5s) | `LEASE: SIGNED ✓` · `KITCHEN: EMPTY` · caption "Lease signed. Kitchen still empty?" | Kitchen fades in 0.4s; chips settle at 0.6s and 1.2s; flame on EMPTY |
| `frames/02-zero-counters.html` | Agitate | 0:02.5-0:07 (4.5s) | `FRYERS 0` · `GRIDDLE 0` · `ORDERS 0` · `RENT: DUE` · caption "No fryers, no griddle, no orders. And the rent's still due." | Counters fade in at 0.2/0.7/1.2s; rent line ticks in at 2.2s with flame |
| `frames/03-approval-timeline.html` | Bridge | 0:07-0:10 (3.0s) | Wordmark · `APPLY` → `CREDIT CHECK` → `APPROVED` · `24-48 HOURS` · captions "HireHospo." / "Approved in 24 to 48 hours." | Hard reset; wordmark 0.4s; steps tick from 1.5s (0.25s each); flame on APPROVED |
| `frames/04-kitchen-fills.html` | Proof | 0:10-0:13 (3.0s) | `DELIVERED IN 1-3 BUSINESS DAYS` · `AFTER DEPOSIT` · `REFURBISHED · WITH WARRANTY` · `INSTALLED & SERVICED BY WASHPRO` · caption "Delivered in 1 to 3 business days." | Fryer + griddle icons drop at 0.2s and 0.6s; counters flip off zero at 1.5s; no flame |
| `shared/frame-end-card.html` | CTA | 0:13-0:15 (2.0s) | Wordmark · "Premium kitchen equipment, refurbished and warranted, on low weekly payments." · pill **Apply now** · `Approved in 24 to 48 hours · Subject to credit approval` · `hirehospo.com` · caption = the final VO line | Pill settles 0.4s; flame pill with accentink text |

Copy locks: approved claims only. Never add "+ GST" anywhere. No weekly or daily payment figure for a specific product. Say "dishwasher", never "glasswasher", if any dishwasher appears. "Subject to credit approval" appears on the end card. Do not add "instant", "guaranteed", "no credit checks" or any urgency wording.

## 6. Deliverable structure
```
ad/cloud-kitchen-empty-lease/
  index.html            # contact sheet + 15.0s animatic player
  frames/*.html
  shared/tokens.css  shared/stage.js  shared/frame-end-card.html
  README.md             # how to record, asset blockers, ⚠ flags
```

## 7. Constraints
- Self-contained: Tailwind + Google Fonts CDN, vanilla JS, no build step.
- On-system only: dark steel, flame as the only go-fill, money in mono, one flame highlight per frame at most.
- NZ English.
- Compliance: approved claims only; price bands real and ⚠-verified; no approval hype; roles clean (financed by HireHospo, delivered/installed/serviced by Washpro).
- Safe area: clear the top 250px and bottom 320px; hero elements in the central 60%. Burned-in captions bottom-centre inside the safe zone.
- Recordable at a true 1080×1920 with `?record` (hides UI chrome, autoplays once, no cursor).
- Original work.

## 8. Process
1. Read the assets and storyboard. Confirm the tokens (kit vs provisional), the copy locks and the compliance gates.
2. Build `shared/` first, then the frames in order, then the animatic in `index.html`, then the README.
3. Self-review before handing back:
   - animatic is exactly 15.0s
   - copy is verbatim
   - the credit-approval microcopy is present, and neither "+ GST" nor "glasswasher" appears anywhere
   - any named product is a real active catalogue unit (or the placeholder is flagged)
   - one flame highlight per frame at most
   - safe area respected
   - `?record` runs clean
