---
name: cold-email-deliverability
description: >-
  Diagnose and fix cold email landing in spam, promotions, or bouncing. Covers the full diagnostic
  ladder (DNS, blacklists, domain age, copy, reputation, bounces), reading GlockApps and inbox
  placement reports, hard vs soft bounces, catch-all risk, spam-word and spintax checking, Google
  Postmaster, and the standard recovery protocol. Use for "my emails are going to spam", "inbox
  placement dropped", "bounce rate climbing", "am I blacklisted", "why did replies fall off a
  cliff", "promotions tab", "reputation dropped", or any request to test or repair deliverability.
  Also usable as a standalone consulting workflow for auditing someone else's sending.
---

# Cold Email Deliverability

The highest-value sub-skill in cold email and the one almost nobody is good at. Read
`${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` first.

## First principle

You cannot see open rates (tracking is off, permanently). So you cannot infer spam placement from
engagement. **Live inbox placement testing is the only ground truth.** Mailbox "health scores" are
warm-up self-reporting and mean nothing.

Two separate failure modes, often confused:
- **Spam placement** - the message arrives but is filed away.
- **Bounce** - the message is rejected outright. Bounces are *not* only invalid addresses.

## The diagnostic ladder (run in order, stop at the first failure)

### 1. DNS configuration
Scan the domain (EasyDMARC or MXToolbox). Confirm SPF (exactly one record), DKIM, DMARC, MX.
If broken: **pause all campaigns immediately** - sending while broken deepens the damage - fix, then resume slowly.
A "medium risk" rating usually just means DMARC is not `p=reject`. That is fine for cold email.

### 2. Blacklists
Check **domain** blacklists, and IP blacklists only if you are on unmanaged SMTP.
- Google/Microsoft IPs appearing on lists: ignore, they rotate them.
- Domain on Spamhaus, SORBS, Spamcop or similar: this is almost certainly your cause.
- Recovery: stop all cold sending on that domain, warm-up only, ~30 days. There is no faster route.
- **How you got there**: blacklist operators seed spam traps - dead or synthetic addresses planted across the web. Hitting one flags you. A blacklist hit is a data-source indictment. Audit where the list came from.

### 3. Domain age
No tool will ever tell you this was the cause. If domains are under 30 days, that is the answer.
Microsoft is especially harsh on young domains. Only fix: wait, or use older domains.

### 4. Copy
The receiving ESP reads the message. Trigger words, promotional phrasing, links, images and tracking code all move you.
- Run the copy through a spam-word checker, then run the **spintax permutations** through it too. AI-generated spintax routinely injects blacklisted words and nonsense pairings.
- Shorter copy gets through better.
- Low-reputation links hurt most. A link to a brand-new domain is worse than no link.
- No unsubscribe links, no opt-out phrasing, in email one.
- **Promotions tab is functionally spam.** It is almost always a copy problem. Iterate copy and re-test until you are out.

### 5. Reputation
The residual. If DNS is clean, no blacklists, domains aged, copy tested clean, and you are still placing badly: your reputation is degraded from spam complaints.
- Only visibility into actual complaint rates is **Google Postmaster** (add every primary domain and subdomain; optionally cold domains too). Nothing else reports complaints.
- Only remedy: reduce cold volume, increase warm-up, wait. 4-8 weeks.
- Root cause is upstream: you emailed people who had no business being on the list. Fix the list or this recurs.

## Bounces

| Type | Causes | Reputation impact |
|---|---|---|
| Hard | address does not exist, domain does not exist | severe |
| Soft | mailbox full, server down | negligible |
| Rejection | content flagged, sender blacklisted, poor reputation | severe, and commonly misread as "bad data" |

The most common hard-bounce cause is **list decay**, not bad scraping. A list verified three months ago has people who changed jobs since. Never sit on verified lists. Verify close to send, and never send to catch-alls, riskies or unknowns without resolving them first.

Auto-pause campaigns on high bounce rate. It is a list emergency, not a copy issue.

## Running a real test

1. Pick a mailbox actually in the campaign.
2. Use the **live campaign copy**, not a template.
3. Send to a seed list (GlockApps gives the deepest diagnostics; the sequencer's built-in placement test is fine for monitoring).
4. Read the report in this order:
   - **Domain blacklists** - if listed, that is your answer
   - **IP blacklists** - ignore on Google/Microsoft
   - **Auth** - DKIM/DMARC/SPF pass?
   - **Spam filter reason** - the gold. It will literally tell you "spam keywords detected" and name them
   - **Per-provider placement** - this is where nuance lives

**Reading per-provider placement**: 20% overall spam is meaningless on its own. 20% spam concentrated in Zoho and Proton, while Google and Microsoft inbox at 100%, is fine and you change nothing. 20% spam that *is* Google Workspace is an emergency. Always drill into the provider breakdown before acting.

Also check how the message *renders*: an email can reach the inbox wearing a "this message seems dangerous" banner. That is worse than spam and no placement test flags it. Send a copy to your own accounts across providers and look.

## Recovery protocol (same regardless of cause, unless the cause is copy)

1. Remove the affected mailboxes - **and every mailbox on that domain** - from all campaigns.
2. Warm-up only. No cold sends.
3. Tag them with a start date so you can find them.
4. Wait 30 days minimum (blacklist clearance window). Re-test at 30, extend to 60 if still bad.
5. If still bad at 60 days after a copy change, leave them warming and replace them in the rotation.
6. If the cause **is** copy: change the copy, re-test, resume. No waiting period needed.

## Consulting note

This is a sellable standalone service. Most operators are stuck in spam, cannot diagnose it, and will pay to have it fixed. The ladder above is the entire service.

## Handoff

Write findings as: cause identified, evidence, action taken, resume date, and the upstream fix that prevents recurrence. Hand back to `cold-email-machine`.
