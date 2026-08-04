# Infrastructure plan — hirehospo-new-venues-nz

Pillar one. Pure recipe. Buy domains **now** — the 30-day age clock is the schedule bottleneck and money can't compress it.

## Scale (worked from the scaling equation)

This is a **small-TAM signal play**, so signal supply — not mailbox capacity — is the real limit. Right-size the stack; don't over-build.

- Target: ~3–5 booked fit-out conversations per week to start (matched to what one person + Checkmate + Washpro can absorb).
- J (emails per booked call) is **unknown until measured** — do not guess. Provision modestly, then scale horizontally once J is real.
- Starting shape: **2 domains × ~3 mailboxes = ~6 mailboxes**, 20–25 sends/day each → ~120/day ceiling. That is far more than early signal volume needs, leaving headroom for the broad A/B challenger without touching per-mailbox limits.

## Domains

- **NOT hirehospo.com.** The primary is sacred and never sends cold.
- Buy 2 brand-adjacent secondaries. Suggested shapes: `gethirehospo`, `hirehospo-team`, `trykitchenfinance`, `hospo-finance`.
- **.com vs .co.nz — deliberate deviation to flag:** the plugin default is `.com` (cheaper, trusted faster globally). For a **100% NZ B2B audience**, a `.co.nz` sender reads as local and trustworthy, which matters for this brand's "NZ-local" positioning. **Recommendation: one `.co.nz` + one `.com`** so you can split-test whether the local TLD lifts reply rate. Revisit after 2–3 weeks of data.
- Each secondary must **301 redirect** to hirehospo.com (never leave it resolving to nothing).
- Registrar with cheap renewals + good API (Spaceship/Dynadot for .com; a reputable NZ registrar for .co.nz).

## Mailboxes

- **Provider**: Google Workspace via a reseller (~$3/mo). Default — best placement, and delivers to Microsoft better than Microsoft does. Under ~100 mailboxes, go all-in on one provider; no diversification needed at this scale.
- **Sender name**: the founder's real first name, consistent across every mailbox. → **[NEEDS INPUT: founder first name]**. Real profile photo on each.
- **Roster (starting)**:
  | Mailbox | Domain | Role | Cap |
  |---|---|---|---|
  | firstname@ (co.nz) | secondary-1.co.nz | campaign | 20–25/day |
  | firstname.b@ (co.nz) | secondary-1.co.nz | campaign | 20–25/day |
  | (unmonitored warm) | secondary-1.co.nz | warm-up only | — |
  | firstname@ (com) | secondary-2.com | campaign | 20–25/day |
  | firstname.b@ (com) | secondary-2.com | campaign | 20–25/day |
  | (unmonitored warm) | secondary-2.com | warm-up only | — |
- **Signature** set at account level, referenced by placeholder in campaigns. Must include a real HireHospo NZ **physical address** (UEMA requirement) → **[NEEDS INPUT: NZ postal address]**.
- **Zero forwarding rules** anywhere. Reply from the Instantly unibox, in-thread.
- Tag every mailbox by provider + purchase batch; campaigns attach by tag.

## DNS (per domain)

| Record | Host | Value | Note |
|---|---|---|---|
| MX | @ | Google MX, standard priorities | routes mail |
| TXT (SPF) | @ | `v=spf1 include:_spf.google.com ~all` | exactly one SPF record, ever |
| TXT (DKIM) | `google._domainkey` | generated in Google admin | generate → publish → activate |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@hirehospo.com; fo=0` | host is `_dmarc`, NOT the full domain |
| CNAME (tracking) | Instantly-specified host | Instantly value | set it even though tracking links stay off |
| 301 redirect | @ | → https://hirehospo.com | never leave unresolved |

Verify with EasyDMARC/MXToolbox, then Instantly's "test domain setup" button, **before** activating any mailbox. Keep TTL low while configuring.

## Warm-up

- On from day one, on forever (it's the denominator that dilutes complaint rate).
- Ramp +1–2/day until warm-up volume = campaign daily cap (20–25).
- Reply-rate setting 30–100%; enable weekend sending + read emulation + warm the tracking domain.
- Warm the **separate unmonitored mailbox** per domain — do not filter/archive warm-up mail in a real inbox (ESPs read that behaviour).
- Sequencer's built-in pool is fine for these disposable domains.

## Inbox placement automation (set at launch, not after a fire)

Daily automated placement tests on all mailboxes, using **the actual campaign copy**, against NZ region + real filters.

| Trigger | Action |
|---|---|
| Placement < **80%** | pause mailbox 30 days, tag `spam-warmup` |
| Any blacklist hit (domain/account) | pause 30 days |
| Placement recovers > 80% | slow-ramp back in, tag `spam-recovered` |

Use 80%, not the default 50%.

## Monthly cost (starting stack)

- 6 mailboxes × ~$3 = ~$18/mo
- 2 domains ≈ ~$3–5/mo amortised
- Instantly sequencer: ~$37–97/mo depending on plan
- **≈ $60–120/month** all-in. Trivial vs paid ads for the same lead volume.

## Earliest safe send date

**Domain purchase date + 30 days minimum** (60–90 ideal). Everything else (offer, list, copy, warm-up) happens during that clock. → set go-live = purchase date + 30d.

Hand back to `cold-email-machine`.
