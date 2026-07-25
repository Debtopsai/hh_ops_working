---
name: hirehospo-ad-factory
description: >-
  Turn a single ad hook into a complete, build-ready HireHospo video-ad package in one run -
  script, storyboard, VO/audio brief, and a Claude Code animation prompt - with the credit-led
  brand voice, the 7 operator ICPs (new cafe, restaurant, caterer, cloud kitchen, food truck,
  bakery, bar/pub), the real Washpro-synced catalogue, NZ finance-ad compliance (+ GST, subject
  to credit approval, no approval hype, no quoted weekly prices), and the "Apply now" CTA baked
  in. Use whenever the user has a hook (or picks one) and wants a HireHospo ad: "make a HireHospo
  ad", "turn this hook into an ad", "run the ad pipeline", "hook to script to storyboard", "build
  the ad", "ad factory", "create the ad for [cafe / restaurant / bakery / food truck / bar]", or
  any HireHospo / Washpro equipment-finance ad request. Even if only one stage is asked for (just
  a script, storyboard, audio brief, or animation prompt), prefer this orchestrator so the whole
  package stays on-brand, catalogue-true, and credit-compliant.
---

# HireHospo Ad Factory

One hook in → a complete, build-ready HireHospo video-ad package out:
**script → storyboard → VO/audio brief → Claude Code animation prompt** - grounded in the real
Washpro-synced catalogue, person-free by default (motion graphics + real equipment imagery), and
run through the credit + catalogue compliance gates.

This skill is an **orchestrator**. It chains the atomic ad skills (`meta-ad-script-writer`,
`meta-ad-storyboard`, `meta-ad-audio-director`) and bakes in the HireHospo constants so you never
re-specify them. Each stage's method also has a compressed fallback in `references/pipeline.md` in
case a sub-skill isn't installed. For anything that names equipment, brands, categories, or price
bands, the **`hirehospo-products` skill is the catalogue authority** - use it; never invent gear.

## What you produce (the output contract)

For one hook, save four files to the working folder (slug = short kebab from the hook, e.g.
`quote-shock`, `466-a-day`, `rational-without-20k`):

1. `HireHospo_<slug>_script_<len>s.md` - beat-by-beat script
2. `HireHospo_<slug>_storyboard.md` - 9:16 shot list + frames-to-build table
3. `HireHospo_<slug>_audio-brief.md` - music brief + VO direction + SFX-to-timestamp
4. `claude-code-prompt-hirehospo-<slug>-frames.md` - paste-ready animation build prompt

Then present all four and end with a 3-line summary + the obvious next step (build the frames in
Claude Code).

## Before you start - load the constants

Read `references/hirehospo-brand.md` (business model, the offer, the 7 ICPs + category matches,
awareness stages, voice, approved-claims table, banned messaging, credit + catalogue gates, the
provisional visual system, reusable frames). If a HireHospo UI kit, brand book, SwipePages landing
page export, or catalogue export (`active-products.csv`) is in the working folder, skim it - **live
brand assets and the live catalogue always win over the inlined summary**. The visual tokens in the
brand ref are explicitly **provisional** until an official kit exists; the business facts (terms,
fees, claims, gates) are hard constants from the HireHospo operating skills.

## Step 1 - Normalise the hook

Capture, verbatim: **hook text** · **archetype** · **awareness stage** (Problem Unaware → Most
Aware) · **ICP** (which of the 7 operator types) · **offer focus** (Rent 12 months / Lease-to-Own
36 months / full fit-out) · **featured category or product** (from the catalogue via
`hirehospo-products`) · **target length** (default **15s**; range 8-30s). Market is **NZ, always**
(NZ English, NZD, GST). Infer archetype/stage/ICP from the wording + the ICP cues in
`references/hirehospo-brand.md`. Only ask the user when the angle genuinely turns on it (e.g. the
hook could target either a new cafe or an established restaurant and the equipment package differs).

## Step 2 - Script

Use `meta-ad-script-writer`. Pass the hook + concept (persona = the ICP; format = **person-free
motion graphics + real equipment imagery**) + length + the **framework auto-selected by archetype**
(table in `references/pipeline.md`). Enforce: the **offer lands last**; HireHospo enters at the
**bridge** (~45-55% of runtime, never in the opening problem beats); bridging is the priority (every
transition inevitable); **every claim comes from the approved-claims table** (anything else gets ⚠ +
"confirm before publishing"); equipment named is **real catalogue gear** with its real price band;
**no specific weekly or daily payment for a specific product** - "From $4.66/day" is the only
approved entry-point figure and only for the cheapest categories; any payment or price mention
carries **"+ GST"**; finance framing carries **"Subject to credit approval"**; **single CTA "Apply
now"** + the subline "Approved in 24 to 48 hours. Subject to credit approval." Run the **script
audit** (bridge inevitable? · offer last? · 3+ specifics? · single CTA? · pace ≤ ~2.6 wps? ·
catalogue-true? · credit gate clean? · GST present? · no hype/pressure language?). Save with the
script template in `references/output-templates.md`.

## Step 3 - Storyboard

Use `meta-ad-storyboard`. **9:16 (1080×1920)**, person-free default (kitchens may appear; faces
optional only for a UGC/founder variant). Produce the shot list + a **frames-to-build** table that
**reuses the standard frames** in the brand ref (quote-shock number / big-number-vs-weekly split /
equipment hero plinth / refurb-with-warranty badge / approval timeline / category grid / end card)
so production stays cheap. **One flame highlight per frame, only on the key beats.** Safe area:
clear the **top 250px** (Reels UI) + **bottom 320px** (caption mask); hero elements in the central
60%. Hold-rate: a hard visual reset at the **bridge (~7-9s)**; body cuts ~every 2s. Equipment shots
use real catalogue products (real brand, real category, plausible condition tag "Refurbished ·
With warranty"). Include the shot-count + timing audit. Save with the storyboard template.

## Step 4 - VO / audio brief

Use `meta-ad-audio-director`. **Credit-led operator VO**: clear, confident, structured, NZ accent,
~2.4-2.6 wps, zero hype, zero pressure - a lender who doesn't need the deal, talking to an operator
who knows their numbers. Music: warm, capable, mid-tempo (90-108 BPM), understated groove or warm
electronic; no EDM drop, no corporate-inspirational piano, no vocals. Kitchen-world SFX are the
signature: low service ambience under the problem beats, a single pan sizzle or rack clack as
texture, a till/receipt tick on money beats, a clean UI tick on APPROVED. SFX mapped to storyboard
timestamps. Ducking: music −6 to −9 dB under VO; master **−14 LUFS**, **−1.0 dBTP**. Save with the
audio template.

## Step 5 - Claude Code animation prompt

Write a paste-ready prompt that builds **self-contained animated HTML frames + a stitched 1080×1920
animatic**, screen-recordable (`?record` mode). Visual source of truth: any HireHospo kit or brand
asset in the folder; otherwise the **provisional token set** in `references/hirehospo-brand.md`
(dark steel canvas, flame accent as the only "go" fill, mono for money). Never redraw the logo -
use the wordmark asset from the site or set the name in the display face and flag it. Per-frame
contract table (file / beat / duration / verbatim copy / motion), reusing prior frames. Lock copy
verbatim; build in the compliance self-review (every claim from the approved table; "+ GST" and
"Subject to credit approval" present where required; equipment names/prices catalogue-true). Save
with the Claude-Code-prompt template.

## Cross-cutting gates (apply at every step)

- **Credit gate (the golden rule, ad edition):** pricing is shared only after credit approval, so
  ads never quote a specific weekly or daily payment for a specific product. "From $4.66/day" is
  the sole approved entry figure (cheapest categories only: glasswashers, hot plates, small
  fryers). Premium gear leads with **capital preservation** ("a $20,000 Rational combi working in
  your kitchen without $20,000 leaving your bank"), never a tiny daily number.
- **Never imply guaranteed approval.** HireHospo is credit-led and declines applicants by design.
  Banned: "everyone approved", "no credit checks", "guaranteed approval", "instant approval".
  Approved framing: "Approved in 24 to 48 hours" + "Subject to credit approval".
- **Catalogue-true:** only real categories, brands, products, and price bands (via
  `hirehospo-products`; active products only). Never invent specs, capacities, or model numbers.
  Link `https://www.hirehospo.com/products/<handle>` where a product is named.
- **Refurbished is a strength:** always paired with "with warranty"; never hidden, never
  apologised for. It is *why* the weekly payment is low.
- **Money formatting:** every payment or price mention carries **"+ GST"**. Never advertise
  specific deposit structures (they are credit-tiered, case-by-case); if deposits come up, only
  "reduced upfront deposit available for qualifying customers".
- **Roles stay clean:** HireHospo finances; **Washpro** sources, refurbishes, delivers, installs,
  and services. Say "delivered, installed and serviced by Washpro" - never imply HireHospo holds
  stock or turns a spanner.
- **Tone:** underwriting, not selling. No pressure tactics ("act now", "limited time", "don't miss
  out"), no discount-shop energy, no hype jargon. NZ English throughout. Restrained punctuation -
  exclamation marks almost never.
- **Internal numbers stay internal:** portfolio metrics (failure rates, revenue model, fees,
  Tuesday/Wednesday patterns) never appear in ads. Public claims only, per the approved table.
- **Save & present** all four artifacts; end with a short summary + the next step. Don't
  over-explain.

## If a sub-skill isn't available

Each stage has a compressed fallback method in `references/pipeline.md` - follow it directly and
keep the same output templates.
