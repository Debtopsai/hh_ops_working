# Storyboard - HireHospo "Fit-Out Bigger Than the Budget" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** HireHospo_cafe-fitout-budget_script_15s.md · **Hook** (common mistake, new cafe, Problem Aware) · **PAS**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now

## Shot list
| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01.5 | GFX quote bars | Two mono bars on canvas; labels left | `FIT-OUT QUOTE` · `BUDGET` | "Fit-out quote…" | Music in low | Open |
| 2 | 0:01.5-0:03 | GFX overshoot | Quote bar overshoots the budget bar's end marker, flame fill on the overshoot | **gap in flame** | "…bigger than your budget?" | Whoosh | Hard cut |
| 3 | 0:03-0:05 | GFX category grid | Three category tiles drop in, prices in mono | `COMMERCIAL DISHWASHER $2,000-$20,000` · `CONVECTION OVEN $2,800-$8,300` · `DEEP FRYER $1,900-$7,000` | "Dishwasher, oven, fryer." | Three light thuds; cafe ambience | Cut on third tile |
| 4 | 0:05-0:07 | GFX one cheque | Tiles collapse into one cheque slip; stamp lands | `ONE CHEQUE` (flame stamp) | "One cheque before your first coffee." | Till tick | **Hard reset** |
| 5 | 0:07-0:08.5 | GFX wordmark | Clean steel; wordmark resolves; cheque tears into weekly strips | HireHospo wordmark | "HireHospo finances it." | Music lift; paper tear | Cut |
| 6 | 0:08.5-0:10 | GFX ceiling | Big mono figure settles | **UP TO $50,000** (flame) | "Up to $50,000." | Till tick | Cut |
| 7 | 0:10-0:12.5 | EQUIP hero plinth + badge | Real convection oven rises on steel plinth; condition chip stamps; payment line fades up; Washpro chip at foot | `<BRAND> · CONVECTION OVEN` ⚠ · `REFURBISHED · WITH WARRANTY` · **low weekly payments** (flame) · `DELIVERED, INSTALLED & SERVICED BY WASHPRO` | "Refurbished, with warranty. Low weekly payments." | Soft stamp; rack clack | Cut |
| 8 | 0:12.5-0:13.5 | GFX approval timeline (compact) | APPLY → CREDIT CHECK → APPROVED (approve-green tick) → DELIVERED 1-3 DAYS | `DELIVERY 1-3 BUSINESS DAYS AFTER DEPOSIT` | "Apply now." | UI ticks | Cut |
| 9 | 0:13.5-0:15 | End card | Standard end card | **Apply now** · *Approved in 24 to 48 hours · Subject to credit approval* | "Subject to credit approval." | Button tick; music resolves | End |

## Frames to build (Claude Code hand-off)
Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuses the standard frames where possible.
| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| quote-bars (new, reusable) | Shots 1-2 | #12141A | two mono bars + labels | bars grow 0.8s; overshoot flame fill 0.3s | No figures on the bars |
| category-grid | Shots 3-4 | #12141A | 3 category tiles with mono bands → cheque slip + stamp | tiles drop 0.25s each; collapse 0.4s; stamp 0.35s | Flame only on the ONE CHEQUE stamp; bands ⚠-verified |
| wordmark + ceiling | Shots 5-6 | #1C1F26 steel | wordmark; cheque tearing into strips; UP TO $50,000 | tear 0.5s; figure settle 0.4s | Flame on the figure only |
| hero-plinth + refurb badge | Shot 7 | brushed-steel gradient | convection oven cut-out + chips + payment line + Washpro chip | rise 0.5s; stamp 0.35s; line fade 0.4s | Flame on "low weekly payments" only; real active product |
| approval-timeline (compact) | Shot 8 | #12141A | 4 mono steps | ticks 0.2s each | No flame |
| end-card | Shot 9 | #12141A | standard end card | pill settle 0.4s | All microcopy guaranteed |

## Production notes
- Dark frames throughout (#12141A). Flame #FF9B2E is the only "go" fill. **One flame highlight per frame at most:** the quote overshoot, ONE CHEQUE, UP TO $50,000, "low weekly payments", the Apply now pill. Money and terms in mono.
- Equipment shots use a real active catalogue product (brand + category chip, product page linked in the hand-off). No invented models or specs. ⚠ Unit still to be selected.
- Wordmark at the bridge and end card only. Never redraw the logo; use the site asset or set "HireHospo" in Space Grotesk and ⚠-flag it.
- No "+ GST" anywhere. No weekly or daily payment figure for a specific product.
- Caption every spoken line, burned in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)
Top 250px clear (chips and labels start at y≈300). Bottom 320px clear (captions at y≈1450-1560; Washpro chip and footnotes sit above the captions). Hero elements in the central 60% width. ✓

## Hold-rate
Hard visual reset at 0:07 (dim problem frames → bright steel). Body cuts every 1.5-2.5s. ✓

## Audit
9 shots (budget 8-10) ✓ · timing sums to 15.0s ✓ · cuts land on reveals and stamps ✓ · one flame per frame max ✓ · end card carries Apply now + "Approved in 24 to 48 hours · Subject to credit approval" ✓ · no "+ GST" ✓.

## Aspect variants
- **4:5 (1080×1350):** tighten the vertical gaps; stack chips two-up.
- **1:1 (1080×1080):** drop the compact approval timeline if present (its delivery microcopy moves to the end card) and give its time to the proof frame.

## Hand-off
Build in Claude Code with `claude-code-prompt-hirehospo-cafe-fitout-budget-frames.md`. First drop in the chosen product's cut-out photo and the HireHospo wordmark asset.
