# Audit — Auckland "Digital Hospo Catalog" cold email plan & script

Audited against the cold-email-machine method (three pillars, triple tap, benchmarks, hard rules, NZ compliance) and the HireHospo business overview + customer data in this repo. Severity: 🔴 critical (fix before sending), 🟠 major (fixes materially change results), 🟡 minor (polish).

The plan is strategically sound in shape — segment, enrich, sequence, warm infrastructure, scale in phases. The problems are in the specifics, and three of them are campaign-killers.

---

## 🔴 Critical

### C1. Wrong compliance regime — the plan cites CAN-SPAM; NZ is UEMA (opt-in)
Section 6 says "comply with the CAN-SPAM Act." HireHospo is NZ-based, emailing NZ businesses. The governing law is the **Unsolicited Electronic Messages Act 2007**, enforced by the DIA. It is **opt-in and materially stricter** than the US:
- A **functional unsubscribe/removal facility is mandatory in *every* message — including email one** (the US "no opt-out in email one" trick is illegal here).
- You need a lawful basis: **express consent**, an **existing business relationship** (inferred consent), or the **conspicuously-published work address** route (relevant business role, address published without a "no unsolicited messages" note).
- **No address harvesting / bought scraped lists** (see C3).
- Accurate sender identification is mandatory; a valid NZ physical address in the signature.
- **Fix:** switch the whole plan to NZ mode. Removal line + physical address in all 5 emails; source only published/relationship addresses; keep the qualification step (it's the legal relevance argument, not just a performance one). AU leads = same regime (Spam Act 2003). See `cold-email-machine/shared/compliance.md`.

### C2. Volume math is both unsafe and impossible for this market
Two separate errors compound:
- **Per-mailbox 50–60/day** is reckless. Safe start is 10/day, ramp to **20–25**, ceiling 50 only once placement is *proven*. On fresh domains, 50–60/day gets you spam-foldered fast.
- **"Scale to 12,000+ emails/day"** cannot work against the NZ TAM. NZ has on the order of **~15,000–25,000** relevant hospitality businesses *in total*. At 12,000/day you would exhaust the entire national market in **~2–3 days**, then re-hit the same people — a guaranteed spam-complaint spike. The US-scale volume playbook does not port to a small country.
- **The real constraint here is conversion, not volume.** Right-sized math to hit the goal (250 customers) is **~300–500 sends/day**, not 12,000 (full model in `campaign-plan.md`). Your own "MECHANICS: 500/day" note is the correct number and contradicts the 12,000 figure elsewhere — delete the 12,000.
- **Fix:** cap mailboxes at 20–25/day; plan for ~400 sends/day; put the effort into qualification, offer and signals (which lift reply rate) rather than raw volume.

### C3. "Start with the current 10,000-customer list" — clarify what this list actually is
The real customer database in this repo is **29 customers**. So "10,000 customers" is almost certainly a **leads/marketing list**, not paying customers. This matters enormously:
- If any are **actual/past customers** → they must be **block-listed from cold outreach** and contacted through a separate warm/nurture flow. Cold-emailing your own customers is an unforced error.
- If it's a **bought or scraped list** → hard-rule violation ("never buy cheap lifetime lead databases"): wrong data gets you reported faster than bad copy, and under UEMA harvested lists are unlawful. It must be **verified + AI-qualified + legal-basis-checked** before a single send — expect to discard 30–50%.
- If it's a **prior-enquirer / existing-relationship list** → this is the *good* case: UEMA "inferred consent" may apply, and these are your warmest cold-ish audience. Treat them as tier-1, but still verify and still honour removals.
- **Fix:** classify the 10k before using it. Do not blast it. Route customers → block list; leads → verify + qualify; enquirers → warm sequence with relationship-consent basis.

---

## 🟠 Major

### M1. Optimising on open rates — but tracking must be OFF
The plan repeatedly optimises on "open rates" and lists "custom tracking domains." Open/click tracking **stays off, always** — pixels and tracked links hurt deliverability, and the method grades on **reply rate / positive-reply rate** as the proxy. You literally cannot (and should not) tune on opens. **Fix:** tracking off; set targets on reply and positive-reply rate; grade against the benchmark table.

### M2. No spintax anywhere — mandatory at volume
The scripts are static. ESPs detect repeated phrases across volume, so **spintax is mandatory**, and every rendered permutation must pass a spam-word check. Finance vocabulary ("finance", "payment", "$", "approval", "free") is spam-adjacent, so this matters more here than usual. **Fix:** spintax greetings/connectors/phrasings; render all permutations and read them; run them through a spam checker. (Rewritten copy in `sequence.md` includes it.)

### M3. No qualification step — the highest-ROI move is missing
The plan has verification/hygiene but no **AI qualification** pass. Qualification typically removes 30–50% of a list and moves reply rates from ~1% to ~4–5%, cuts complaints, and — in NZ — is the legal relevance argument. **Fix:** add a qualification pass (fit for financing kitchen equipment? independent hospitality venue? not a supplier/franchise/existing customer?) before leads enter the sequencer. Scrape ~2× what you intend to send.

### M4. "Non-Auckland = outright purchase with discount" contradicts the business
Your own book has **active finance customers outside Auckland** (Waikato, Palmerston North), and Washpro delivers/installs/services **nationwide**. Restricting non-Auckland leads to outright purchase throws away your core value prop for ~everyone outside one city. **Fix (confirm):** offer **finance nationwide** as the default; position outright-purchase-with-discount as an *option* for buyers who prefer ownership, not the only lever. If there is a real ops constraint (servicing radius, install economics) that limits finance to Auckland, state it — otherwise drop the split.

### M5. Fabricated urgency and invented numbers (emails 3 & 5)
"Over 100+ enquiries," "closing the catalog this week," "only 7 more business days" — if untrue, this is misleading, off-brand (HireHospo's voice is transparent, "underwriting not selling"), and a spam-complaint risk. **Fix:** replace with **honest scarcity tied to a real mechanism** — Washpro's install capacity genuinely limits how many new finance customers you can onboard per month. That's true, on-brand, and still creates a reason to act.

### M6. Targeting managers/procurement heads; ICP includes rest homes
- "Managers, procurement heads" violates decision-makers-only. Small hospitality venues have no "procurement head"; the buyer is the **owner/director**. Mid-level contacts forward-or-delete, never reply. **Fix:** owner / co-owner / director only.
- **Rest homes** (aged care) are a different buyer (facilities/procurement, longer cycle, different compliance) — they dilute the ICP and the copy. **Fix:** split them into their own campaign or drop from this one.

### M7. The "Digital Hospo Catalog" is a weak lead magnet as framed
A catalog is a generic one-to-many asset (Tier-3 — "dead since ~2023"), and the "only for a select few we feel add value" framing is manufactured exclusivity stacked on Google-review flattery, which reads manipulative. The *concept* (private, finance-rate access) can work **if the exclusivity is real** — member/finance rates and the refurbished-with-warranty range genuinely aren't on the public site, and install capacity genuinely caps intake. **Fix:** make the exclusivity honest (see M5), and **A/B it against a reverse lead magnet** — a personalised "kitchen equipment shortlist + fit-out plan," which the method rates far higher and which suits your catalogue perfectly.

---

## 🟡 Minor

- **M-a. Subject line (email 1)** is ~12 words, telegraphs a pitch, and personalises with name + compliment → instant mail-merge tell. Method: **3–5 words, lowercase, curiosity, never telegraph the sale.** (Rewritten in `sequence.md`.)
- **M-b. Review-count personalisation** ("{{Rating}}, over {{reviewCount}} reviews") is "readily available" data → reads automated, and it's a generic compliment (which your own plan section 3a says to avoid). Drop it or replace with a genuine 2–8 word signal-derived line.
- **M-c. Broken merge tokens**: `{[Rating}}`, `((at low weekly costs))`, `Kia orai` typo, inconsistent `{{ }}`. Any un-populated/malformed token visibly breaks the email. Add fallbacks (`{{firstName|there}}`).
- **M-d. Email length**: email 1 is ~10 sentences; method caps the body at **6**.
- **M-e. CTA drift**: email 2 asks for "10 minutes next week" (makes them open a calendar) *and* whether they saw the catalog — two asks, higher friction. Keep the single low-resistance reply-word CTA; save calendar links for after interest.
- **M-f. Weekly-cost language**: keep it general ("low weekly payments") — **never a specific weekly figure before Checkmate approval**, and always **"+ GST"**. The current copy is OK on this; hold the line in every variant.
- **M-g. GoDaddy** has expensive renewals; prefer Spaceship/Dynadot (.com) or a reputable NZ registrar (.co.nz). Consider a **.co.nz** secondary for NZ trust (split-test vs .com).
- **M-h. Missing 30-day domain-age gate** — the single biggest schedule lever. Buy domains first, today; earliest send = purchase + 30 days.
- **M-i. No block-list step** — load every email/domain from `data/customers.csv` (+ Washpro, suppliers, prior opt-outs) so no existing customer is ever cold-emailed.
- **M-j. 5-email sequence** with emails 2/3/5 as pure nudges/urgency. Long sequences are fine for a small TAM **only if every email carries new value/proof/pain**. Consolidate to a value-bearing 3, with 4–5 optional. (Restructured in `sequence.md`.)

---

## What's genuinely good (keep it)

- **Segment-then-personalise** structure and the phased 12-month roadmap.
- **Trigger-word reply CTA** ("reply 'Catalog'") — low friction and enables reply-automation sub-sequences. Keep it.
- **Te reo / Kiwi-local voice** (Kia ora, Ngā mihi, "Kiwi customers") — on-brand and differentiating for an NZ audience. Keep it; just stop stacking it with flattery in the subject.
- **Social-proof email** (email 4) — right instinct; needs a *real, consented* case study.
- **Warm-up, Mail-Tester/GlockApps, A/B mindset** — all correct.

## Do-this-first checklist
1. Reclassify the 10k list (C3) and load customers to the block list.
2. Switch to NZ/UEMA compliance mode; removal line in all 5 emails (C1).
3. Delete the 12k/day target; plan ~400/day, 20–25/mailbox (C2).
4. Confirm the Auckland-only-finance assumption (M4).
5. Add qualification + spintax (M2, M3).
6. Rewrite the sequence per `sequence.md`; buy domains today (M-h).
