---
name: glossary
description: Shared vocabulary, benchmarks, hard rules and tool stack for every cold-email skill. Load once per session.
---

# Cold Email Glossary, Benchmarks, Stack

## The three pillars (the pyramid)

Build and debug bottom-up. A weak lower pillar makes every pillar above it irrelevant.

1. **Technical foundation** - domains, DNS, mailboxes, warm-up, inbox placement. Recipe-following. No excuse to get wrong.
2. **List** - the right human, valid email, actually a fit for the offer.
3. **Copy** - opens, reads, replies. Hardest to templatise, most fun, most over-invested in.

Ignore one pillar and you cap around 1% reply. Nail all three and you break 5-8%, occasionally 12-20% on signal plays.

## The triple tap (every cold email has three jobs)

| Tap | Job | Where it lives | Lever |
|---|---|---|---|
| 1 | Get the **open** | subject line + first sentence (preview text) | curiosity, never telegraph the sale |
| 2 | Get the **read** | body | problem + mechanism + casual credibility |
| 3 | Get the **reply** | CTA | one word, one thumb, under a minute |

## Benchmarks (use these to grade a campaign)

| Grade | Reply rate | Opportunity rate | Read |
|---|---|---|---|
| Signal / hyper-targeted | 8-30% | high | not volume-scalable, best leads you will get |
| High performing | >5% | >2% | find what is working, do more of it |
| Good, scalable | 2-4% | ~1% | scale it |
| Acceptable floor | 1-2% | 0.5-1% | works if lead value is high |
| Broken | <1% | <0.5% | stop, run the diagnostic ladder |

Bounce above ~3-5% means the list is the problem, not the copy.
Inbox placement below 80% means no copywriter on earth can save the campaign.

Expectations move inversely with prospect wealth and company size. 500+ employee targets can be 1 in 1,000. Never guarantee a reply rate without knowing the ICP.

## Volume math (the scaling equation)

- **J** = emails required to book one call. Measure it on a live optimised system. Do not guess.
- emails/day = (calls wanted per day) x J
- mailboxes = emails/day / per-mailbox daily limit (default 20-25, hard ceiling 50)
- domains = mailboxes / 5 (target roughly 100 sends/day/domain)

Example: J=500, 10 calls/day wanted, 25 per mailbox -> 5,000 emails/day -> 200 mailboxes -> 40 domains.

Scale horizontally (more mailboxes), never vertically (higher per-mailbox volume).

## Tool stack (2026 state, no tool is load-bearing)

| Job | Primary | Alternates |
|---|---|---|
| Sequencer | Instantly AI | Smartlead, Reach Inbox, Email Bison (agency, ~$600/mo, unlimited sub-accounts) |
| Domains | Spaceship, Dynadot (good API) | Porkbun, Cloudflare, GoDaddy (renewals expensive) |
| Mailbox provisioning | managed reseller (~$3/mo/mailbox) | Google Workspace direct (~$8.40), Microsoft 365, private SMTP |
| Lead data | Apollo filters + bulk scrape | Apify actors, Consulti, ZoomInfo (accurate, expensive, no bulk export), BookYourData (doctors, agents, mobile numbers) |
| Local / non-LinkedIn leads | Google Maps scraper, Leadswift | IGLeads (social), Ocean.io (website-phrase lookalikes) |
| LinkedIn scraping | ICPS (pre-validated emails) | Apify LinkedIn actors |
| Verification | Million Verifier (bulk cheap) | Consulti, EverClean (CRM hygiene) |
| Catch-all verification | Findymail | Clay-native catch-all |
| Enrichment / qualification | Clay | n8n + Perplexity Sonar, Make.com, Claude Code + Turso/Supabase/Neon |
| Scraping anything | Apify | Phantombuster |
| Social signals | Trigify | Apify LinkedIn engagement actors |
| Funding signals | Crunchbase (the source) + Apify | not Apollo (stale) |
| Deliverability testing | Instantly Inbox Placement | GlockApps (best diagnostics), EmailGuard, Warmy (primary domain only) |
| DNS / blacklist audit | EasyDMARC, MXToolbox | Google Postmaster (spam-complaint truth) |

## Hard rules (violating any one of these is the usual cause of failure)

1. Never send cold email from your primary domain.
2. Never use mailbox auto-forwarding. Reply from the sequencer unibox.
3. No links, images, tracking pixels or unsubscribe links in **email one**. Plain text only.
4. Open tracking and click tracking stay **off**, always. Reply rate is the proxy for open rate.
5. Spintax is mandatory, and the spintax output must itself pass a spam-word check.
6. Minimum 30 days domain age before first send. 60-90 preferred.
7. Never email a list you have not verified, and never email leads you have not qualified.
8. Decision makers only. No managers, coordinators, or anyone with "specialist" in the title.
9. Never buy cheap lifetime lead databases. Wrong data gets you reported as spam faster than bad copy.
10. Speed to lead. Reply inside 30 minutes or lose roughly 60% of the conversion.
