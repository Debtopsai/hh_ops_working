---
name: cold-email-list-building
description: >-
  Build, source, verify and qualify cold email lead lists. Covers ICP definition, decision-maker
  targeting, Apollo and B2B database filter craft (job titles, keywords, technologies, job postings,
  exclusions), which filters are unreliable, scraping non-LinkedIn audiences (Google Maps, social,
  website-phrase lookalikes), bulk export economics, email verification, catch-all resolution, and
  the AI qualification step that reliably 2-3x's reply rates. Use for "who should I target", "build
  me a lead list", "Apollo filters", "my list isn't converting", "how do I find X", "verify these
  leads", "catch-all emails", "B2C cold email", or any question about lead sourcing or data quality.
---

# Cold Email List Building

Pillar two, and the most under-respected. Everyone thinks they already have it dialled in. Read
`${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` first.

## Framing

Your leads do not know you, do not trust you, and are not looking for your solution. You are placing
a targeted bet that this person has this pain right now. You are usually wrong, and that is fine.
The job of list building is to raise the hit rate and keep the misses from reporting you as spam.

Relevance is the spam defence. An irrelevant email is a spam complaint waiting to happen, and spam
complaints are the fastest way to destroy a domain.

## Who to target

**Always decision makers.** Founder, co-founder, CEO, President, Owner, CMO, CFO, CRO, Director.
Never managers, coordinators, or anyone with "specialist" in the title.

Why: a mid-level contact has two moves - forward it (where it dies) or delete it. Neither is a reply.
Only a decision maker has the powerful response. Filtering to decision makers roughly **doubles**
reply rates on the same list, same copy, same offer.

The objection "won't that shrink my list?" - yes, and you get half the bounce rate, double the reply
rate, and twice the meetings on half the volume.

**Who replies more:**
- Blue oceans - segments that get few marketing emails (manufacturing, farming, trades, industrials)
- Younger companies - no entrenched vendors, no incumbent loyalty
- Newly hired executives - hired to drive change, actively looking for new solutions
- Smaller companies - fewer gatekeepers, faster decisions

**Who replies less:**
- Anyone easy to find on Apollo/LinkedIn in a category everyone assumes has money (agencies, doctors, lawyers)
- Large enterprises - busier, entrenched, longer chains
- Over-farmed signals, especially "recently funded". Good signal, but you must be first, and Apollo's funding data is never first

There is an inverse relationship between how much money a prospect has and how likely they are to reply. Set expectations accordingly, and hunt for the balance point: has money, gets few emails.

## Filters that work

| Filter | Use | Note |
|---|---|---|
| Job title | always | list the decision-maker variants; the database matches similar titles |
| Location | always | filter on **company HQ**, not employee location. Zip-code radius available for local plays |
| Employee count | always | use a custom range. Exclude 1-2 employee shells |
| Email status = verified | always | unless your TAM is tiny |
| Company keywords | almost always | far more precise than industry. Industry alone gives you the whole supply chain, not the segment |
| Industry | as a stack on top of keywords | ask an LLM to map your target to the platform's exact industry list |
| Keyword **exclusions** | always | the highest-leverage filter nobody uses |
| Technologies | when relevant | download the platform's full technology list, feed it to an LLM, ask which stack signals budget and fit |
| Job postings | when relevant | hiring for the problem = has the problem + willing to spend. Database job data is stale; scrape it fresh instead |

## Filters that do not work

- **Apollo signal filters** (recent funding, rapid growth, M&A, new product) - second or third-hand and stale. Get funding from Crunchbase directly.
- **Revenue** - private companies do not disclose it, so it is guessed. Use employee count plus industry norms as the proxy.
- **Apollo buying intent** - consistently underperforms the plain filters. If you want intent data, use a purpose-built intent platform and treat it as an experiment.

## The list-building loop (non-negotiable)

1. Set filters.
2. **Open the actual results and read them.** Do these companies fit? Which keyword pulled the wrong ones in?
3. Add exclusions for whatever polluted the set.
4. Repeat until roughly 9 in 10 look right.
5. Only then export.

Skipping step 2 is where everyone goes wrong. Assuming your filters were correct is the single most common list failure.

## Sourcing routes

**Is the ICP on LinkedIn with a company page?**

- **Yes** → B2B database (Apollo default: best balance of accuracy and bulk export). Bulk-export via a scraping service rather than an enterprise seat. Track which slice you have already pulled - by state, industry, or title band - because scraping services cannot use saved-list exclusions. Scrape one state at a time.
- **Yes, and you want freshest data** → LinkedIn scraper (ICPS returns pre-validated emails, which removes a whole verification step).
- **No - local/trade businesses** → Google Maps scraper (Leadswift, or an Apify actor). Filter on has-email, broken website, missing social presence. Note most Maps scrapers return role-based addresses (info@, hello@) rather than owner addresses; pick one that resolves owners if you can.
- **No - creators/influencers** → social scrapers (IGLeads and similar). Expect roughly 1 in 10 to expose an email.
- **No - defined by a website characteristic** ("companies that support veterans") → website-phrase lookalike search (Ocean.io). Pricey, but it is the only route for these.
- **Doctors, real estate agents, or you need mobile numbers** → a specialist vertical database.

**Never**: cheap lifetime lead databases, bought lists, or anything on a one-time-fee deal. Wrong data (right email, wrong company) gets you reported faster than bad copy.

## B2C cold email

Possible but conditional. Ask one question: **is there a public, scrapeable data point that proves this person is a fit?** Homeowner status, has children, a social bio, a public interest signal. If yes and the offer is high-ticket, it works. If you are just emailing "rich people", you will send thousands of irrelevant emails, get reported, and the economics will never close. Screen B2C requests on this before agreeing to build.

## Verification

1. **Bulk verify** everything (Million Verifier or equivalent, bought in bulk for the unit price). Results split good / risky (catch-all + unknown) / bad.
2. Send **only to goods**.
3. **Resolve the riskies separately.** Typical Apollo export is 70-80% good even with the verified filter, so riskies are 20-30% of your data - and about **half of them are deliverable**. Export riskies, run them through a catch-all verification tool (Findymail or equivalent). Catch-all credits cost more, which is exactly why you run cheap bulk verification first and only pay the premium on the leftovers.
4. Never sit on a verified list. Verify close to send. Three months of drift produces hard bounces.
5. Apply the same hygiene to your warm CRM - validate on entry, and run a periodic cleaner against the whole database.

## Qualification (the highest-ROI step in the whole system)

Even a well-built filter set delivers roughly 3 in 10 leads who are not actually a fit. Run every lead through an AI qualification pass before it enters the sequencer.

Expect it to remove **30-50%** of the list. That is the point. Reply rates typically move from ~1% to ~4-5% on the remainder, spam complaints fall, negative replies fall, and campaigns last far longer before burning out.

Budget for it: scrape roughly **2x** the data you intend to send to.

**Qualification prompt shape:**

```
You are an expert sales assistant. Review the following lead and their company and decide
if they are a good fit to sell to. Use your knowledge of their industry and business model
to judge whether they have use for this offer, or whether businesses like theirs
traditionally buy solutions like this.

My offer: <offer + mechanism>
Disqualifiers: <competitors, wrong business models, resellers, agencies serving this space>

Lead company information: <description, industry, title, website content, LinkedIn>

Output exactly one word, yes or no. No explanation, no punctuation.
```

**Where to run it**: Clay is easiest (a Clay agent can browse the web, which plain LLM calls cannot). Cheaper equivalents: n8n or Make with a Perplexity/Sonar research call plus an LLM judgement call, or a Claude Code pipeline writing to a Turso/Supabase/Neon table. The research capability is what matters, not the vendor.

## Recommended pipeline

```
filters (loop until 9/10 fit)
  → bulk scrape (2x target volume)
  → bulk verify → goods
                → riskies → catch-all verify → recovered goods
  → AI qualification (removes 30-50%)
  → optional enrichment / personalisation research
  → dedupe against a permanent "already contacted" store
  → block-list check (customers, vendors, competitors, prior opt-outs)
  → sequencer
```

Keep a **permanent database of everyone contacted and their outcome**. It is what makes recycling, deduping and campaign analysis possible later, and no sequencer will keep it for you once you delete leads to control costs.

## Handoff

Write `<slug>-icp-and-filters.md`: filter set per segment, exclusion list, sourcing route, verification workflow, qualification prompt, expected yield after each stage, and cost per usable lead. Hand back to `cold-email-machine`.
