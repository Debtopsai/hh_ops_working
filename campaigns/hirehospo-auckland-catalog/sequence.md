# Sequence (rewritten) — Auckland Hospo Catalog

Your concept, voice and trigger-word CTA kept. Fixed: short curiosity subjects (no telegraphing/flattery), ≤6-sentence bodies, spintax, **NZ removal line in every email**, honest scarcity (Washpro install capacity) instead of invented numbers, no weekly figures, "+ GST", fallbacks on every token.

**Variables**: `{{firstName|there}}`, `{{CompanyName}}` (normalised, not ALL-CAPS legal name), optional `{{suburb}}`. Keep to these — every extra variable is another chance to look automated. **Fill before send**: `[Your Name]`, `[NZ postal address]`, `[case study name — with consent]`, `[scheduling link]`.

---

## Email 1 — the offer [T+0, new thread, plain text, no links]

**Subject (spintax, 3–5 words, lowercase, curiosity):**
`{{a hospo catalog for {{CompanyName}}?|kitchen gear, {{firstName}}?|quick one for {{CompanyName}}}}`

**Body:**
```
Kia ora {{firstName|there}},

I'm [Your Name] from HireHospo — {{we help|we back}} Auckland hospitality
businesses get commercial kitchen equipment on low weekly payments instead of a
big upfront spend, with Washpro delivering, installing and servicing it locally.

We keep a Hospo Catalog of refurbished, warranted gear at finance rates that
{{isn't on the public site|we don't list publicly}}. We only open it to a set
number of Auckland venues at a time, because Washpro can only install so many a
month.

{{Thought {{CompanyName}} might be a good fit.|Reckon {{CompanyName}} could be a fit.}}

If you'd like a look, just reply 'Catalog' and I'll send it over.

Ngā mihi nui,
[Your Name], HireHospo
Not for you? Reply 'no thanks' and I'll take you off the list. HireHospo, [NZ postal address].
```
*No compliment, no review-count tell, no weekly figure. Scarcity is real (install capacity). Removal line present (UEMA).*

---

## Email 2 — nudge + one new reason [T+3, SAME thread, short]

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
*Not a bare nudge — it adds the refurbished-but-warranted value point. One CTA, no calendar ask.*

---

## Email 3 — honest scarcity / close the loop [T+7, same thread]

```
Kia ora {{firstName|there}},

Quick one — I know you're busy.

We onboard a limited number of new finance customers each month so Washpro can
install without delays, and this month's intake is filling up. If a low-weekly-
payment setup for {{CompanyName}}'s kitchen is worth a look, I'd like to get you
the catalog before it does.

Reply 'Catalog' and it's yours. If the timing's off, no worries at all — just say
so and I'll leave it there.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```
*Scarcity tied to a true mechanism (install capacity), not invented enquiry counts. Graceful out included.*

---

## Email 4 — social proof (optional) [T+10, links allowed now]

```
Kia ora {{firstName|there}},

Thought this might be useful: [case study name — with consent], an Auckland
{{cafe|venue}}, kitted out their kitchen through us on weekly payments instead of a
lump sum, and Washpro had them installed in a few days.

{{Short, specific outcome in one line — e.g. "opened on time without tying up
$18k in gear."}}

Happy to line {{CompanyName}} up the same way — reply 'Catalog' and I'll send the
range. Or here's a 2-min overview: [high-trust link — YouTube/Loom].

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```
*Real, consented case study only. Link is fine from email 2+; show the URL, keep it high-trust.*

---

## Email 5 — last call (optional) [T+14]

```
Kia ora {{firstName|there}},

Last note from me. If getting {{CompanyName}}'s kitchen sorted on low weekly
payments (+ GST, subject to credit approval) is on the list, reply 'Catalog' and
I'll send it — or grab a quick time here: [scheduling link].

If it's not a priority this quarter, or someone else owns the fit-out, point me
their way and I'll leave you to it. Either way, all the best with the mahi.

Ngā mihi nui, [Your Name], HireHospo
Reply 'no thanks' to opt out. HireHospo, [NZ postal address].
```
*Single primary CTA (reply-word) with the calendar link secondary. "Subject to credit approval" appears here, still no number.*

---

## A/B matrix (test ONE layer at a time; lock the winner before the next)

| Layer | Variants | Isolates |
|---|---|---|
| **Offer** (biggest signal) | Hospo Catalog vs **reverse lead magnet** (personalised equipment shortlist + fit-out plan) | which proposition raises the hand |
| Subject | the three email-1 spins above | open/reply lift |
| CTA word | 'Catalog' vs 'Send it' vs 'Yes' | reply friction |
| TLD (infra) | .co.nz sender vs .com sender | does a local TLD lift NZ reply rate |
| Sequence length | 3 vs 5 emails | do 4–5 add positive replies or just complaints |

Choose winners on **positive-reply rate**, not raw reply or opens (tracking is off). Check significance before killing a variant; always run against your known-good control.

---

## Spintax QA — two mandatory checks before send (do not skip)

1. **Render every permutation** (paste each block into an LLM, ask for all variations) and read them — kill nonsense combos (e.g. a nested `{{CompanyName}}` inside another spin rendering twice). ⚠️ The nested `{{CompanyName}}` inside the email-1 subject/lines needs a manual read-through.
2. **Spam-word check every permutation.** Finance vocabulary is spam-adjacent — test the rendered copy, watch: `$`, "free", "guarantee(d)" (banned anyway), "approval", "finance", "low weekly", "rates".

## Rendered example (Email 1, one permutation)
```
Subject: quick one for The Corner Larder

Kia ora Aroha,

I'm [Your Name] from HireHospo — we help Auckland hospitality businesses get
commercial kitchen equipment on low weekly payments instead of a big upfront
spend, with Washpro delivering, installing and servicing it locally.

We keep a Hospo Catalog of refurbished, warranted gear at finance rates that isn't
on the public site. We only open it to a set number of Auckland venues at a time,
because Washpro can only install so many a month.

Thought The Corner Larder might be a good fit.

If you'd like a look, just reply 'Catalog' and I'll send it over.

Ngā mihi nui,
[Your Name], HireHospo
Not for you? Reply 'no thanks' and I'll take you off the list. HireHospo, [NZ postal address].
```

## Reply automation (tie to the trigger word)
- Reply contains **'Catalog'** → auto-tag interested, fire the catalog/fit-out deliverable, start the credit-check handoff (Checkmate → quote only if approved).
- Reply contains **'no thanks'** / removal language → auto opt-out + block-list the domain.
- **Speed to lead**: respond to interested replies within 30 minutes from the unibox, in-thread.
