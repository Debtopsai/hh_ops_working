# Campaign A (flagship) — Premium invite brochure, Tier A top venues

The exclusive-brochure idea, built out. Audience = Tier A (≥ ~250 reviews & ≥ 4.5★). Offer = a limited batch of near-new premium refurbished machines at invite pricing. Frame = real exclusivity + loss-leader. Finance is the back end.

**Guardrails held throughout**: no weekly $ figure before Checkmate approval; "+ GST"; no approval hype; secondary domains only; removal line in every email (UEMA); reviews used as a selection *criterion*, never as per-lead flattery.

---

## Offer

- **Hero**: a curated brochure of **near-new (<12 months) premium-brand** refurbished gear — Rational, Convotherm, Turbofan, Electrolux and similar from the Washpro catalogue — refurbished, warranted, at **invite-only pricing**.
- **Why the exclusivity is honest (all three levers are real)**:
  1. *Stock* — near-new premium refurb units genuinely are limited (unlike the general range).
  2. *List* — genuinely selective; you selected on public reviews/stars.
  3. *Fit* — top venues have the money, the brand pride, and the replacement cycle for premium gear.
- **Back end**: buy outright at the discount, **or** low weekly payments (+ GST, subject to approval); Washpro delivers + installs nationwide.
- **Brand line to hold**: this is *invite pricing on a limited premium batch* — exclusive, not "cheap". HireHospo stays a finance provider, not a discount shop.
- **CTA**: reply **'Brochure'** (trigger word → auto-fire the brochure + credit handoff).

## Deliverable when they reply 'Brochure'
A genuinely good brochure: the near-new premium units with photos, brand, age, warranty, and **discounted cash price**; plus "available from low weekly payments (+ GST) once approved" — **no personalised weekly figure until Checkmate**. A weak brochure converts an invited top venue into a closed door — make it excellent.

## Channel (Tier A is high-value → multi-touch, not email-only)
Top venues often hide the owner's email behind a gatekeeper, so email alone under-reaches them:
1. **Email** sequence below (primary).
2. **Phone** follow-up on interested/opened (speed to lead < 30 min).
3. **LinkedIn** connect after an interested reply.
4. **Physical brochure** (direct mail, ~$3–5) to the highest-value non-responders — physical converts for high-value leads and reinforces "premium/exclusive".

---

## Sequence (variables: `{{firstName|there}}`, `{{CompanyName}}`; fill `[Your Name]`, `[NZ postal address]`, `[case study — with consent]`)

### Email 1 — the invitation [T+0, plain text, no links]

Two A/B arms for the "angle" test — run them head to head and let **positive-reply rate** decide the tone question.

#### Variant A (PRIMARY — appreciative, client copy)
Kept exactly as written. Only mechanical bugs fixed (typo, broken `{[Rating}}` token, stray `(( ))`, name fallback) + the NZ-required removal line added — no wording changed.

**Subject:** `Kia ora {{firstName|there}}, we appreciate the value you're adding to our Auckland community.`

```
Kia ora {{firstName|there}},

I just wanted to say how impressed I was with {{CompanyName}}'s {{rating}}, with
over {{reviewCount}} generous reviews. It's clear Kiwis in Auckland love what
you're dishing up.

To introduce - I'm [Your Name] from HireHospo.
Like you, we also have a mission to make our customers happy.

For us, it's pretty simple: solving the equipment ownership equation for Auckland
hospitality businesses.

We allow businesses like yours to have access to high quality operations (at low
weekly costs), so you can focus on what you do best - create amazing experiences
that Kiwi's rely on.

To help, we have a Digital Hospo Brochure (which you won't find publicly) - only
for a select few restaurants in Auckland we feel are adding value to our local
community.

If you'd like access to this - feel free to reply to this email with 'Brochure.'

Ngā mihi nui,

[Your Name]
HireHospo
Not for you? Reply 'no thanks' and I'll take you off our list. HireHospo, [NZ postal address].
```
> ⚠️ **Merge-field names must match your tool's columns exactly** — `firstName`, `CompanyName`, `rating`, `reviewCount`. If a column is named differently (e.g. `stars`, `google_rating`), the token renders blank. Set a fallback on every field. **Skip any lead missing `rating`/`reviewCount`** so this email never sends with a blank where a number should be.

#### Variant B (challenger — lean)
**Subject (spintax):** `{{an invite for {{CompanyName}}|premium refurb — invite only|short list for {{CompanyName}}}}`

```
Kia ora {{firstName|there}},

I'm [Your Name] from HireHospo. We've drawn up a short list of {{Auckland's|NZ's}}
best-reviewed kitchens for something we don't run publicly, and {{CompanyName}} is
on it.

We've just taken in a limited batch of near-new premium gear — think Rational,
Convotherm, Turbofan — under 12 months old, refurbished and warranted, at
invite-only pricing.

Because the stock's limited, the brochure only goes to a handful of top venues. You
can take it outright at the discount, or on low weekly payments (+ GST, subject to
approval), and Washpro delivers and installs.

Want me to send it over? Just reply 'Brochure'.

Ngā mihi nui,
[Your Name], HireHospo
Not for you? Reply 'no thanks' and I'll take you off the list. HireHospo, [NZ postal address].
```
*A tests warm/appreciative (your copy) vs B tests lean/curiosity. Both carry the removal line (UEMA). Emails 2–5 below follow whichever Email-1 wins.*

### Email 2 — one new reason [T+3, same thread]
```
Kia ora {{firstName|there}},

{{Floating this back up|Circling back}} on the premium brochure for {{CompanyName}}.

The pull with these near-new units: you get top-brand gear with warranty at a big
step down from new — the refurb is what makes premium affordable, not a compromise
on quality.

Happy to send it — just reply 'Brochure'.

Ngā mihi nui, [Your Name]
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 3 — honest scarcity [T+7, same thread]
```
Kia ora {{firstName|there}},

Quick one — this batch of near-new premium stock is limited, and it's moving. I'd
rather {{CompanyName}} saw the brochure before the best units go.

If premium gear at invite pricing is worth a look, reply 'Brochure' and it's yours.
If the timing's off, no worries — just say so and I'll leave it there.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```
*Scarcity is true (limited near-new stock), not an invented enquiry count.*

### Email 4 — social proof [T+10, links allowed]
```
Kia ora {{firstName|there}},

Thought this might land: [case study — with consent], one of {{Auckland's|the
region's}} top {{restaurants|venues}}, upgraded to near-new premium gear through us
rather than paying new-price up front — Washpro had them installed in days.

Same brochure's open to {{CompanyName}}. Reply 'Brochure', or here's a 2-min look:
[high-trust link].

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 5 — last call [T+14]
```
Kia ora {{firstName|there}},

Last note from me. If near-new premium gear at invite pricing (outright, or low
weekly + GST, subject to approval) is of interest for {{CompanyName}}, reply
'Brochure' and I'll send it — or grab a quick time here: [scheduling link].

If it's not the moment, or someone else runs the kitchen fit-out, point me their
way. Either way, all the best with the mahi.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

---

## A/B matrix (test one layer at a time; positive-reply rate decides)

| Layer | Variants | Isolates |
|---|---|---|
| **Angle** | "invite / exclusivity" vs "near-new premium at a discount" | does exclusivity or the deal pull harder for Tier A |
| Subject | the three email-1 spins | open/reply lift |
| CTA word | 'Brochure' vs 'Send it' vs 'Yes' | reply friction |
| Channel | email-only vs email + physical brochure | does direct mail lift Tier-A conversion |
| Proof | with vs without the case-study email | is the named venue worth the extra touch |

## Spintax QA (mandatory before send)
1. Render every permutation and read — kill nonsense combos (watch the nested `{{CompanyName}}` inside spins).
2. Spam-check every permutation — finance/premium vocabulary is spam-adjacent: `$`, "discount", "free", "premium", "approval", "finance", "invite". Test the rendered copy, not the template.

## Reply automation
- 'Brochure' → tag interested, fire the brochure, start Checkmate handoff (credit check → quote/weekly only if approved; on decline, no quote, politely).
- 'no thanks' / removal language → opt-out + block-list the domain.
- Interested → phone within 30 min from the unibox; LinkedIn connect; escalate high-value non-responders to the physical brochure.
