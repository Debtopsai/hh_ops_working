---
name: cold-email-infrastructure
description: >-
  Build and configure cold email sending infrastructure - buying secondary domains in bulk, DNS
  records (SPF, DKIM, DMARC, MX, custom tracking CNAME, redirect), choosing between Google,
  Microsoft, managed SMTP and unmanaged SMTP, mailbox counts per domain, daily sending caps, slow
  ramp, warm-up settings, and inbox placement automations. Use for "set up mailboxes", "how many
  domains do I need", "which DNS records", "Google or Microsoft", "warm-up settings", "SPF DKIM
  DMARC", "buy sending domains", "my mailboxes aren't warming", or any provisioning or capacity
  question. Also use before any campaign launch to verify the sending stack is sound.
---

# Cold Email Infrastructure

Pillar one. It is pure recipe. There is no excuse to get it wrong, and getting it wrong invalidates
every other pillar. Read `${CLAUDE_PLUGIN_ROOT}/shared/glossary.md` first.

## The model (know this before touching anything)

Three stacked reputations, in descending order of importance:

**IP address** → **domain** → **mailbox**

- Lose a mailbox, the domain survives. Lose a domain, every mailbox under it dies. Lose an IP, everything on it dies.
- On Google/Microsoft the IP is *their* problem: they rotate and clean it. That is what you pay for.
- On unmanaged SMTP the IP is *your* problem, with no recovery path. This is the trap that makes cheap infrastructure expensive.
- The receiving ESP judges: DNS validity, domain age, domain/IP/mailbox reputation, and the copy itself.

## Capacity plan

Work backwards from the scaling equation in the glossary.

- **Per mailbox**: start 10/day, ramp to 20-25/day. Ceiling 50/day only once placement is proven stable. Lower is always safer.
- **Per domain**: roughly 100 sends/day total. 5 mailboxes x 20/day is the default shape. 3 x 33 also works.
- **Mature system**: 500-1,000 mailboxes for a large TAM. At ~$3/mailbox/month that is $1,500-$3,000/month, which is trivial next to paid ads for the same lead volume.
- **Scale horizontally.** More mailboxes, not more volume per mailbox.

## Provider choice (2026)

| Option | Cost | IP managed by | Use when |
|---|---|---|---|
| Google Workspace via reseller | ~$3/mo | Google | **Default.** Highest inbox placement, delivers to Microsoft better than Microsoft does |
| Google direct | ~$8.40/mo | Google | You have no reseller. Overpaying |
| Microsoft 365 | ~$4+/mo | Microsoft | Diversification at scale, enterprise-heavy targets |
| Managed private SMTP | ~$3-5/mo | the vendor | Diversification, fast/cheap scale, no Google account risk |
| Unmanaged SMTP (unlimited mailboxes, ~$1 or less each, one dedicated IP) | cheap | **you** | Only once you have a proven system and low complaint rates. One spam trap kills the whole range |

**Diversification rule**: under ~100 mailboxes, go all-in on whatever is currently best (Google, as of now). At 500+, split roughly half Google, the rest across Microsoft and private SMTP. Provider dominance flips every 6-12 months, and platform-wide deliverability shocks happen (Google's November update dropped industry placement from 80-90% to ~50% for weeks). A single-provider system has no hedge.

Provider matching (sending Microsoft-to-Microsoft) does not work. Do not enable it.

## Domains

- Buy in bulk on a registrar with cheap renewals and a good API. Avoid registrars that triple the price on renewal.
- `.com` only. Cheaper and trusted faster than `.io` and friends.
- Use brand-adjacent variants: prefixes and suffixes on the brand name (`get-`, `my-`, `try-`, `-hq`, `-team`), plus category words.
- **Never the primary domain.** The primary is sacred.
- Every secondary domain must 301 redirect to the primary site. Domain masking proxies add a step and show no measured benefit.
- **Buy them now.** Domain age is the one thing money cannot compress. 30 days minimum, 60-90 ideal. Buying domains is always the first action in a build.

## DNS records (per domain)

| Record | Host | Value | Note |
|---|---|---|---|
| MX | @ | provider MX, priority per provider | routes mail |
| TXT (SPF) | @ | `v=spf1 include:<provider> ~all` | one SPF record only, ever |
| TXT (DKIM) | provider selector (e.g. `google._domainkey`) | generated in the provider admin | generate, publish, then activate in the admin |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=quarantine; rua=...; fo=0` | `quarantine` or `reject`. Set failure reporting to 0 unless you want the noise |
| CNAME (tracking) | sequencer-specified host | sequencer value | set it even though you will not use tracking links |
| Redirect | @ | 301 to primary site | do not leave it resolving to nothing |

Gotcha: DMARC host is `_dmarc`, not `_dmarc.yourdomain.com`. Pasting the full string breaks it.
Propagation is minutes to hours. Set TTL low while configuring.

Verify with EasyDMARC or MXToolbox, then with the sequencer's own "test domain setup" button before activating any mailbox.

## Mailboxes

- **Sender name**: the founder's real name, consistently across all mailboxes. If the name is hard to pronounce or spell, use a simple, common, one-or-two-syllable first name. Nobody verifies.
- Real profile photo on the mailbox.
- Signature set at the **account** level, then referenced by placeholder in campaigns. Never pasted per campaign.
- Tag every mailbox by provider and purchase batch. Campaigns attach mailboxes by tag, not individually.
- **Never configure forwarding.** Every "add a forwarding address" prompt is a trap. A reply forwarded to a central mailbox and answered from there becomes a fresh cold email from an unknown sender, which is why it lands in spam and why links stop working. Reply from the unibox, inside the existing thread.

## Warm-up settings

- On from day one, on **forever**. Warm-up is the denominator that dilutes your spam-complaint rate. 1 complaint per 100 cold sends is a 1% rate; add 100 warm-up sends and it halves.
- Increase 1-2/day until warm-up volume equals the campaign daily cap.
- Reply rate setting: anywhere 30-100% works.
- Enable every advanced humanising option: weekend sending, read emulation, warm the custom tracking domain.
- Warm-up **quality** matters more than volume. A cheap pool full of low-reputation mailboxes does net damage. For the **primary** domain, use a premium tool where you control the warm-up topic and target ESP mix. For disposable cold-email domains, the sequencer's built-in pool is sufficient.
- To keep warm-up noise out of a monitored inbox, create a separate unmonitored mailbox on that domain and warm that one. Do not filter-and-archive warm-up mail in a real inbox; ESPs read that behaviour.

## Inbox placement automation (configure at launch, not after a fire)

Set daily automated placement tests on all mailboxes, testing **the actual campaign copy**, against the real target regions and filters.

| Trigger | Action |
|---|---|
| Placement < 80% | pause mailbox from campaigns 30 days, tag `spam-warmup` |
| Domain or account hits any blacklist | pause 30 days |
| Placement recovers > 80% | enable slow ramp back into campaigns, tag `spam-recovered` |

Use 80%, not the default 50%. Below 80% something is wrong and you want to know before it compounds.

## Handoff

Write `<slug>-infrastructure-plan.md`: domain list with purchase dates and earliest safe send date, mailbox roster with provider mix and caps, the DNS record table, warm-up settings, placement automation config, and the total monthly cost. Then hand back to `cold-email-machine`.
