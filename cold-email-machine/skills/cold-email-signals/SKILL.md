---
name: cold-email-signals
description: >-
  Design and build signal-based cold email campaigns - outreach triggered by a real, recent event
  that proves the prospect has the problem. Covers job-posting signals, social engagement signals,
  funding and company-event signals, spam-folder mining, and inventing custom signals, plus the
  enrichment and automation pipeline that turns a signal into a lead in a campaign. Use for "signal
  campaigns", "trigger-based outreach", "intent data", "how do I find people who need this right
  now", "job posting outreach", "recently funded leads", "LinkedIn engagement scraping", "my reply
  rate is capped and I want a 10-20% campaign", or when a standard filtered campaign is working and
  the user wants the next tier. Do not run this before a control campaign is working.
---

# Signal Campaigns

The biggest strategic shift in cold email. A signal removes the guesswork: instead of betting that
this person has the pain, you have evidence that they do. It also gives you something to say other
than "buy my thing".

Read `${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` first.

## Prerequisite gate

**Do not build signal workflows first.** They are complex, cost real money, and roughly half of them
still underperform a well-built control campaign. Validate the offer with fundamentals, get a working
control, then layer signals on top. If the user asks for signals before they have a control, say so.

## What a signal needs

1. A source with **accurate and recent** data. Recency is the whole game - being late on a signal is worse than not using it.
2. A way to **enrich** it into a decision maker with a verified email. Most signal sources give you a company, not a person.
3. A way to **push it automatically** into the sequencer. Signals decay; manual handling wastes them.
4. Qualification and verification, same as any list.

Expect: 5-20%+ reply rates, far better personalisation, and hard limits on volume. Signal campaigns are not scalable in the way a 100k Apollo pull is. Run them alongside, not instead of.

## The standard signal plays

### 1. Job postings
A company hiring for a role that solves your problem is telling you they have the problem *and* have budget.
- Source: scrape LinkedIn/job boards **fresh daily**. Database job data (Apollo, and even Clay) is too stale - a three-month-old posting may already be filled.
- **Exclude your own category.** Searching for "publicist" returns PR agencies, not their clients. Build the exclusion list first.
- Enrich: company → decision maker → verified email.
- Angle: "Saw you're hiring for X. We do that for a quarter the cost of a full-time hire."

### 2. Social engagement (highest quality, most underused)
Someone who comments on or likes a post about your topic has self-identified as interested, and given you something specific to reference.
- Source: monitor a set of creators or topics in your space (Trigify, or an Apify LinkedIn actor).
- You get: their LinkedIn profile, their comment, the post topic, the creator they follow.
- Enrich: LinkedIn → email (an ICPS-style tool) → verify → catch-all resolve.
- Angle: three layers of rapport - their comment, the topic, and a creator you both follow. Instant common ground. Drop your own LinkedIn in the signature and it compounds.

### 3. Funding and company events
Legitimate signals, heavily farmed. Only worth running if you are **first**.
- Source: **Crunchbase directly**, scraped daily via Apify. This is where every other database sources it, several days later. Using Apollo funding data guarantees you are last in the pile.
- Available: funding rounds and predictions, IPO predictions, growth events, leadership hires, acquisitions, news mentions.
- Best of this family: **newly hired executives.** Someone brought in to drive change will actually adopt a new solution. A CMO of ten years will not.

### 4. Spam-folder mining (the highest-converting play in the methodology)
If you sell anything related to outbound, deliverability, or email:
- Pull the senders from your own spam folder. They are sending cold email and failing at it.
- Look up their domain, diagnose why it landed in spam.
- Email them: "Your cold email landed in my spam yesterday. Here's why. Here's the fix. Want help?"
- Reply rates: **20-30%**, overwhelmingly positive.
- Volume is capped by how many people email you, which is exactly why nobody else runs it.

### 5. Custom signals (where the real edge is)
The general move: **what public, observable event proves this prospect has my problem right now?**

Examples of the pattern:
- PR agency: scrape award announcements daily → the winners have just proven they care about publicity
- SEO agency: identify sites buying low-quality backlinks → they are already paying someone for SEO
- Cyber security: scan target sites for vulnerabilities → lead with the specific finding
- Any agency: scrape award lists you also appear on, and open with shared status
- Recruiter/staffing: repeated reposting of the same role means their pipeline is failing

Once you understand "monitor the internet for an event, then enrich and route it", nothing is off the table.

## Build pipeline (same shape for every signal)

```
scheduled scrape (daily) of the source
  → filter to the recency window
  → dedupe against your permanent contacted/processed store
  → AI qualification (fit for the offer?)
  → enrich: company → decision maker → email
  → verify → catch-all resolve
  → research + write the 2-8 word personalisation from the signal itself
  → push into the signal campaign in the sequencer
```

**Tooling**: Apify for the scrape (almost anything is scrapeable, and most Crunchbase/LinkedIn actors require a pro account on the source so they can use your session). Then either Clay for the enrichment/qualification/personalisation chain, or n8n/Make, or a Claude Code pipeline writing to a database. Clay is the fastest path and the most expensive; Perplexity/Sonar via API is dramatically cheaper for the research step than a Clay browsing agent.

**Do not skip the dedupe store.** Signal workflows run daily and will re-contact the same people without it.

## Enrichment is the hard part

Most signals hand you an organisation, not a person. Budget for: company → decision-maker identification → email discovery → verification → catch-all resolution. That chain is where signal projects die. Plan it before you build the scraper.

## Buyer intent data

Apollo's buying intent is not usable. Purpose-built intent platforms are more granular and more promising, but treat any intent data as an experiment split-tested against your control until it earns its place.

## Output

Write `<slug>-signal-<name>.md`: the signal and why it proves the pain, the source and scrape cadence, the recency window, exclusions, the enrichment chain, the qualification prompt, the personalisation prompt, the dedupe store, expected daily volume, and the specific campaign it feeds. Hand back to `cold-email-machine`.
