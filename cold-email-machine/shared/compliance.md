---
name: compliance
description: Jurisdictional rules for cold email. Read before writing copy or choosing a sending region. NZ/AU/EU differ materially from the US.
---

# Compliance calibration

Most US cold-email teaching (including the source methodology for this plugin) assumes CAN-SPAM. CAN-SPAM is an **opt-out** regime and enforcement against B2B cold email is effectively nil. That is not true everywhere, and the operator running this plugin is NZ-based with AU exposure. Get this right per-market before you send.

## United States - CAN-SPAM (opt-out)

Requirements that matter: accurate header/sender info, non-deceptive subject line, a physical mailing address, an opt-out mechanism honoured within 10 days.
Practical reality: enforcement against low-volume B2B outreach is rare. The methodology's advice to omit unsubscribe links from email one is a deliverability call, not a legal one, and it does create nominal CAN-SPAM exposure. Mitigate by honouring every removal request instantly and including opt-out language from email two onward.
Several US states (notably California) add their own layers.

## New Zealand - Unsolicited Electronic Messages Act 2007 (opt-in)

Materially stricter. Commercial electronic messages require **consent** - express, or inferred from an existing business relationship, or deemed where a work-role address is **conspicuously published** without a "no unsolicited messages" statement and the message is relevant to that person's role.
The published-address route is the lane B2B cold email actually lives in. To stay inside it:
- Send only to role-relevant business addresses that are genuinely published (company website, public directory), not to guessed or pattern-derived personal addresses.
- The offer must be relevant to that person's stated role. This is a legal argument for the qualification step, not just a performance one.
- Accurate sender identification is mandatory.
- A functional unsubscribe facility is mandatory and must work for 30 days. There is no email-one exemption in the Act.
- Do not use address-harvesting software or harvested-address lists.
DIA enforces and has issued penalties. Do not repeat "nobody has ever been fined" reasoning in an NZ context.

## Australia - Spam Act 2003 (opt-in)

Same shape as NZ: consent, identification, functional unsubscribe. ACMA enforces actively and fines are substantial. Conspicuous-publication inference exists and is narrower than people assume.

## EU / UK - GDPR + ePrivacy

B2B outreach can run on legitimate interest, but you need a documented balancing test, a lawful data source, a privacy notice, and honoured objection rights. Germany and Austria are effectively opt-in for B2B. Treat EU volume as a legal project, not a growth channel, unless someone has signed off on it.

## Practical policy this plugin enforces

- **US campaigns**: follow the methodology as written. Physical address in the signature. Opt-out language from email two.
- **NZ/AU campaigns**: published-role-address sourcing only, mandatory unsubscribe path in every email including email one, and mandatory qualification so relevance is defensible. Use a plain-text line rather than a tracked link, e.g. "Reply 'no thanks' and I'll take you off my list" plus a real removal process, and pair it with a compliant address in the signature. Accept the small deliverability cost.
- **EU/UK**: do not launch without explicit sign-off.
- Every market: honour removal instantly, block-list the domain, never re-add.

When the user's market is unstated and they are NZ-based, ask which market the campaign targets before writing copy. It changes the copy, not just the paperwork.
