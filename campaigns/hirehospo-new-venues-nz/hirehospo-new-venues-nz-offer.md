# Offer — hirehospo-new-venues-nz

Run before list building, because the offer decides who the list is.

## Core offer (one sentence a sixth-grader understands)

Open your new kitchen without the big upfront spend — get refurbished, warranted commercial equipment on a low weekly payment, and Washpro delivers, installs and services it.

**Mechanism**: HireHospo finances it (Rent 12m or Lease-to-Own 36m); Washpro handles the physical gear end-to-end. That split is the credibility anchor — it's not a finance company shipping you a box, it's local delivery + install + service on the equipment.

## Is the core offer strong enough to run direct?

Mostly yes — for a *new venue* the pain is acute and time-boxed, and "low weekly instead of $15–20k upfront" is a clear, non-commodity promise. Per the offer-engineering rule, a genuinely useful offer doesn't need tricks. **But** two things push us to lead with a front-end for the *first* touch:

1. A cold finance pitch to someone mid-fit-out reads as salesy and invites the "what does it cost?" question we're not allowed to answer pre-approval.
2. We can't quote a weekly figure cold (golden rule), so a direct "here's your price" CTA is off the table anyway.

**Decision: split-test two whole offers** (whole-offer tests produce the biggest signal):

### Variant A (primary) — Reverse lead magnet: the fit-out plan
The email-one CTA is not "buy finance", it's:

> "Happy to put together a kitchen equipment shortlist + fit-out plan for [venue] — matched to what similar NZ venues run. Want me to send it over?"

- **Why it works**: high perceived personal effort, low actual labour (generated from the Washpro catalogue), genuinely useful to someone opening a venue, and an obvious on-ramp to the finance conversation. This is the mechanism that reliably breaks past 5% on hard-to-sell-cold offers.
- **The deliverable must be excellent.** When they say yes, they get a real, tailored shortlist (category-by-category: dishwasher/glasswasher, cooking line, refrigeration, prep, holding) with indicative *cash* prices from the catalogue and a one-line "here's what that looks like as a weekly payment once you're approved (+ GST)" — **no personalised weekly figure until Checkmate approval**. A weak deliverable converts an interested lead into a closed door.

### Variant B (challenger) — Direct frame
Straight value: "equip your new kitchen on low weekly payments (+ GST, subject to credit approval), refurbished + warranted, Washpro installs." CTA: "worth a look?" Faster, more salesy, expected to under-perform A on cold — but it's the control to beat and it's cheap to run in the same campaign.

## Optional upgrade — SaaS magnet (build once, no per-lead labour)

If Variant A wins and you want to scale the effort out of it, build a tiny web tool:

- **Tool**: "New Venue Kitchen Fit-Out Planner." Prospect picks venue type + covers/day + service style; it returns a category-by-category equipment shortlist from the Washpro catalogue with indicative cash prices and a "turn this into a weekly payment (subject to approval)" CTA.
- **Pre-filled URL** on reply: `?venue=<type>&name=<venue>` so it renders instantly, no form.
- **On the result page**: the "apply / talk to us" CTA + a retargeting pixel (every click becomes a warm audience).
- **Build path (non-technical)**: PRD → Bolt/Lovable, one catalogue data source (sync the ~241-product Washpro list) + one LLM key. **Build path (technical)**: same PRD in Claude Code, hosted anywhere.
- **Guardrail baked into the tool**: indicative ranges only, always "+ GST", always "subject to credit approval", never a committed personalised weekly figure.

## Implicit objections to pre-empt (feed to copywriting + any retargeting)

| Objection (unspoken) | Counter to seed in copy/deliverable |
|---|---|
| "Refurbished = unreliable" | warranty included + Washpro services it → refurb keeps the weekly low, warranty removes the risk |
| "Locking into debt before I open" | Rent 12m exists for exactly this; upgrade path at end of term |
| "Delivery hassle right before launch" | Washpro delivers + installs, 1–3 business days after deposit |
| "What does it actually cost?" | can't quote cold — answer with the free shortlist + "weekly once approved, + GST" |

## The one-word CTA everything resolves to

**"Want me to send it over?"** → "yes".

Hand back to `cold-email-machine`.
