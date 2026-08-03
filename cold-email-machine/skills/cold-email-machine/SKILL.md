---
name: cold-email-machine
description: >-
  Orchestrator for building, launching, diagnosing and scaling a B2B cold email system end to end -
  infrastructure and DNS, list building and qualification, offer and lead-magnet design, sequence
  copywriting and A/B variants, deliverability testing, signal campaigns, reply handling and scaling
  math. Use whenever the user wants to "build a cold email system", "launch an outbound campaign",
  "set up cold email", "fix my cold email", "our replies dropped", "scale outbound to X emails a day",
  "write a cold email sequence", "who should we target", or hands over an Instantly/Smartlead/Bison
  account, an Apollo filter set, a lead list, or campaign analytics. Prefer this orchestrator even
  when the user asks for only one stage (just copy, just a list, just deliverability) so the campaign
  stays internally consistent, compliant for its market, and diagnosed bottom-up against the three
  pillars.
---

# Cold Email Machine

One offer in, a running, measured cold email system out. This is an **orchestrator**: it holds the
campaign profile, decides which stage skill to run, and enforces the pillar order so nobody spends
40 hours on copy while sitting in the spam folder.

## Always load first

1. `${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` - pillars, triple tap, benchmarks, scaling equation, tool stack, hard rules.
2. `${CLAUDE_PLUGIN_ROOT}/shared/compliance.md` - the market decides the copy, not just the paperwork. NZ and AU are opt-in regimes; do not apply US advice to them.
3. `campaign-profile-<slug>.md` in the working folder if it exists. If not, create it from
   `${CLAUDE_PLUGIN_ROOT}/shared/campaign-profile-template.md` and fill what you can from the
   conversation before asking anything.

## Routing

| Situation | Run |
|---|---|
| Nothing exists yet | full build order below |
| Domains/mailboxes/DNS/warm-up | `cold-email-infrastructure` |
| In spam, placement dropped, bounces climbing, blacklisted | `cold-email-deliverability` |
| Who to email, filters, scraping, verification, qualification | `cold-email-list-building` |
| Offer is boring/competitive, needs a lead magnet or a frame | `cold-email-offer-engineering` |
| Sequences, subject lines, spintax, A/B variants | `cold-email-copywriting` |
| Trigger-based campaigns, job posts, funding, engagement, spam-folder mining | `cold-email-signals` |
| Replies, unibox, CRM, analytics, recycling, scaling, omni-channel | `cold-email-ops` |

## Full build order (never reorder)

1. **Profile** - fill the campaign profile. Market first, because it gates copy.
2. **Offer** (`cold-email-offer-engineering`) - run this *before* the list. The offer decides who the list is.
3. **Infrastructure** (`cold-email-infrastructure`) - buy domains now so the 30-day clock starts while you do everything else. This is the single biggest schedule lever.
4. **List** (`cold-email-list-building`) - filters, scrape, verify, catch-all verify, qualify.
5. **Copy** (`cold-email-copywriting`) - sequence, spintax, A/B matrix.
6. **Pre-flight gate** (below) - all must pass before a single send.
7. **Deploy** - load leads, attach all mailboxes by tag, slow ramp on, campaign live.
8. **Ops** (`cold-email-ops`) - reply handling, analytics, A/B decisions, then scaling.

## Pre-flight gate

Do not send until every line is true. State the checklist back to the user with pass/fail.

- [ ] Domains 30+ days old, SPF + DKIM + DMARC + MX valid, redirect to the primary site set
- [ ] Mailboxes warming, warm-up target equals daily campaign cap, slow ramp ON, daily cap <= 25
- [ ] Zero mailbox forwarding rules anywhere
- [ ] Inbox placement automation configured (pause below threshold, slow-ramp back above it)
- [ ] Open tracking OFF, link tracking OFF, no links or images in email one
- [ ] Copy passed a spam-word check, **including the spintax variants**
- [ ] All spintax permutations rendered and read - no nonsense combinations
- [ ] List verified (goods only) + catch-alls resolved + AI-qualified
- [ ] Block list loaded: existing customers, vendors, competitors, prior opt-outs
- [ ] Advanced deliverability on: skip hostile prospects, risky emails disallowed
- [ ] Compliance mode applied for the target market (unsubscribe path where required, physical address)
- [ ] Reply owner assigned, notifications on, reply macros drafted
- [ ] A live deliverability test run **with the actual campaign copy** from an actual campaign mailbox

## Diagnostic order (when something is broken)

Always bottom-up. Do not touch copy until the two pillars below it are clean.

1. Inbox placement test with the real copy → if <80%, run `cold-email-deliverability`
2. DNS scan + blacklist check → fix or pause 30 days
3. Bounce rate → if >3-5%, the list is stale or unverified, run `cold-email-list-building`
4. Lead list eyeball → are these actually the right humans? Qualification step missing?
5. Only now: copy, offer, CTA → `cold-email-copywriting` / `cold-email-offer-engineering`

## Output contract

For a full build, save to the working folder:

1. `campaign-profile-<slug>.md`
2. `<slug>-infrastructure-plan.md` - domains, mailbox counts, provider mix, DNS records, warm-up settings, go-live date
3. `<slug>-icp-and-filters.md` - filter sets per segment, exclusions, qualification prompt, verification workflow
4. `<slug>-offer.md` - front-end offer, frame, lead magnet spec (and PRD if it is a SaaS magnet)
5. `<slug>-sequence.md` - full 3-email sequence with spintax, plus the A/B variant matrix
6. `<slug>-preflight.md` - the gate above, ticked, with test evidence
7. `<slug>-runbook.md` - who does what daily/weekly, metrics to watch, escalation triggers

Then a short summary: what is built, what the go-live date is (gated by domain age), what J needs measuring, and the single next action.

## Anti-patterns to call out immediately

- Reaching for AI personalisation, Clay, or signal workflows before a control campaign works. Fundamentals beat fancy every time.
- Scaling volume to fix a 1% reply rate. Volume amplifies a bad list.
- Guaranteeing reply rates to a client before seeing the ICP.
- Sending from the primary domain because "it has reputation".
- Treating Instantly's health score as truth. Inbox placement testing is the only real signal.
