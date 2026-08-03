---
description: Build, launch, diagnose or scale a cold email system end to end
---

Run the `cold-email-machine` orchestrator skill.

Context from the user: $ARGUMENTS

Load `${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` and `${CLAUDE_PLUGIN_ROOT}/shared/compliance.md`, then look for a `campaign-profile-*.md` in the working folder. If none exists, create one from the template and fill everything you can infer before asking any questions. Then route to the correct stage skill per the orchestrator's routing table.
