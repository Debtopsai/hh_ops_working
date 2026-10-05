# Storyboard - HireHospo "Rational Without the $20K" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** HireHospo_rational-without-20k_script_15s.md · **Hook** (common mistake, restaurant owner, Problem Aware) · **PAS**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now

## Shot list
| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01.5 | GFX quote-shock | Oversized mono number counts $0 → $20,000; small chip above | **$20,000** (flame under digits) · `COMBI OVEN` | "Paying cash…" | Count-up ticks, music in low | Open |
| 2 | 0:01.5-0:03 | GFX receipt | Receipt slip prints up from below the number | `PAID IN FULL` | "…for a combi oven?" | Receipt printer whirr | Hard cut |
| 3 | 0:03-0:05 | GFX bank ledger | Mono ledger: balance line drops; `−$20,000` lands in flame | `BANK −$20,000` (flame) | "That's twenty grand…" | Till tick on the drop, music dips | Cut on drop |
| 4 | 0:05-0:07 | GFX ledger fade | `WAGES` and `STOCK` lines grey out one after the other; quiet, dim pass in soft focus behind | `WAGES` · `STOCK` | "…not paying wages, or stock." | Low service ambience | **Hard reset** |
| 5 | 0:07-0:08.5 | EQUIP hero plinth | Brushed-steel plinth; real Rational combi cut-out rises; wordmark above | HireHospo wordmark · `RATIONAL · COMBI OVEN` ⚠ | "HireHospo finances a refurbished Rational…" | Music lift | Cut |
| 6 | 0:08.5-0:10 | GFX refurb badge | Condition chip stamps onto the oven | `REFURBISHED · WITH WARRANTY` (flame stamp) | "…with warranty." | Soft stamp | Cut |
| 7 | 0:10-0:12.5 | GFX capital ledger | Two mono lines tick in turn; payment model below; Washpro chip at foot | `OVEN IN THE KITCHEN ✓` · `CAPITAL KEPT IN THE BUSINESS ✓` · **low weekly payments** (flame) · `DELIVERED, INSTALLED & SERVICED BY WASHPRO` | "Low weekly payments. Your capital stays put." | Two UI ticks; tray-rack clack | Cut |
| 8 | 0:12.5-0:13.5 | GFX approval timeline (compact) | APPLY → CREDIT CHECK → APPROVED (approve-green tick) → DELIVERED 1-3 DAYS | `DELIVERY 1-3 BUSINESS DAYS AFTER DEPOSIT` | "Apply now." | UI ticks | Cut |
| 9 | 0:13.5-0:15 | End card | Wordmark + offer line + flame **Apply now** pill + mono subline + hirehospo.com | **Apply now** · *Approved in 24 to 48 hours · Subject to credit approval* | "Subject to credit approval." | Button tick, music resolves | End |

## Frames to build (Claude Code hand-off)
Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuses the standard frames.
| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| quote-shock | Shots 1-2 | #12141A | mono $20,000 count-up + category chip + receipt slip | count 0.7s, flame underline snaps on lock; receipt slides up 0.4s | Thumbnail candidate; $20,000 ⚠ match to a real active Rational |
| bank-ledger (new, reusable) | Shots 3-4 | #12141A | mono ledger: balance drop + WAGES / STOCK lines | drop 0.4s; lines desaturate 0.3s each | Reusable for any capital-hit hook |
| hero-plinth | Shot 5 | brushed-steel gradient on #1C1F26 | Rational cut-out + brand/category chip + wordmark | rise 0.5s ease-out | No flame in this frame; real active product only |
| refurb-badge | Shot 6 | as shot 5 | condition chip stamp | stamp settle 0.35s | Flame on the stamp only |
| capital-ledger | Shot 7 | #12141A | two ticked lines + "low weekly payments" + Washpro chip | ticks 0.25s each; payment line fades up 0.4s | Flame on "low weekly payments" only; ticks in approve green |
| approval-timeline (compact) | Shot 8 | #12141A | 4 mono steps | sequential ticks 0.2s each | No flame (saved for the end card) |
| end-card | Shot 9 | #12141A | standard end card | pill settle 0.4s | The one place all microcopy is guaranteed |

## Production notes
- Dark frames throughout (#12141A). Flame #FF9B2E is the only "go" fill. **One flame highlight per frame:** the $20,000 underline, −$20,000, the refurb stamp, "low weekly payments", the Apply now pill. Shots 2, 4, 5 and 8 carry none. Money and terms in mono.
- Equipment shots use a real active Rational combi (brand + category chip, product page linked in the hand-off). No invented models or specs. ⚠ Unit still to be selected.
- Wordmark at the bridge (shot 5) and end card only. Never redraw the logo; use the site asset or set "HireHospo" in Space Grotesk and ⚠-flag it.
- No "+ GST" anywhere. No weekly or daily figure anywhere.
- Caption every spoken line, burned in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)
Top 250px clear (chip at y≈320). Bottom 320px clear (captions at y≈1450-1560; Washpro chip sits above the captions). Number, ledger and plinth in the central 60% width. ✓

## Hold-rate
Hard visual reset at 0:07 (dim ledger → bright steel plinth). Body cuts every 1-2.5s. ✓

## Audit
9 shots (budget 8-10) ✓ · timing sums to 15.0s ✓ · cuts land on the number lock, the receipt, the balance drop, the stamp and the ticks ✓ · one flame per frame max ✓ · end card carries Apply now + "Approved in 24 to 48 hours · Subject to credit approval" ✓ · no "+ GST" ✓ · no quoted payment figure ✓.

## Aspect variants
- **4:5 (1080×1350):** the receipt overlaps the number's lower edge; the ledger lines sit two-up.
- **1:1 (1080×1080):** drop shot 8 (its delivery microcopy moves to the end card) and give the 1s to shot 7.

## Hand-off
Build in Claude Code with `claude-code-prompt-hirehospo-rational-without-20k-frames.md`. First drop in the chosen Rational's cut-out photo and the HireHospo wordmark asset.
