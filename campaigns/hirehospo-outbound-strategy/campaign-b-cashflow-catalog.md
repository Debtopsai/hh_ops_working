# Campaign B (workhorse) — Growth & cashflow, Tier B established venues

The volume campaign. Audience = Tier B (≈50–250 reviews, ≥4.0★): established, thriving-but-not-yet-top independent NZ venues. **Angle = aspirational growth:** you're doing well; the climb to the top of Auckland is about consistency and operations, and financing better gear keeps your cash free for growth instead of tied up in a machine. Frame = appreciative + a productive itch. This is where most of the ~400 sends/day live.

**How B differs from A:** Campaign A is exclusivity + near-new *premium* stock + invitation, for the top ~10–15% who are already there. Campaign B is broad range + *growth/cashflow* framing at scale, for the solid middle that wants to climb. Different offer, different tier — never blend them in one send.

**Guardrails held**: no weekly $ figure before Checkmate approval; "+ GST"; no approval hype; **no crude star guarantees** (equipment → consistency/speed → the experience people review, never "buy this, get 4.5★"); secondary domains only; removal line in every email (UEMA); reviews/stars used for tiering, and as an honest aspiration, never as per-lead flattery.

**Deeper detail** (funnel math, 7-section plan, original audit) lives in `campaigns/hirehospo-auckland-catalog/`. This file is the canonical Campaign B offer + sequence.

---

## Offer

- **Core:** access better commercial kitchen equipment on **low weekly payments** (Rent 12m / Lease-to-Own 36m) instead of a big upfront spend — refurbished + warranted, Washpro delivers, installs and services it.
- **The itch (why they should care now):** upgrading normally ties up cash in equipment — right when a thriving venue most wants that cash for *growth* (marketing, staff, the next site). Financing flips that: the kitchen gets better **and** the cash stays in the business.
- **The aspiration:** the gap between a great venue and a top-of-Auckland one (4.5★+) is consistency and speed under pressure — which comes down to the gear. Better equipment lifts operations; freed cash funds the growth. Both point the same way: up.
- **Lead magnet:** the **"Hospo Catalog"** — the broad refurbished range at finance rates that isn't fully public.
- **CTA:** reply **'Catalog'**.

**Deliverable when they reply 'Catalog':** the refurbished range for their venue type (dishwasher/glasswasher, cooking line, refrigeration, prep, holding) with photos, warranty and indicative **cash** prices, plus "available from low weekly payments (+ GST) once approved" — no personalised weekly figure until Checkmate.

**Channel:** email-primary at volume. Phone follow-up on interested within 30 min; LinkedIn only after an interested reply.

---

## Email sequence

Variables: `{{firstName|there}}`, `{{CompanyName}}`, optional `{{suburb}}`. Fill `[Your Name]`, `[NZ postal address]`, `[case study — with consent]`, `[scheduling link]`, `[high-trust link]`.

### Email 1 — two A/B arms (test tone; positive-reply rate decides)

**Variant A (PRIMARY — appreciative + growth itch).**

Subject (spintax): `{{from 4 to 4.5, {{firstName}}?|{{CompanyName}}'s next level|a thought for {{CompanyName}}}}`

```
Kia ora {{firstName|there}},

{{CompanyName}} is clearly doing something right — you're one of the better-loved
kitchens around, and that's hard to earn.

So here's a thought worth leaving with you: the gap between a great venue and a
top-of-Auckland one is usually consistency and speed when you're slammed — and that
comes down to the gear in the kitchen.

The catch is that upgrading normally ties up cash in equipment, right when you'd
rather be putting it into growth.

That's the bit we solve — better refurbished-and-warranted machines on low weekly
payments (+ GST), so your cash stays in the business while the kitchen runs faster
and more consistently. Washpro delivers and installs.

We keep a Hospo Catalog of this gear that isn't public. Want me to send it? Just
reply 'Catalog'.

Ngā mihi nui,
[Your Name], HireHospo
Not for you? Reply 'no thanks' and I'll take you off the list. HireHospo, [NZ postal address].
```
> Note: this is a touch longer than the 6-sentence ideal — it's carrying the full appreciate → itch → aspiration → offer arc. Worth testing against the lean Variant B. The `from 4 to 4.5` subject is true for the whole Tier-B band, so it needs no per-lead data.

**Variant B (challenger — lean, direct).**

Subject (spintax): `{{a hospo catalog for {{CompanyName}}?|kitchen gear, {{firstName}}?|quick one for {{CompanyName}}}}`

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

### Email 2 — the cashflow-for-growth reason [T+3, same thread]
```
Kia ora {{firstName|there}},

Circling back on the catalog for {{CompanyName}}.

The reason operators go this way: instead of a big lump sum on a machine, that cash
stays free for the things that actually grow the business — marketing, staff, the
next site — and the kitchen still gets the upgrade (refurbished + warranted, Washpro
installs).

Want it? Just reply 'Catalog'.

Ngā mihi nui, [Your Name]
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 3 — aspiration + honest scarcity [T+7, same thread]
```
Kia ora {{firstName|there}},

Quick one. The venues that go from "great" to "the one everyone books" usually get
there by making the kitchen faster and more consistent — not by spending more on ads.

If lifting {{CompanyName}}'s operations while keeping your cash free for growth is
worth a look, reply 'Catalog'. We only onboard a limited number each month (Washpro
install capacity), and this month's filling up.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 4 — social proof (a venue that climbed) [T+10, links allowed]
```
Kia ora {{firstName|there}},

Thought this might land: [case study — with consent], an established Auckland
{{cafe|venue}}, upgraded their kitchen with us on weekly payments instead of a lump
sum — faster service, more consistent, and they kept their cash for growing the
business.

Happy to line {{CompanyName}} up the same way — reply 'Catalog', or here's a 2-min
look: [high-trust link].

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

### Email 5 — last call [T+14]
```
Kia ora {{firstName|there}},

Last note from me. If getting {{CompanyName}} to the next level — a sharper kitchen,
with cash freed up for growth (low weekly + GST, subject to credit approval) — is on
the list, reply 'Catalog' and I'll send it, or grab a quick time here: [scheduling
link].

If it's not the moment, or someone else runs operations, point me their way. Either
way, all the best with the mahi.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```

---

## A/B matrix (test one layer at a time; positive-reply rate decides)

| Layer | Variants | Isolates |
|---|---|---|
| Tone / angle | Variant A appreciative-growth vs Variant B lean-direct | which angle wins for Tier B |
| Aspiration lever | "from 4 to 4.5 / top of Auckland" vs "free your cash for growth" | which motivation pulls harder |
| Subject | the email-1 spins | open/reply lift |
| CTA word | 'Catalog' vs 'Send it' vs 'Yes' | reply friction |
| Sequence length | 3 vs 5 emails | do 4–5 add positive replies or just complaints |

Choose winners on **positive-reply rate**, not raw reply or opens (tracking off). Run against the control.

## Spintax QA (mandatory before send)
1. Render every permutation and read — kill nonsense combos (watch nested `{{CompanyName}}` / `{{firstName}}` inside spins).
2. Spam-check every permutation — finance vocabulary is spam-adjacent: `$`, "free", "guarantee(d)" (banned), "approval", "finance", "low weekly", "rates", "growth".

## Reply automation
- 'Catalog' → tag interested, fire the catalog, start Checkmate handoff (credit check → quote/weekly only if approved; on decline, no quote, politely). Phone within 30 min.
- 'no thanks' / removal language → opt-out + block-list the domain.
