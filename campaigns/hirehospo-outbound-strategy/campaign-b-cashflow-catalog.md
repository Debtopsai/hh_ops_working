# Campaign B (workhorse) — Cashflow "Hospo Catalog", Tier B established venues

The volume campaign. Audience = Tier B (≈50–250 reviews, ≥4.0★): established, solid independent NZ hospitality venues. Offer = the broad refurbished range on low weekly payments. Frame = direct value + honest scarcity. This is where most of the ~400 sends/day live.

**How B differs from A:** Campaign A is exclusivity + near-new *premium* stock + invitation, aimed at the top ~10–15%. Campaign B is the broad refurbished range + *cashflow* framing at scale, for the solid middle. Different offer, different tier — never blend them in one send.

**Guardrails held**: no weekly $ figure before Checkmate approval; "+ GST"; no approval hype; secondary domains only; removal line in every email (UEMA); reviews/stars used for tiering, never as per-lead flattery.

**Deeper detail lives in** `campaigns/hirehospo-auckland-catalog/` — the full 7-section plan (`campaign-plan.md`), the funnel math, and the original audit (`AUDIT.md`). This file is the canonical Campaign B offer + sequence.

---

## Offer

- **Core**: access the commercial kitchen equipment you need on **low weekly payments** (Rent 12m / Lease-to-Own 36m) instead of a big upfront spend — refurbished + warranted, Washpro delivers, installs and services it.
- **Lead magnet**: the **"Hospo Catalog"** — the broad refurbished range at finance rates that isn't fully public. Light exclusivity is real (finance access + range, capped by Washpro install capacity), but this is *value/cashflow*, not the premium invite.
- **Primary pain it hits**: equipment is a big upfront cost and cashflow is tight; buying private second-hand carries breakdown risk with no warranty/service.
- **Credit-tier link**: Tier B are established → Lease-to-Own eligible, reduced-deposit candidates (Checkmate still underwrites).
- **CTA**: reply **'Catalog'** (trigger word → auto-fire the catalog + credit handoff).

## Deliverable when they reply 'Catalog'
The refurbished range relevant to their venue type (dishwasher/glasswasher, cooking line, refrigeration, prep, holding) with photos, warranty, and **indicative cash prices**, plus "available from low weekly payments (+ GST) once approved" — **no personalised weekly figure until Checkmate**.

## Channel
Email-primary **at volume** (this is the scale campaign, not the high-touch of A). Phone follow-up on interested replies within 30 min. LinkedIn only after an interested reply.

---

## Sequence (variables: `{{firstName|there}}`, `{{CompanyName}}`, optional `{{suburb}}`; fill `[Your Name]`, `[NZ postal address]`, `[case study — with consent]`)

### Email 1 — the offer [T+0, plain text, no links]
**Subject (spintax, 3–5 words, curiosity, no telegraph):**
`{{a hospo catalog for {{CompanyName}}?|kitchen gear, {{firstName}}?|quick one for {{CompanyName}}}}`

```
Kia ora {{firstName|there}},

I'm [Your Name] from HireHospo — {{we help|we back}} NZ hospitality businesses get
commercial kitchen equipment on low weekly payments instead of a big upfront spend,
with Washpro delivering, installing and servicing it locally.

We keep a Hospo Catalog of refurbished, warranted gear at finance rates that isn't
on the public site. We only open it to a set number of venues at a time, because
Washpro can only install so many a month.

Thought {{CompanyName}} might be a good fit.

If you'd like a look, just reply 'Catalog' and I'll send it over.

Ngā mihi nui,
[Your Name], HireHospo
Not for you? Reply 'no thanks' and I'll take you off the list. HireHospo, [NZ postal address].
```

### Email 2 — one new reason [T+3, same thread]
```
Kia ora {{firstName|there}},

{{Just floating this back up|Circling back once}} on the Hospo Catalog for
{{CompanyName}}.

The reason it lands well: the gear's refurbished but warranted, so you get premium
brands at a low weekly payment (+ GST) without the second-hand risk — and Washpro
handles delivery and install.

Want me to send it through? Just reply 'Catalog'.

Ngā mihi nui, [Your Name]
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 3 — honest scarcity [T+7, same thread]
```
Kia ora {{firstName|there}},

Quick one — I know you're busy.

We onboard a limited number of new finance customers each month so Washpro can
install without delays, and this month's intake is filling up. If a low-weekly-
payment setup for {{CompanyName}}'s kitchen is worth a look, I'd like to get you the
catalog before it does.

Reply 'Catalog' and it's yours. If the timing's off, no worries — just say so.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 4 — social proof (optional) [T+10, links allowed]
```
Kia ora {{firstName|there}},

Thought this might be useful: [case study — with consent], an established Auckland
{{cafe|venue}}, kitted out their kitchen through us on weekly payments instead of a
lump sum, and Washpro had them installed in a few days.

Happy to line {{CompanyName}} up the same way — reply 'Catalog', or here's a 2-min
overview: [high-trust link].

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 5 — last call (optional) [T+14]
```
Kia ora {{firstName|there}},

Last note from me. If getting {{CompanyName}}'s kitchen sorted on low weekly
payments (+ GST, subject to credit approval) is on the list, reply 'Catalog' and
I'll send it — or grab a quick time here: [scheduling link].

If it's not a priority this quarter, or someone else owns the fit-out, point me
their way. Either way, all the best with the mahi.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

---

## A/B matrix (test one layer at a time; positive-reply rate decides)

| Layer | Variants | Isolates |
|---|---|---|
| **Tone** | lean/direct (above) vs warm/appreciative (Campaign A's Variant-A voice) | which tone wins for Tier B |
| Subject | the three email-1 spins | open/reply lift |
| CTA word | 'Catalog' vs 'Send it' vs 'Yes' | reply friction |
| Product lead | "low weekly" vs "refurbished + warranted" as the opener | which pain pulls harder |
| Sequence length | 3 vs 5 | do 4–5 add positive replies or just complaints |

Choose winners on **positive-reply rate**, not raw reply or opens (tracking off). Run against the control.

## Spintax QA (mandatory before send)
1. Render every permutation and read — kill nonsense combos (watch nested `{{CompanyName}}`).
2. Spam-check every permutation — finance vocabulary is spam-adjacent: `$`, "free", "guarantee(d)" (banned), "approval", "finance", "low weekly", "rates".

## Reply automation
- 'Catalog' → tag interested, fire the catalog, start Checkmate handoff (credit check → quote/weekly only if approved; on decline, no quote, politely).
- 'no thanks' / removal language → opt-out + block-list the domain.
- Interested → phone within 30 min from the unibox, in-thread.
