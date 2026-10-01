# Command Dashboard: backend technical design, phases 0 and 1

Status: draft for Raj's approval, revised 1 October 2026 for a **separate dashboard app**. Target repo: a new repo, `hh-command-dashboard` `[TBC, Raj: name, and who creates it]`. Ops Desk (`hh-wp-portal`) is a read-only source and gets no code changes.

## 1. Shape

```
GoCardless API + own webhook ─┐
MYOB Business API ────────────┼─> Inngest jobs ─> wh.raw_* ─> wh modelled tables ─> wh metric views ─> /api/* ─> dashboard pages
Ops Desk DB (read-only role) ─┤        (service role writes)                   (RLS by signed-in user's dashboard role)
HubSpot API (phase 0 matching) ┘
```

**The app.** Next.js and TypeScript, hosted on Railway, in its own repo. It is not part of Ops Desk: it has its own deploy, URL and logins.

**Storage.** A dedicated Supabase project (Postgres with row level security, and Supabase Auth for logins). Everything lives in the schema `wh`, managed by versioned SQL migrations (`supabase/migrations/`). No Prisma.

**Ops Desk as a source.** The dashboard reads the Ops Desk database through a new Postgres role, `dashboard_reader`, that can only `SELECT` the tables listed in section 2.1. The role's connection string is a secret in the dashboard's Railway service. Creating the role is a one-off SQL statement Raj runs on the Ops Desk database (see `04-credentials-checklist.md`). It is not a code change, and `prisma db push` does not touch roles.

**Repo layout**

| Path | Purpose |
| --- | --- |
| `supabase/migrations/NNNN_name.sql` | Forward-only schema, view, role and policy migrations |
| `src/lib/sources/` | Read clients for GoCardless, MYOB, HubSpot and the Ops Desk DB |
| `src/lib/ingest/`, `src/lib/match/` | Ingestion and the matching job |
| `src/lib/metrics.ts` | Metric registry: view name, label, definition and visibility, with no formulas |
| `src/inngest/` | Scheduled and event jobs |
| `src/app/api/*`, `src/app/(dashboard)/*` | Read-only API and pages |
| `tests/unit/`, `tests/sql/` | Tests. The SQL tests run against a local Supabase Postgres in CI |

**Source clients are GET-only by construction.** Each client exposes one `get(path, query)` method. A unit test asserts that no other HTTP verb appears in the client module. The Ops Desk DB client runs as `dashboard_reader`, which has no write grant.

## 2. Schema

All money columns are `bigint` cents, GST exclusive unless the column name ends in `_gross_cents`. All timestamps are `timestamptz`. All dates that mean a business day are `date` in Pacific/Auckland.

### 2.1 Raw tables (one per source object)

Every raw table has the same columns:

```sql
source_id          text primary key,     -- the source's own ID
payload            jsonb not null,       -- full object as returned
source_updated_at  timestamptz,          -- source's own updated or created stamp
fetched_at         timestamptz not null default now(),
payload_hash       text not null         -- sha256 of payload; an unchanged hash is a no-op upsert
```

The raw tables are:

| Source | Tables |
| --- | --- |
| GoCardless | `raw_gc_customer`, `raw_gc_mandate`, `raw_gc_payment`, `raw_gc_payout`, `raw_gc_payout_item` (`source_id` = `payout_id:index`), `raw_gc_refund`, `raw_gc_event` (webhook and `/events`) |
| MYOB | `raw_myob_customer`, `raw_myob_invoice`, `raw_myob_bill`, `raw_myob_account`, `raw_myob_pnl_month` (`source_id` = `account_uid:yyyy-mm`) |
| HubSpot (phase 0, matching only) | `raw_hubspot_deal` |
| Ops Desk | `raw_opsdesk_deal`, `raw_opsdesk_equipment_line`, `raw_opsdesk_contract`, `raw_opsdesk_holding`, `raw_opsdesk_company`. Primary key is `(source_id, snapshot_date)`, so history is kept |

Each raw table also gets a history table, `raw_*_history`. A trigger appends the previous payload there when a row's `payload_hash` changes, so a source that edits or deletes a record does not erase what the dashboard showed.

Personal and credit data:

- No raw table stores a credit report.
- Checkmate is not a phase 1 source.
- When Checkmate data arrives in phase 2, only `credit_decision`, `risk_tier` and `decided_on` are allowed, on `deal_thread`.
- A schema test fails if any `wh` column name matches `credit_report|bureau|score_detail`.

### 2.2 Modelled tables

```sql
create table wh.deal_thread (
  hubspot_deal_id        text primary key,     -- master key
  opsdesk_deal_id        text,
  agreement_id           uuid references wh.agreement,
  meta_lead_id           text,                 -- phase 2
  checkmate_ref          text,                 -- phase 2
  plutio_agreement_no    text,
  gc_customer_id         text,
  gc_mandate_id          text,
  myob_customer_uid      uuid,
  is_test                boolean not null default false,
  duplicate_of           text references wh.deal_thread,
  updated_at             timestamptz not null default now()
);

create table wh.agreement (
  agreement_id        uuid primary key,
  opsdesk_deal_id     text not null,
  opsdesk_version_id  text,                    -- ContractVersion when present
  customer_key        text not null,           -- Ops Desk company id
  product             text not null check (product in ('rent','lease_to_own')),
  term_weeks          int  not null,           -- via termWeeksFromMonths: 12m = 52, 36m = 156
  start_date          date not null,           -- first weekly period start
  advance_weeks       int  not null default 0,
  bond_cents          bigint not null default 0,   -- never revenue
  derived_status      text not null,           -- from dates and signed evidence
  status              text not null,           -- derived_status unless overridden
  ended_on            date,
  source_built_at     timestamptz not null
);

create table wh.agreement_rate (               -- handles mid-term variations
  agreement_id      uuid references wh.agreement,
  effective_from    date not null,
  weekly_rate_cents bigint not null check (weekly_rate_cents >= 0),
  primary key (agreement_id, effective_from)
);

create table wh.agreement_override (
  id uuid primary key, agreement_id uuid references wh.agreement,
  status text not null, effective_on date not null,
  reason text not null, set_by text not null, set_at timestamptz not null default now()
);

create table wh.agreement_snapshot (
  snapshot_date      date not null,
  agreement_id       uuid not null references wh.agreement,
  status             text not null,
  product            text not null,
  weekly_rate_cents  bigint not null,
  weeks_remaining    int,
  outstanding_cents  bigint,                   -- weekly_rate × weeks_remaining
  arrears_cents      bigint,
  primary key (snapshot_date, agreement_id)
);

create table wh.payment (                      -- one row per GoCardless payment
  gc_payment_id     text primary key,
  gc_customer_id    text, gc_mandate_id text, gc_payout_id text,
  charge_date       date not null,
  amount_gross_cents bigint not null,          -- as collected, GST inclusive
  amount_cents      bigint not null,           -- ex GST, see section 8
  status            text not null,
  failure_reason    text,
  payout_arrival_date date,
  retry_of          text
);

create table wh.cogs_component (               -- config, not code
  key text primary key,                        -- 'gocardless_fees', 'advertising', 'washpro_cost'
  label text not null,
  enabled boolean not null,
  effective_from date not null,
  source_view text not null,                   -- wh view returning (week_start, amount_cents)
  note text
);

create table wh.stage_event (                  -- created now, filled in phase 2
  hubspot_deal_id text, stage text, occurred_at timestamptz, source text,
  primary key (hubspot_deal_id, stage, occurred_at)
);

create table wh.finance_month (                -- MYOB P&L, modelled
  month date, account_uid uuid, account_name text, section text,
  amount_cents bigint, is_intercompany boolean not null default false,
  primary key (month, account_uid)
);

create table wh.setting (key text primary key, value jsonb, set_by text, set_at timestamptz);
-- 'myob_reconciled_to' (date), 'backfill_start' (date), 'intercompany_accounts' (uuid[])

create table wh.source_run (source text, started_at timestamptz, finished_at timestamptz,
  ok boolean, rows_upserted int, error text, primary key (source, started_at));

create table wh.recon_run (id uuid primary key, ran_at timestamptz, check_key text,
  period_start date, expected_cents bigint, actual_cents bigint,
  variance_ratio numeric(12,6), flagged boolean, inputs jsonb);

create table wh.match_run    (id uuid primary key, ran_at timestamptz, counts jsonb);
create table wh.match_result (run_id uuid references wh.match_run, gc_customer_id text,
  hubspot_deal_ids text[], myob_customer_uids uuid[], hubspot_status text,
  myob_status text, rule text, detail jsonb, primary key (run_id, gc_customer_id));
```

`ad_daily`, `activity` and `call` are not created in phase 1. They are listed so the phase 2 migrations have names reserved.

### 2.3 Building `wh.agreement`

The daily job runs after the Ops Desk snapshot. It applies the Ops Desk active-book rules (`crm/active-book.ts`) once, in SQL, with these changes:

1. **One agreement per signed contract version.** Where an imported deal holds several agreements (one deal per company from the Plutio import), the job emits one agreement per distinct (start date, term, product) group of equipment lines. It writes a `data_health` row so the split is reviewed.
2. **Start date.** `contractStartDate`, then `paymentStartDate`, then the earliest line start. A missing start is a data health row, not a guess. The agreement is excluded and the exclusion is counted on the Book view.
3. **Term.** Weeks via `termWeeksFromMonths` (`round(months × 52 / 12)`). It is not re-implemented: the job reads the same rule from a shared SQL function, `wh.term_weeks(months)`, and a test asserts both give equal results for 1 to 60 months.
4. **Rates.** One `agreement_rate` row per contract version's effective date.
5. **Status.**
   - `active` inside term.
   - `rolling` for Rent past term with collections in the last 28 days.
   - `ended` after term otherwise.
   - `cancelled` when Ops Desk inactivated the deal.
   - `bought_out`, `defaulted` and `recovered` only by override.

## 3. Metric layer

Each metric is a view in `wh` named `m_<metric>`. Every view returns at least `(week_start date, value, numerator, denominator, status text)`. Weeks are Mondays in Pacific/Auckland, and `wh.week_start(d date)` is the one helper that computes them.

The TypeScript metric registry (`src/lib/warehouse/metrics.ts`) holds only:

- the view name;
- the label;
- the plain-English definition;
- the visibility class.

It holds no formula.

### 3.1 Weekly periods (the basis of revenue)

```sql
create view wh.agreement_period as
select a.agreement_id, a.customer_key, a.product,
       (a.start_date + 7 * k)                 as period_start,
       k,
       case when k < a.advance_weeks then 'advance' else 'direct_debit' end as covered_by,
       r.weekly_rate_cents
from wh.agreement a
cross join lateral generate_series(
       0,
       case when a.status = 'rolling'
            then ((coalesce(a.ended_on, current_date) - a.start_date) / 7)
            else a.term_weeks - 1 end) as k
cross join lateral (
       select weekly_rate_cents from wh.agreement_rate ar
       where ar.agreement_id = a.agreement_id and ar.effective_from <= a.start_date + 7 * k
       order by effective_from desc limit 1) r
where a.status <> 'cancelled'
  and (a.ended_on is null or a.start_date + 7 * k < a.ended_on);
```

Three properties follow from this view:

- **Rent in advance** is not extra money. It only marks which periods are pre-paid. Each period is counted once, whether advance or direct debit covers it.
- **Bonds** are not in the view at all.
- **A variation** changes the rate from its effective date and never double counts a period.

### 3.2 Phase 1 metric views

| View | Definition (SQL summary) | Visibility |
| --- | --- | --- |
| `m_weekly_revenue` | `sum(weekly_rate_cents)` from `agreement_period` by `week_start(period_start)`, plus `m_fee_revenue` | owner |
| `m_fee_revenue` | MYOB invoice lines on fee items `[TBC, item codes or accounts for late and admin fees]` joined to a GoCardless payment for the same customer with status `failed` or `charged_back`. Link rule `[TBC]`: an invoice reference holding the payment ID is preferred, otherwise a failure within the 7 days before the fee invoice date. Unlinked fee lines are listed for review and **not counted** | owner |
| `m_cash_collected` | `sum(amount_cents)` from `wh.payment` where `gc_payout_id is not null`, by `week_start(payout_arrival_date)`. A gross column is carried for reconciliation | owner, sales_ops |
| `m_cogs` | Union of each enabled `cogs_component.source_view` by week, summed | owner |
| `m_cogs_gocardless_fees` | `-sum(amount)` of payout items of fee types (`gocardless_fee`, `app_fee`, `surcharge_fee`) by payout week, ex GST using the tax amounts on the item `[TBC, verify item tax fields on a real payout]` | owner |
| `m_gross_margin` | revenue less COGS, plus `margin / revenue` as `numeric`. Status `partial` while any planned component (`advertising`) is not enabled | owner |
| `m_active_customers`, `m_active_agreements`, `m_contracted_weekly` | From `agreement_snapshot` at each week's Sunday, statuses `active` and `rolling` | owner, sales_ops |
| `m_failure_rate` | failed ÷ presented by charge-date week. "Presented" means a status reached `submitted` or later | owner, sales_ops |
| `m_arrears` | MYOB open invoices by days past due into 1 to 7, 8 to 14, 15 to 30 and 30+ buckets. GoCardless-unpaid fallback with status `fallback_source` | owner, sales_ops |
| `m_book_outstanding`, `m_concentration_top5`, `m_mix`, `m_ending_90d`, `m_rolling_rent`, `m_net_new`, `m_early_exit` | From snapshots as defined in PRD section 5, business health | owner, sales_ops |
| `m_pnl_month` | `wh.finance_month`, `is_intercompany = false`, with a `reconciled` flag from the `myob_reconciled_to` setting | owner |
| `m_data_health` | Active agreements with a complete thread ÷ active agreements | owner, sales_ops |

### 3.3 The API

`GET /api/scorecard?week=YYYY-MM-DD` returns one object per tile:

```json
{ "key": "weekly_revenue", "label": "Weekly revenue", "gstLabel": "+ GST",
  "thisWeek": {"cents": "441230", "status": "ok"},
  "lastWeek": {"cents": "438010", "status": "ok"},
  "avg4w":   {"cents": "430177", "status": "ok"},
  "numerator": null, "denominator": null,
  "freshness": [{"source": "gocardless", "at": "2026-10-01T08:41:00+13:00", "late": false}],
  "flags": [] }
```

Money crosses the wire as a cents string and is formatted by one function, `formatNzdExGst(cents: string)`, which always appends "+ GST". The 4-week average is computed in SQL as `round(avg(...))`, half away from zero, over complete weeks only.

## 4. Jobs (Inngest)

| Function | Trigger | Does |
| --- | --- | --- |
| `wh-gc-sync` | cron `*/15 * * * *`, and event `wh/gc.event.received` | Incremental pull of customers, mandates, payments, payouts and refunds by `created_at[gte]` since the last cursor less a 3-day overlap. Payout items are fetched per payout. Upsert raw, then rebuild `wh.payment` for touched IDs |
| `wh-gc-backfill` | manual event | Same, from `wh.setting.backfill_start` (default 12 months back, flagged) |
| `wh-myob-sync` | cron `5 * * * *` | Accounts, customers, invoices (modified since cursor), bills, monthly P&L for the trailing 13 months. P&L comes from the `Report/ProfitAndLossSummary` endpoint `[TBC, verify endpoint and parameters at app registration; fallback is GeneralLedger journal transactions summed by account and month]` |
| `wh-opsdesk-snapshot` | cron `TZ=Pacific/Auckland 0 1 * * *` | Copies the five Ops Desk tables into `raw_opsdesk_*` for today |
| `wh-agreement-build` | after `wh-opsdesk-snapshot` succeeds | Rebuilds `agreement`, `agreement_rate`, and today's `agreement_snapshot` |
| `wh-recon-nightly` | cron `TZ=Pacific/Auckland 30 2 * * *` | Section 8 |
| `wh-thread-match` | cron `TZ=Pacific/Auckland 0 3 * * *`, and manual | Section 6 |

Every job writes `wh.source_run`. Every upsert is `insert ... on conflict (source_id) do update ... where payload_hash is distinct from excluded.payload_hash`, so re-runs are no-ops.

The app gets its own Inngest app ID and keys (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`). It does not share the Ops Desk Inngest app.

## 5. GoCardless webhook

- The dashboard has **its own endpoint**, `/api/webhooks/gocardless`, registered as a second webhook endpoint in GoCardless with its own secret (`WH_GOCARDLESS_WEBHOOK_SECRET`). The Ops Desk route is not touched.
- The signature is HMAC-SHA256 of the raw body, from the `Webhook-Signature` header, compared in constant time.
- A bad signature returns 498, as GoCardless recommends, and stores nothing.
- A verified event is written to `wh.raw_gc_event` (`on conflict do nothing` on the event ID). The route then sends `wh/gc.event.received` to Inngest and returns 204.

Tests:

- a bad signature stores nothing;
- a good signature delivered twice stores one row;
- an unknown event type is stored and ignored.

## 6. Deal thread and matching job (0.4)

**How the HubSpot deal ID is carried into each system.** This is the design only. Nothing is written in phases 0 and 1.

| System | Where | Format | Who writes, once approved |
| --- | --- | --- | --- |
| GoCardless | Customer `metadata.hs_deal_ids` (comma-separated; GoCardless allows 3 metadata keys per resource) and mandate `metadata.hs_deal_id` | `64166307992` or `64166307992,44038739285` | Ops Desk when it creates the customer at signing. Existing customers by hand from the matching report |
| MYOB | Customer card custom field 1, labelled "HubSpot deal", plus `HS:<deal id>` at the start of each sales invoice's customer PO number | `HS:64166307992` | Bookkeeper. `[TBC, confirm custom fields are free in the HireHospo file]` |
| Plutio | Agreement custom field `hubspot_deal_id` | `64166307992` | The Pabbly flow, after it creates the deal |
| Ops Desk | `wh.deal_thread.opsdesk_deal_id` | Ops Desk deal ID | Matching job, in the dashboard database. Nothing written to Ops Desk |

**Matching job.** It reads only. For each GoCardless customer with an active mandate and a payment in the last 8 weeks, rules are applied in order, and the first rule that decides wins:

1. `metadata`: `hs_deal_ids` present and the deal exists, so matched.
2. `company_number`: the NZ company number in the HubSpot deal name (for example `(8174358)`) equals the number on the GoCardless customer or MYOB card. Matched.
3. `exact_name`: normalised legal name equal after removing Limited, Ltd, Registered, punctuation and case. Matched if one company, ambiguous if more than one.
4. `email_domain`: the GoCardless customer email domain equals a HubSpot deal's associated contact email domain, and the domain is not a free-mail domain. Matched if one company.
5. `token`: token overlap of at least 0.6 on non-generic words. **Always ambiguous**, never auto-matched. The interim report showed this rule produces false pairs.
6. Otherwise unmatched.

Duplicate HubSpot deals for the same company count as one company and are flagged `duplicate`. The same rules run against MYOB customer cards. Output goes to `wh.match_result`. Counts go to `wh.match_run.counts`. A CSV export and the Deal thread page read it.

## 7. Access control and row level security

**Logins.** Supabase Auth with email magic link. Sign-up is disabled, and the Owner invites users. Each user has one row in `wh.dashboard_user (user_id uuid primary key references auth.users, role text check (role in ('owner','sales_ops')))`. A user with no row sees a "no access" page and every query returns nothing.

**Role check**, one helper used by every policy:

```sql
create function wh.dashboard_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from wh.dashboard_user where user_id = auth.uid()
$$;
```

**Policies**

- RLS is enabled and **forced** on every `wh` table.
- Customer-level tables (`agreement`, `agreement_snapshot`, `payment`, `deal_thread`, `match_result`):
  `select` is allowed when `wh.dashboard_role() in ('owner','sales_ops')`.
- Owner-only tables (`finance_month`, `cogs_component`, `setting`, `recon_run`, `agreement_override`):
  `select` is allowed when `wh.dashboard_role() = 'owner'`.
- `raw_*` tables have no policy for `authenticated`, so they read as empty. Only the ingestion jobs touch them, using the service role key, which is server side only.
- Metric views are created `with (security_invoker = true)`, so a view reads with the caller's rights.
- Owner-only metrics (`m_weekly_revenue`, `m_fee_revenue`, `m_cogs*`, `m_gross_margin`, `m_pnl_month`) also filter on `wh.dashboard_role() = 'owner'` inside the view. They read agreement tables that sales users may see, so the view filter is what keeps revenue and margin owner-only. The filter is tested, not trusted.

**Queries run as the signed-in user.** The API uses the Supabase client with the user's session, never the service role, so a bug in a route cannot return rows the policies deny.

**Audit.** Every request writes `wh.access_log (user_id, at, route, metric_keys, filters)`.

**RLS tests**, run against local Supabase in CI with real JWTs for each role:

- A `sales_ops` user reading `m_pnl_month`, `m_weekly_revenue`, `m_cogs` or `m_gross_margin` gets zero rows.
- A `sales_ops` user can read `m_cash_collected` and `agreement_snapshot`.
- A signed-in user with no `dashboard_user` row reads zero rows from every table and view.
- An anonymous request reads zero rows.
- No role except the service role reads `raw_*`.

## 8. Reconciliation and the GST question on cash

GoCardless collects GST-inclusive amounts, and its payouts are gross collections less fees and refunds. The handoff asks for both "all money ex GST" and "cash collected matches GoCardless payouts exactly". Both hold this way:

- **Reconcile on gross.** For each payout:

  ```
  Σ payout_items(payment_paid_out)
    + Σ items of type payment_charged_back, payment_refunded, refund
    + Σ fee items
    = payout.amount
  ```

  This must match to the cent, using item amounts as GoCardless signs them. Then, for each week:

  ```
  Σ wh.payment.amount_gross_cents (paid out that week) = Σ payment_paid_out items in that week's payouts
  ```

  This must also match to the cent. Any difference is a red flag, not a 1% tolerance.
- **Display ex GST.** `amount_cents = round(amount_gross_cents × 100 / 115)`, half away from zero, computed per payment in SQL `numeric`. The tile shows "Cash collected + GST". Drill-through rows show both, so the exact payout match stays visible.
- **Open item: bonds.** A bond collected through GoCardless would be divided by 1.15 here even if the accountant says a refundable bond carries no GST. `[TBC, accountant: GST treatment of the security bond]`. Until answered, payments identified as bond (by MYOB invoice line or Ops Desk upfront invoice) are listed separately on the drill-through.

**Revenue against MYOB:**

- Weekly: `m_weekly_revenue` excluding fees, against MYOB sales invoice lines on rental income accounts `[TBC, account codes]`, dated in the week, ex GST. Weeks after `myob_reconciled_to` are skipped.
- Monthly: the same against `finance_month` rental income lines.
- Variance over 1% of MYOB, in either direction, flags the tile.
- Revenue matching MYOB within 1% is only expected once open question 3 settles whether MYOB books gross billings or the 30% share. If MYOB books the 30% share, the check is re-pointed, not loosened.

## 9. Tests (phase 1)

| Kind | What |
| --- | --- |
| Unit (Vitest) | Week boundaries across the NZ daylight-saving changes (Sunday 27 September 2026 and 5 April 2026). `formatNzdExGst` always appends "+ GST". GET-only source clients. Matching rules on fixed fixtures, including the false pairs found on 1 October 2026 |
| SQL integration (Vitest against local Supabase in CI) | Migrations apply cleanly from empty. Money fixtures: bond excluded, 10 weeks advance spread over weeks 1 to 10 and not counted twice, fee counted only with a returned payment, weekly rate × paid weeks equals the sum of periods, a variation mid-term, a Rent rollover, a refund after payout. Payout reconciliation on a fixture payout to the cent. Every RLS case in section 7 |
| UI (Vitest + Testing Library) | Every money element in dashboard components has "+ GST". No component formats GST-inclusive money. Degraded states render their text. Sales users never see P&L tiles |
| Hand check | `scripts/verify_agreements.py` recomputes three real agreements in Python `Decimal` from raw rows and compares to `m_weekly_revenue` drill-through rows to the cent |
| House rules | `scripts/check-house-rules.sh` fails on any em dash character or its HTML entity in the diff, `docs/` and `src/`, and lists every `[TBC]` |

CI (GitHub Actions) runs lint, typecheck, format check, unit tests, SQL tests against `supabase start`, and build.
