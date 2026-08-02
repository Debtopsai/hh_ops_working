# Output templates

Use these so every run looks consistent across the HireHospo ad library. Fill the brackets; keep
the headings. Dark-steel theme throughout (provisional system - a real kit in the folder wins).

---

## 1. Script - `HireHospo_<slug>_script_<len>s.md`

```markdown
## Script - "<Title>" - <ICP> - <Awareness stage> - <Archetype> - <Framework> - <len>s

**Offer focus:** <Rent 12m / Lease-to-Own 36m / full fit-out> · **Featured gear:** <real category / product + price band> · **HireHospo intro at:** <0:0X (XX%)> · **CTA:** Apply now
**Format:** person-free motion graphics + real equipment imagery (dark). **Voice:** credit-led operator - underwriting, not selling.
**Compliance:** approved claims only · "+ GST" on every payment mention · "Subject to credit approval" on the end card · no quoted weekly price for a specific product.

| Time | Section | VO | On-screen text | Visual (dark, no people) | SFX / music |
|---|---|---|---|---|---|
| 0:00-0:0X | Hook | "<verbatim>" | **<MIRROR / flame key figure>** | <quote-shock frame> | <music in low; count-up tick> |
| ... | Agitate | ... | ... | <capital-hit / dead-gear beat> | <dip; service ambience> |
| ... | Bridge (HireHospo) | "HireHospo ..." | HireHospo | <wordmark resolves; approval timeline> | <lift; APPROVED tick> |
| ... | Mechanism / proof | ... | ... | <hero plinth / refurb badge / split frame> | <rack clack; till tick> |
| ...-0:<len> | CTA | "<offer line>" | **Apply now** · *Approved in 24 to 48 hours · Subject to credit approval* | <end card> | <settle; out> |

- **Bridge intent honoured:** <1 line - why each transition is inevitable>.
- **Audit:** bridge ✓ · offer last ✓ · specifics: <list> ✓ · single CTA ✓ · ~<n> words / <wps> wps · claims all approved ✓ · "+ GST" ✓ · credit-approval microcopy ✓ · catalogue-true ✓.
- **⚠ Claim check:** <flag anything off the approved table or any price band needing live-site verification; confirm "$4.66/day" only used for cheapest categories>.
- **Shorter-cut trim:** <how to compress, keeping the bridge + end card>.
```

---

## 2. Storyboard - `HireHospo_<slug>_storyboard.md`

```markdown
# Storyboard - HireHospo "<Title>" - <len>s - Motion Graphics + Equipment Imagery (no people)

**Script:** <script filename> · **Hook** (<archetype>, <ICP>, <awareness>) · **<Framework>**
**Total shots:** <n> · **Aspect ratio:** 9:16 (1080×1920) · **Theme:** dark steel (provisional system; canvas #12141A)
**HireHospo intro at:** <0:0X (XX%)> · **CTA:** Apply now

## Shot list
| # | Time | Shot | Visual | On-screen text | VO | SFX / music | Cut |
|---|---|---|---|---|---|---|---|
| 1 | 0:00-0:0X | GFX quote-shock | ... | **... (flame key figure)** | "..." | ... | Hard cut |

## Frames to build (Claude Code hand-off)
Shared system: provisional HireHospo dark-steel tokens (a real kit/brand book in the folder wins). Reuse the standard frames.
| Frame | Used in | Background | Core content | Key motion | Notes |
|---|---|---|---|---|---|
| quote-shock | Shot 1 | #12141A | mono price count-up + flame highlight | number 0→N in 0.7s, flame snaps on lock | thumbnail; price band ⚠-verified |
| ... | ... | ... | ... | ... | equipment = real active product, "Refurbished · With warranty" |

## Production notes
- Dark frames throughout (#12141A). Flame #FF9B2E = the only "go" fill. **One flame highlight per frame, key beats only.** Money and terms in mono.
- Equipment shots use real catalogue products (real brand + category chip; link the product page in the hand-off). Never invent models or specs.
- Wordmark at the bridge + end card only; never redraw the logo. End card carries "Apply now" + "Approved in 24 to 48 hours · Subject to credit approval" + "+ GST" wherever a payment is referenced.
- Caption every spoken line, burned-in, bottom-center, inside the safe zone.

## Safe-area check (9:16) · ## Hold-rate (bridge reset ~7-9s; body cuts ~2s) · ## Audit (shots/timing) · ## Aspect variants (4:5 / 1:1) · ## Hand-off
```

---

## 3. Audio brief - `HireHospo_<slug>_audio-brief.md`

```markdown
# Audio brief - HireHospo "<Title>" - <len>s

## Music brief
- Genre/feel: warm, capable, mid-tempo - understated groove or warm electronic. No vocals, no EDM drop, no corporate-inspirational piano.
- BPM <90-108>, steady. Feel: a well-run kitchen after service - competent, calm, a little warmth.
- Energy curve by beat: <restrained hook → dip on the capital-hit beat → lift at the bridge → settle on APPROVED → resolve + short tail on the end card>.

## VO direction - credit-led operator
- Voice: clear, confident, structured. NZ accent. ~2.4-2.6 wps. Zero hype, zero upsell energy - a lender who doesn't need the deal. Clean breath cuts.
| Time | Line | Direction |
|---|---|---|
| 0:00-0:0X | "<verbatim>" | <flat, factual; small stress on the figure> |
| ... | ... | ... |
- Record 2-3 reads of the hook and the CTA line at varying warmth for the editor to choose.

## SFX - mapped to storyboard timestamps
| Timestamp | Cue | Purpose | Level |
|---|---|---|---|
| 0:00 | count-up tick + low service ambience | establish, drive the number | −18dB |
| ... | single pan sizzle / rack clack | kitchen texture (sparing) | −16dB |
| ... | APPROVED stamp / UI tick | the bridge beat | −12dB |
| ... | till / receipt tick | the money-model beat | −16dB |
| ... | button | CTA | −16dB |

## Ducking & loudness
Music −6 to −9 dB under VO (the hook may ride without a duck); SFX peaks duck a further 3-6 dB. VO is the priority track. Master −14 LUFS integrated, −1.0 dBTP.
```

---

## 4. Claude Code prompt - `claude-code-prompt-hirehospo-<slug>-frames.md`

```markdown
# Claude Code Prompt - HireHospo <len>s Ad "<Title>": Animated Visual Frames

> How to use: open Claude Code in the HireHospo folder with the script, storyboard, audio brief,
> and any HireHospo brand assets (kit, wordmark, product photos, `active-products.csv`) present;
> paste below the line.

## 1. Role - front-end motion engineer who designs (self-contained animated HTML, no build step).
## 2. Mandate - build the animated frames + a <len>s animatic at 1080×1920; person-free motion graphics + real equipment imagery (UGC/founder variant only if the hook calls for a face).
## 3. Inputs - the script + storyboard (build spec) · any HireHospo kit/brand assets in the folder (source of truth if present) · the catalogue export for real product names/prices.
## 4. Design system - provisional dark-steel tokens (a real kit WINS if present): canvas #12141A · surface #1C1F26 · ink #F4F4F2 · flame #FF9B2E (the only "go" fill) · flamedark #D97C14 · warmtint #2A2318 · approve #58C97B (ticks only) · accentink #14161A on flame. **Merriweather** headlines / **Inter** body + labels (typography confirmed from hirehospo.com; colour tokens still provisional). One flame highlight per frame. Brushed-steel gradient allowed on plinth frames. **Never redraw the logo** - wordmark asset or display-face text, ⚠-flagged.
## 5. What to build - per-frame contract table (File | Beat | Duration | verbatim copy | Motion), reusing the standard frames (quote-shock / split / hero plinth / refurb badge / approval timeline / category grid / ledger / end card). **Lock copy verbatim** - approved claims only, "+ GST" on every payment mention, "Subject to credit approval" on the end card, no quoted weekly price for a specific product, catalogue-true gear.
## 6. Deliverable structure - ad/<slug>/ {index.html (contact sheet + animatic), frames/*.html, shared/{tokens.css, stage.js, frame-end-card.html}, README.md}.
## 7. Constraints - self-contained (Tailwind + Google Fonts CDN, vanilla JS); on-system only (dark steel, flame = only go-fill, money set in Inter, one flame highlight/frame); NZ English; compliance (approved claims only; price bands real and ⚠-verified; no approval hype; roles clean: financed by HireHospo, delivered/installed/serviced by Washpro); recordable true 1080×1920 with `?record`; original work.
## 8. Process - read the assets + storyboard, confirm tokens (kit vs provisional), copy locks, and the compliance gates; build shared first; build frames in order; build the animatic; README; self-review (animatic = <len>.0s · copy verbatim · "+ GST" + credit-approval microcopy present · catalogue-true gear · flame discipline · safe area · `?record` clean).
```
