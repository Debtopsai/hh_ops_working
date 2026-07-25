# Pipeline detail - frameworks, beat-maps, audits, fallbacks

Read this for the per-stage method. If the named sub-skill is installed, prefer it; otherwise follow
the compressed fallback here and keep the same output templates.

## Framework by hook archetype (Step 2 - script)

| Archetype | Framework | Notes |
|---|---|---|
| Contrarian truth · Curiosity gap | **PPI+P** | Persona + Problem + Pattern-interrupt + Promise (e.g. "Refurbished is why the payment is low") |
| Common mistake · High-stakes warning | **PAS** | Problem → Agitation → Solution (the quote-shock / capital-hit hooks live here) |
| Specific truth | **PAS or PPI+P** | Value/most-aware → PAS-lite (claim → proof → CTA), e.g. the "$4.66/day" entry hook |
| Myth-busting objection | **PAS** | PPI+P if it has a "you're half right" twist (e.g. "You're right not to trust second-hand gear - without a warranty") |

**Bridging is the priority:** every transition (hook→body, body→product, product→CTA) must feel
inevitable. The **offer lands last**. HireHospo enters at the **bridge** (~45-55% of runtime),
then runs as proof through the middle (approval timeline, equipment hero, refurb badge) - never in
the opening problem beats.

## Awareness map (Step 1 - where the hook sits)

Problem Unaware → Problem Aware (quote shock) → Solution Aware (finance exists) → Product Aware
(HireHospo vs outright vs bank) → Most Aware (ready to apply). No product in the Problem stages -
sell the felt cost of the capital hit (the fit-out quote, the dead glasswasher, the drained account);
HireHospo enters at Solution Aware; "Apply now" + the approval subline land at Most Aware. The
competitor is **delay and outright purchase** - make the cost of tying up capital specific, flat, and
calm.

## Length beat-maps (Step 2)

| Length | Hook | Agitate | Bridge (HireHospo) | Mechanism / proof | CTA | Target words |
|---|---|---|---|---|---|---|
| 10s | 0-3s | 3-5s | ~5-6s | 6-8s | 8-10s | ~24-28 |
| 15s | 0-3s | 3-6s | ~7-8s (≈50%) | 8-13s | 13-15s | ~36-40 |
| 20s | 0-5s | 5-7s | ~7-9s | 9-16s | 18-20s | ~48-55 |
| 30s | 0-6s | 6-10s | ~10-12s | 12-24s | 26-30s | ~70-80 |

Pace **~2.4-2.6 wps** (confident and unhurried - underwriting, not auctioneering). Always give a
shorter-cut trim note (compress the agitation/mechanism, keep the bridge + end card intact).

## Audits

**Script audit (run before saving):** bridge inevitable? · offer last (HireHospo enters at the
bridge ~45-55%, not the opening)? · 3+ specifics (real prices/timeframes/named gear)? · single CTA
("Apply now")? · pace ≤ ~2.6 wps? · every claim on the approved table or ⚠-flagged? · no specific
weekly/daily payment for a specific product ("$4.66/day" entry hook only, cheapest categories)? ·
"+ GST" on every payment/price mention? · "Subject to credit approval" present (end card at
minimum)? · no approval hype, pressure, or discount-shop language? · equipment catalogue-true
(active products, real brands/bands)? · Washpro/HireHospo roles clean?

**Storyboard audit:** shot count within budget (15s = 8-10 cuts; 20s = 9-12) · cuts land on
emphasis/reveals · hard visual reset at the bridge (~7-9s) · equipment shots are real catalogue
gear with plausible tags ("Starline undercounter · Refurbished · With warranty", never invented
models) · **one flame highlight per frame, key beats only** · money and terms set in mono ·
safe-area (central 60%; clear top 250px / bottom 320px on 9:16) · timing sums to target · wordmark
at bridge + end card only · end card carries the full required microcopy.

**Audio audit:** VO pace 2.4-2.6 wps, confident, zero hype · energy arc matches PAS/PPI+P (dip on
the capital-hit beat, lift at the bridge, settle on APPROVED) · kitchen SFX textural, not literal
foley wall-to-wall · SFX mapped to real timestamps · ducking −6 to −9 dB under VO · master −14 LUFS
/ −1.0 dBTP · no vocals, no EDM drop, no corporate-inspirational piano.

**Hook scoring (only if you also generate/choose hooks - `meta-ad-hook-writer`):** score on
Clarity / Relevance / Novelty / Specificity / Credibility (each /10), total /50; ship 42+; cover
the archetype spread; balance across awareness stage × ICP; kill any hook that leans on approval
hype, pressure, or discount-shop energy.

## Compressed fallbacks (if a sub-skill is missing)

**Script (fallback):** pick the framework from the table → write a beat table (Time | Section | VO |
On-screen text | Visual | SFX) for the length's beat-map → HireHospo enters at the bridge, offer
last → one CTA ("Apply now") + the approval subline → run the script audit → save with the script
template.

**Storyboard (fallback):** parse the script beats → set shot count from the budget → assign shot
types (GFX / EQUIP-photo / TXT) with cuts on emphasis and a hard reset at the bridge → write the
shot list + a frames-to-build table on the provisional dark-steel system, reusing the §11 frames
(quote-shock / split / hero plinth / refurb badge / approval timeline / category grid / ledger /
end card) → one flame highlight per frame → safe-area + timing audit → save with the storyboard
template.

**Audio brief (fallback):** music = warm, capable, mid-tempo (90-108 BPM), understated groove or
warm electronic, no vocals; energy arc mapped to PAS/PPI+P (restrained hook, dip on the capital-hit
beat, lift at the bridge, settle + short tail on the end card); VO = credit-led operator (clear,
confident, NZ accent, ~2.4-2.6 wps), note pace + emphasis words; SFX = list each cue (count-up
tick, low service ambience, single pan sizzle or rack clack, till/receipt tick, APPROVED stamp/UI
tick, button) mapped to storyboard timestamps; ducking music −6 to −9 dB under VO → save with the
audio template.

**Claude Code prompt (fallback):** translate the storyboard's frames-to-build into per-frame
contracts (file / beat / duration / verbatim copy / motion); specify self-contained animated HTML
at 1080×1920 with a stitched animatic + `?record` mode; visual source = any HireHospo kit/brand
asset in the folder, else the provisional tokens (canvas #12141A, flame #FF9B2E as the only "go"
fill, mono for money, one flame highlight per frame, never redraw the logo); reuse prior frames;
lock copy verbatim ("+ GST", "Subject to credit approval", approved claims only, catalogue-true
gear) → save with the Claude-Code-prompt template.
