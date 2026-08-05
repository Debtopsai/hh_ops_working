# HireHospo outbound — segmentation & campaign strategy

The plan for turning two assets — the **Southern Hospitality database** and the **Google (Maps) scraper** — into a set of segmented cold email campaigns, led by an exclusive premium-refurb offer to top-rated venues.

Market = NZ (UEMA opt-in). All the standard HireHospo guardrails apply: no weekly $ figure before Checkmate approval; "+ GST"; no approval hype; cold from secondary domains only; block-list every existing customer.

---

## 1. The two assets and what each is for

| Asset | What it is | Best used for |
|---|---|---|
| **Southern Hospitality DB** | a list of NZ hospitality businesses (equipment buyers) | the core addressable list — high-fit (they buy/replace commercial kitchen gear). **Must**: confirm lawful basis (§7), classify, verify, qualify, and strip out Southern Hospitality's own trade/supplier contacts + any existing HireHospo customers |
| **Google Maps scraper** | pulls venues with **review count, star rating**, category, address, website, sometimes email | (a) **enrich** the SH DB — match business → Google listing → append reviews/stars so we can tier; (b) **build fresh** Tier-A lists directly by city + category, filtered to high-reviews/high-stars |

The scraper is the segmentation engine: the SH DB rarely carries review/star data, so we **join** the two — SH business → Google listing → reviews/stars/website → owner email.

---

## 2. Segmentation model

Four dimensions. Tier is the primary axis (your idea); the rest overlay.

### Primary axis — tier by reviews × stars
Starting thresholds (calibrate to the real distribution once scraped — treat as v1):

| Tier | Criteria | Read | Campaign |
|---|---|---|---|
| **A — Top venues** | ≥ ~250 reviews **and** ≥ 4.5★ (roughly top 10–15%) | busy, established, premium, brand-proud, best credit risk | **A: Premium invite brochure** (flagship) |
| **B — Established mid** | ~50–250 reviews, ≥ 4.0★ | solid operators, workhorse audience | **B: Cashflow / low-weekly** |
| **C — Emerging / new / small** | < 50 reviews **or** opened < 12 mo (few reviews yet) | cashflow-tight, high need | **C: New-venue fit-out** |
| **Exclude / hold** | < 3.5★, or < 10 reviews with no other signal | poor experience / struggling → weaker fit **and** higher credit risk | deprioritise; revisit via Rent-only |

### Overlays
- **Geography**: Auckland (priority — dense, closest Washpro install) vs rest-of-NZ. Finance runs **nationwide** (you have active Waikato/Palmerston North customers); Auckland is the priority slice, not the only one. *[Confirm: any ops constraint limiting finance outside Auckland? If yes, state it; else NZ = one finance market.]*
- **Venue type**: cafe / restaurant / bakery / bar / caterer / food truck / cloud kitchen — drives which equipment the copy references.
- **Signal overlay** (cross-cuts tiers, highest intent): new opening / fit-out / hiring / new licence → route to Campaign C regardless of review count.

### Credit-tier link (HireHospo-specific)
Feed the tier into the **product + deposit** recommendation, since Checkmate underwrites anyway:
- Tier A/B established → Lease-to-Own eligible, reduced-deposit candidates.
- Tier C / new / low-rated → lead with **Rent 12m** (lower exposure) + standard deposit.
This makes the segmentation serve sales *and* risk, not just marketing.

---

## 3. Campaign portfolio (priority order)

| # | Campaign | Segment | Offer / lead magnet | Frame | Trigger CTA | Volume | Priority |
|---|---|---|---|---|---|---|---|
| **A** | **Premium invite brochure** | Tier A top venues | limited batch of near-new (<12 mo) premium-brand refurb gear (Rational/Convotherm/Turbofan…) at invite pricing/discount | exclusivity + loss-leader | reply **'Brochure'** | low | **1 — flagship pilot** |
| **B** | Cashflow / low-weekly ("Hospo Catalog") | Tier B established | low weekly payments across the broad refurbished range | direct value + honest scarcity (install capacity) | reply **'Catalog'** | high (~400/day) | 2 — workhorse |
| **C** | New-venue fit-out | Tier C + opening signal | personalised equipment shortlist + fit-out plan (reverse lead magnet) | signal | reply **'yes'** | medium, high intent/lead | 3 |
| **D** | Replace / upgrade (optional) | Tier B/C, older venues | swap failing gear to low weekly, Washpro installs | pain trigger | reply **'yes'** | recycle pool | later |

**How this maps to work already in the repo:**
- Campaign **A** is the full realisation of your exclusive-brochure idea → copy in `campaign-a-premium-brochure.md`.
- Campaign **B** → canonical offer + sequence in `campaign-b-cashflow-catalog.md` (Tier-B workhorse); deeper 7-section plan + funnel math + original audit in `campaigns/hirehospo-auckland-catalog/`.
- Campaign **C** = the signal play already built → `campaigns/hirehospo-new-venues-nz/`.

Run **one segment per campaign** (campaigns test audiences; A/B variants test copy). Don't blend tiers in one send — the whole point is a different offer per tier.

---

## 4. Flagship (Campaign A) in one paragraph

Take a genuinely **limited batch of near-new premium refurbished machines**, offer it as an **invite-only brochure at a discount** to a short-list of NZ's **best-reviewed** venues. It works because all three scarcity/exclusivity levers are *real*: near-new premium refurb stock genuinely is limited; the invite list genuinely is selective (you selected on public reviews); and top venues genuinely have the money, the brand pride, and the equipment-replacement cycle to want it. The brochure gets the hand raised; **finance is the back end** (outright-at-a-discount *or* low weekly, Washpro installs). Full offer rationale + 5-email sequence in `campaign-a-premium-brochure.md`. For Tier A specifically, run it **multi-touch** — email + phone + LinkedIn, and consider a **physical brochure** (direct mail converts for high-value leads), because top venues often hide the owner's email behind a gatekeeper.

---

## 5. Data pipeline (run once, then weekly for the scraper)

```
Southern Hospitality DB  +  Google Maps scrape (by city × venue type)
  → normalise + join (business → Google listing → reviews/stars/website/email)
  → dedupe against permanent "already-contacted" store
  → BLOCK-LIST check: all of data/customers.csv (existing HireHospo customers)
                      + Southern Hospitality trade/supplier contacts
                      + Washpro/partners/competitors + prior opt-outs
  → TIER (A/B/C) on reviews × stars ; attach geography + venue type + credit-tier hint
  → enrich to a decision-maker (owner/director) + PUBLISHED email  [UEMA: published only]
  → verify (Million Verifier → goods ; catch-alls → Findymail)
  → AI-qualify (fit for equipment finance? independent hospitality venue? not supplier/franchise/customer?)  [cuts 30–50%]
  → route each lead to its tier's campaign in Instantly
```

Keep the permanent contacted-store — it powers dedupe, recycling and analysis when you delete leads to control sequencer cost.

---

## 6. Volume & roadmap (right-sized to the NZ TAM)

The binding constraint is the market (~15–25k relevant NZ venues), not sending capacity — so optimise **conversion** (tiering + offer + qualification lift positive-reply toward 5–8%) and **recycle** every 3–6 months, rather than chasing raw volume. Target **~400 sends/day** at peak (20–25/mailbox, ~20 mailboxes, ~4–7 secondary domains) — not five figures.

- **Month 1 — pipeline + flagship pilot.** Build the pipeline (§5). Buy + warm domains (30-day age gate — do this first). Ship Campaign A to a small Tier-A list as a high-touch pilot (email + phone/LinkedIn, optional physical brochure). Goal: prove the premium offer, land 2–3 nameable case studies.
- **Months 2–3 — launch the workhorse + signal.** Campaign B (Tier B, scale toward ~400/day) and Campaign C (signal) run alongside. Measure **J** and positive-reply rate per campaign; lock winning offers on positive-reply rate.
- **Months 4–9 — scale + recycle + omni-channel.** Add mailboxes horizontally while placement > 80%. Start recycling completed-no-reply with repositioned angles. Add phone follow-up + LinkedIn-after-interest + retargeting.
- **Months 10–12 — full run + CRM.** Hold peak volume; integrate interested→booked into HubSpot/Zoho *on action*, with the Checkmate → Plutio → GoCardless → Washpro handoff. Review vs the 250-customer / 200-rent goal.

Grade against benchmarks: broken <1%, floor 1–2%, good 2–4%, high >5%, signal/Tier-A 8–20% positive reply. Code-red on reply collapse, placement <80%, bounce >3–5%, or daily-send drop (lead supply out).

---

## 7. Compliance, provenance & the reviews caveat

- **NZ UEMA (opt-in)** — removal facility in **every** email incl. #1; lawful basis; accurate sender ID; NZ physical address; no harvesting software. AU leads = Spam Act 2003 (same shape). **Not CAN-SPAM.**
- **Southern Hospitality DB — confirm lawful basis before sending.** Emailing a list associated with a competitor supplier raises a real flag under UEMA (consent/relationship/published-address) and the Privacy Act 2020. The compliant lane: keep only addresses that are **genuinely published** for a relevant business role, send a role-relevant offer, honour removals, don't use harvesting tools. If the DB's provenance doesn't support that, treat it as an enrichment *seed* (names to look up + re-source published addresses via the scraper), not a send-to list. Worth a quick legal sign-off given the volume.
- **Reviews/stars = targeting, not flattery.** Use them to tier and to justify the invite ("a short list of the best-reviewed kitchens"); never as a per-lead compliment line ("loved your 4.8★!") — that reads automated and tanks reply rate.
- **Brand tension to hold:** HireHospo is "a finance provider, not a discount shop." Frame Campaign A's discount as **invite pricing on a limited premium batch** (exclusive), never "cheap gear". Keep the premium positioning.

---

## 8. Open questions to confirm (don't block the pilot on these)

1. **Southern Hospitality DB**: size, fields (emails? owner names? region tags?), and **provenance/lawful basis** (§7) — the one real gate before sending.
2. **Finance nationwide?** — assumed yes (your data supports it); confirm no ops constraint limits finance to Auckland.
3. **Campaign A discount**: is it an equipment/cash discount (fine to state publicly) or a finance-rate discount (keep personalised + post-approval, no number cold)?
4. **Case-study consent**: can we name a top venue as social proof in Campaign A?
