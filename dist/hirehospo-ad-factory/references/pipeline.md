# Pipeline - the method for each stage (portable build)

In the full install these methods come from `meta-ad-script-writer`, `meta-ad-storyboard`,
`meta-ad-audio-director`, and `meta-ad-hook-writer`. This build inlines them. If those skills are
installed alongside this one, prefer them - they are deeper. Either way, keep the output templates in
`references/output-templates.md`.

---

## Script

### The bridging problem (the reason this stage exists)

**Bridging** = the transitions between sections: hook → body, body → product, product → CTA. A bad
bridge - "here's a problem… BUY OUR PRODUCT" - collapses hold rate and tanks downstream conversion.
Every transition must feel inevitable; the viewer should not notice the moment the ad moves from
"I'm learning something" to "this is what they're selling". The product should arrive as the natural
conclusion of the teaching.

Diagnostic: if hold rate is far below hook rate (e.g. 30% hook, 8% hold), the bridge is the problem,
not the hook.

**The HireHospo timing rule:** HireHospo enters at the **bridge, ~45-55% of runtime** - never in the
opening problem beats - and then runs as *proof* through the middle (approval timeline, equipment
hero, refurb badge). The **offer and the CTA land last.** In these short lengths the brand has to
carry the middle, so the bridge is the earliest legitimate entry point, not a target to beat.

### Framework by hook archetype

| Archetype | Framework | Notes |
|---|---|---|
| Contrarian truth · Curiosity gap | **PPI+P** | Persona + Problem + Pattern-interrupt + Promise (e.g. "Refurbished is why the payment is low") |
| Common mistake · High-stakes warning | **PAS** | Problem → Agitation → Solution (the quote-shock / capital-hit hooks live here) |
| Specific truth | **PAS or PPI+P** | Value / most-aware → PAS-lite (claim → proof → CTA), e.g. the "$4.66/day" entry hook |
| Myth-busting objection | **PAS** | PPI+P if it has a "you're half right" twist (e.g. "You're right not to trust second-hand gear - without a warranty") |

**PPI+P** - Persona + Problem + Pattern Interrupt + Promise. Best for contrarian-truth, curiosity-gap,
and educational angles.
1. **Persona call-out** - "If you're [specific operator] and [specific situation]…"
2. **Problem** - "…you're probably doing [the common approach]."
3. **Pattern interrupt** - "That's the reason it isn't working, because [mechanism]."
4. **Promise** - "Here's what works instead."
The hook can *be* the persona call-out plus problem, in which case the script picks up at the pattern
interrupt.

**PAS** - Problem → Agitation → Solution. Best for specific-truth, high-stakes-warning, and
common-mistake hooks; more direct than PPI+P.
1. **Problem** - surface it (often the hook itself)
2. **Agitation** - make it real, specific, immediate; stack the consequences (the dead machine on a
   Friday, the fit-out quote, the drained account)
3. **Solution** - HireHospo as the natural answer to the agitated problem
Don't use PAS on a problem-unaware audience - they haven't accepted the problem yet, so the agitation
falls flat.

### Awareness map (where the hook sits)

Problem Unaware → Problem Aware (quote shock) → Solution Aware (finance exists) → Product Aware
(HireHospo vs outright vs the bank) → Most Aware (ready to apply). No product in the Problem stages -
sell the felt cost of the capital hit (the fit-out quote, the dead glasswasher, the drained account);
HireHospo enters at Solution Aware; "Apply now" plus the approval subline land at Most Aware. The
competitor is **delay and outright purchase** - make the cost of tying up capital specific, flat, and
calm.

### Length beat-maps

| Length | Hook | Agitate | Bridge (HireHospo) | Mechanism / proof | CTA | Target words |
|---|---|---|---|---|---|---|
| 10s | 0-3s | 3-5s | ~5-6s | 6-8s | 8-10s | ~24-28 |
| 15s | 0-3s | 3-6s | ~7-8s (≈50%) | 8-13s | 13-15s | ~36-40 |
| 20s | 0-5s | 5-7s | ~7-9s | 9-16s | 18-20s | ~48-55 |
| 30s | 0-6s | 6-10s | ~10-12s | 12-24s | 26-30s | ~70-80 |

Pace **~2.4-2.6 wps** (confident and unhurried - underwriting, not auctioneering). Always give a
shorter-cut trim note (compress the agitation/mechanism, keep the bridge + end card intact).

### Method

Pick the framework from the table → write the beat table (Time | Section | VO | On-screen text |
Visual | SFX) against the length's beat-map → HireHospo enters at the bridge, offer last → one CTA
("Apply now") plus the approval subline → run the script audit → save with the script template.

---

## Storyboard

Parse the script beats → set the shot count from budget (**15s = 8-10 cuts; 20s = 9-12**) → assign
shot types (**GFX** motion graphic / **EQUIP** equipment photo / **TXT** type-only) with cuts on
emphasis and reveals, and a **hard visual reset at the bridge (~7-9s)**; body cuts about every 2s →
write the shot list plus a frames-to-build table on the dark-steel system, reusing the standard
frames in `hirehospo-brand.md` §11 (quote-shock / big-number-vs-weekly split / hero plinth / refurb
badge / approval timeline / category grid / capital-preservation ledger / end card) → one flame
highlight per frame → safe-area and timing audit → save with the storyboard template.

**9:16 (1080×1920) canonical.** Safe area: clear the **top 250px** (Reels UI) and **bottom 320px**
(caption mask); hero elements in the central 60%. Caption every spoken line, burned in, bottom-centre,
inside the safe zone. Note the 4:5 and 1:1 reflow. Wordmark at the bridge and end card only. The end
card carries the full required microcopy.

Equipment shots use real catalogue gear with plausible tags ("Starline undercounter · Refurbished ·
With warranty") - never invented models. Money and terms in mono.

---

## Audio brief

**Music:** warm, capable, mid-tempo (90-108 BPM), understated groove or warm electronic. No vocals,
no EDM drop, no corporate-inspirational piano. Feel: a well-run kitchen after service - competent,
calm, a little warmth. Energy arc mapped to the framework: restrained hook → dip on the capital-hit
beat → lift at the bridge → settle on APPROVED → resolve with a short tail on the end card.

**VO:** credit-led operator - clear, confident, structured, NZ accent, ~2.4-2.6 wps, zero hype, zero
upsell energy, clean breath cuts. Direct line by line (note pace and the emphasis word). Ask for 2-3
reads of the hook and the CTA at varying warmth so the editor can choose.

**SFX:** kitchen-world and textural, never a wall-to-wall foley bed. List each cue against a real
storyboard timestamp: count-up tick, low service ambience under the problem beats, a single pan
sizzle or rack clack as texture, a till or receipt tick on money beats, a clean UI tick or stamp on
APPROVED, a button on the CTA.

**Mix:** music −6 to −9 dB under VO (the hook may ride without a duck); SFX peaks duck a further
3-6 dB; VO is the priority track. Master **−14 LUFS integrated, −1.0 dBTP**.

---

## Claude Code prompt

Translate the storyboard's frames-to-build into per-frame contracts (file / beat / duration /
verbatim copy / motion). Specify self-contained animated HTML at 1080×1920 with a stitched animatic
and a `?record` mode. Visual source: any HireHospo kit or brand asset in the folder, else the
provisional tokens (canvas #12141A, flame #FF9B2E as the only "go" fill, mono for money, one flame
highlight per frame, never redraw the logo). Reuse prior frames. **Lock copy verbatim** - approved
claims only, "+ GST" on every payment mention, "Subject to credit approval" on the end card, no
quoted weekly price for a specific product, catalogue-true gear. Save with the Claude-Code-prompt
template.

---

## Audits

**Script audit (run before saving):** bridge inevitable? · offer last (HireHospo enters at the bridge
~45-55%, not the opening)? · 3+ specifics (real prices/timeframes/named gear)? · single CTA ("Apply
now")? · pace ≤ ~2.6 wps? · every claim on the approved table or ⚠-flagged? · no specific weekly/daily
payment for a specific product ("$4.66/day" entry hook only, cheapest categories)? · "+ GST" on every
payment/price mention? · "Subject to credit approval" present (end card at minimum)? · no approval
hype, pressure, or discount-shop language? · equipment catalogue-true (active products, real
brands/bands)? · Washpro/HireHospo roles clean?

**Storyboard audit:** shot count within budget (15s = 8-10 cuts; 20s = 9-12) · cuts land on
emphasis/reveals · hard visual reset at the bridge (~7-9s) · equipment shots are real catalogue gear
with plausible tags · **one flame highlight per frame, key beats only** · money and terms set in mono
· safe-area (central 60%; clear top 250px / bottom 320px on 9:16) · timing sums to target · wordmark
at bridge + end card only · end card carries the full required microcopy.

**Audio audit:** VO pace 2.4-2.6 wps, confident, zero hype · energy arc matches PAS/PPI+P (dip on the
capital-hit beat, lift at the bridge, settle on APPROVED) · kitchen SFX textural, not wall-to-wall
foley · SFX mapped to real timestamps · ducking −6 to −9 dB under VO · master −14 LUFS / −1.0 dBTP ·
no vocals, no EDM drop, no corporate-inspirational piano.

**Hook scoring (only if you also generate or choose hooks):** score each on **Clarity / Relevance /
Novelty / Specificity / Credibility** (each /10, in that priority order), total /50; **ship 42+**;
cover the archetype spread (contrarian truth, specific truth, common mistake, high-stakes warning,
curiosity gap, myth-busting objection); balance across awareness stage × ICP; flag the weakest; kill
any hook that leans on approval hype, pressure, or discount-shop energy.
