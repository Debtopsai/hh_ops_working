# Cold Email Machine

A Claude Code plugin that encodes a complete B2B cold email system: infrastructure, deliverability,
list building, offer engineering, copywriting, signal campaigns and campaign operations.

Source methodology: Lead Gen Jay (Jay Feldman) - the 7-hour cold email masterclass, the 2026 "8
tactics that still work" video, the cold email openers video, the reverse lead magnet / SaaS magnet
video, and the Claude Code lead-gen system video. Compliance layer added for NZ, AU and EU, which
the source material does not cover.

## Install

```
/plugin install <path-or-marketplace>/cold-email-machine
```

Or drop the folder into your plugins directory and restart Claude Code.

## Structure

```
cold-email-machine/
├── .claude-plugin/plugin.json
├── shared/
│   ├── glossary.md                     pillars, triple tap, benchmarks, scaling equation, tool stack, hard rules
│   ├── compliance.md                   CAN-SPAM vs NZ/AU opt-in vs GDPR, and what changes in the copy
│   └── campaign-profile-template.md    the context object every skill reads and writes
├── skills/
│   ├── cold-email-machine/             ORCHESTRATOR - routing, build order, pre-flight gate, diagnostic ladder
│   ├── cold-email-infrastructure/      domains, DNS, providers, mailboxes, warm-up, placement automation
│   ├── cold-email-deliverability/      the diagnostic ladder, GlockApps reading, bounces, recovery protocol
│   ├── cold-email-list-building/       ICP, filters, sourcing, verification, catch-alls, AI qualification
│   ├── cold-email-offer-engineering/   front-end offers, Trojan horse, lead magnet ladder, SaaS magnets
│   ├── cold-email-copywriting/         triple tap, sequences, spintax, personalisation, split testing
│   ├── cold-email-signals/             job posts, social engagement, funding, spam-folder mining, custom
│   └── cold-email-ops/                 replies, CRM handoff, analytics, recycling, team SOP, scaling, omni-channel
└── commands/
    ├── cold-email.md                   /cold-email          full orchestrator
    ├── cold-email-audit.md             /cold-email-audit    bottom-up diagnosis
    ├── cold-email-sequence.md          /cold-email-sequence copy + spintax + A/B matrix
    ├── cold-email-list.md              /cold-email-list     ICP, filters, verification, qualification
    └── cold-email-scale.md             /cold-email-scale    capacity maths and readiness check
```

## The build order it enforces

1. Campaign profile (market first, because market gates the copy)
2. Offer - before the list, because the offer decides who the list is
3. Infrastructure - buy domains immediately, the 30-day age clock is the schedule bottleneck
4. List - filters, scrape 2x, verify, catch-all resolve, AI qualify
5. Copy - triple tap sequence, spintax, A/B matrix
6. Pre-flight gate - 14 checks, all must pass before a single send
7. Deploy
8. Ops - replies, analytics, A/B decisions, then scaling

## The four things this plugin will argue with you about

- **Scaling volume to fix a low reply rate.** Volume amplifies a bad list. Add qualification first.
- **Reaching for Clay, AI personalisation or signals before a control campaign works.** Fundamentals beat fancy.
- **Copy-first debugging.** If inbox placement is under 80%, copy is irrelevant.
- **Applying US CAN-SPAM logic in NZ or AU.** Both are opt-in regimes with active enforcement.

## Customising

Fork any SKILL.md - they are just documents. The likely edits:
- `shared/glossary.md` tool table, if your stack differs
- `shared/compliance.md` default market
- Per-brand campaign profiles saved alongside your working files

If you run a self-improvement loop (auto-learn / auto-improve style), point it at
`cold-email-copywriting` first. That is the skill where your own taste diverges most from the
defaults, and where a critique-regenerate loop pays back fastest.
