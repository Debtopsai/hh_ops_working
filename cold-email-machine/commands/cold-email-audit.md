---
description: Diagnose a cold email system that has stopped working, bottom-up
---

Run the diagnostic ladder from the `cold-email-machine` orchestrator, bottom-up. Do not touch copy until infrastructure and list are cleared.

Symptom / context: $ARGUMENTS

1. Inbox placement with the real campaign copy (`cold-email-deliverability`)
2. DNS scan and blacklist check
3. Bounce rate and list freshness (`cold-email-list-building`)
4. Lead-list fit and whether a qualification step exists
5. Only then, copy and offer

Report: cause, evidence, fix, resume date, and the upstream change that prevents recurrence.
