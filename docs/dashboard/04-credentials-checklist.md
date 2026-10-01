# Credentials checklist for Raj (phase 0 and 1)

Every credential below is read-only.

**Where they go:** Railway, the **new dashboard service** variables, not Ops Desk. They never go in code, chat, email, tickets or this repo.

**When you are done:** tell me which ones are set, not their values.

## 1. GoCardless read-only access token

1. Sign in to the GoCardless dashboard (live, not sandbox) as an admin.
2. Go to Developers, Create, Access token.
3. Name it `command-dashboard-readonly` and set **Scope: Read-only**.
4. Copy the token once. GoCardless will not show it again.
5. Set it in Railway as `WH_GOCARDLESS_READONLY_TOKEN`.

Create a new token. Do not reuse Ops Desk's `GOCARDLESS_ACCESS_TOKEN`, which may be read-write. The dashboard must never hold a write-capable token.

## 2. GoCardless webhook endpoint (a second one, for the dashboard)

1. In GoCardless, go to Developers, Create, Webhook endpoint.
2. Set the URL to `https://<dashboard domain>/api/webhooks/gocardless`.
3. Leave any existing Ops Desk endpoint exactly as it is. GoCardless delivers to every endpoint.
4. Copy the new endpoint's secret and set it in Railway as `WH_GOCARDLESS_WEBHOOK_SECRET`.

## 3. HubSpot private app, read scopes only

1. In HubSpot portal 47462529, go to Settings, Integrations, Private apps, Create a private app.
2. Name it `Command Dashboard (read only)`.
3. Tick these scopes and nothing with "write" in the name:
   - `crm.objects.deals.read`
   - `crm.objects.contacts.read`
   - `crm.objects.companies.read`
   - `crm.objects.owners.read`
   - `crm.schemas.deals.read`
   - `crm.schemas.contacts.read`
4. Create the app and copy the access token.
5. Set it in Railway as `WH_HUBSPOT_TOKEN`.

Phase 2 adds engagement read scopes (emails, calls, notes) and webhooks. You will get a separate list then.

## 4. MYOB Business API developer app, OAuth

1. Register at the MYOB developer portal (my.myob.com, Developer) with the account that owns the HireHospo company file.
2. Create an app named `Command Dashboard`.
3. Set the redirect URI to `https://<dashboard domain>/api/myob/callback`. I will build this route in phase 1, and it only stores tokens.
4. Request the narrowest read access MYOB offers for: company file, sales (invoices, customers), purchases (bills), accounts and reports. `[TBC: MYOB has moved to granular scopes; confirm the exact read-only scope names shown at registration and send me the list]`
5. Set the API key and secret in Railway as `WH_MYOB_CLIENT_ID` and `WH_MYOB_CLIENT_SECRET`.
6. In MYOB, create a company file user for the integration with a **read-only** role, so access is limited by MYOB as well as by the code.
7. After the callback route ships, you sign in once through the dashboard's Settings page to authorise. Tokens are stored encrypted with a new `WH_TOKEN_ENCRYPTION_KEY`, a random 32-byte value you generate and set in Railway.
8. Tell me the HireHospo company file's name. If the login can see more than one file (for example IWise Limited), the job will refuse every other file by its ID.

## 5. Supabase project

1. Create a Supabase project named `hh-command-dashboard`, in the Sydney region (closest to NZ).
2. In Authentication, disable sign-ups and enable email magic link.
3. Set these in Railway on the dashboard service:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server side only)
   - `SUPABASE_DB_URL`, used by migrations
4. Add me as a project member, or send the database connection details through a secure channel. Not chat.

## 6. Read-only access to the Ops Desk database

Run this once on the Ops Desk Railway Postgres, as the owner. Replace the password with a long random value.

```sql
create role dashboard_reader login password '<random>' nosuperuser nocreatedb nocreaterole;
grant connect on database railway to dashboard_reader;   -- [TBC, Raj: the Ops Desk database name]
grant usage on schema public to dashboard_reader;
grant select on crm_companies, crm_deals, crm_equipment_lines, crm_contracts,
  crm_contract_versions, crm_machine_holdings, enquiries, products to dashboard_reader;
alter role dashboard_reader set default_transaction_read_only = on;
```

Table names are taken from the `@@map` lines in the Ops Desk Prisma schema at `6c8860e`. Their only effect on Ops Desk is a read-only login; Ops Desk code and data are unchanged.

Set the connection string in Railway on the dashboard service as `OPSDESK_READONLY_DATABASE_URL`. Use Railway's private network address if the two services are in the same Railway project.

## 7. Inngest

Create a new Inngest app for the dashboard. Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` on the dashboard service. Do not reuse Ops Desk's keys.

## 8. Settings I need from you (not secrets)

| Setting | Default if not set |
| --- | --- |
| Back-fill start date for GoCardless and MYOB | 12 months before the first run, flagged on the dashboard as a default |
| MYOB reconciled-to date | None. Every MYOB month is badged "Not reconciled" |
| MYOB intercompany account(s) for HireHospo and IWise | None. P&L shows a warning that intercompany may be mixed in |
| MYOB rental income account codes and the late fee and admin fee item codes | None. Revenue to MYOB checks and the fee metric stay "not configured" |

## Not needed yet

Meta (phase 2) and Google Drive (phase 3).
