# Sequence — hirehospo-new-venues-nz

Triple tap, 3 emails (optional 4th breakup). Plain text in email one. **NZ opt-in market: a plain-language removal line is mandatory in every email, including email one** — this is the deliberate deviation from the US "no opt-out in email one" rule.

**Hard guardrails encoded below**: no weekly $ figure anywhere (credit-approval-first); "+ GST" whenever money is referenced; no approval hype ("guaranteed"/"instant approval" are banned); casual + honest tone, no salesy language.

**Personalisation variables**: `{{first_name}}` (owner; fallback "there"), `{{venue}}` (normalised venue name — never the ALL-CAPS legal entity), `{{suburb}}` (drop the clause if unknown). Keep it to these three — every extra variable is another chance to look automated or be wrong.

---

## VARIANT A (primary) — reverse lead magnet: the fit-out plan

### Email 1 — day 0, new thread, plain text

**Subject (spintax, 3–5 words, question, lowercase):**
`{{opening in {{suburb}}?|new kitchen for {{venue}}?|quick one re {{venue}}}}`

**Body:**
```
Hi {{first_name|there}},

{{Saw|Noticed}} {{venue}} is opening{{ in {{suburb}}| soon}} — {{congrats|exciting}}.

Kitting out a commercial kitchen is usually the biggest upfront hit of a new
fit-out, and most new spots would rather not have $15–20k tied up in a dishwasher
and oven before they've served a coffee.

We help NZ hospo operators get refurbished, warranted commercial gear on a low
weekly payment instead — and Washpro delivers, installs and services it locally.

Happy to {{put together|pull together}} a kitchen equipment shortlist + rough
fit-out plan for {{venue}}, matched to what similar NZ venues run.

Want me to send it over?

{{first_name|Cheers}} —
[Founder first name], HireHospo
Reply "no thanks" and I'll take you off my list. HireHospo, [NZ postal address].
```

> Note: no price, no links, no images (email-one deliverability). The removal line + physical address satisfy UEMA. "Low weekly payment" is a general statement, not a quote — no figure, no "subject to approval" needed yet.

### Email 2 — +2–3 days, SAME thread, 2 sentences

```
Hi {{first_name|there}},

{{Just floating this back up|Bumping this once}} in case it got buried — still
happy to {{pull together|put together}} that equipment shortlist + fit-out plan
for {{venue}} whenever the timing's right.

[Founder first name]
Reply "no thanks" to opt out. HireHospo, [NZ postal address].
```

### Email 3 — +3–5 days, same or new thread (split-test), the "dump" (links allowed now)

```
Hi {{first_name|there}},

Last one from me. In case it's useful, here's how we've helped other new NZ
venues open their kitchens without the big upfront spend: [high-trust link —
YouTube/Loom, or the fit-out-planner page].

The gear is refurbished + warranted, Washpro handles delivery and install
nationwide (1–3 business days), and it's a low weekly payment (+ GST, subject to
credit approval) rather than a lump sum.

If getting the kitchen sorted is on the list for {{venue}}, reply and I'll send
the shortlist + plan. If someone else owns the fit-out, point me their way and
I'll leave you to it.

[Founder first name], HireHospo
Reply "no thanks" and you're off the list. HireHospo, [NZ postal address].
```

> Links only from email 2+ (never email 1), high-trust domains only, show the URL — don't hyperlink text. Email 3 is the only place the "+ GST, subject to credit approval" line appears, and still with no number.

### Optional Email 4 — breakup (+5–7 days)

```
Hi {{first_name|there}}, last note — if the kitchen fit-out isn't a priority this
quarter, no worries at all. If it comes up, we're the low-weekly-payment route and
Washpro does the install. Just reply and I'll pick it back up.
Reply "no thanks" to opt out. HireHospo, [NZ postal address].
```

---

## VARIANT B (A/B challenger) — direct frame

Same 3-email cadence, opt-out in every email. Email 1:

```
Subject: {{{{venue}} kitchen gear|equipping {{venue}}?}}

Hi {{first_name|there}},

{{Saw|Noticed}} {{venue}} is opening{{ in {{suburb}}|}} — the kitchen is usually
the biggest upfront cost.

HireHospo finances refurbished, warranted commercial equipment on low weekly
payments (+ GST, subject to credit approval) so you're not dropping $15–20k before
you open, and Washpro delivers + installs it.

Worth a look?

[Founder first name], HireHospo
Reply "no thanks" and I'll take you off my list. HireHospo, [NZ postal address].
```

---

## A/B variant matrix (test ONE layer at a time; lock the winner before the next)

| Layer | Variants | What it isolates |
|---|---|---|
| **Offer** (biggest signal) | A reverse-lead-magnet vs B direct frame | which proposition gets the hand raised |
| Subject (within winner) | `opening in {{suburb}}?` vs `new kitchen for {{venue}}?` vs `quick one re {{venue}}` | open/reply lift from the hook |
| CTA (within winner) | "Want me to send it over?" vs "Worth a look?" vs "Should I put it together?" | reply-friction |
| TLD (infra-level) | .co.nz sender vs .com sender | does a local TLD lift NZ reply rate |
| Email 3 thread | same-thread vs new-thread | follow-up placement |

Choose winners on **positive reply rate**, not raw reply rate (a 10% reply that's all "remove me" loses to a 5% that's all interested). Check significance before killing a variant; always run against your known-good control.

## Rendered plain example (Variant A, email 1, one permutation)

```
Subject: opening in Ponsonby?

Hi Aroha,

Noticed The Corner Larder is opening in Ponsonby — congrats.

Kitting out a commercial kitchen is usually the biggest upfront hit of a new
fit-out, and most new spots would rather not have $15–20k tied up in a dishwasher
and oven before they've served a coffee.

We help NZ hospo operators get refurbished, warranted commercial gear on a low
weekly payment instead — and Washpro delivers, installs and services it locally.

Happy to put together a kitchen equipment shortlist + rough fit-out plan for The
Corner Larder, matched to what similar NZ venues run.

Want me to send it over?

Cheers — [Founder first name], HireHospo
Reply "no thanks" and I'll take you off my list. HireHospo, [NZ postal address].
```

## Spintax QA — TWO mandatory checks before deploy (do not skip)

1. **Render every permutation** (paste each spintax block into an LLM, ask for all variations) and read them — generators produce nonsense combinations (e.g. a greeting that reads "Cheers Aroha, — Aroha").  ⚠️ the `{{first_name|Cheers}}` sign-off in email 1 needs a manual fix: use a dedicated sign-off token, not the name variable, so it never renders the name twice.
2. **Run every permutation through a spam-word checker** — generators insert blacklisted words that weren't in the original. Finance vocabulary ("finance", "payment", "approval", "$") is spam-adjacent, so test the actual rendered copy, not just the template.

## Spam-check result

**PENDING** — run before send. Watch: "$", "guarantee/guaranteed" (banned anyway), "free", "approval", "finance", "low weekly". If a placement test flags keywords, it will usually name them — swap and re-test.

Hand back to `cold-email-machine`.
