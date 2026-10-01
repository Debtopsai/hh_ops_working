# HireHospo Command Dashboard: PRD v0.1

Sep 27, 2026 · @Raj Singh

## Summary and build decisions

Build the dashboard as a module inside the existing Ops Desk, fed by scheduled API pulls into one warehouse, with Claude reading that warehouse through a HireHospo MCP server. Four decisions shape everything below.

**1. Build it into Ops Desk, not as a new app.** Ops Desk already has a Today dashboard, a CRM, an Insights/BI section and Marketing enquiries. A second app would duplicate logins, customer records and the enquiry data. The command dashboard becomes the Insights module done properly.

**2. MCP connectors are not the data pipe.** The connectors in Claude (GoCardless, Meta Ads, HubSpot, Gmail and the rest) are tools Claude calls during a chat. They do not run on a schedule, keep no history, and a web page cannot call them. A live dashboard needs scheduled pulls, stored weekly snapshots so trends exist, and each metric defined once in code. So each tool's API feeds a warehouse, and MCP sits on top: a read-only HireHospo MCP server lets Claude answer questions and write the Monday read from the same numbers the dashboard shows.

**3. The number that matters is cost per funded contract.** HireHospo is credit-led and declines more than it approves, so lead volume and CPL flatter the wrong thing. Funded means deposit cleared in the account. Every marketing and sales metric rolls up to that.

**4. One ID has to thread every system.** The funnel from Meta lead to funded contract only works if the CRM deal ID is carried into Plutio, GoCardless and MYOB. This is the first build task, not a nice-to-have, and it is the same thread idea the SOP handoff uses.

Voice memo recordings can be picked up, with limits. Section 7 covers how.

## Decisions and data check, 1 October 2026

HubSpot is the CRM of record, MYOB is the ledger, and COGS is advertising plus GoCardless fees. A check of the live HubSpot data shows the deal pipeline must be rebuilt before the funnel views can work.

| Decision | Effect on the build |
| --- | --- |
| CRM of record: HubSpot | Zoho CRM and the Ops Desk CRM are not deal sources. Ops Desk enquiries flow into HubSpot |
| Ledger: MYOB | Ingestion uses the MYOB Business API. MYOB's Claude connector is not yet available on this account, so MYOB figures cannot be checked from chat |
| COGS: advertising + GoCardless fees | Used as defined on the P&L and scorecard. In unit economics, advertising is left out of gross margin because it is already in CAC |
| Built inside Ops Desk | Not yet confirmed. Claude Code checks the repo in phase 0 |

### What the data check found

- **HubSpot deals do not track the funnel.** All 50 deals sit in the first stage of the Contract Pipeline, Prospect Inquiry, including signed customers such as Ciao Cusina. Deals are created at contract time with the weekly rate as the amount, and never move. There are duplicates (Homely Flavors, Sugar Spice & Everything Nice) and internal or test deals (IWise, Joels Video Editing at $10).
- **The funnel lives on contacts.** 214 contacts were created between 1 July and 1 October 2026, mostly from paid social. Lifecycle stages are in use (lead, MQL, SQL, opportunity), but "evangelist" and "other" are being used for something \[TBC what\]. HubSpot stamps the date each lifecycle stage is entered, so a v1 funnel can run off contacts while the deal pipeline is fixed.
- **Both deal pipelines use HubSpot's default stages** (Qualified To Buy, Presentation Scheduled, Decision Maker Bought-In), which do not match HireHospo's process.
- **MYOB is behind.** The HireHospo file is being reconciled with GST returns outstanding, and money moves between HireHospo and IWise without invoices. MYOB-based figures will be off until that is done, and intercompany transfers need their own account so they never show as revenue or cost.

### Proposed HubSpot pipeline

Rebuild the Contract Pipeline as: Enquiry, Credit submitted, Approved, Declined, Quote sent, Contract sent, Signed, Deposit cleared, Dispatched, Lost. Create the deal when credit is submitted rather than at contract, so approval rate and quote speed become measurable. Add required deal properties: credit decision, risk tier, deposit structure, product (Rent or Lease to Own), Meta lead ID, Plutio agreement number and GoCardless customer ID. Merge the duplicates and archive the test deals. This changes how the team works day to day, so it needs your go-ahead before anyone touches HubSpot.

## Problem, goals and non-goals

HireHospo's numbers sit across roughly ten tools, and the owner runs the business from Melbourne. Nobody can see in one place whether this week's ad spend became funded contracts, whether quotes went out on time, or whether the book is getting healthier. The P&L only becomes visible after month end in MYOB, and only once the books are reconciled.

### Goals

| # | Goal | How we know it worked |
| --- | --- | --- |
| G1 | One screen answers "how did HireHospo do this week" | By 9am Monday NZT the scorecard is complete for the prior week, with no other tool opened |
| G2 | Every headline number is trustworthy | Revenue reconciles to MYOB within 1% once the books are current, ad spend to Meta Ads Manager to the dollar, cash collected to GoCardless payouts exactly |
| G3 | The full funnel is visible | Every lead from the last 8 weeks is traced to an outcome: declined, lost, open or funded, with cost per stage |
| G4 | Sales discipline is measured from real activity | Quote-sent and follow-up rates come from logged emails and calls, not self-reporting |
| G5 | Sales calls are captured without admin | Each recorded call is transcribed, summarised and on the CRM deal within 1 hour of upload |

### Non-goals for v1

- **Not a replacement for MYOB or the CRM.** Read-only, except call notes written to the CRM deal. Editing stays in the source system.
- **No automated decisions.** The dashboard flags a failed payment or a stalled deal; a person acts. Credit and collections actions stay human.
- **No forecasting.** Cash and revenue forecasts need a few months of clean snapshots first. Parked as P2.
- **Not the DebtOps build.** The collections view reads GoCardless. Automated collections is a separate project.
- **Not Washpro's P&L.** Washpro appears only as HireHospo's cost and as dispatch dates.

## Users and user stories

Two people use it daily: the owner, who needs the weekly read and the exceptions, and the Sales and Operations Manager, who needs the work queue. Credit and collections views serve whoever holds those roles \[TBC\].

### Owner (Raj)

- As the owner, I want a Monday scorecard of revenue, COGS, margin, ad spend, funded contracts and cost per funded contract, so I know how the week went in two minutes.
- As the owner, I want every rate shown with its count beside it, so a 50% close rate on 2 deals does not read like a trend.
- As the owner, I want to click any number and see the records behind it, so I can check it rather than trust it.
- As the owner, I want to ask Claude "why did cost per funded contract rise this month" and get an answer from the same numbers, so I do not have to pull exports.

### Sales and Operations Manager (Urman)

- As the sales manager, I want a list of approved applicants with no quote sent after 24 hours, so none go cold.
- As the sales manager, I want quotes with no reply and no second follow-up flagged, so follow-ups happen on time.
- As the sales manager, I want signed agreements with no cleared deposit listed with days waiting, so I chase the deposit, which is where deals stall.
- As the sales manager, I want my call recording to become a CRM note with the next step, so I do not type up calls.

### Credit and collections \[TBC who\]

- As credit, I want approval rate, decline rate and time to decision by week, so I can see whether the lead mix is changing.
- As collections, I want today's failed payments and arrears by age, so I act on day 1 rather than day 14.

### Edge cases the build must handle

- A lead with no deal yet, and a deal with no Meta lead (referral, repeat customer).
- A customer with two agreements, or one agreement varied mid-term (the Ciao Cusina mixer substitution is a live example).
- A Rent agreement past 52 weeks rolling month to month, which is revenue but not a new contract.
- A week with zero funded contracts: cost per funded contract shows "none funded", not infinity or zero.

## Dashboard layout

Nine views, with the weekly scorecard as the landing page. Every tile shows this week, last week and the 4-week average, plus the count behind any rate. Every tile drills through to the records.

| View | Question it answers | Key tiles |
| --- | --- | --- |
| Scorecard (landing) | How did the week go, and what needs me today? | Active customers, active agreements, weekly contracted revenue, weekly revenue, weekly COGS, gross margin, cash collected, ad spend, leads, approvals, funded contracts, cost per funded contract, LTV:CAC, payment failure rate. Needs-attention list below |
| P&L | Are we making money? | Month to date and last 12 months from MYOB, weekly run-rate, gross margin % trend, gross margin by product, equipment category, brand and sales channel, overheads |
| Book | Is the book growing and healthy? | Active agreements, weekly contracted revenue and annualised run-rate, net new agreements, book outstanding, early exit rate, arrears ratio, customer concentration, Rent vs Lease to Own mix, agreements reaching end of term in the next 90 days, Rent rollovers |
| Unit economics | What is a customer worth against what it cost to win? | LTV, paid and fully loaded CAC, LTV:CAC, CAC payback weeks, by product, campaign, equipment category, deposit tier and lead-week cohort |
| Marketing | Is ad spend buying funded contracts? | Weekly spend, CPL, cost per qualified lead, cost per approval, cost per funded contract, by campaign and ad, with lead-week cohorts |
| Sales funnel | Where do deals leak? | Funnel from lead to funded with counts and drop-off, days in each stage, close rate, approval rate |
| Sales activity | Is the team doing the work? | Speed to first contact, quote sent within 24 hours of approval, first and second follow-up rates, calls recorded, call summaries |
| Collections | Is the money coming in? | Failed payments today and this week, failure rate by weekday, 21st to 25th window, arrears by age, accounts over 3 failures |
| Ops | Is equipment going out on time? | Deposits cleared awaiting dispatch, cleared-to-dispatched days, Washpro invoices this week vs active agreements |

### Needs-attention list

This is the most useful part of the screen, because it enforces the house rules rather than just reporting. Red items are rule breaches; amber items are work going stale.

| Flag | Level | Rule behind it |
| --- | --- | --- |
| Quote email sent before credit approval recorded | Red | No quote before credit approval |
| Dispatch recorded before deposit cleared | Red | No dispatch before the deposit has cleared |
| Washpro invoicing started before direct debit set up | Red | Both deposit and direct debit must clear first |
| Approved, no quote sent after 24 hours | Amber | Speed after approval |
| Quote sent, no reply and no second follow-up after \[TBC\] days | Amber | Follow-up discipline |
| Signed, deposit not cleared after 5 days | Amber | Deals stall at the deposit |
| Payment failed today | Amber | Act on day 1 |
| Ad set CPL up more than 50% on its 4-week average | Amber | Creative fatigue or targeting drift |
| A data source not refreshed on schedule | Amber | Trust in the numbers |

Thresholds in amber rows are starting points for Raj to set, not decided values.

## Metric definitions

Each metric is defined once, in the metric layer, and the dashboard and Claude both read that definition. Conventions for all of them: the week runs Monday to Sunday NZT, all money is ex GST, and every rate carries its numerator and denominator.

### Money

| Metric | Definition | Source | Refresh |
| --- | --- | --- | --- |
| Weekly revenue | Customer weekly charges invoiced in the week, ex GST. Excludes rent in advance until the week it covers, and excludes security bonds entirely | Agreement records + GoCardless, reconciled to MYOB | Hourly |
| Weekly contracted revenue | Sum of the weekly rate on every active agreement at week end (the run-rate) | CRM deals + agreement records | Daily snapshot |
| Cash collected | GoCardless payments paid out to the bank in the week, confirmed by payout, whether or not an invoice reference is attached | GoCardless payouts | Webhook, near real time |
| Weekly COGS | Advertising spend plus GoCardless transaction fees for the week, as defined by the owner. Whether Washpro's weekly cost also belongs here is open question 3 | Meta Marketing API + GoCardless fees, reconciled to MYOB | Hourly |
| Gross margin | Weekly revenue less weekly COGS, in $ and % | Derived | Hourly |
| P&L | MYOB Profit and Loss report, month to date and trailing 12 months | MYOB Business API | Hourly |

### Gross margin breakdown

Gross margin sits on the scorecard as a weekly $ and %, and is also cut below so a thin-margin product, category or channel shows up rather than hiding in the total.

| Cut | Definition | Why it matters |
| --- | --- | --- |
| Per agreement | Weekly rate less that agreement's GoCardless fees, and Washpro cost if it is COGS, $ and % | Spots agreements discounted too far |
| Rent vs Lease to Own | Weighted margin % by product | The two products price differently, and the Rent buyout credit changes end-of-term economics |
| Equipment category and brand | Margin % by category (dishwashers, combi ovens, refrigeration and so on) and by brand | Shows which lines are worth pushing in ads |
| Discount level | Margin % against the discount taken off the standard rate | Shows what rounding and discounting actually cost |
| Sales channel | Finance agreements vs outright online sales, if HireHospo sells outright \[TBC\] | An outright sale earns a one-off margin, not a weekly one, so it is reported as its own channel, never blended into the weekly figure |
| Contribution margin | Gross margin less paid CAC, per funded agreement | The bridge from gross margin to LTV:CAC |

No margin target is set yet; like the other KPIs, it is baselined from the first 4 weeks of clean data.

### Marketing

| Metric | Definition | Source | Refresh |
| --- | --- | --- | --- |
| Ad spend | Meta spend for the week by campaign, ad set and ad. GST basis stated on the tile \[TBC\] | Meta Marketing API | Hourly, last 7 days reprocessed daily as Meta data settles |
| Leads | Meta Instant Form leads plus portal enquiries, deduplicated by phone and email | Meta leads + Ops Desk enquiries | 15 min |
| CPL | Ad spend / leads | Derived | Hourly |
| Qualified lead | Lead that is a hospitality operator in the Auckland region with a real equipment need \[TBC, Raj to define\] | CRM field | 15 min |
| Cost per approval | Ad spend / credit approvals, by lead-week cohort | Derived | Daily |
| Cost per funded contract (CAC) | Ad spend / agreements with deposit cleared, by lead-week cohort. Also shown as a simple period ratio, labelled as such | Derived | Daily |

Cost per funded contract lags spend by several weeks because of the credit and deposit cycle. The cohort view (spend in lead week X against contracts funded from those leads, whenever they fund) is the honest version; the period ratio is only for a quick read.

### Sales

| Metric | Definition | Source |
| --- | --- | --- |
| Speed to lead | Minutes from lead created to first logged call or email | CRM activity |
| Approval rate | Approved / credit decisions made | Credit decision on the deal |
| Quote-sent rate | Approvals with a quote email within 24 hours / approvals | CRM email log |
| First follow-up rate | Quotes with a follow-up call or email within \[TBC\] business days, where the customer had not replied / quotes sent | CRM activity |
| Second follow-up rate | Quotes with a second follow-up within \[TBC\] business days of the first, still no reply / quotes needing one | CRM activity |
| Close rate | Funded / approved, and funded / qualified leads, both shown | Derived |
| Deposit conversion | Deposit cleared / agreements signed | Plutio + GoCardless or bank |
| Days in stage | Median days lead to decision, approval to quote, quote to signed, signed to cleared, cleared to dispatched | Stage timestamps |

A quote email is identified by a fixed subject prefix or a CRM template, not guessed from the body. Classification by Claude is the fallback for emails that miss the convention, and those are marked as inferred.

### Collections

| Metric | Definition | Source |
| --- | --- | --- |
| Payment failure rate | Failed / payments presented, by week and by weekday. Baseline 10.5%, or about 3.7% excluding the chronic accounts | GoCardless |
| Arrears | $ overdue and accounts overdue, bucketed 1 to 7, 8 to 14, 15 to 30, 30+ days | MYOB AR + GoCardless |
| Fees charged | Late and admin fees raised only on direct debits actually presented and returned | MYOB |

### Business health

These are the current-state numbers, read from the daily agreement snapshot, and they sit on the scorecard strip and the Book view.

| Metric | Definition | Source | Refresh |
| --- | --- | --- | --- |
| Active customers | Customers with at least one active agreement | Agreement snapshot | Daily |
| Active agreements | Agreements inside their term, plus Rent agreements rolling month to month | Agreement snapshot | Daily |
| Weekly contracted revenue and annualised run-rate | Sum of weekly rates on active agreements, ex GST; × 52 for the annualised figure | Agreement snapshot | Daily |
| Average weekly rate | Weekly contracted revenue / active agreements, split Rent and Lease to Own | Derived | Daily |
| Net new agreements | Funded in the week less those ended, defaulted or recovered | stage\_event + snapshot | Daily |
| Book outstanding | Remaining contracted payments on active agreements, ex GST | Agreement snapshot | Daily |
| Early exit rate | Agreements ended before term (default, recovery, early buyout) / agreements active at the start of the period, rolling 12 weeks | Derived | Weekly |
| Arrears ratio | $ in arrears / weekly contracted revenue | MYOB + GoCardless | Daily |
| Customer concentration | Share of weekly contracted revenue from the top 5 customers | Derived | Weekly |
| Equipment on hire | Machines out on active agreements, by category | Snapshot + Ops Desk products | Daily |

### Unit economics: LTV, CAC and LTV:CAC

LTV:CAC goes on the scorecard, calculated per funded agreement and shown by product and lead-week cohort, next to CAC payback in weeks. Until 12 months of payment history exists, LTV is modelled from assumptions and the tile says so.

```latex
\text{LTV} = \text{weekly rate} \times \text{expected paid weeks} \times \text{gross margin \%} - \text{expected loss}
```

| Component | Definition |
| --- | --- |
| Weekly rate | The discounted weekly rate on the agreement, ex GST |
| Expected paid weeks | Contracted term (52 Rent, 156 Lease to Own) × completion factor, plus expected rollover weeks on Rent. Completion factor comes from the early exit rate once history exists; until then a starting assumption \[TBC, Raj\] |
| Gross margin % | Weekly revenue less GoCardless fees for that agreement, and less the Washpro cost if open question 3 puts it in COGS. Advertising is left out here because it is already in CAC; counting it in both would understate LTV:CAC |
| Expected loss | Default rate × average unrecovered balance, net of the security bond retained and equipment recovered and re-leased \[TBC\] |
| Excluded | Security bonds, which are returned. Rent in advance is counted only as the weeks it covers, never as extra revenue |
| Delivery and install fees | Only the margin HireHospo keeps, if any |

| Metric | Definition |
| --- | --- |
| Paid CAC | Meta spend / funded contracts, by lead-week cohort |
| Fully loaded CAC | Paid spend plus sales labour, credit check fees and sales tools \[TBC which\], / funded contracts |
| LTV:CAC | LTV / CAC, shown against both paid and fully loaded CAC, each labelled |
| CAC payback | CAC / weekly gross margin per agreement, in weeks |
| Cash payback | Same, but counting the rent in advance received at signing, since it brings cash forward even though it adds no revenue |

The common 3:1 LTV:CAC benchmark is a software rule of thumb, not an equipment finance standard. HireHospo's own target is set after the first cohort baseline, and payback weeks against average paid weeks is the more useful test for a weekly-payment book.

## Data sources and connection plan

The dashboard pulls every source through its own API with read-only credentials; Claude connectors are only for testing queries from chat. Checkmate, Plutio and ThriveDesk have no connector, so their events land in HubSpot or come through a webhook.

| Source | What we pull | Method for the dashboard | Claude connector today | Notes |
| --- | --- | --- | --- | --- |
| MYOB (ledger) | P&L, sales, bills, AR, customer cards | MYOB Business API, OAuth, read-only | Not available on this account yet | Ledger confirmed. Weekly figures come from GoCardless and agreement records until the MYOB file is reconciled |
| GoCardless | Payments, failures, fees, mandates, payouts, customers | API plus webhooks for payment events | Connected to the account, not loaded in this project | Store the HubSpot deal ID in customer metadata. Fees feed COGS |
| Meta Ads | Spend and results by ad, Instant Form leads | Marketing API insights + lead retrieval | Yes | Spend feeds both COGS and CAC. Store the Meta lead ID on the contact and deal |
| HubSpot (CRM of record) | Contacts with lifecycle stage dates, deals, emails, calls, notes | CRM API + webhooks | Yes, checked 1 October 2026 | Pipeline rebuild needed first, see decisions |
| Gmail / Zoho Mail | Quote and follow-up emails | Logged to HubSpot | Yes | Logging to HubSpot attaches emails to the contact and deal |
| Zoho CRM | Nothing for deals | None | Yes | Out of scope unless it holds history worth importing |
| Ops Desk (hh-wp-portal) | Portal enquiries, products | Direct read from its database | Not needed | Same codebase as the dashboard |
| Checkmate | Credit decision, tier, date | \[TBC\] API or export; fallback is a required decision property on the HubSpot deal | No | The deal property is enough for v1 |
| Plutio | Proposal sent, agreement signed, date | \[TBC\] API or webhook on signing | No | Fallback: signed date entered on the deal |
| Microsoft Clarity | Portal sessions, scroll, dead clicks | Clarity data export API | Yes | P1, for the brochure funnel |
| Google Drive | Call recordings folder | Drive API watch on one folder | Yes | See section 7 |
| SwipePages | Landing page variants and conversions | API | Yes | P1, only if landing pages carry paid traffic |
| ThriveDesk | Support tickets | \[TBC\] | No | P2 |
| Washpro dispatch | Dispatch and install dates | \[TBC\] where recorded today | No | Needed for cleared-to-dispatched days |

Xero is no longer a source. If the MYOB connection serves more than one company file, the ingestion job reads HireHospo's file only.

## Call recordings and transcription

Yes, voice memo recordings can be picked up, but there is no connector or API into the iPhone Voice Memos app, so each recording has to be shared into a watched folder. v1 does that with a one-tap iOS Shortcut; v2 moves sales calls onto a phone line that records and matches calls automatically.

### What a voice memo can capture

The Voice Memos app records the room, so it works for in-person meetings and speakerphone calls on a second device. It cannot record a call happening on the same iPhone. Recent iOS versions can record calls inside the Phone app, announce it to the other party, and save audio and transcript to Notes \[verify on your iOS version and region\]. Either route ends with an audio file that we pick up the same way.

### v1 pipeline: memo to CRM note

1. **Record.** Voice Memos, or Phone app recording.
2. **Share.** An iOS Shortcut, "HireHospo call", takes the file, asks for the customer name or picks from recent deals, and uploads to a Drive folder named HireHospo Calls / Inbox with the name in the filename.
3. **Transcribe.** A job watching that folder sends the audio to a speech-to-text service \[TBC which\].
4. **Extract.** Claude reads the transcript and returns fixed fields: customer, equipment discussed, objections, whether the deposit was discussed, agreed next step and date, and compliance flags.
5. **Match and write.** The call is matched to the CRM deal by the name given in step 2. A confident match writes a note to the deal and a row to the warehouse; a weak match goes to a review queue on the dashboard.
6. **File.** The audio moves to HireHospo Calls / Processed, kept for \[TBC\] months, then deleted.

### Compliance flags Claude checks on every call

These mirror the house rules, so call review doubles as QA:

- A weekly or daily price given before credit approval.
- Approval implied or promised before a decision ("you're approved", "no problem getting you approved").
- Stock or a delivery date promised before signing and deposit.
- Gas installation offered, when HireHospo does not install gas.
- An installation price given without a site visit.
- The deposit not mentioned on a call that discussed pricing.

### v2: a recorded sales line

A cloud phone number with recording and an API (or the CRM's own calling, if the plan tier includes recording and transcripts \[TBC\]) matches calls by phone number, needs no Shortcut, and captures every call rather than the ones someone remembers to share. Recommended once v1 proves the extraction is useful.

### Consent

This needs an advisor's sign-off before the first recording; the notes below identify the questions, they are not legal advice. In New Zealand a party to a conversation may generally record it, but the Privacy Act 2020 expects people to be told when their information is collected and why. Raj is in Victoria, which has its own surveillance devices law, and other Australian states differ again. The simple safe practice is to say at the start of every call that it is recorded for records and training, and to cover recordings in the HireHospo privacy policy, which is already an open item for the Equifax subscription.

## Architecture and data model

Every source lands in one warehouse on a schedule, the metric layer defines each KPI once, and both the dashboard and Claude read from it. Call notes go to the CRM deal and to the warehouse.

&#91;embedded content: data architecture · sources to warehouse to dashboard and Claude\]

**Stack.** Follows the group standard: Next.js and TypeScript for the Ops Desk module, Postgres on Supabase with row level security for the warehouse, Inngest for scheduled pulls and webhook handling. Whether the warehouse lives in the Ops Desk database or a separate Supabase project depends on how Ops Desk is built on Railway \[TBC\].

**Freshness.** GoCardless by webhook, near real time. CRM and leads every 15 minutes. MYOB and Meta hourly, with Meta's last 7 days reprocessed daily because its numbers settle late. Each tile shows when its source last refreshed.

### Core tables

| Table | One row per | Holds |
| --- | --- | --- |
| deal\_thread | Deal | CRM deal ID (the master key), Meta lead ID, Checkmate reference, Plutio agreement number, GoCardless customer and mandate IDs, MYOB customer card ID |
| stage\_event | Stage change | Deal ID, stage, timestamp, source system |
| agreement\_snapshot | Agreement per day | Product, weekly rate, status, arrears. The CRM only knows today, so this is what makes last week's book visible |
| payment | GoCardless payment | Amount, charge date, status, failure reason, payout |
| ad\_daily | Ad per day | Spend, impressions, clicks, leads |
| activity | Email or call | Deal ID, type (quote, follow-up 1, follow-up 2, call), how it was classified (rule or inferred) |
| call | Recording | Transcript link, extracted fields, compliance flags, match confidence |
| finance\_weekly | Week | Revenue, COGS and margin lines from MYOB |

A data health tile shows the share of active agreements whose thread is complete across all systems. Target is 95% or better before any funnel number is trusted.

## Requirements

The P0 list is what makes v1 worth using: trusted money numbers, the funnel, the rule-enforcing attention list, sales activity and calls. Everything else waits.

### P0, must have

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| R1 | Deal thread | CRM deal ID is written into Plutio, GoCardless metadata and the MYOB customer card or invoice reference for every new deal. Existing active agreements are back-filled. Data health tile shows at least 95% complete |
| R2 | Ingestion for MYOB, GoCardless, Meta Ads, HubSpot and Ops Desk | Each source refreshes on its schedule. A source more than twice its interval late turns its tiles amber and names the source |
| R3 | Metric layer | Every metric in section 5 exists as one SQL definition. The dashboard and the MCP server call the same definitions. No metric is calculated in the front end |
| R4 | Reconciliation | A nightly job compares weekly revenue to MYOB, spend to Meta and cash collected to GoCardless payouts. Any variance over 1% is flagged on the scorecard |
| R5 | Scorecard view | Loads in under 3 seconds. Every tile shows this week, last week, 4-week average and the count behind any rate. Every tile drills to records |
| R6 | Funnel with stage timestamps | Each deal carries timestamps for lead, credit submitted, decision, quote sent, signed, deposit cleared and dispatched. Funnel view shows counts, drop-off and median days per stage |
| R7 | Needs-attention list | All flags in section 4 fire correctly against test deals built to trigger each one, and none fire on a clean deal |
| R8 | Sales activity metrics | Quote and follow-up emails classified by subject prefix or template. At least 90% classified by rule rather than inferred after the first month |
| R9 | Call pipeline v1 | A memo shared through the Shortcut appears as a CRM note within 1 hour. At least 90% auto-matched. Unmatched calls sit in a review queue. Compliance flags tested on sample transcripts |
| R10 | Business health metrics | Every business health metric in section 5 on the scorecard strip and Book view, from daily snapshots, with week-on-week movement |
| R11 | Unit economics | LTV, paid and fully loaded CAC, LTV:CAC and payback weeks per funded agreement, by product, campaign, category, deposit tier and cohort. Tile labelled "modelled" until 12 months of history. Three agreements checked by hand in Python Decimal match the dashboard to the cent, with bonds excluded and rent in advance not double counted |
| R12 | Access control | Owner sees everything. Other roles see what their role needs \[TBC who sees the P&L and unit economics\]. Enforced with row level security, and every view logged |
| R13 | Conventions | Week is Monday to Sunday NZT. All money ex GST and labelled "+ GST". NZ English. No em dashes in any label or generated text |

### P1, next

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| R14 | HireHospo MCP server | Read-only tools over the metric layer. Claude answers "cost per funded contract last month by campaign" with the same figure the dashboard shows |
| R15 | Monday read | Claude writes the weekly narrative from the scorecard and emails it at 8am Monday NZT |
| R16 | Alerts | Red flags push to phone or email within 15 minutes |
| R17 | Portal funnel | Clarity and Ops Desk data show brochure visits to enquiries, by category |
| R18 | Call pipeline v2 | Recorded sales line, calls matched by phone number, no Shortcut needed |

### P2, designed for, not built

Cash and revenue forecasting from the daily snapshots. Actual cohort LTV from payment history, replacing the modelled LTV once 12 months of snapshots exist. Organic social from Vistasocial. Support tickets from ThriveDesk. Handing collections actions to DebtOps. Keeping raw data and snapshots from day one is what keeps these open.

## Phasing

Five phases, each with an exit test, so every phase ships something usable. Durations are estimates for one developer with Claude Code and move with the answers to the open questions, especially the CRM decision.

| Phase | Estimate | Builds | Exit test |
| --- | --- | --- | --- |
| 0. Foundations | Week 1 | CRM of record decided, deal thread ID (R1), warehouse schema, read-only credentials, access roles | Thread complete on all active agreements |
| 1. Money and book | Weeks 2 to 3 | MYOB, GoCardless, Ops Desk ingestion. Scorecard money tiles, P&L, Book, Collections views. Reconciliation job | Last 4 reconciled weeks of revenue match MYOB within 1% |
| 2. Funnel and marketing | Weeks 3 to 4 | Meta Ads and CRM ingestion, credit and signing events, Marketing, Funnel and Unit economics views, needs-attention list | Last 8 weeks of leads traced to an outcome |
| 3. Sales activity and calls | Weeks 4 to 5 | Email classification, Sales activity view, call pipeline v1 | Two weeks of calls processed, 90% auto-matched |
| 4. Claude layer | Week 6 | MCP server, Monday read, alerts | Claude and the dashboard give the same answer to 10 test questions |

Phase 3's call pipeline has no dependency on phases 1 and 2 beyond the CRM decision, so it can start in week 1 if calls are the most pressing need.

## Risks, compliance and data quality

With HubSpot chosen as the CRM, the biggest risk is the state of the data: HubSpot deals never move stage, and the MYOB file is still being reconciled.

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Other CRMs still holding deals | Funnel and sales metrics disagree depending on source | HubSpot is the record; Zoho CRM and the Ops Desk CRM feed it or are retired |
| Revenue overstated | Rent in advance and security bonds counted as revenue inflate the week they are paid | Bonds excluded; advance recognised in the weeks it covers (section 5) |
| Small numbers | With a few funded contracts a week, rates swing wildly and invite bad decisions | Counts shown beside every rate; no colour coding until a minimum count \[TBC\] is reached |
| Lag between spend and funding | Judging ads on this week's cost per funded contract kills good ads early | Cohort view by lead week is the default for CAC |
| Meta Instant Forms | No location or site behaviour on leads; the portal pixel misses these leads | Meta lead ID stored on the deal so outcomes can be traced back to the ad |
| Emails not classified | Quote and follow-up rates wrong | Fixed subject prefix or CRM template for every quote and follow-up |
| Stale source | Dashboard looks live but is not | Freshness stamp on every tile, amber when late |
| Personal information | Dashboard, transcripts and recordings hold customer personal and credit data | Read-only tokens, row level security, access logging, a retention period for recordings, covered in the privacy policy |
| Call recording law | Recording without notice may breach privacy expectations in NZ and some Australian states | Announce recording on every call; advisor sign-off before the first one |
| Published flags become a record | The needs-attention list documents rule breaches | That is the point, but agree who reviews red flags and how they are closed |

Credit data from Checkmate carries its own obligations under the Credit Reporting Privacy Code. Only the decision, tier and date come into the warehouse, never the credit report itself.

## Open questions

Four of these block phase 0; the rest can be answered during the build.

| # | Question | Owner | Blocking? |
| --- | --- | --- | --- |
| 1 | Which CRM is the system of record for deals? | Raj | Answered 1 October 2026: HubSpot |
| 2 | Which ledger does HireHospo use? | Raj | Answered 1 October 2026: MYOB |
| 3 | COGS is advertising plus GoCardless fees. Where does Washpro's weekly cost sit: in COGS, in overheads, or not on HireHospo's books at all under the 30% management fee model? Are delivery and install costs HireHospo's or passed through? | Raj, accountant | Yes, gross margin and LTV depend on it |
| 4 | Is the dashboard built inside Ops Desk, and what database and stack does Ops Desk run on Railway? | Claude Code, from the repo | Yes, confirmed in phase 0 |
| 5 | Which mailbox sends quotes and follow-ups: Gmail or Zoho Mail? | Urman | No |
| 6 | What are the first and second follow-up windows, in business days? | Raj, Urman | No |
| 7 | What makes a lead qualified? | Raj | No |
| 8 | Does Checkmate offer an API or export, or is the HubSpot decision property the record? | Raj | No |
| 9 | Does Plutio send a webhook on signing? | Engineering | No |
| 10 | Where are Washpro dispatch and install dates recorded today? | Urman | No |
| 11 | Which device and app record calls, who records them (Raj in Melbourne, Urman in Auckland, both), and are they phone calls or meetings? | Raj | No |
| 12 | Call recording disclosure wording and retention period, signed off by an advisor | Raj, advisor | Before first recording |
| 13 | Who can see the P&L, margin and unit economics? | Raj | No |
| 14 | Which speech-to-text service, given recordings contain customer personal information? | Engineering | No |
| 15 | KPI targets. None are set; proposal is to baseline from the first 4 weeks of clean data, then set them | Raj | No |
| 16 | Is Meta ad spend reported with or without GST on HireHospo's invoices? | Raj, accountant | No |
| 17 | Starting assumption for expected paid weeks (term completion and Rent rollover) until 12 months of history exists | Raj | No, LTV shows "assumption" until set |
| 18 | Which costs go into fully loaded CAC: sales wages, credit check fees, tools? | Raj | No |
| 19 | Default loss inputs for LTV: how much of a defaulted balance is typically recovered through the bond and re-leasing the equipment? | Raj, collections | No |
| 21 | Go-ahead to rebuild the HubSpot Contract Pipeline, merge duplicate deals and archive test deals | Raj | Yes, the funnel views wait on it |
| 22 | What do the "evangelist" and "other" lifecycle stages mean in HubSpot today? | Raj, Urman | No |
| 23 | Does the MYOB file have an intercompany account for HireHospo and IWise transfers, and when will reconciliation and the outstanding GST returns be done? | Raj | No, but MYOB figures are flagged until then |

Also open (question 20): does HireHospo sell equipment outright online, for example through a store or Shopify, and should those sales appear here as a second channel with their own gross margin? Owner: Raj. Not blocking.
