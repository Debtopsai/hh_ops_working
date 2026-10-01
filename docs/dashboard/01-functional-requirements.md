# Command Dashboard: functional requirements, phases 0 and 1

Status: draft for Raj's approval, 1 October 2026. Read with `PRD.md`. Where they differ, the handoff of 1 October 2026 wins, then this document, then the PRD.

## 1. Scope

**In scope**

Phase 0:
- warehouse schema;
- deal thread design and the read-only matching job;
- access roles;
- credentials checklist;
- HubSpot pipeline plan (written, not run).

Phase 1:
- GoCardless, MYOB and Ops Desk ingestion;
- the GoCardless webhook;
- Scorecard money tiles;
- P&L, Book and Collections views;
- nightly reconciliation.

**Out of scope until phase 2 or later**
- Meta Ads and ad spend;
- HubSpot funnel and lifecycle ingestion;
- Marketing, Funnel, Unit economics, Sales activity and Ops views;
- the needs-attention rules that depend on CRM events;
- calls;
- the MCP server.

Nothing in phases 0 and 1 writes to HubSpot, MYOB, GoCardless or Meta.

## 2. Conventions (apply to every requirement)

| ID | Convention |
| --- | --- |
| C1 | A week runs Monday 00:00 to Sunday 23:59:59, Pacific/Auckland. A week is named by its Monday, written as "week of 29 September 2026" |
| C2 | All money is NZD, excludes GST, and is labelled "+ GST" wherever it is shown. GST is 15%. No GST-inclusive figure appears in the UI |
| C3 | Money is stored as integer cents (`bigint`) in the warehouse and handled as integer cents in TypeScript. No floating point anywhere money is computed. Ratios are computed in SQL `numeric` and sent to the browser as a string with 4 decimal places |
| C4 | Security bonds are never revenue. Rent in advance is recognised only in the weeks it covers. Late and admin fees count only on direct debits actually presented and returned |
| C5 | Intercompany transfers between HireHospo and IWise Limited are never revenue or cost |
| C6 | No silent zero. A metric whose source is missing, late or unreconciled returns a status and a null, and the tile says why |
| C7 | Every rate shows its numerator and denominator beside it |
| C8 | NZ English. Dates written as 1 October 2026. No em dashes in any label, generated text, document, commit or PR |
| C9 | Every metric is defined once, as a SQL view in the `wh` schema. The API and later the MCP server read the view. The browser only formats |

## 3. Roles

| Role | Who | Sees |
| --- | --- | --- |
| Owner | Raj | Everything |
| Sales and operations manager | Urman | Book (customer level), Collections (customer level), Scorecard operational tiles (active customers, active agreements, weekly contracted revenue, cash collected, failure rate). **Not** P&L, COGS, gross margin, or anything from MYOB beyond AR `[TBC, Raj: open question 13]` |
| Credit, collections | `[TBC who]` | Phase 2. Collections view grant only, if the role exists |

Roles are granted in Ops Desk at Settings, Section Access, as new feature grants. `SUPER_ADMIN` maps to Owner. No other Ops Desk role gets dashboard access by default.

## 4. Phase 0 functional requirements

| ID | Requirement | Acceptance |
| --- | --- | --- |
| F0.1 | Warehouse schema exists in the `wh` schema of the Ops Desk database, created by versioned SQL migrations and untouched by `prisma db push` | A CI test applies the migrations, runs `prisma db push`, and asserts every `wh` table and view still exists with the same columns |
| F0.2 | Every raw table keeps the source ID, the full source payload, the source's own updated timestamp and our fetch timestamp | Schema test |
| F0.3 | The deal thread table exists, keyed on the HubSpot deal ID. It has columns for Meta lead ID, Checkmate reference, Plutio agreement number, GoCardless customer and mandate IDs, MYOB customer card UID and Ops Desk deal ID | Schema test |
| F0.4 | Read-only matching job pairs every active GoCardless customer with HubSpot deals and MYOB customer cards. Each customer is classified matched, unmatched or ambiguous, with the rule that decided it | Report with real counts, stored in `wh.match_result`, exportable as CSV, shown on a "Deal thread" admin page. The job makes GET requests only, which a unit test asserts against the client |
| F0.5 | Matching never writes an ID into any source system | Code review plus the GET-only test in F0.4 |
| F0.6 | Data health metric: share of active agreements whose thread is complete across HubSpot, GoCardless and MYOB | Shown on the Scorecard with its count, for example "12 of 31 complete (38.7%)" |
| F0.7 | Access roles from section 3 exist and are enforced by row level security, not only by the UI | RLS tests in section 7 |
| F0.8 | Credentials checklist and HubSpot pipeline plan delivered as documents | `04-credentials-checklist.md`, `05-hubspot-pipeline-plan.md` |

**Phase 0 exit test (from the handoff)**
- The matching report exists with real counts.
- These three documents are approved.
- The agreement source is identified.

The first needs the credentials in `04-credentials-checklist.md`.

## 5. Phase 1 functional requirements

### 5.1 Ingestion

| ID | Source | What | Schedule | Acceptance |
| --- | --- | --- | --- | --- |
| F1.1 | GoCardless | Customers, mandates, payments, payouts, payout items (including fees), refunds, events | Every 15 minutes incremental, plus webhook. Back-fill from `[TBC, Raj]`, default 12 months before the first run | Idempotent: running twice changes no row. Back-fill re-run produces identical totals |
| F1.2 | GoCardless webhook | Payment, mandate, payout and refund events | Real time | Bad signature returns 498 and stores nothing. Good signature stores the raw event once, even when delivered twice |
| F1.3 | MYOB | Monthly P&L by account, sales invoices with lines, customer cards, bills, AR aging | Hourly | Only the HireHospo company file is read. Idempotent upserts |
| F1.4 | Ops Desk | Deals, equipment lines, contracts, holdings, companies, enquiries, products | Daily snapshot at 01:00, plus on demand | Snapshot copied into `wh.raw_opsdesk_*` so history exists even when Ops Desk rows change |
| F1.5 | Freshness | Every source records its last successful run | Continuous | A source more than twice its interval late turns its tiles amber and names the source |

### 5.2 Scorecard money tiles

Every tile shows this week, last week, the 4-week average, a freshness stamp, and drills through to its records. Rates show their count.

| ID | Tile | Definition | Notes |
| --- | --- | --- | --- |
| F1.6 | Weekly revenue + GST | For each agreement, the weekly rate for every weekly period whose start date falls in the week and is covered by the agreement (including weeks covered by rent in advance), plus qualifying fees | Gross billings basis (see conflict 1 in `00-phase0-findings.md`). Bonds excluded. Advance never counted as extra |
| F1.7 | Cash collected + GST | GoCardless payments with `links.payout` set, counted by the payout's `arrival_date` `[TBC, verify field name: handoff says payout_date]` in NZ time, converted to ex GST | Reconciled exactly to payouts on the GST-inclusive gross (see 03 section 8). Shown ex GST |
| F1.8 | COGS + GST | Sum of enabled COGS components for the week. Phase 1 enables GoCardless fees only | Tile subtitle reads "GoCardless fees only. Advertising added in phase 2". Status `partial`, never shown as complete |
| F1.9 | Gross margin + GST and % | Weekly revenue less COGS, in $ and % | Carries the same "partial" subtitle as COGS until advertising lands |
| F1.10 | Active customers | Distinct customers with at least one active or rolling agreement at week end | From `wh.agreement_snapshot` |
| F1.11 | Active agreements | Agreements active or rolling at week end | Same |
| F1.12 | Weekly contracted revenue + GST | Sum of weekly rates on active and rolling agreements at week end, with the annualised figure (× 52) beneath | Same |
| F1.13 | Payment failure rate | Failed ÷ presented GoCardless payments with charge date in the week, with both counts | From GoCardless |
| F1.14 | Data health | Thread complete count ÷ active agreements | From F0.6 |
| F1.15 | Reconciliation flags | Any variance over 1% from the nightly job shown as an amber flag on the tile it affects, naming the check and the variance | From F1.20 |

### 5.3 P&L view (Owner only)

| ID | Requirement |
| --- | --- |
| F1.16 | MYOB P&L by month: income, cost of sales, gross profit, overheads, net profit. Shows month to date and the trailing 12 months, accrual basis. Each line drills to its MYOB accounts. Intercompany accounts `[TBC, open question 23]` are excluded and listed separately as "Intercompany, excluded". Every month after the "reconciled to" date is badged "Not reconciled". The reconciled-to date is an Owner-set setting with who set it and when. Beside it sits a weekly run-rate from the warehouse revenue and COGS, so the gap between MYOB and operational figures is visible |

### 5.4 Book view

| ID | Requirement |
| --- | --- |
| F1.17 | From the daily agreement snapshot: active agreements, weekly contracted revenue and annualised run-rate, average weekly rate (Rent and Lease to Own), net new agreements, book outstanding, Rent vs Lease to Own mix, customer concentration (top 5 share), agreements reaching end of term in the next 90 days, Rent agreements rolling month to month, and early exit rate (rolling 12 weeks, shown as "not enough history" until 12 weeks of snapshots exist). An agreement list drills to each agreement: Ops Desk link, thread IDs, weekly rate, start, term, end, status, last 8 GoCardless collections. Badged "unreconciled" until the clean-up in `00-phase0-findings.md` section 4 is signed off |

### 5.5 Collections view

| ID | Requirement |
| --- | --- |
| F1.18 | Today's failed payments (with failure reason). Failures this week. Failure rate by weekday for the last 12 weeks. Failures in the 21st to 25th window of each month. Arrears by age (1 to 7, 8 to 14, 15 to 30, 30+ days) from MYOB AR, falling back to GoCardless unpaid charges with a label saying which. Accounts with more than 3 failures in 12 weeks. Fees charged (late and admin), only on returned direct debits |
| F1.19 | Arrears ratio: $ in arrears ÷ weekly contracted revenue, with both figures |

### 5.6 Reconciliation

| ID | Requirement |
| --- | --- |
| F1.20 | Nightly at 02:30 Pacific/Auckland. Checks: (a) for each of the last 8 weeks, cash collected (gross) equals the sum of GoCardless payout amounts plus fees and refunds deducted in those payouts, to the cent; (b) for each reconciled week, warehouse weekly revenue against MYOB rental income from sales invoices dated in that week, flagged over 1%; (c) for each reconciled month, warehouse revenue against MYOB P&L rental income accounts, flagged over 1%. Results are stored per run with inputs, so any flag can be re-checked |

### 5.7 Access, audit and drill-through

| ID | Requirement |
| --- | --- |
| F1.21 | Every dashboard page view and drill-through is written to the Ops Desk audit log with user, view and filters |
| F1.22 | Drill-through shows the rows behind a number. The rows sum to the number shown, which is pinned by a test per tile |
| F1.23 | The Scorecard loads in under 3 seconds with 12 months of data |

## 6. Edge cases phase 1 must handle

- A customer with two agreements, and an agreement varied mid-term. The Ciao Cusina mixer substitution is a live example: a new contract version ends one holding and starts another on the same agreement.
- A Rent agreement past 52 weeks rolling month to month. It is revenue and an active agreement, but not a new agreement.
- A GoCardless payment with a null invoice reference in metadata. It is not unmatched if it has a payout.
- A failed payment later retried and paid. It counts once as failed in its charge week and once as collected in its payout week.
- A refund or chargeback after payout. It reduces cash collected in the payout week where it is deducted, not the original week.
- A week with no payouts. Cash collected shows $0.00 + GST with status `ok` only if GoCardless was refreshed after the week ended; otherwise null with status `stale`.
- A MYOB month not yet reconciled. Shown, badged, and excluded from reconciliation checks.

## 7. Verification required before hand-back (from handoff section 8)

1. A script finds zero em dash characters and zero em dash HTML entities across the diff, docs and UI strings.
2. A test asserts every money figure rendered by a dashboard component carries "+ GST", and that no component renders a GST-inclusive amount.
3. Money tests on fixed fixtures:
   - bonds excluded from revenue;
   - rent in advance spread across its weeks;
   - fees only on returned direct debits;
   - weekly rate times paid weeks reconciles.
4. Three real agreements computed by hand in Python `Decimal`, matching the dashboard to the cent.
5. RLS tests: a non-owner cannot read P&L, COGS, margin, or customer-level rows they are not granted, even through raw SQL as `wh_reader`.
6. Webhook signature verification tested with a bad signature.
7. Every `[TBC]` collected in `06-open-items.md`.
