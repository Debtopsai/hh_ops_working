# Command Dashboard: open items, phases 0 and 1

Updated 1 October 2026. Every `[TBC]` in `00` to `05` is listed here.

## Blocking approval or the phase 0 exit test

| # | Item | Owner | Effect until answered |
| --- | --- | --- | --- |
| A1 | Approve the three documents (`01`, `02`, `03`) | Raj | No application code is written |
| A2 | Approve making the Ops Desk CRM the agreement system of record, with the `wh.agreement` clean-up (`00` section 4) | Raj | Phase 1 builds on the Ops Desk active-book rules, with Book tiles badged "unreconciled" |
| A3 | Create the credentials in `04-credentials-checklist.md` | Raj | The matching report cannot have GoCardless or MYOB counts. Phase 0 exit test not met |
| A4 | Revenue basis: gross billings (PRD) or the 30% HireHospo share (Ops Desk `calculateFinanceRevenue`). This is open question 3 seen from the revenue side | Raj, accountant | Dashboard shows gross billings. The 1% revenue check against MYOB may fail by design if MYOB books the 30% share |
| A5 | Push access and a `feat/` branch in `hh-wp-portal` for this session | Raj | Docs stay in `hh_ops_working`. Code cannot start there |
| A6 | `hh_ops_working` is public and holds customer personal data | Raj | Exposure continues. Make it private or remove the files and purge history |

## Business answers needed for phase 1

| # | Item | Owner | Default |
| --- | --- | --- | --- |
| B1 | Back-fill start date for GoCardless and MYOB | Raj | 12 months, flagged |
| B2 | MYOB intercompany account(s) and when reconciliation and GST returns are done (open question 23) | Raj | Every MYOB month badged "Not reconciled". Intercompany warning on P&L |
| B3 | MYOB rental income account codes, and late fee and admin fee item codes | Raj, bookkeeper | Revenue-to-MYOB checks and the fee metric show "not configured" |
| B4 | Link rule from a fee invoice to the returned direct debit (payment ID in the invoice reference preferred) | Raj, bookkeeper | Unlinked fee lines listed, not counted |
| B5 | GST treatment of the security bond (Ops Desk bills it as taxable) | Accountant | Bond payments listed separately on cash drill-through |
| B6 | Who sees P&L, COGS, margin and unit economics (open question 13) | Raj | Owner only |
| B7 | Who holds the credit and collections roles | Raj | No grant exists. Sales and ops manager sees Collections |
| B8 | Minimum count before rates get colour coding | Raj | No colour coding |
| B9 | Washpro cost in COGS (open question 3) | Raj, accountant | COGS component exists, disabled |
| B10 | Pabbly flow: who owns it, what triggers it | Raj | HubSpot plan section 8 cannot be finalised |
| B11 | MYOB customer card custom field free for "HubSpot deal" | Bookkeeper | Thread design for MYOB uses the invoice PO prefix only |

## Technical items to verify during implementation

| # | Item | How |
| --- | --- | --- |
| T1 | `prisma db push --accept-data-loss` leaves the `wh` schema untouched | CI test before first deploy |
| T2 | Production Postgres major version is 15 or later (`security_invoker` views) | `select version()` on Railway |
| T3 | Inngest Cloud keys set on the Railway web service | Railway variables, Inngest dashboard |
| T4 | GoCardless payout field for "payout date". The handoff says `payout_date`; the payout resource has `arrival_date` | First real payout pulled |
| T5 | GoCardless payout item tax fields on fee items | First real payout pulled |
| T6 | MYOB P&L report endpoint and parameters, and the read-only scope names | MYOB app registration |
| T7 | What the existing GoCardless webhook route returns on a bad signature | Read the route and its tests before changing it |

## HubSpot plan items (open question 21 and phase 2)

| # | Item | Owner |
| --- | --- | --- |
| H1 | Go-ahead to rebuild the Contract Pipeline, merge 5 duplicate pairs and archive 16 deals | Raj |
| H2 | Stage probabilities | Raj |
| H3 | Risk tier names | Raj |
| H4 | What `amount` should hold once the weekly rate moves to `hh_weekly_rate` | Raj |
| H5 | Whether HubSpot multi-currency is on, before fixing USD to NZD | Raj |
| H6 | Meaning of the "evangelist" and "other" lifecycle stages (open question 22) | Raj, Urman |
| H7 | Exact HubSpot lifecycle-stage date property names, from the properties API | Phase 2 build |

## Judgement calls made (flag if you disagree)

- The warehouse lives in a `wh` schema inside the Ops Desk Postgres, not in Supabase. Ops Desk is not on Supabase.
- Jobs use Inngest as the handoff says, even though Ops Desk schedules most work on BullMQ.
- The dashboard is at `/insights`, because `/command` is taken by the catalogue Command Center.
- The existing `/business-intelligence` and `/finance` cockpits are retired once phase 1 is signed off, to keep one computation site per stat.
- Cash collected reconciles exactly on the GST-inclusive gross and displays ex GST (amount × 100 / 115).
- Token-based name matching is never auto-matched, after it paired the wrong companies on 1 October 2026.
- The handoff's "all 50 deals in Prospect Inquiry" is corrected: 47 are, 1 is in another stage and 2 have no pipeline. All deals carry USD as currency.
