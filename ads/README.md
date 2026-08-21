# HireHospo video ad briefs

Three build-ready video-ad packages produced by the `hirehospo-ad-factory` pipeline
(hook → script → storyboard → VO/audio brief → Claude Code animation prompt).

Each package is four files. All three are **9:16 (1080×1920)**, **person-free** (motion graphics +
real equipment imagery), dark-steel themed, and carry the credit-led brand voice, the "Apply now"
CTA, and the NZ finance-ad compliance gates.

| # | Slug | Hook | ICP | Awareness | Framework | Offer | Length |
|---|---|---|---|---|---|---|---|
| 1 | `fitout-quote-shock` | "The fit-out quote came back. $16,800." | New cafe owner | Problem Aware | PAS | Full fit-out · Rent 12m | 15s |
| 2 | `friday-glasswasher` | "Friday, seven o'clock. The glasswasher just died." | Bar / pub | Solution Aware | PAS-lite | Lease-to-Own 36m | 15s |
| 3 | `rational-without-20k` | "You can afford the oven. That's not the problem." | Restaurant owner | Product Aware | PPI+P | Lease-to-Own 36m | 20s |

## Files per package

- `HireHospo_<slug>_script_<len>s.md` - beat-by-beat script with the audit and ⚠ claim check
- `HireHospo_<slug>_storyboard.md` - shot list, frames-to-build table, safe-area + timing audit
- `HireHospo_<slug>_audio-brief.md` - music brief, VO direction, SFX mapped to timestamps
- `claude-code-prompt-hirehospo-<slug>-frames.md` - paste-ready animation build prompt

## Build order (production efficiency)

**Build `fitout-quote-shock` first.** It establishes `shared/tokens.css`, `shared/stage.js` and four
parameterised components - end card, approval timeline, hero plinth, refurb badge. The other two ads
reuse them: `friday-glasswasher` reuses 6 of 9 shots, `rational-without-20k` reuses 4 of 11. Building
in any other order means building the shared system twice.

## Compliance status

Gates run across all 12 files, all passing:

- **No approval hype, pressure, or discount-shop language** anywhere (the only matches are the
  prohibition rules themselves, inside the build prompts).
- **"+ GST"** on every payment mention; **"Subject to credit approval"** on every end card and
  approval-timeline frame.
- **No specific weekly or daily payment for a specific product.** `$4.66/day` - the sole approved
  entry figure - appears only in `friday-glasswasher` (glasswashers, $2,300-$4,000, one of the three
  cheapest categories), with its `+ GST · SUBJECT TO CREDIT APPROVAL` footnote locked to it as one
  indivisible block. It is explicitly prohibited in the other two builds.
- **Catalogue-true gear.** Only three products are named across the set - Starline M2 (Commercial
  Dishwashers), Turbofan E31D4 (Convection Ovens), Rational SCC WE101 (Combi Ovens) - all real units
  financed in the HireHospo portfolio. No invented models, capacities, or specs.
- **Roles clean.** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
- **Timing verified.** Shot lists and frame contracts both sum to target on all three (15.0s / 15.0s
  / 20.0s).

## ⚠ Verify before any paid spend

1. **`$16,800`** (Brief 1) is an illustrative composite fit-out total built from real category bands -
   confirm against the live catalogue, and only ever present it as the outright-purchase cost.
2. **All category price bands** are a 26 May 2026 snapshot - verify on hirehospo.com.
3. **Active status** of Starline M2, Turbofan E31D4 and Rational SCC WE101 - if the Rational is not
   active, substitute another active Rational combi, never a generic oven.
4. **Wordmark asset** - the logo must never be redrawn. If no asset is available the build flags it.
5. **Visual tokens are provisional.** No official HireHospo UI kit exists yet; a real kit or brand
   book dropped in the folder overrides the token set in every build prompt.
6. **"240 glasses"** (Brief 2) is a scene device, not an equipment claim - worth a client sign-off.
