---
name: cold-email-copywriting
description: >-
  Write and critique cold email copy and sequences - subject lines and preview text, body structure,
  one-word CTAs, the triple tap framework, sequence length and spacing, spintax, personalisation
  (including AI personalisation done correctly), spam-word avoidance, and A/B split test design and
  interpretation. Use for "write me a cold email", "cold email sequence", "subject lines", "improve
  this email", "my copy isn't getting replies", "spintax", "split test my copy", "what CTA should I
  use", "personalisation", or any request to produce or review outbound email copy. Not general
  copywriting - the rules here are inverted for spam filters and for a reader who does not know you.
---

# Cold Email Copywriting

This is not normal copywriting. The wrong word does not lose the sale, it loses the inbox. And your
goal is not to sell - it is to find out whether this person has a problem you can solve.

Read `${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` and `${CLAUDE_PLUGIN_ROOT}/shared/compliance.md` first.
The market determines whether an opt-out line is optional or mandatory.

## The triple tap

Every email does three jobs. Write, critique and split-test them as three separate units.

### Tap 1 - the open (subject line + first sentence)

These two lines are the entire preview. They are the only thing that exists before the open/spam/delete decision.

Rules:
- **Never telegraph the sale.** If they can tell you are selling before opening, you are archived or reported.
- Should sound like it could be from a client, a vendor, a colleague. Ambiguity is the asset.
- 3-5 words. Lowercase, human, not a marketing department.
- **Questions get opens.** Answering a question is reflexive.
- Do not bait-and-switch. The body must connect to the subject or you get reported.

Working shapes:
- `Sending cold emails?` / "Not sure if this is you or someone on your team - mind checking?"
- `is this you on Google?` / "Just came across this, can you confirm it's you?"
- `quick favour` / `pulled something for you` / `list for <name>`

Since tracking is off, you cannot measure opens. **Reply rate is the proxy.** A subject-line variant with a higher reply rate almost certainly has a higher open rate.

### Tap 2 - the read (body)

Six sentences maximum. Sixth-grade reading level. If you confuse them, you lose them.

Two jobs only:
1. Name their **specific problem** and your **mechanism** for solving it
2. Establish trust with **casual, non-braggy** credibility

Working skeleton:
1. Why you are emailing *them* specifically
2. Poke one specific pain
3. Drop social proof casually, once, ideally a name they recognise from their own segment
4. The ask

Tonality must match the ICP profile - age, gender, industry, temperament. Humour lands with a young agency founder and dies with a 55-year-old dealership owner. State the ICP profile before writing and adjust deliberately.

Credibility when you have no case studies: media coverage, social following, a relevant video you made, a client in an adjacent segment. Consider doing free work to earn one anchor case study. Segment-matched proof beats impressive-but-irrelevant proof every time.

### Tap 3 - the reply (CTA)

**One word. One thumb. Under a minute.**

- No calendar links. No forms. No proposed times. No multiple questions. No "does Tuesday at 2 work" - that makes them open their calendar.
- `Worth a look?` · `Want me to send the strategy?` · `Would it be okay if I sent it over?` · `Should I send it?`
- The reply you want is "yes", "sure", "send it".
- If email one is the first touch, the reverse-lead-magnet CTA outperforms everything else (see `cold-email-offer-engineering`).

## Do / don't

**Do**: low-resistance CTA · specific problem *and* specific mechanism · casual proof · short · plain text · match tone to ICP.

**Don't**: overpromise · make claims without a mechanism ("100 leads in 30 days or your money back" with no how is instant spam) · be vague about what you do · confuse them · bait and switch · use promotional or salesy language.

## Personalisation

- **Always** use first name. Tried, true, works.
- **Be wary of company name** - "ACME LLC" or an all-caps legal name is an instant tell that this was mail-merged. Normalise it or skip it.
- **Be wary of location** - often wrong, and humans do not mention where you live.
- More personalisation is not better. Each variable is another chance to be wrong or to look automated.

**AI personalisation** helps roughly 5% of the people using it and hurts the rest. Rules if you use it:
- Never let AI write the whole email. More generated words, more chances to be wrong or to smell like AI.
- Generate **2-8 words**, one sentence, from **research that is not readily available** on a profile. Company descriptions and LinkedIn bios are readily available and read as automated.
- Good sources: recent partnerships, a specific ad they are running, a named publication feature, a technical finding from scanning their site (SEO position, security issue, page performance), a specific GitHub contribution.
- Bad: "Go Gators" (visible on LinkedIn), "I admire your company's ability to generate leads for other businesses" (obviously generated).
- **Read 100 outputs before shipping.** If fewer than 9 in 10 are accurate and human-sounding, the prompt is unusable.
- Wrong personalisation ("your GitHub integration has an issue" when they do not use GitHub) is worse than none.

## Spintax

Mandatory, not optional. ESPs detect repeated phrases across volume.

- Syntax: `{{option one|option two|option three}}`
- Spin greetings, connectors, phrasings - anything that does not change meaning.
- **Two mandatory checks after generating spintax:**
  1. Render **all** permutations (paste the block into an LLM and ask for every variation) and read them. Generators routinely produce combinations that make no sense together.
  2. Run the permutations through a **spam-word checker**. Generators routinely insert blacklisted words that were not in your original.
- Never trust a generator's output unchecked. This is the most common self-inflicted deliverability wound.

## Links, images, opt-outs

**Email one**: plain text. No links, no images, no tracking, no unsubscribe link, no opt-out phrasing. Delivery is the only goal.

**Emails two and three**: you are already in the inbox. ESPs rarely reclassify an ongoing thread. You can now include links and images.
- Links must be high-trust and recognisable: YouTube, Calendly, Loom, Vimeo. Never a link to a brand-new low-reputation domain.
- Do not hyperlink text. Show the URL.
- Opt-out, when needed, in plain language, never the word "unsubscribe": "If I'm barking up the wrong tree, just say so and I'll drop it."
- Images work when they carry information words cannot. Split test them; never in email one.
- Want to send a video? Ask permission in email one ("mind if I send a quick video?"). That is itself a great CTA.

**Once they reply, it is no longer a cold email.** Open thread, established dialogue. Send whatever you like - links, images, video, the words "deal" and "price". This is exactly why you reply from the unibox in the same thread and never forward to another mailbox.

**Market override**: in NZ, AU and the EU an unsubscribe facility is legally required in every commercial message. Use a plain-text removal instruction plus a real removal process, and accept the small deliverability cost. See `shared/compliance.md`.

## Sequences

**Default: 3 emails.** Email one almost always outperforms. Every additional send raises spam-report probability.

| Email | Timing | Thread | Job |
|---|---|---|---|
| 1 | day 0 | new | triple tap, plain text, hardest working |
| 2 | +2-3 days | **same thread** | a short nudge. "Did you catch this?" Nothing new. Two sentences |
| 3 | +3-5 days | same or new (split test this) | the dump: video, case studies, features, the full argument. Plus a graceful out |

Shorter sequences reach more people; longer sequences reach fewer people more times.
- **Large TAM** → 1-2 emails, maximise unique prospects. More arrows.
- **Small TAM** (under ~50k) → up to 4-7, but every email must carry new value, new proof, and a new pain lever. Stop immediately if placement drops or reply rate falls.

Optional email 4: the breakup. "Last note from me. If this isn't a priority this quarter, no worries. If someone else on your team owns this, point me their way." It performs.

**Sub-sequences**: trigger on a keyword in the reply (e.g. they reply "video") or on an interested tag, and fire the follow-up automatically. The simplest reliable reply automation there is.

## Split testing (do this relentlessly)

**Two levels, never mixed:**
- **Campaigns test audiences** - one industry, company size or segment per campaign, identical copy. That tells you which segment responds.
- **A/B variants inside a campaign test copy and offers** - same lead list, so differences are attributable to the copy.

**Test one element at a time.** To test 3 subject lines, 3 bodies and 3 CTAs, you run 9 variants in sequence, not simultaneously - lock the winner at each layer before moving to the next. Otherwise confounders make the data useless.

Also split test: emails two and three (almost nobody does), same-thread vs new-thread for email three, and entire offers or lead magnets against each other when starting out. Testing whole offers produces big signal; testing single words produces noise.

**Choosing winners:**
- Never on open or click rate. Those require tracking, which is off.
- Reply rate is acceptable. **Positive reply rate / opportunity rate is correct.** A 10% reply rate that is all "remove me" loses to a 5% rate that is all interested.
- Check statistical significance before killing a variant. When in doubt, hand the two variants' numbers to an LLM and ask whether the difference is significant.
- Always run against a **control** - your known-good baseline.
- Keep a permanent log of winners, losers and *why*, and feed it into every future test so the system compounds.

## Spam-word discipline

Run every draft, and every spintax permutation, through a spam-word checker before deployment. If a placement test comes back with "spam keywords detected", the report will usually name them. Some triggers are non-obvious and industry-specific - test your own vocabulary (an industry term in your company name can be enough) by running placement tests with and without the word.

## Output

Write `<slug>-sequence.md`: the 3-email sequence with spintax inline, a rendered plain example of each, the A/B variant matrix with what each variant isolates, the CTA, the personalisation variables used and their fallbacks, and the spam-check result. Hand back to `cold-email-machine`.
