# HireHospo cold email plan — Auckland "Hospo Catalog" (improved & fleshed out)

This is the original 7-part plan, corrected against the audit and expanded with the missing pieces (funnel math, qualification, NZ compliance, spintax, right-sized infrastructure). Read `AUDIT.md` first for the *why* behind each change.

**Goal**: ~250 new customers and ~200 machines on rent in 12 months.
**Market**: NZ (UEMA opt-in). **Primary segment**: independent Auckland hospitality venues. **Channel**: cold email as the top-of-funnel, phone + LinkedIn as follow-up.

---

## 0. The number that reframes everything — funnel math

Work backwards from the goal instead of forwards from a volume target.

| Stage | Assumption (verify with real data) | Implied |
|---|---|---|
| Customers wanted / yr | 250 | — |
| Consultation → approved & closed | ~20% | 1,250 consults/yr |
| Positive reply → consultation booked | ~50% (speed-to-lead dependent) | 2,500 positive replies/yr |
| Positive-reply rate on sends | ~2.5% (good, scalable band) | ~100,000 sends/yr |
| Sequence length | ~3 sends/prospect | ~33,000 unique prospects/yr |
| Working days | ~250 | **~400 sends/day** |
| Per mailbox @ 20/day | — | **~20 mailboxes** |
| Mailboxes / domain @ 3–5 | — | **~4–7 domains** |

**Two conclusions:**
1. The target needs **~400 sends/day**, not 12,000. The 12,000/day figure is deleted.
2. **33,000 unique prospects is at/above the entire NZ hospitality TAM** (~15–25k businesses). So the binding constraint is the market, not sending capacity — which means the whole game is **lifting conversion** (qualification, offer, signals push positive-reply from 2.5% toward 5–8%, halving the prospects you need) and **recycling** the list every 3–6 months. If cold email alone can't supply 33k qualified prospects, it is *one* channel toward the goal, not the only one. Set expectations accordingly.

---

## 1. Target audience & segmentation

**Primary ICP**: decision-makers — **owner / co-owner / director** (not managers, not "procurement heads") at independent NZ hospitality venues: cafes, restaurants, bistros, bakeries, bars, caterers, food trucks, cloud kitchens.

**Segments (test one per campaign — campaigns test audiences, variants test copy):**
- **Auckland — finance-led** (primary): the tailored rent/lease message. Densest, closest to Washpro, fastest install.
- **Rest-of-NZ — finance-led** (corrected): finance is offered nationwide (you have active Waikato/Palmerston North customers; Washpro installs nationwide). Position **outright-purchase-with-discount as an option**, not the only offer. *Confirm if any real ops constraint limits finance outside Auckland — if so, state it; otherwise treat NZ as one finance market with Auckland as the priority slice.*
- **Rest homes / aged care**: **out of scope for this campaign** — different buyer and cycle. Spin up separately if wanted.

**Exclude**: equipment suppliers, hospitality-supply/refrigeration firms, distributors, national franchise HQs, non-hospitality businesses, and everyone already in `data/customers.csv`.

---

## 2. Build & enrich the list (with the corrections)

1. **Classify the "10,000" list first** (see AUDIT C3): customers → block list; bought/scraped → verify + qualify + legal-basis or discard; prior enquirers → warm tier-1 (inferred-consent basis, still verify).
2. **Expand** via Apollo (bulk export through a scraper, not an enterprise seat) for venues on LinkedIn; **Google Maps scraper** (Leadswift/Apify) for local venues not on LinkedIn — filter has-email, resolve owner addresses where possible. NZ compliance: **published business/owner addresses only**, no pattern-guessed personal addresses, no harvested lists.
3. **Segment** by region (Auckland vs rest-of-NZ) and venue type.
4. **Verify**: bulk-verify (Million Verifier), send to **goods** only; resolve catch-alls separately (Findymail). Verify **close to send**.
5. **Qualify** (the step that was missing — see §3c). Scrape ~2× intended send volume.
6. **Dedupe** against a permanent "already-contacted" store; **block-list check** every load.

---

## 3. Messaging strategy

### 3a. Offer & copy principles
- **Core value prop**: access commercial kitchen equipment on **low weekly payments** (Rent 12m / Lease-to-Own 36m) instead of a large upfront spend — refurbished + warranted, Washpro delivers/installs/services. **Never a specific weekly figure before Checkmate approval; always "+ GST"; no approval hype.**
- **Personalisation**: `{{firstName}}` + `{{CompanyName}}` (normalised, not the ALL-CAPS legal name), optional `{{suburb}}`. **Drop the Google-review-count line** — it reads automated and it's a generic compliment. If you want a personalisation variable, use a genuine 2–8 word signal-derived observation, not readily-available data.
- **Triple tap**: subject+first line get the open (3–5 words, curiosity, never telegraph); body gets the read (≤6 sentences, one specific pain + the mechanism, casual proof); CTA gets the reply (one word).
- **Lead magnet**: keep the private **"Hospo Catalog"** (finance/member rates + refurbished range genuinely not on the public site, intake capped by Washpro install capacity — real scarcity). **A/B it against a reverse lead magnet** (a personalised equipment shortlist + fit-out plan), which the method rates higher.

### 3b. Sequence blueprint
3 value-bearing emails (default), 4–5 optional for the small TAM — but **every email must carry new value/proof/pain**, not just a nudge. Full rewritten copy with spintax, removal lines, honest scarcity, and the A/B matrix is in `sequence.md`. Cadence T+0 / +3 / +7, optional +10 (case study) / +14 (last call).

### 3c. Qualification prompt (add this)
Runs before the sequencer; expect it to cut 30–50%.
```
You are an expert sales assistant for HireHospo, an NZ financier of commercial
kitchen equipment (delivered/installed/serviced by Washpro). Decide if this lead
is a good fit to approach about financing kitchen equipment.
Good fit: independent NZ hospitality venue (cafe/restaurant/bakery/bar/food-truck/
caterer/cloud kitchen) that owns or will need commercial kitchen equipment.
Disqualifiers: equipment/refrigeration/hospitality-supply businesses, distributors,
franchise HQs, non-hospitality, existing HireHospo customers.
Lead: <name, venue, type, location, website/IG, title, published email>
Output exactly one word, yes or no.
```

---

## 4. Technical setup (right-sized)

- **Domains**: 4–7 brand-adjacent secondaries (scale in with volume), **never hirehospo.com**; each 301-redirects to the primary site. Registrar with cheap renewals + good API (Spaceship/Dynadot for .com; reputable NZ registrar for .co.nz). **Test one .co.nz vs .com** for NZ trust. **Buy today — 30-day age gate is the schedule bottleneck.**
- **Mailboxes**: Google Workspace via reseller (~$3/mo). **~3–5 per domain**, cap **20–25/day** (not 50–60). Sender = founder's real name across all; real photo; account-level signature with a valid **NZ physical address** (UEMA).
- **DNS per domain**: one SPF, DKIM (activated), DMARC at host `_dmarc` (`p=quarantine`), tracking CNAME (set but unused), MX, 301 redirect. Verify with EasyDMARC/MXToolbox + the sequencer's domain test before activating mailboxes.
- **Tracking OFF** (open + click) — grade on reply rate.
- **Warm-up** from day one, forever; ramp to campaign cap; warm a separate unmonitored mailbox per domain.
- **Sequencer**: Instantly (A/B, unibox, sub-sequences, placement testing). **Zero forwarding rules** — reply from the unibox in-thread.
- **Inbox-placement automation**: daily tests with the real copy; **pause any mailbox < 80%**, blacklist → pause 30 days, recover → slow-ramp back.
- **Deliverability testing**: Mail-Tester + GlockApps with the actual campaign copy from a campaign mailbox.

---

## 5. Execution & scaling roadmap (right-sized)

**Phase 1 — Setup & pilot (Months 1–3)**
Buy domains (day 1) → warm 30–60 days. Classify + verify + qualify the list; load block list. Build the sequence + spintax; run the pre-flight gate. Pilot to a small qualified subset from **campaign mailboxes**; validate on **reply / positive-reply rate** (not opens). Establish baseline **J**.

**Phase 2 — Optimise & scale (Months 4–9)**
Lock the winning offer (catalog vs reverse-magnet) on positive-reply rate, then subject, then CTA — one layer at a time. Scale toward **~400 sends/day** by adding mailboxes **horizontally** (20–25 each) only while placement stays >80%. Add **speed-to-lead phone follow-up** and **LinkedIn after an interested reply**. Start recycling completed-no-reply at 3 months with a repositioned angle.

**Phase 3 — Full run & CRM (Months 10–12)**
Hold ~400/day (diversify providers only if you ever pass ~100 mailboxes — unlikely at this TAM). Integrate interested→booked into **HubSpot/Zoho** *on action* (not on reply), with the credit-check handoff. Advanced A/B on offer angles + lead magnets. Review against the 250-customer / 200-rent goal; recycle and reposition for year two.

---

## 6. Compliance & best practice (NZ-correct)

- **UEMA 2007 (NZ) + Spam Act 2003 (AU)** — opt-in. **Removal facility in every email including email one**, working 30 days; lawful basis (consent / existing relationship / published role address); accurate sender ID; **NZ physical address** in the signature; **no harvested/bought lists**. (CAN-SPAM does **not** apply.)
- **Deliverability**: no spam-trigger words (test finance vocabulary explicitly), plain-text email one, spintax checked, tracking off.
- **HireHospo guardrails**: no weekly figure before credit approval; "+ GST"; no approval hype; cold from secondary domains only; block-list all customers.

---

## 7. Team & tools

- **Lead operator** (you/VA): scraping, verification, qualification, loading, the "already-contacted" ledger, block-sheet upkeep.
- **Reply owner** (one named person): the unibox, **speed to lead (reply <30 min → ~60% more conversion)**, macros, opportunity pipeline, interested→booked, the Checkmate credit handoff.
- **You**: offer, copy, split-test design + winner selection.
- **Tools**: Instantly (send/A/B/analytics/sub-sequences) → HubSpot/Zoho (nurture on action) → Checkmate (credit) → Plutio (proposal) → GoCardless (direct debit) → Washpro (fulfilment). Tag links `?utm_source=instantly` so attribution survives the handoff.

**Grade against benchmarks**: broken <1% reply, floor 1–2%, good/scalable 2–4%, high >5%, signal 8–20%. Code-red if reply rate collapses, placement drops 15–20 pts (or any test <80%), bounce >3–5%, or daily sends fall (lead supply out).
