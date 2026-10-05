# Claude Code Prompt - HireHospo 15s Ad "Food Truck Fryer From $4.66/Day": Animated Visual Frames

> How to use: open Claude Code in the HireHospo folder with the script, storyboard, audio brief,
> and any HireHospo brand assets (kit, wordmark, product photos, `active-products.csv`) present.
> Paste everything below the line.

---

## 1. Role
You are a front-end motion engineer who designs. You build self-contained animated HTML with no build step.

## 2. Mandate
Build the animated frames and a stitched **15.0s animatic at 1080×1920** for the HireHospo "Food Truck Fryer From $4.66/Day" ad. Person-free motion graphics plus real equipment imagery.

## 3. Inputs
- `HireHospo_truck-fryer-466_script_15s.md` and `HireHospo_truck-fryer-466_storyboard.md` (the build spec; the storyboard's shot list is authoritative for timing).
- Any HireHospo kit or brand asset in the folder. If one exists it is the source of truth and overrides section 4.
- The catalogue export (`active-products.csv`) for the hero product. **It must be an active product.** Use its real brand, category and product-page link. If no export or photo is present, build the plinth with a neutral placeholder silhouette labelled `HERO COMPACT FRYER - TBC` and list it in the README as a blocker. Never invent a model name or spec.

## 4. Design system (provisional; a real kit wins)
Tokens: canvas `#12141A` · surface `#1C1F26` · line `#2A2E37` · ink `#F4F4F2` · ink2 `#B9BDC7` · mute `#838896` · flame `#FF9B2E` (the only "go" fill) · flamedark `#D97C14` · warmtint `#2A2318` · approve `#58C97B` (ticks only) · accentink `#14161A` (text on flame).
Type: Space Grotesk (display) · Inter (body) · **JetBrains Mono for money, terms and chips** (uppercase, 0.08em tracking).
Rules: one flame highlight per frame at most. Brushed-steel gradient only on plinth frames. Motion uses transform and opacity only, ~0.5s ease-out settles, a stamp settle for badges, and respects `prefers-reduced-motion`. **Never redraw the logo.** Use the wordmark asset; if none exists, set "HireHospo" in Space Grotesk 600 and ⚠-flag it in the README.

## 5. What to build - per-frame contract (copy locked verbatim)
| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-price-hook.html` | Hook | 0:00-0:03 (3.0s) | `From $4.66/day` · `SUBJECT TO CREDIT APPROVAL` · captions "Food truck fryer?" / "From $4.66 a day." | Hatch glow fades in 0.4s; figure settles at 1.5s in flame; footnote fades in 0.3s after |
| `frames/02-truck-ledger.html` | Agitate | 0:03-0:07 (4.0s) | `TRUCK ACCOUNT` · `−$1,900 to −$7,000` · `STOCK` · `FUEL` · caption "Buying outright drains the cash your truck runs on." | Drop at 0.5s (0.4s) in flame; STOCK greys at 2.0s, FUEL at 2.6s |
| `frames/03-hero-plinth.html` | Bridge | 0:07-0:08.5 (1.5s) | Wordmark · `<BRAND> · DEEP FRYER` · caption "HireHospo finances refurbished fryers," | Hard reset; fryer rises 0.5s; no flame |
| `frames/04-refurb-badge.html` | Bridge | 0:08.5-0:10 (1.5s) | `REFURBISHED · WITH WARRANTY` · caption "with warranty." | Flame chip stamps (scale 1.15→1, 0.35s) |
| `frames/05-truck-chips.html` | Proof | 0:10-0:12.5 (2.5s) | `LPG CONVERSION AVAILABLE` · `INSTALLED & SERVICED BY WASHPRO` · `low weekly payments` · caption "LPG conversion available. Installed by Washpro." | Chips slide in at 0.3s and 0.9s; payment line fades up in flame at 1.4s |
| `frames/06-approval-timeline.html` | CTA lead-in | 0:12.5-0:13.5 (1.0s) | `APPLY` → `CREDIT CHECK` → `APPROVED` → `DELIVERED 1-3 DAYS` · microcopy `DELIVERY 1-3 BUSINESS DAYS AFTER DEPOSIT` · caption "Apply now." | Sequential ticks 0.2s each; approve-green tick on APPROVED; no flame |
| `shared/frame-end-card.html` | CTA | 0:13.5-0:15 (1.5s) | Wordmark · "Premium kitchen equipment, refurbished and warranted, on low weekly payments." · pill **Apply now** · `Approved in 24 to 48 hours · Subject to credit approval` · `hirehospo.com` · caption = the final VO line | Pill settles 0.4s; flame pill with accentink text |

Copy locks: approved claims only. Never add "+ GST" anywhere. No weekly or daily payment figure for a specific product. Say "dishwasher", never "glasswasher", if any dishwasher appears. "Subject to credit approval" appears on the end card. Do not add "instant", "guaranteed", "no credit checks" or any urgency wording.

## 6. Deliverable structure
```
ad/truck-fryer-466/
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
