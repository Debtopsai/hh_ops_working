# Storyboard - HireHospo "Lease Signed, Kitchen Empty" - 15s - Motion Graphics + Equipment Imagery (no people)

**Script:** HireHospo_cloud-kitchen-empty-lease_script_15s.md · **Hook** (curiosity gap, cloud kitchen, Problem Aware) · **PPI+P**
**Total shots:** 8 · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** 0:07 (47%) · **CTA:** Apply now

## Shot list
| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:02.5 | GFX empty kitchen | Empty stainless kitchen, lit; two status chips top-centre | `LEASE: SIGNED ✓` · `KITCHEN: EMPTY` (flame) | "Lease signed. Kitchen still empty?" | Room tone; key-turn | Open → hard cut |
| 2 | 0:02.5-0:04.5 | GFX zero counters | Three mono counters at 0 | `FRYERS 0` · `GRIDDLE 0` · `ORDERS 0` | "No fryers, no griddle, no orders." | Order ping that cuts off | Cut |
| 3 | 0:04.5-0:07 | GFX rent line | Rent line ticks forward while counters stay at zero | `RENT: DUE` (flame) | "And the rent's still due." | Clock tick | **Hard reset** |
| 4 | 0:07-0:08.5 | GFX wordmark | Clean steel; wordmark resolves | HireHospo wordmark | "HireHospo." | Music lift | Cut |
| 5 | 0:08.5-0:10 | GFX approval timeline | APPLY → CREDIT CHECK → APPROVED ticks | `APPROVED` (flame) · `24-48 HOURS` | "Approved in 24 to 48 hours." | UI ticks; clean tick on APPROVED | Cut |
| 6 | 0:10-0:11.5 | GFX kitchen fills | Back to the kitchen: fryer and griddle icons drop onto the benches | `DELIVERED IN 1-3 BUSINESS DAYS` · `AFTER DEPOSIT` | "Delivered in 1 to 3…" | Rack clack | Cut |
| 7 | 0:11.5-0:13 | GFX counters flip | Counters flip off zero; chips at foot | `REFURBISHED · WITH WARRANTY` · `INSTALLED & SERVICED BY WASHPRO` | "…business days." | Sizzle; order ping completes | Cut |
| 8 | 0:13-0:15 | End card | Standard end card | **Apply now** · *Approved in 24 to 48 hours · Subject to credit approval* | "Apply now." | Button tick; music resolves | End |

## Frames to build (Claude Code hand-off)
Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuses the standard frames where possible.
| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| empty-kitchen (new, reusable) | Shots 1, 6-7 | #12141A + cool kitchen light | empty benches (simple vector or real empty-kitchen still) + status chips; later fryer/griddle icons | chip settle 0.3s; icons drop 0.3s each | Flame on EMPTY only (shot 1); no flame in 6-7 |
| zero-counters | Shots 2-3 | #12141A | 3 mono counters + rent line | counters fade in 0.2s each; rent line ticks 0.6s | Flame on RENT: DUE only |
| wordmark + approval-timeline | Shots 4-5 | #1C1F26 steel | wordmark; 3 mono steps | wordmark 0.4s; ticks 0.25s each | Flame on APPROVED only |
| end-card | Shot 8 | #12141A | standard end card | pill settle 0.4s | All microcopy guaranteed |

## Production notes
- Dark frames throughout (#12141A). Flame #FF9B2E is the only "go" fill. **One flame highlight per frame at most:** EMPTY, RENT: DUE, APPROVED, the Apply now pill (shots 6-7 carry none). Money and terms in mono.
- Equipment appears as category icons (fryer, griddle), not a named unit, so there's no product to verify for this one.
- Wordmark at the bridge and end card only. Never redraw the logo; use the site asset or set "HireHospo" in Space Grotesk and ⚠-flag it.
- No "+ GST" anywhere. No weekly or daily payment figure for a specific product.
- Caption every spoken line, burned in, bottom-centre, inside the safe zone.

## Safe-area check (9:16)
Top 250px clear (chips and labels start at y≈300). Bottom 320px clear (captions at y≈1450-1560; Washpro chip and footnotes sit above the captions). Hero elements in the central 60% width. ✓

## Hold-rate
Hard visual reset at 0:07 (dim problem frames → bright steel). Body cuts every 1.5-2.5s. ✓

## Audit
8 shots (budget 8-10) ✓ · timing sums to 15.0s ✓ · cuts land on reveals and stamps ✓ · one flame per frame max ✓ · end card carries Apply now + "Approved in 24 to 48 hours · Subject to credit approval" ✓ · no "+ GST" ✓.

## Aspect variants
- **4:5 (1080×1350):** tighten the vertical gaps; stack chips two-up.
- **1:1 (1080×1080):** drop the compact approval timeline if present (its delivery microcopy moves to the end card) and give its time to the proof frame.

## Hand-off
Build in Claude Code with `claude-code-prompt-hirehospo-cloud-kitchen-empty-lease-frames.md`. First drop in the HireHospo wordmark asset.
