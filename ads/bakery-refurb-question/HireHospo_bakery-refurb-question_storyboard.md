# Storyboard - HireHospo "Refurbished Mixer? Fair Question" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** HireHospo_bakery-refurb-question_script_15s.md · **Hook** (myth-busting objection, bakery, Product Aware) · **PAS ("you're half right" twist)**
**Total shots:** 9 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now

## Shot list
| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:01.5 | GFX mixer silhouette | Spiral mixer silhouette on dark steel, rim-lit | — | "Refurbished mixer?" | Mixer hum; music in low | Open |
| 2 | 0:01.5-0:03 | GFX objection | Question types out in mono over the silhouette | **WHAT IF IT BREAKS?** (flame on ?) | "What if it breaks?" | Hum stutters to a stop | Hard cut |
| 3 | 0:03-0:05 | GFX quote-shock | Range counts up in mono; flour dust | `BAKERY & DOUGH EQUIPMENT` · `$1,300-$17,000` (flame under 17,000) | "Fair. But new bakery gear…" | Count-up ticks; dough slap | Cut on lock |
| 4 | 0:05-0:07 | GFX up front | `UP FRONT` stamps under the range | `UP FRONT` | "…means thousands up front." | Till tick | **Hard reset** |
| 5 | 0:07-0:08.5 | EQUIP hero plinth | Brushed-steel plinth; real spiral mixer rises; wordmark above | HireHospo wordmark · `<BRAND> · SPIRAL MIXER` ⚠ | "HireHospo finances refurbished bakery gear…" | Music lift | Cut |
| 6 | 0:08.5-0:10 | GFX refurb badge | Condition chip stamps onto the mixer | `REFURBISHED · WITH WARRANTY` (flame stamp) | "…with warranty." | Soft stamp | Cut |
| 7 | 0:10-0:12.5 | GFX confidence pair | Two lines type out; payment line fades up; Washpro chip at foot | "Refurbished is why the payment is low. The warranty is why that's fine." · **low weekly payments** (flame) | "Low weekly payments, with warranty." | Two UI ticks | Cut |
| 8 | 0:12.5-0:13.5 | GFX approval timeline (compact) | APPLY → CREDIT CHECK → APPROVED → DELIVERED 1-3 DAYS | `DELIVERY 1-3 BUSINESS DAYS AFTER DEPOSIT` | "Apply now." | UI ticks | Cut |
| 9 | 0:13.5-0:15 | End card | Standard end card | **Apply now** · *Approved in 24 to 48 hours · Subject to credit approval* | "Subject to credit approval." | Button tick; music resolves | End |

## Frames to build (Claude Code hand-off)
Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuses the standard frames where possible.
| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| objection (new, reusable) | Shots 1-2 | #12141A + rim light | mixer silhouette + mono question | type-on 0.6s; flame on ? at end | Reusable for any "what if…" objection hook |
| quote-shock | Shots 3-4 | #12141A | range count-up + UP FRONT stamp + flour dust particles | count 0.7s; stamp 0.35s | Flame under 17,000 only; band ⚠-verified |
| hero-plinth + refurb badge | Shots 5-6 | brushed-steel gradient | spiral mixer cut-out + chip + wordmark; condition stamp | rise 0.5s; stamp 0.35s | No flame on shot 5 |
| confidence-pair | Shot 7 | #12141A | two typed lines + payment line + Washpro chip | type-on 0.5s per line; fade 0.4s | Flame on "low weekly payments" only |
| approval-timeline (compact) | Shot 8 | #12141A | 4 mono steps | ticks 0.2s each | No flame |
| end-card | Shot 9 | #12141A | standard end card | pill settle 0.4s | All microcopy guaranteed |

## Production notes
- Dark frames throughout (#12141A). Flame #FF9B2E is the only "go" fill. **One flame highlight per frame at most:** the question mark, the $17,000 underline, the refurb stamp, "low weekly payments", the Apply now pill. Money and terms in mono.
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
Build in Claude Code with `claude-code-prompt-hirehospo-bakery-refurb-question-frames.md`. First drop in the chosen product's cut-out photo and the HireHospo wordmark asset.
