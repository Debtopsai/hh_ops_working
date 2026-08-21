# HireHospo video ad briefs

Six build-ready video-ad packages produced by the `hirehospo-ad-factory` pipeline
(hook → script → storyboard → VO/audio brief → Claude Code animation prompt).

**Set 1 (briefs 1-3)** - problem-led cuts across three ICPs. All cleared to produce.
**Set 2 (briefs 4-6)** - the offer-headline cuts. Two carry an unapproved rate and are blocked
pending Credit sign-off; the third is the control and ships today. **Read "The $14.99 problem"
below before briefing any of Set 2.**

Each package is four files. All three are **9:16 (1080×1920)**, **person-free** (motion graphics +
real equipment imagery), dark-steel themed, and carry the credit-led brand voice, the "Apply now"
CTA, and the NZ finance-ad compliance gates.

| # | Slug | Hook | ICP | Awareness | Framework | Offer | Length |
|---|---|---|---|---|---|---|---|
| 1 | `fitout-quote-shock` | "The fit-out quote came back. $16,800." | New cafe owner | Problem Aware | PAS | Full fit-out · Rent 12m | 15s |
| 2 | `friday-glasswasher` | "Friday, seven o'clock. The glasswasher just died." | Bar / pub | Solution Aware | PAS-lite | Lease-to-Own 36m | 15s |
| 3 | `rational-without-20k` | "You can afford the oven. That's not the problem." | Restaurant owner | Product Aware | PPI+P | Lease-to-Own 36m | 20s |
| 4 | `50k-from-1499` ⚠ | "$50,000 of kitchen equipment. Everything on the list." | Restaurant / scaling | Solution Aware | PAS | Lease-to-Own 36m | 15s |
| 5 | `coffee-and-muffin` ⚠ | "You sell this about fifteen times before noon." | New cafe owner | Solution Aware | PPI+P | Rent 12m / LTO 36m | 15s |
| 6 | `fifty-thousand` ✅ | "Fifty thousand dollars of equipment. Sitting in a quote." | Restaurant / caterer | Product Aware | PAS | Lease-to-Own 36m | 15s |

⚠ = blocked pending Credit sign-off on the entry rate · ✅ = cleared to produce today

## The $14.99 problem

Briefs 4 and 5 came from two supplied offer headlines: *"$50k worth of equipment from $14.99/day"*
and *"$50k worth of equipment for the price of a coffee & muffin a day."* Both were built, but the
figures do not reconcile and there are two separate issues.

**1. The arithmetic.** At 36-month Lease-to-Own, $14.99/day = $104.93/week = **$16,369 collected
over 156 weeks**. Against the **2.0-2.2x multiple observed across real HireHospo Lease-to-Own
contracts** (Turbofan E31D4 $41.30/wk; Starline M2 $50-$70/wk; Rational SCC WE101 $189.17/wk), that
funds roughly **$7,400-$8,200 of equipment - not $50,000**. Going the other way, $50,000 of
equipment implies roughly **$91-$100/day**. The two numbers in the headline are about **6.5x apart**.
*(These multiples are internal - they size the hook, they never appear in creative.)*

**2. The construction, independent of the arithmetic.** "$50,000 ... from $14.99/day" pairs the
**top of the funding range with the bottom of the payment range**. Under the Fair Trading Act that
reads as misleading even where both figures are individually true, because the headline implies
they describe the same deal. Brief 4 carries a mandatory three-line on-screen range disclosure as
the minimum fix.

**Where that leaves each cut:**

- **Brief 5 `coffee-and-muffin` is the one to put to Credit first.** It uses $14.99/day but makes
  **no $50,000 claim**, so it has no juxtaposition problem - and a cafe starter package
  (undercounter dishwasher + convection oven, or dishwasher + glasswasher) lands at **$7,000-$8,500**
  on the real bands, which is exactly what $14.99/day funds. **The figure and the package reconcile.**
  It is also the strongest creative in the set.
- **Brief 4 `50k-from-1499` needs a decision:** correct the figure (Credit sets the true rate for a
  $50k package, ~$91-$100/day on current multiples), or correct the equipment value (drop the ceiling
  - which is what brief 5 does). Built as specified with the disclosure block, but do not publish
  as-is.
- **Brief 6 `fifty-thousand` needs nothing.** It tests the same $50,000 ceiling with no rate
  attached, using only approved claims. It is the control that answers whether the ceiling sells on
  its own or the daily figure is doing the work - and it runs today regardless of what Credit
  decides.

In both figure-led builds the rate is a **single parameterised token** (`--entry-rate` in
`shared/tokens.css`, shared across briefs 4 and 5), so a change from Credit is a one-line edit, not
a re-render. Both also ship a `?alt` figure-free cut.

## Files per package

- `HireHospo_<slug>_script_<len>s.md` - beat-by-beat script with the audit and ⚠ claim check
- `HireHospo_<slug>_storyboard.md` - shot list, frames-to-build table, safe-area + timing audit
- `HireHospo_<slug>_audio-brief.md` - music brief, VO direction, SFX mapped to timestamps
- `claude-code-prompt-hirehospo-<slug>-frames.md` - paste-ready animation build prompt

## Build order (production efficiency)

**Build `fitout-quote-shock` first.** It establishes `shared/tokens.css`, `shared/stage.js` and four
parameterised components - end card, approval timeline, hero plinth, refurb badge. Every other ad
reuses them:

| Order | Ad | Reuses | New frames |
|---|---|---|---|
| 1 | `fitout-quote-shock` | - (establishes `shared/`) | 6 |
| 2 | `friday-glasswasher` | 6 of 9 shots | 4 |
| 3 | `rational-without-20k` | 4 of 11 shots | 5 |
| 4 | `50k-from-1499` | timeline, badge, end card, quote-shock | 3 |
| 5 | `coffee-and-muffin` | timeline, badge, end card, disclosed figure | 3 |
| 6 | `fifty-thousand` | 5 of 6 frames | **1** |

Building in any other order means building the shared system twice. **If Credit sign-off is slow,
build 1, 2, 3 and 6** - all four are cleared, and 6 costs one new frame.

## Compliance status

Gates run across all 24 files, all passing:

- **No approval hype, pressure, or discount-shop language** anywhere (the only matches are the
  prohibition rules themselves, inside the build prompts).
- **"+ GST"** on every payment mention; **"Subject to credit approval"** on every end card and
  approval-timeline frame.
- **No specific weekly or daily payment for a specific product.** `$4.66/day` - the sole approved
  entry figure - appears only in `friday-glasswasher` (glasswashers, $2,300-$4,000, one of the three
  cheapest categories), with its `+ GST · SUBJECT TO CREDIT APPROVAL` footnote locked to it as one
  indivisible block. It is explicitly prohibited in the other two builds.
- **Catalogue-true gear.** Only three products are named across the whole set - Starline M2
  (Commercial Dishwashers), Turbofan E31D4 (Convection Ovens), Rational SCC WE101 (Combi Ovens) -
  all real units financed in the HireHospo portfolio. **Briefs 4, 5 and 6 name no product at all**,
  only categories: a model name beside a rate reads as a per-product quote and breaches the credit
  gate. No invented models, capacities, or specs anywhere.
- **The control is rate-free.** Verified: no daily or weekly figure appears in brief 6's storyboard,
  on-screen copy, or build prompt.
- **Roles clean.** HireHospo finances; Washpro sources, refurbishes, delivers, installs and services.
- **Timing verified.** Shot lists and frame contracts both sum to target on all six (15.0s / 15.0s /
  20.0s / 15.0s / 15.0s / 15.0s).

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
7. **`$14.99/day`** (Briefs 4 and 5) is **not on the approved claims table** and must be signed off by
   Credit before either ad runs. See "The $14.99 problem" above. Put brief 5 forward first.
8. **"You sell this about fifteen times before noon"** (Brief 5) is an observation about cafe trade,
   not a revenue claim. If fifteen reads high for the cafes being targeted, "about ten" works
   identically - an alternate VO take is specified in the audio brief.
9. **The coffee-and-muffin price is never stated on screen** (Brief 5) and must not be - HireHospo has
   no basis to make a claim about third-party retail pricing. The equivalence is implied by one lit
   tile.
