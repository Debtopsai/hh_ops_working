# Command Dashboard: phase 0 findings

Prepared 1 October 2026 for Raj. This file covers handoff items 0.1 (repo inspection), 0.2 (where agreements live), 0.4 (interim matching report) and the answer to open question 4. Items 0.3, 0.4 job design, 0.5 and 0.6 are in the other documents in this folder.

Sources read: the handoff, `PRD.md` (all 419 lines), the Ops Desk repo `Debtopsai/hh-wp-portal` at `6c8860e` (21 September 2026), the live HubSpot portal 47462529 (read-only, 1 October 2026), and the customer book export in `data/` of this repo.

## 1. Where this work lives

The handoff assumes this session opens in `hh-wp-portal`. It opened in `hh_ops_working`, and this session can only push to the branch `claude/hopeful-archimedes-edyjrk` here. I inspected `hh-wp-portal` read-only and wrote these documents here. On 1 October 2026 Raj confirmed the dashboard is a **separate app**, not a module inside Ops Desk. The documents move to the new dashboard repo once it exists.

**Exposure to fix now:** `hh_ops_working` is a **public** repository. Its own `data/README.md` says "keep this repo private". The repo holds `data/customers.csv`, `data/machines.csv`, `data/HireHospo_Database.xlsx` and a signed lease PDF, which together contain customer names, phone numbers, emails, addresses and a company number. This breaks house rule 9 before any dashboard exists. Make the repo private or remove the files and purge them from history. I have not changed anything about it. The interim matching report below uses internal IDs only, so it adds no new personal data.

## 2. Repo inspection (0.1)

| Area | What Ops Desk is today |
| --- | --- |
| Stack | Next.js 16, React 19, TypeScript, Prisma 6, Tailwind 4, Recharts, luxon, zod, pino |
| Database | **Plain Railway Postgres** (add-on, `DATABASE_URL`), not Supabase. One connection role, presumed owner. No row level security anywhere, no SQL views, no migrations folder |
| Schema changes | `prisma db push`, never `migrate` ("we have drift"). Railway pre-deploy runs `prisma db push --accept-data-loss` and carries on if it fails |
| Hosting | Railway, Dockerfile build, `node start.js`. The web service forks the BullMQ worker in the same container. A separate worker service is possible |
| Jobs | BullMQ on Redis does almost all scheduling (10 queues). Inngest is installed and serves 2 functions, including `finance-nightly-reconciliation` at 02:00 Pacific/Auckland |
| Auth | iron-session staff login. Static RBAC matrix: 5 roles (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `OPERATOR`, `VIEWER`) × 26 modules, enforced on `/api/*` by middleware. `FeatureGrant` rows gate beta sections (Business Intelligence, Growth, Outreach). Pages check permissions client side |
| Tests and CI | Vitest, 304 test files, Prisma mocked. CI runs lint, `tsc --noEmit`, build and tests against a Postgres 16 service. No Playwright |
| Insights / BI | `/business-intelligence` (BI cockpit) and `/finance` (Financial Cockpit), both under the Insights nav. `/command` is the product catalogue Command Center, not a finance view |
| Existing CRM tables | `crm_companies`, `crm_contacts`, `crm_leads`, `crm_deals`, `crm_equipment_lines`, `crm_contracts`, contract lineage and versions, `crm_machine_holdings`, `DealLifecycle`, enquiries, Meta `MarketingLead` with `metaLeadId` |
| GoCardless code | A client exists: reads payments, mandates and billing requests. It also has write functions (customers, mandates, payments), but `PAYMENTS_SHADOW_MODE` defaults on and returns fake IDs. There is a webhook at `/api/integrations/gocardless/webhook` with HMAC-SHA256 verification on the `webhook-signature` header, secret `GOCARDLESS_WEBHOOK_SECRET`. It only applies events when `PAYMENTS_ENABLED` is on |
| Xero code | A full Xero client and webhook exist. Xero is not the ledger. The dashboard will not read Xero tables |
| MYOB code | None |
| HubSpot code | None. Ops Desk does not create the HubSpot deals (see 0.4) |
| Money convention | Already integer NZD cents, GST exclusive at rest, "+ GST" applied at display. This matches house rules 3 and 4 |
| Stats register | `CLAUDE.md` and `STATS.md` hold a release-blocking register: one computation site per stat, no silent zero, prod comparison on every deploy |

### Conflicts found in the existing code

1. **Revenue definition.** `src/lib/finance/calculations.ts` books "HireHospo revenue" as 30% of rental, with 70% as the Washpro share. The PRD defines weekly revenue as the full customer weekly charge. These are different numbers, and the 1% reconciliation to MYOB only passes if the dashboard and MYOB use the same one. This is open question 3 seen from the other side. Until it is answered, I keep the PRD definition and show it as **gross billings**. The 30% split is ready as a COGS component, switched off.
2. **Rent in advance.** The same function adds rent in advance to rental revenue at signing, which breaks house rule 5. The dashboard does not use it. The existing `/finance` page keeps doing it until it is retired.
3. **Security bond GST.** Ops Desk bills the security deposit as a taxable line (`provisioning.ts`, "FLAG-1 RESOLVED: taxable"). A refundable bond is normally not a taxable supply. It never enters dashboard revenue either way, but it changes how cash is converted to ex GST. `[TBC, accountant]`
4. **Duplicate stats.** The BI cockpit already computes weekly run-rate, active customers, concentration, cash collected and CAC, with known defects listed in `STATS.md` (for example, all-time cash stamped with the selected period). With a separate dashboard, both will exist side by side. See section 3.

## 3. Open question 4: inside Ops Desk or a separate Supabase project

**Decided by Raj, 1 October 2026: a separate dashboard.** It has its own repo, Railway service and Supabase project (Postgres with row level security, and Supabase Auth). This overrides PRD decision 1 and the handoff's "build inside Ops Desk".

Ops Desk becomes a read-only source, read through a dedicated `dashboard_reader` Postgres role. The dashboard makes no code changes to Ops Desk.

Costs of this choice:

- Raj and Urman have a second login.
- Ops Desk data reaches the dashboard by a daily copy, not live.
- Ops Desk's own `/business-intelligence` and `/finance` pages keep computing their own versions of run-rate, cash collected and CAC. Those pages will disagree with the dashboard where they have known defects (`STATS.md`). I recommend Ops Desk retires or relabels them, but that is an Ops Desk change, outside this build.

## 4. Where agreements live (0.2)

**There is no single reliable source of agreements today.** Four places each hold part of the record, and none is complete:

| Candidate | What it has | Why it is not reliable on its own |
| --- | --- | --- |
| Ops Desk `crm_deals` + `crm_equipment_lines` + `crm_contracts` | Product (`financeOption`), term months, weekly rate (cents), contract and payment start dates, bond, rent in advance, per-machine lines, signed-contract evidence | No status column: active is derived at run time in `crm/active-book.ts`. The legacy book was copied from Plutio custom fields with **one deal per company**, so multiple agreements collapse into one record with at most 4 machine slots. In June 2026 production had 14 deals with no start date. End dates are never imported. `MachineHolding`, the intended per-machine source, is not yet trusted (`REPORTING_FROM_HOLDINGS` is off until reconciliation passes). Last known count: 34 active, $12,472.29/wk (June 2026 debug report) |
| Google Sheet export (`data/machines.csv`) | One row per machine: product, term, weekly, start, deposit | A manual sheet, last exported 19 July 2026. It misses agreements signed since (Ciao Cusina, GUI Newmarket, The Good Neighbours Cafe). It has known data errors (M060 says 36m but has term 12, HH042 is an import artefact). Deposit is repeated per machine |
| HubSpot deal amount | Company name, Rent or Lease in the deal name, an amount | Covered in 0.4 below: duplicates, zeros, at least one deposit entered as the weekly rate, no start date, term or status, and currency set to USD |
| GoCardless | What is actually being collected, per customer | The truth about cash, not about contract terms. Not read yet: no credential in this session |

**Proposal:** the Ops Desk CRM becomes the agreement system of record. It is where agreements are now drafted and signed (`AgreementLink`, `AgreementSigner`), and it already holds the right fields. Four changes make it reliable:

1. **One agreement per row.** Add `wh.agreement` as the modelled agreement table. It holds one row per signed agreement, keyed to an Ops Desk deal and contract version, not to a company. Imported company-level deals are split into their agreements during a one-off clean-up.
2. **An explicit status.** The statuses are `active`, `rolling` (Rent past 52 weeks), `ended`, `bought_out`, `defaulted`, `recovered` and `cancelled`. Status is derived from dates and signed evidence. An operator override can set it, with a reason, for cases dates cannot express, such as default or recovery. Each override is a logged row in `wh.agreement_override`. Ops Desk deals are never edited from the dashboard.
3. **Reconciled to GoCardless.** A daily check compares each active agreement's weekly rate with what GoCardless actually collected over the last 4 weeks. Every difference goes on the data health list.
4. **Clean-up before trust.** The first build of `wh.agreement` is reviewed line by line against the Sheet and GoCardless by Urman and Raj. Until that review is signed off, Book tiles carry an "unreconciled" badge.

This is a design change to how agreements are recorded and needs your approval. Phase 1 can still build without it, using the Ops Desk active-book rules as the starting status with the badge showing. Getting a reliable result needs the clean-up.

## 5. HubSpot deals: what creates them

All 50 deals have `hs_object_source_label = INTEGRATION` and `hs_object_source_detail_1 = Pabbly Connect`. They are created by a **Pabbly Connect** workflow, not by Ops Desk; Ops Desk has no HubSpot code at all. The deal names ("<COMPANY> - Lease agreement" and "- Rent agreement") match Plutio's agreement templates, so the trigger is most likely a Plutio signing event. `[TBC, Raj: confirm the Pabbly workflow's trigger and owner]`. The most recent deal was created on 23 September 2026, so the workflow is still live.

The live data also differs from the handoff's description in four ways:

- 47 deals are in the Contract Pipeline stage `251084371`. One Selwyn deal is in stage `251084375`. 2 early IWise deals have **no pipeline at all**.
- **Every deal has `deal_currency_code = USD`.** The amounts are NZD weekly rates, so any HubSpot currency roll-up is wrong.
- Some amounts are not weekly rates. Lahoria Trading's deal says 490, which is the deposit in the Sheet, while its weekly rate is 65. Three real deals have an amount of 0.
- Lifecycle stage property names were not pulled yet. That is a phase 2 need and is listed in the open items.

## 6. Interim matching report (0.4)

The matching job specified in 0.4 pairs active GoCardless customers with HubSpot deals and MYOB customer cards. **It cannot run with real counts yet:**

- No GoCardless credential exists in this session.
- The MYOB connector returns "not available on your account yet".
- No source secrets exist in this container.

The job's design is in `03-backend-technical.md` section 6. It runs once the credentials in `04-credentials-checklist.md` exist.

What could be matched today, with real data, is **HubSpot deals against the customer book export**. I paired every company by hand after a token pass, because the token pass produced false pairs on generic words such as "catering", "hotel" and "foods".

The full report is in `matching/2026-10-01-hubspot-vs-book.md`. Summary:

| Measure | Count |
| --- | --- |
| HubSpot deals | 50 |
| Test, internal or blank-name deals (IWise, rajurman, Pabbly Connect, Simple Test HH, Joels Video Editing, 3 named " - Rent agreement") | 16 |
| Real customer deals | 34 |
| Duplicate groups among real deals (Hiraya, BlueMoonSkyNZZ rent, Selwyn, Sugar Spice, Homely Flavors) | 5 groups, 10 deals |
| Book customers (excluding HH042 artefact) | 28 |
| Book customers matched to a HubSpot deal | 17 |
| of which the weekly rate agrees to the cent | 8 |
| of which the weekly rate differs | 9 |
| Book customers with no HubSpot deal | 11 (mostly agreements signed before the Pabbly flow existed, plus Eat Shop Do at $725.00/wk + GST) |
| Ambiguous after hand review | 0 |
| Real HubSpot deals with no book customer | 12 deals, 11 companies (newer signings the Sheet misses, and some that may never have funded) |

**What this shows:** HubSpot cannot be the agreement source, and the Sheet is stale. That supports the proposal in section 4.
