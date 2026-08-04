# Pre-flight gate — hirehospo-new-venues-nz

Do not send a single email until every line is TRUE. Current status shown; `[ ]` = not yet met.

## Standard gate (from the orchestrator)

- [ ] Domains **30+ days old**; SPF + DKIM + DMARC + MX valid; 301 redirect to hirehospo.com set
- [ ] Mailboxes warming; warm-up target = daily campaign cap; slow ramp ON; daily cap ≤ 25
- [ ] **Zero** mailbox forwarding rules anywhere
- [ ] Inbox-placement automation configured (pause < 80%, slow-ramp back above)
- [ ] Open tracking OFF, link tracking OFF; **no links/images in email one**
- [ ] Copy passed a spam-word check — **including every spintax permutation**
- [ ] All spintax permutations rendered and read — no nonsense combos (⚠️ fix the email-1 sign-off token so the name never renders twice)
- [ ] List verified (goods only) + catch-alls resolved + AI-qualified
- [ ] Block list loaded: **all of `data/customers.csv`** + Washpro + suppliers + competitors + prior opt-outs
- [ ] Advanced deliverability on: skip hostile prospects, risky emails disallowed
- [ ] Compliance mode = **NZ** applied (see below)
- [ ] Reply owner assigned, notifications on, reply macros drafted
- [ ] A live deliverability test run **with the actual campaign copy** from an actual campaign mailbox

## NZ compliance sub-gate (UEMA 2007 — opt-in)

- [ ] Every email (incl. email one) carries a **plain-language removal line** + a real removal process that works for 30 days
- [ ] A valid HireHospo **NZ physical/postal address** is in the signature → **[NEEDS INPUT]**
- [ ] Accurate sender identification (real founder name + HireHospo) → **[NEEDS INPUT: founder name]**
- [ ] Leads sourced from **published** business/owner addresses only — no guessed/pattern or harvested addresses
- [ ] Offer is **role-relevant** to each recipient (qualification pass done) — the legal basis, not just performance

## HireHospo business guardrails (campaign-specific)

- [ ] **No weekly $ figure anywhere in the copy** (credit-approval-first golden rule) — confirmed across A, B, and all spintax
- [ ] Every money reference reads **"+ GST"**
- [ ] **No approval hype** — "guaranteed/instant/pre-approved" do not appear
- [ ] Interested-reply workflow routes to **Checkmate credit check → quote only if approved** (no quote on decline)
- [ ] Sending from **secondary** domains only — hirehospo.com never sends cold

## Inputs still required before launch (blockers)

1. **Founder first name** (sender identity, all mailboxes).
2. **HireHospo NZ postal address** (legal signature requirement).
3. **Domain purchases** (starts the 30-day clock — do this first, today).
4. **Consent to name any live customer** used as social proof in copy.
5. **Instantly workspace** + Google-reseller mailboxes provisioned.
6. Confirmation the reply owner + speed-to-lead process is staffed.

## Go/no-go

**NO-GO** until the blockers clear and the gate is all-true. Earliest realistic go-live = **domain purchase date + 30 days**. Everything else (list build, copy QA, warm-up) runs inside that window.

Hand back to `cold-email-machine`.
