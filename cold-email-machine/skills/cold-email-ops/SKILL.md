---
name: cold-email-ops
description: >-
  Run a live cold email system day to day - reply handling and speed to lead, unibox workflow and
  reply macros, reply automation, the cold-to-warm CRM handoff, campaign analytics interpretation,
  A/B winner decisions, lead recycling and list rotation, block lists, team SOPs and role split,
  the scaling equation, and omni-channel follow-up (retargeting, voicemail drops, direct mail,
  LinkedIn). Use for "how do I handle replies", "our replies aren't converting", "should I scale",
  "how many mailboxes to send X per day", "reply automation", "recycle my old leads", "campaign
  analytics", "who should own the unibox", "retargeting cold email leads", or anything about
  operating rather than building the system.
---

# Cold Email Ops

The build is a fraction of the work. A cold email machine is maintained, not set and forgotten. Read
`${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` first.

## Reply handling (the single biggest point of value leakage)

You spent a lot to get this person to raise their hand. Most operators drop it here.

- **Speed is everything.** Reply within 30 minutes and convert roughly 60% more. Target 5-10 minutes. Push notifications on, mobile app installed.
- **Speed beats personalisation.** A fast canned reply beats a beautiful reply two hours later.
- Reply **from the sequencer unibox, in the same thread**. Never from another mailbox. Once they have replied it is a warm dialogue and you can send links, images, video, and use words you could not use cold.
- Build a **reply macro library** and keep adding to it. Modern uniboxes learn which macro you use for which reply shape and start suggesting.
- Set a **follow-up reminder on every reply**: no response in a week, nudge. This alone lifts interested-to-booked conversion materially. It often takes 3-4 exchanges to catch someone at the right moment.

**Check the "others" tab daily.** Replies from people you deleted to save on lead quota, or from a different address, land there. There is gold in it. Merge them back to the lead record where possible.

**Work the soft nos.** "Not interested right now, thanks" is a courteous human who engaged. Reply: acknowledge, correct the misread if there is one, leave case studies and a door open. They will not report you - they already engaged. Build a soft-no macro.

**Hard nos** ("never contact me again"): delete lead, add to block list, move on. Enable skip-hostile-prospects. Prepare the team for it - this is normal in outreach and far gentler than door-knocking or cold calling.

**How to blow a reply**: taking days · sending a canned reply that ignores their actual question · info dumping (answer the question, then move to a call - if you dump everything, there is no reason to take the call) · no clear next step · not following up.

## Cold to warm

Do **not** push interested replies into your main CRM. They have not opted in yet.

Move them only when they take an action: book a call, fill a form, request the deliverable. That action should automatically create the contact in the main CRM and drop them into nurture and reminder sequences. Use the sequencer's own opportunity pipeline for the interested-but-not-yet-actioned stage.

Tag every link you send with a source parameter (`?utm_source=<sequencer>`) so attribution survives the handoff. Otherwise you cannot answer "did cold email make money", only "did cold email get replies".

## Block list hygiene

Two layers:
1. The sequencer's own list, fed by the unibox and by AI triggers (auto-block on unsubscribe language or abusive keywords).
2. A **shared sheet** of emails and domains that the sequencer reads continuously: current customers, past customers, vendors, partners, competitors. Add "write to the block sheet" as a step in every CRM automation, so a new client is never cold emailed.

## Analytics

Track at three levels:
- **Account**: total emails sent (this is the operational health metric - if it drops, someone stopped loading leads), reply rate, opportunity rate. Open and click must read 0% - if they do not, tracking is on somewhere and you are damaging deliverability.
- **Campaign**: reply rate and positive reply rate per campaign, per step, per variant.
- **Mailbox**: combined score, but only as a hint. Inbox placement testing is the real signal.

Grade against the benchmark table in the glossary. Reply rate and opportunity rate normally track 1:1 - when they diverge, the offer or the list differs between variants, and that is the interesting finding.

**Campaign is broken, mailbox or campaign fault?** If all mailboxes are shared across all campaigns (which they should be, attached by tag), account analytics will not isolate it. Instead: inspect the lead list for fit and provider mix → check statuses for bounces and mass not-interesteds → run a GlockApps test with **that campaign's exact copy from a mailbox in that campaign**. If placement is clean, it is the list or the offer.

**Code red triggers** - investigate immediately:
- Reply rate collapses versus the prior 7 days
- Inbox placement drops 15-20 points
- Bounce rate climbs above 3-5%
- Total emails sent falls (lead supply has run out)

## A/B decisions

Choose winners on **positive reply rate**, not raw reply rate. Verify statistical significance before killing a variant - hand the two variants' numbers to an LLM and ask. When two variants are genuinely indistinguishable after real volume, they are not different enough: kill one and introduce a bigger swing.

Keep a permanent log of every test, its result, and the reasoning. That log is what makes the tenth campaign smarter than the first.

## Lead lifecycle

**Removing leads**: sequencers charge by leads stored. When a campaign hits 100% complete:
1. Filter to contacted-only (never delete not-yet-contacted).
2. **Download everything, including lead status** - contacted, replied, interested, not interested, bounced. This is the asset.
3. Append to a permanent store (sheet or database).
4. Delete from the sequencer, clone the campaign fresh, load new leads and new A/B variants.

**Recycling** (essential for a small TAM): re-contact at 3-6 months. Nobody remembers a cold email from three months ago.
- Filter to **completed, no reply**. Exclude interested (they are a sales problem now, not a prospecting one) and not-interested.
- **Reposition.** They ignored you once for one of three reasons: not a fit, no trust yet, or no pain at that moment. Change the pain lever, change the proof, change the angle. Same offer, different door.

## Team SOP

Three roles. Do not give the unibox to three people - diffusion of responsibility means nobody answers it.

| Role | Owns |
|---|---|
| **Lead operator** | filters, scraping, verification, qualification, loading campaigns, deleting and archiving completed lists, keeping the "already scraped" ledger |
| **Reply owner** | the unibox, speed to lead, macros, the opportunity pipeline, converting interested to booked |
| **You** | offers, copy, split-test design and winner selection, strategy |

Daily checks: emails sending, reply rates, inbox placement tests, mailbox health, unibox at zero including the others tab.

## Scaling

Only after the system is optimised. Scaling a broken system just breaks it faster.

1. Measure **J** (emails per booked call) on the live optimised system.
2. Decide the call volume your sales capacity can actually absorb. Do not 10x a team that handles 10 calls a day.
3. Apply the scaling equation from the glossary.
4. Add mailboxes horizontally. Diversify providers past ~100 mailboxes.
5. Scale slowly. Common failure modes: reply buildup (stop scaling, the team cannot keep up), lead mismanagement (people lost, not answered), **lists running out** (the most common - the whole system stalls while you pay for idle mailboxes), and copy burnout from sending the same thing at volume.

The lead-supply role is the fragile one. If that person leaves and nobody knows which segments were already scraped, you lose the ledger. Document it as a shared artefact, not in someone's head.

## Reply automation (three tiers)

**Tier 1 - built in.** Enable the sequencer's AI reply suggestions and lead-status tagging, plus positive-reply notifications. Connect your own LLM key. Build the macro library. No engineering needed. Do not enable full autonomous inbox management.

**Tier 2 - assisted.** Webhook on reply-received → research the lead (Perplexity or similar) → an LLM assistant trained on your reply knowledge base drafts a response → log it → email the salesperson the draft, the research and a direct unibox link. They read, adjust, send. Removes the research and blank-page time while keeping the human.

**Tier 3 - autonomous with a check step.** Webhook → pull the full thread from the sequencer API → categorise the reply into finer buckets than interested/not-interested (interested, soft no, hard no, trigger-word for the reverse lead magnet, out of office, wrong person) → an agent with thread memory, web research and a vector knowledge base drafts the reply → write it to a review table (Notion/Airtable) → a human marks it good, or corrects it → good fires the send via the sequencer API in the same thread; corrections train the knowledge base with the revision and the reasoning. Hard nos auto-delete and block. Trigger-word replies fire the fulfilment workflow with no human step.

Build tier 3 only once you have 10+ replies a day. Do not solve a problem you do not have.

## Omni-channel

Cold email is the cheapest top-of-funnel there is. Once someone has clicked anything, they are a retargetable audience.

| Channel | When | Notes |
|---|---|---|
| **Retargeting ads** | always, first thing to add | pixel the destination (site, Calendly, the SaaS magnet page). Focus budget in the first 30 days, taper to 90. Start with Meta, Google Display, YouTube, LinkedIn; then TikTok, Reddit, Quora. Very hard to lose money on retargeting |
| **Voicemail drops** | on open or on reply | phone does not ring, they get a voicemail notification and often call back - have someone ready to answer. Clone your voice, have an LLM write a per-lead script, fire it via a voicemail drop API |
| **Direct mail** | high-value leads, or after an interested reply | genuine pen-plotted handwritten letters (~$3 each) get opened. Bulk printed mail mostly does not |
| **LinkedIn** | after an interested reply | ~30 connections/day ceiling, so reserve it for engaged leads |
| **SMS** | avoid | high phone-ban risk, people hate cold texts |
| **AI outbound calling** | avoid | kills the deal. Use voicemail drops and take the callback |

**Retargeting creative**: counter the implicit objections (what stops them buying that they will never say out loud), show segment-matched case studies, and highlight the specific feature that matters to each buyer type. Get conversion tracking set up properly - pay someone once if needed.

## Output

Write `<slug>-runbook.md`: role assignments, daily and weekly checks, benchmark thresholds and code-red triggers, the recycling policy, the block-list process, the reply macro library, the current J and the scaling plan. Hand back to `cold-email-machine`.
