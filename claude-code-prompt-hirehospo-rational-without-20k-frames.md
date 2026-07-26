# Claude Code Prompt — HireHospo 15s Ad "Twenty grand, for one oven": Animated Visual Frames

> **How to use:** open Claude Code in the HireHospo working folder with the script
> (`HireHospo_rational-without-20k_script_15s.md`), storyboard
> (`HireHospo_rational-without-20k_storyboard.md`), audio brief
> (`HireHospo_rational-without-20k_audio-brief.md`), and any HireHospo brand assets present
> (UI kit, wordmark, Rational combi product photo, `active-products.csv`). Paste everything below the line.

---

## 1. Role
You are a front-end motion engineer who designs. You build self-contained animated HTML frames — no build step, no framework, vanilla JS + CSS — that look like premium finance motion graphics and screen-record cleanly at 1080×1920.

## 2. Mandate
Build the animated frames + a stitched **15.0s** animatic for a HireHospo video ad, at **1080×1920 (9:16)**. **Person-free motion graphics + real equipment imagery** — no faces, no talking heads.

## 3. Inputs (read first, in this order)
1. `HireHospo_rational-without-20k_storyboard.md` — the build spec (shot list + frames-to-build table). Authoritative for layout, copy, and motion.
2. `HireHospo_rational-without-20k_script_15s.md` — beat timing + verbatim on-screen copy.
3. `HireHospo_rational-without-20k_audio-brief.md` — cut/settle timings to sync motion to.
4. Any HireHospo **kit / brand book / wordmark / product photo** in the folder — **source of truth if present** (overrides the provisional tokens below). Use `active-products.csv` / the live product page for the real Rational combi image, category, and price band.

## 4. Design system — provisional dark-steel tokens (a real kit WINS if present)
```
canvas    #12141A   ad canvas (service-kitchen dark)
surface   #1C1F26   cards / plinths ("steel")
line      #2A2E37   hairlines
ink       #F4F4F2   primary text on dark
ink2      #B9BDC7   secondary text
mute      #838896   captions / de-emphasis
flame     #FF9B2E   the ONLY "go" fill: Apply-now pill, APPROVED, the key figure highlight
flamedark #D97C14   flame-toned text on light surfaces (AA-safe)
warmtint  #2A2318   soft flame-tinted surface (benefit chips, footnote bands)
approve   #58C97B   small approval ticks only (never a fill)
accentink #14161A   text on a flame surface — always
```
- **Type:** Space Grotesk (display; semibold headings, bold figures, tight tracking) · Inter (body/captions) · **JetBrains Mono for money, terms, chips** ("$20,000", "+ GST", "REFURBISHED · WITH WARRANTY", "low weekly payments + GST", timeline steps; uppercase 0.08em).
- **Discipline:** **one flame highlight per frame, key beat only.** The two capital-hit frames (drain / ledger-empty) carry **no flame** — the problem beat is cold. Brushed-steel gradient allowed on the plinth frame only. Motion: transform + opacity only; settles ~0.5s ease-out; a "stamp" settle for APPROVED and the refurb badge; respect `prefers-reduced-motion`.
- **Logo:** use the HireHospo wordmark **asset** from the folder/site. **Never redraw or invent a logomark.** If no asset exists, set "HireHospo" in Space Grotesk and ⚠-flag it in the README. Wordmark at the bridge + end card only.

## 5. What to build — per-frame contract (reuse the standard frames)
Lock copy **verbatim**. Approved claims only · "+ GST" on every payment/price mention · "Subject to credit approval" on the end card · **no quoted weekly price for a specific product** · catalogue-true gear.

| File | Beat | Duration | Verbatim copy | Motion |
|---|---|---|---|---|
| `frames/01-quote-shock.html` | Hook 0:00–0:03 | 3.0s | `$20,000` · `+ GST` · `FOR ONE OVEN` | Mono number counts 0→20,000 (~0.8s, ease-out); flame underline snaps under the last digits on lock; hold |
| `frames/02-capital-drain.html` | Agitate 0:03–0:06 | 3.0s | `PAID IN FULL. GONE.` · `before service.` | Reuse the quote-shock number; it desaturates to grey and drains downward out of a ledger line to `$0` (~1.2s); faint hollow tick at 0:05. **No flame.** |
| `frames/03-approval-timeline.html` | Bridge 0:06–0:08 | 2.0s | `HireHospo` · `APPLY → CREDIT CHECK → APPROVED → DELIVERED 1–3 DAYS` · `Subject to credit approval` | Hard reset; wordmark resolves (0.4s); 4 mono steps tick left→right; **APPROVED** lights flame + stamps |
| `frames/04-hero-plinth.html` | Proof 1 0:08–0:11.5 | 3.5s | `RATIONAL · COMBI OVEN` · `NZ-based delivery, install & service` · `REFURBISHED · WITH WARRANTY` | Real Rational combi cut-out settles on brushed-steel plinth (0.5s); refurb badge stamps on at 0:10.5 (flame) |
| `frames/05-capital-ledger.html` | Proof 2 0:11.5–0:13 | 1.5s | `CAPITAL — kept in the business ✓` · `OVEN — in your kitchen ✓` · `low weekly payments + GST` | Two rows tick in sequence; footer figure lights flame last (one flame highlight) |
| `frames/06-end-card.html` | CTA 0:13–0:15 | 2.0s | `Premium kitchen equipment, refurbished and warranted, on low weekly payments.` · `low weekly payments + GST` · **`Apply now`** · `Approved in 24 to 48 hours · Subject to credit approval` · `hirehospo.com` | Wordmark + prop settle; flame Apply-now pill (accentink text) with a stamp settle; hold |

(Frames 02 and 04 span two storyboard shots each — build them as single frames with an internal beat at the sub-timestamp noted.)

## 6. Deliverable structure
```
ad/rational-without-20k/
  index.html                  # contact sheet (all 6 frames) + a play-through 15.0s animatic
  frames/                     # the 6 files above, each standalone + individually recordable
  shared/
    tokens.css                # the token set + type scale
    stage.js                  # 1080×1920 stage, timeline sequencer, ?record clean-mode
    frame-end-card.html       # the reusable end card (imported by index)
  assets/                     # wordmark + Rational combi image (from folder/live site)
  README.md
```

## 7. Constraints
- Self-contained: Tailwind (CDN) + Google Fonts (CDN) + vanilla JS only. No bundler, no npm.
- On-system only: dark steel canvas, flame = the only go-fill, mono for money, **one flame highlight per frame** (none on frames 02). NZ English throughout.
- **Compliance (hard):** approved claims only; the `$20,000` band is ⚠ *verify against the live Rational SCC WE101 product page before paid use* — leave a README note; no approval hype ("guaranteed/instant/everyone approved" — banned); "+ GST" on both the `$20,000` and the "low weekly payments" mentions; "Subject to credit approval" present on the end card + timeline; **no specific weekly/daily figure** (premium gear → capital preservation, not a daily number); roles clean (financed by HireHospo; delivery/install/service shown passively as 'NZ-based delivery, install & service' — never name Washpro in on-screen copy, never imply HireHospo turns a spanner).
- Recordable: true 1080×1920, `?record` hides all UI/controls and plays once clean for screen capture. Each frame also standalone-recordable.
- Original work — no copied brand assets beyond the supplied HireHospo wordmark/product image.

## 8. Process
1. Read the storyboard + script + audio brief + any kit/brand assets. Confirm tokens (kit vs provisional), lock the verbatim copy table, and the compliance gates.
2. Build `shared/` first (tokens, stage, sequencer, end card).
3. Build the 6 frames in order; sync settle/stamp motion to the audio-brief timestamps.
4. Build the 15.0s animatic in `index.html` (contact sheet + play-through).
5. Write `README.md`: how to record, the ⚠ price-verification note, wordmark-asset status, and the frame/beat map.
6. **Self-review:** animatic = 15.0s · copy verbatim vs the table · "+ GST" on both money mentions · "Subject to credit approval" on the end card · catalogue-true gear (real Rational combi, no invented model) · flame discipline (one/frame, none on the drain frames) · safe area (top 250px / bottom 320px clear) · `?record` clean.
