# Runbook — hirehospo-new-venues-nz

The build is a fraction of the work; a cold email machine is maintained, not set-and-forget.

## Roles

| Role | Owns | HireHospo mapping |
|---|---|---|
| **Lead operator** | signal scrapes, verification, qualification, loading campaigns, the "already-contacted" ledger, block-sheet upkeep | you / a VA |
| **Reply owner** | the unibox, speed-to-lead, macros, the opportunity pipeline, interested→booked | **one named person** — never split the unibox 3 ways |
| **Strategy** | offers, copy, split-test design + winner selection | you |

## The interested-reply → sale handoff (HireHospo-specific, critical)

A "yes" is **not** a quote. The golden rule holds:

```
positive reply ("yes / send it")
  → send the fit-out shortlist + plan (cash prices, "+ GST", NO weekly figure)
  → collect details → CHECKMATE CREDIT CHECK
  → approved  → quote (weekly + GST, deposit tiers, rent-vs-lease) via HTML email → Plutio proposal
  → declined → politely, no quote issued
  → contract signed → deposit → GoCardless direct debit → Washpro dispatch (1–3 business days)
```

- Do **not** push interested replies into HubSpot/Zoho until they take an action (reply-yes counts as the action to send the deliverable; create the CRM contact when they engage with the quote/proposal).
- Tag links with `?utm_source=instantly` so attribution survives into the CRM.

## Speed to lead

- **Reply within 30 minutes** → ~60% more conversion. Target 5–10 min. Push notifications on, mobile app installed.
- A fast canned reply beats a perfect reply two hours later.
- Reply from the **Instantly unibox, in the same thread** — never from another mailbox (that turns a warm reply back into a cold email).
- Follow-up reminder on **every** reply: no response in a week → nudge. It often takes 3–4 exchanges.
- Check the **"others" tab daily** — replies from deleted leads / other addresses land there.

## Reply macro library (seed set — keep adding)

- **"yes / send it"** → deliver the shortlist + plan; ask 2 quick qualifying Qs (venue type, target open date); tee up the credit step.
- **"how much / what's the weekly?"** → "Depends on the gear + your approval — that's why I send the shortlist first, then we confirm the weekly (+ GST) once you're approved. Want the shortlist?" (**never a number here**).
- **"is refurbished reliable?"** → warranty + Washpro services it; refurb is what keeps the weekly low and gets you premium brands.
- **"already sorted / bought it"** → congrats; leave the door open for the next site or a second-hand upgrade later; add a recycle reminder.
- **Soft no** ("not right now") → acknowledge, correct any misread, leave a case study + open door. Don't delete — recycle in 3–6 months.
- **Hard no** ("never contact me") → delete, block-list the domain, move on. Enable skip-hostile-prospects.

## Daily / weekly checks

- **Daily**: emails actually sending (if volume drops, the lead supply ran out — the #1 stall), unibox at zero incl. "others" tab, reply/positive-reply rate, inbox-placement tests, mailbox health.
- **Weekly**: signal scrapes ran and deduped, list topped up (small TAM burns out fast), A/B readouts, block-sheet synced with any new signed customers.

## Benchmarks & code-red triggers

Grade against the glossary table. For this **signal** play expect a higher ceiling (8–20%); the broad B challenger sits at 2–4%.

Investigate immediately if:
- Reply rate collapses vs the prior 7 days
- Inbox placement drops 15–20 points (or any single test < 80%)
- Bounce rate climbs above 3–5% (→ list problem, re-verify)
- Total emails sent falls (→ lead supply out)

Diagnose **bottom-up**: placement test with real copy → DNS/blacklist → bounce/list fit → only then copy/offer.

## Recycling (essential — small TAM)

- Re-contact **completed, no-reply** at **3–6 months** (exclude interested + not-interested).
- **Reposition**: change the pain lever / proof / angle — e.g. switch from "opening" framing to "6 months in — time to upgrade the gear that's already struggling?" Same offer, new door.
- Keep the permanent contacted-store; download full lead status before deleting from Instantly to control cost.

## Omni-channel (add in order)

1. **Retargeting** first — pixel the fit-out-planner page / destination; Meta + Google Display to start. Counter the unspoken objections (refurb reliability, delivery hassle) with segment-matched proof.
2. **Handwritten direct mail** (~$3) for high-value leads or after an interested reply — high open rate.
3. **LinkedIn** only after an interested reply (reserve the ~30/day connection ceiling for engaged leads).
4. **Avoid** cold SMS and AI outbound calling.

## Scaling (only once optimised)

1. Measure **J** (emails per booked call) on the live system — don't guess.
2. Set call volume to what Checkmate + Washpro + the reply owner can actually absorb.
3. Apply the scaling equation; add mailboxes **horizontally**; diversify providers past ~100 mailboxes.
4. Watch the fragile failure mode here: **lead supply running out** — signal volume is finite, so the broad B campaign and recycling are what keep the mailboxes fed. Document which signal sources/regions were already scraped as a shared ledger, not in someone's head.

## Current J and scaling plan

- **J**: unknown — measure first.
- **Plan**: prove Variant A beats B on positive-reply rate → lock offer → then subject → then CTA → measure J → scale mailboxes to hit the weekly booked-call target.

Hand back to `cold-email-machine`.
