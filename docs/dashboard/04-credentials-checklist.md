# Credentials checklist for Raj (phase 0 and 1)

Every credential below is read-only.

**Where they go:** Railway, `hh-wp-portal` project, **web** service variables. Also add them to the worker service if it runs separately. They never go in code, chat, email, tickets or this repo.

**When you are done:** tell me which ones are set, not their values.

## 1. GoCardless read-only access token

1. Sign in to the GoCardless dashboard (live, not sandbox) as an admin.
2. Go to Developers, Create, Access token.
3. Name it `ops-desk-warehouse-readonly` and set **Scope: Read-only**.
4. Copy the token once. GoCardless will not show it again.
5. Set it in Railway as `WH_GOCARDLESS_READONLY_TOKEN`.

Use a new variable. The existing `GOCARDLESS_ACCESS_TOKEN` belongs to the Ops Desk payments module and may be read-write, and the warehouse must never hold a write-capable token.

## 2. GoCardless webhook secret

1. In GoCardless, go to Developers, Create, Webhook endpoint.
2. Set the URL to `https://<ops desk domain>/api/integrations/gocardless/webhook`.
3. If an endpoint already exists with that URL, reuse it and its secret. Do not create a second one.
4. Copy the secret and set it in Railway as `GOCARDLESS_WEBHOOK_SECRET`, which is the variable the existing route reads. If it is already set, leave it.
5. Tell me whether the endpoint already existed. That decides whether old events are being delivered today.

## 3. HubSpot private app, read scopes only

1. In HubSpot portal 47462529, go to Settings, Integrations, Private apps, Create a private app.
2. Name it `Ops Desk warehouse (read only)`.
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
2. Create an app named `Ops Desk warehouse`.
3. Set the redirect URI to `https://<ops desk domain>/api/insights/myob/callback`. I will build this route in phase 1, and it only stores tokens.
4. Request the narrowest read access MYOB offers for: company file, sales (invoices, customers), purchases (bills), accounts and reports. `[TBC: MYOB has moved to granular scopes; confirm the exact read-only scope names shown at registration and send me the list]`
5. Set the API key and secret in Railway as `WH_MYOB_CLIENT_ID` and `WH_MYOB_CLIENT_SECRET`.
6. In MYOB, create a company file user for the integration with a **read-only** role, so access is limited by MYOB as well as by the code.
7. After the callback route ships, you sign in once through Ops Desk Settings to authorise. Tokens are stored encrypted with the existing `TOKEN_ENCRYPTION_KEY`.
8. Tell me the HireHospo company file's name. If the login can see more than one file (for example IWise Limited), the job will refuse every other file by its ID.

## 5. Settings I need from you (not secrets)

| Setting | Default if not set |
| --- | --- |
| Back-fill start date for GoCardless and MYOB | 12 months before the first run, flagged on the dashboard as a default |
| MYOB reconciled-to date | None. Every MYOB month is badged "Not reconciled" |
| MYOB intercompany account(s) for HireHospo and IWise | None. P&L shows a warning that intercompany may be mixed in |
| MYOB rental income account codes and the late fee and admin fee item codes | None. Revenue to MYOB checks and the fee metric stay "not configured" |

## Not needed yet

Meta (phase 2) and Google Drive (phase 3).
