# Storyboard - HireHospo "Friday Dishwasher" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** HireHospo_friday-dishwasher_script_15s.md · **Hook** (high-stakes warning, bar / pub, Problem Aware) · **PAS**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now

## Shot list
| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01.5 | GFX status chip | Dark bar back-of-house, warm practical light; mono clock `FRI · 9:42PM` top-centre (below 250px) | `FRI · 9:42PM` | "Bar dishwasher died…" | Service ambience, music in low | Open |
| 2 | 0:01.5-0:03 | GFX status flip | Chip `DISHWASHER: OK` flips to **DOWN** (flame); glass racks stack behind, slightly out of focus | **DISHWASHER: DOWN** | "…on a Friday?" | Rack clack on the flip | Hard cut |
| 3 | 0:03-0:05 | GFX quote-shock | Mono number counts $0 → $2,300-$4,000 range | **$2,300-$4,000** (flame under 4,000) | "That's up to four grand," | Count-up ticks, music dips | Cut on lock |
| 4 | 0:05-0:07 | GFX till | Till-drawer line icon slides open; number drops into it, drawer reads empty | `OUT OF THE TILL` | "…out of the till." | Till/receipt tick | **Hard reset** |
| 5 | 0:07-0:08.5 | EQUIP hero plinth | Brushed-steel plinth; real active dishwasher (cut-out) rises; brand + category chip in mono | HireHospo wordmark · `<BRAND> · DISHWASHER` ⚠ | "HireHospo finances a refurbished dishwasher…" | Music lift | Cut |
| 6 | 0:08.5-0:10 | GFX refurb badge | `REFURBISHED · WITH WARRANTY` stamps onto the unit (flame stamp) | `REFURBISHED · WITH WARRANTY` | "…with warranty." | Soft stamp | Cut |
| 7 | 0:10-0:12.5 | GFX split | Left: $4,000 greys out. Right: **From $4.66/day** in flame; footnote band in warmtint; Washpro chip below | **From $4.66/day** · `SUBJECT TO CREDIT APPROVAL` · `DELIVERED, INSTALLED & SERVICED BY WASHPRO` | "From $4.66 a day." | Till tick on figure | Cut |
| 8 | 0:12.5-0:13.5 | GFX approval timeline (compact) | Four mono steps tick: APPLY → CREDIT CHECK → APPROVED (approve tick) → DELIVERED 1-3 DAYS | `DELIVERY 1-3 BUSINESS DAYS AFTER DEPOSIT` | "Apply now." | UI ticks | Cut |
| 9 | 0:13.5-0:15 | End card | Wordmark + offer line + flame **Apply now** pill + mono subline + hirehospo.com | **Apply now** · *Approved in 24 to 48 hours · Subject to credit approval* | "Subject to credit approval." | Button tick, music resolves | End |

## Frames to build (Claude Code hand-off)
Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuses the standard frames.
| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| status-down (new, simple) | Shots 1-2 | #12141A + warm vignette | mono clock + status chip OK→DOWN | chip flip 0.3s; flame fill on DOWN only | Reusable for any "it died" hook (fryer, dishwasher) |
| quote-shock | Shots 3-4 | #12141A | mono range count-up + till icon | count 0.7s, flame underline snaps on lock; till slide 0.4s | Thumbnail candidate; band ⚠-verified |
| hero-plinth | Shot 5 | brushed-steel gradient on #1C1F26 | real dishwasher cut-out + brand/category chip + wordmark | rise 0.5s ease-out | Real active product only; link its page |
| refurb-badge | Shot 6 | as shot 5 | condition chip stamp | stamp settle 0.35s | Flame on stamp only (so no flame on shot 5) |
| split | Shot 7 | #12141A | $4,000 grey-out left / From $4.66/day right + footnote band + Washpro chip | left desaturates 0.4s, right slides in 0.5s | Footnote must be legible ≥ 28px |
| approval-timeline (compact) | Shot 8 | #12141A | 4 mono steps | sequential ticks 0.2s each | APPROVED uses approve-green tick (flame saved for end card) |
| end-card | Shot 9 | #12141A | standard end card | pill settle 0.4s | The one place all microcopy is guaranteed |

## Production notes
- Dark frames throughout (#12141A). Flame #FF9B2E is the only "go" fill. **One flame highlight per frame:** DOWN, the 4,000 underline, the refurb stamp, $4.66/day, the Apply now pill. Money and terms in mono.
- Equipment shots use a real active dishwasher (brand + category chip, product page linked in the hand-off). No invented models or specs. ⚠ Unit still to be selected (see script claim check).
- Wordmark appears at the bridge (shot 5) and end card only. Never redraw the logo; use the site asset or set "HireHospo" in Space Grotesk and ⚠-flag it.
- Caption every spoken line, burned in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)
Top 250px clear (clock sits at y≈300). Bottom 320px clear (captions at y≈1450-1560, footnote band above captions). Hero numbers and plinth in the central 60% width. ✓

## Hold-rate
Hard visual reset at 0:07 (dark till → bright steel plinth). Body cuts every 1.5-2.5s. ✓

## Audit
9 shots (budget 8-10) ✓ · timing sums to 15.0s ✓ · cuts land on the status flip, the number lock, the stamp and the figure ✓ · one flame per frame ✓ · end card carries Apply now + "Approved in 24 to 48 hours · Subject to credit approval" ✓ · no "+ GST" ✓ · no "glasswasher" ✓.

## Aspect variants
- **4:5 (1080×1350):** stack the clock and chip tighter; the split becomes top/bottom.
- **1:1 (1080×1080):** drop shot 8 (the timeline's delivery microcopy moves onto the end card) and give its 1s to shot 7.

## Hand-off
Build in Claude Code with `claude-code-prompt-hirehospo-friday-dishwasher-frames.md`. Before the build, drop in the chosen dishwasher's cut-out photo and the HireHospo wordmark asset.
