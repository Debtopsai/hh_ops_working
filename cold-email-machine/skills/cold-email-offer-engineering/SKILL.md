---
name: cold-email-offer-engineering
description: >-
  Design or reposition the offer behind a cold email campaign so it actually gets replies - front-end
  offers, loss leaders, Trojan horse framing, blue-ocean repositioning, and the lead magnet ladder
  including reverse lead magnets and SaaS magnets (personalised micro-tools delivered on a
  pre-filled URL). Use for "my offer is boring", "everyone sells this", "nobody replies", "what
  lead magnet should I use", "reverse lead magnet", "SaaS magnet", "how do I stand out", "what
  should my CTA offer be", or when a campaign's copy and list are fine but the proposition is not
  compelling. Run this BEFORE list building - the offer decides who the list is.
---

# Offer Engineering for Cold Email

Pillar three's foundation. Copy cannot rescue a proposition nobody wants. Read
`${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` first.

## Frame

The goal of a cold email is **not** a sale. It is to get a hand raised. Your prospect is unaware,
not searching, and probably already using something. You need them to say "yes, tell me more" in one
word. Design the offer for that moment, not the close.

## Offer killers

- **Boring** - seen a thousand times, no spark
- **Competitive/commodity** - indistinguishable, so it becomes a price fight
- **Absurd** - big guarantees with no mechanism and no proof. Instant spam report
- **Complex** - if they cannot understand it in one read, they archive it

If your offer is genuinely unique and solves a real problem, stop here. You do not need tricks. Just
name the problem and the mechanism.

## If the offer is boring or competitive: get the foot in the door

Break your service into its component deliverables. Ask: which single piece do prospects actually
want, that competitors do not lead with, and that is cheap for you to deliver? That becomes the
**front-end offer**. Sell the retainer later.

### Strategy 1 - Loss leader

Sell something they want, that they believe is expensive, at a shockingly low price. You make nothing
on it. It buys trust and a delivery opportunity. Back-end upsells fund it.
Requires: something with high perceived value and low delivery cost, plus a real back end.

### Strategy 2 - Trojan horse

Reframe the outreach as something that is not a sale: a journalist interview, a podcast booking, a
research project, a case-study feature, a partnership exploration.

**The frame must be real.** If you say you are writing an article, write the article. If you say
podcast, have a podcast. A bait-and-switch destroys reputation and gets you reported. When the frame
is genuine, reply rates commonly move from 1-2% to 10-20%.

This is the single most reliable lever for commoditised offers. Launching a blog, publication or
podcast to make the frame real is cheap and permanent.

### Strategy 3 - Lead magnets

See the ladder below.

## Blue-ocean repositioning (if you are building an offer from scratch)

Two moves:
1. **Reposition the skill.** Same capability, unclaimed framing. "We rank you on Google" → "we train the LLMs to name you as the category leader". "Lead generation" → "influencer outreach machines for ecom brands".
2. **Reposition the audience.** Same offer, a segment everyone ignores that still has money. Ignored segments reply far more than over-farmed ones.

Spend real time here. Everything downstream - lead gen, sales, delivery - gets easier in proportion to how good the offer is.

## The lead magnet ladder

Two governing rules:
- The **more time the prospect thinks you spent on them personally**, the higher the perceived value.
- The **more time they must spend consuming it**, the lower the perceived value.

| Tier | Examples | Verdict |
|---|---|---|
| 3 - avoid | generic PDFs, whitepapers, case study decks, recorded videos | dead since ~2023. Everyone knows it is one-to-many and AI-generated. Exception: prompt packs and automation blueprints, which are usable data |
| 2 - maybe | mini courses, free trials, usable datasets (e.g. a large curated lead list) | works, unremarkable |
| 1 - good | full course access, a free software licence, a genuine sample of the service | real value, real reciprocity |
| 0 - best | **reverse lead magnet / SaaS magnet** | see below |

Use lead magnets when: the offer is competitive or a commodity, the targets are smaller businesses, and you have already tried the direct frame. They perform *worse* the further up-market you go - enterprise buyers do not want your PDF, they want the problem solved.

## Reverse lead magnets

The insight came from the Loom-video play: it worked because the prospect believed a human was
spending individual time on them. It died because it does not scale.

A reverse lead magnet keeps the perceived effort and removes the labour. Instead of "want the PDF?",
the CTA is:

> "Would it be okay if I spent an hour going through your [site / LinkedIn / ads / copy] and put together [specific deliverable] for you?"

Almost everyone says yes. And when the deliverable lands, the reciprocity debt is real - usually
worth at least a call. This is the only mechanism that has reliably produced 5%+ reply rates on the
hardest offers to sell cold.

**The delivery must be excellent.** If they say yes and you send something weak, you have converted
an interested lead into a closed door. Do not launch a reverse lead magnet you cannot deliver on.

## SaaS magnets (the current best form)

A tiny personalised web tool that generates the deliverable on load.

**How it works:**
1. Prospect replies yes.
2. You send a **pre-filled URL** carrying their identifier as a parameter (`?linkedin=<their-url>` or `?domain=<their-site>`).
3. On click it scrapes their profile/site, runs an LLM analysis, and renders the personalised result immediately. **No opt-in form, no button to press.** Every extra step destroys conversion.
4. The result page carries the download and the CTA.
5. The page carries your tracking pixels, so every click is now a retargetable audience of proven-interested prospects.

You build it once. There is no per-lead automation running.

**Build path (non-technical):** generate a PRD describing the tool, hand it to a live-coding platform (Bolt, Lovable), and give it two API keys - a scraper (Apify or similar) for the profile/site data, and an LLM key (direct or via a router). Publish, attach a domain, add pixels.
**Build path (technical):** same PRD, built in Claude Code, hosted anywhere.

**Choosing what to build:** it must be (a) genuinely useful, (b) computable from one public identifier, and (c) an obvious on-ramp to your paid offer. Audits, scans, rankings, gap analyses, generated angle/idea sets, and curated data pulls all work.

**Delivery automation:** when a reply is tagged interested (or contains a trigger word), auto-draft the response with the pre-filled URL hyperlinked and their identifier already substituted. You already have their LinkedIn or domain from the lead record.

## Output

Write `<slug>-offer.md`:
- Core offer and mechanism, stated in one sentence a sixth-grader understands
- Front-end offer, if the core is boring or competitive
- Frame: direct / Trojan horse (name the real deliverable and how it gets fulfilled) / signal
- Lead magnet decision and tier, with the reverse-lead-magnet spec and PRD if applicable
- The one-word CTA the whole thing resolves to
- Implicit objections to pre-empt (feed these to `cold-email-copywriting` and to retargeting)

Hand back to `cold-email-machine`.
