# Plutio → Google Sheet (Netlify Function)

Appends a new HireHospo customer to the Google Sheet the acquisition dashboard
reads, the moment a contract is signed in Plutio.

    Plutio contract signed
      └─> POST /api/plutio-contract-signed   (Netlify Function)
            ├─ verify shared secret
            ├─ confirm the contract is actually signed
            ├─ skip if this contract id is already in the sheet
            ├─ append 1 row to Customers  (next free HH0xx)
            └─ append 1 row per unit to Machines (next free M0xx)

No npm dependencies. The service-account JWT is signed with `node:crypto` and
the Sheets REST API is called with `fetch`.

## Files

| File | Goes where |
|---|---|
| `netlify/functions/plutio-contract-signed.mjs` | same path in the dashboard project |
| `netlify.toml` | project root (merge if one already exists) |

## Environment variables

Set in Netlify → Site configuration → Environment variables.

| Variable | Value |
|---|---|
| `PLUTIO_WEBHOOK_SECRET` | any long random string; must match the `?token=` in the Plutio webhook URL |
| `SHEET_ID` | the id between `/d/` and `/edit` in the spreadsheet URL |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `...@....iam.gserviceaccount.com` from the service-account JSON |
| `GOOGLE_PRIVATE_KEY` | the `private_key` value from that JSON, `\n` escapes intact |
| `PLUTIO_DEBUG_LOG` | set to `1` to log the raw Plutio payload and write nothing; unset when done |

The spreadsheet must be shared with `GOOGLE_SERVICE_ACCOUNT_EMAIL` as **Editor**.

## Before it will write real data

The field mapping in `isSigned()` and `mapContract()` is a best guess — Plutio's
payload shape is not publicly documented. Capture one real payload first:

1. Set `PLUTIO_DEBUG_LOG=1`, redeploy, sign a test contract.
2. Read the logged JSON in Netlify → Logs → Functions.
3. Correct the field paths in the mapping block at the top of the function.
4. Unset `PLUTIO_DEBUG_LOG` and redeploy.

## Behaviour notes

- **Idempotent.** The Plutio contract id is written into the Customers `Notes`
  column; a redelivered or re-fired webhook is a no-op. Plutio has no dedicated
  "signed" event, so the function subscribes to `contract.update` and gates on
  signature state — without this guard every later edit would add a duplicate.
- **IDs are `max+1`, not row count.** Existing ids are non-contiguous
  (HH001–HH044, M001–M060) so counting rows would collide.
- **Writes are `RAW`, never `USER_ENTERED`.** Nine phone numbers in the sheet
  are already `#ERROR!` from values being read as formulas.
- **Quantity is expanded** into one Machines row per unit.
- **Deposit repeats on each machine row**, matching the existing sheet
  convention (it is customer-level, not per-machine).
- **Term and contract type default to Lease-to-Own 36m** — the most common
  product. They usually live in the Plutio template rather than a field, so
  check them against the real payload.
- **ID allocation is not race-safe.** Two contracts signed in the same second
  could collide. At current volume (~29 customers) this is not worth solving.

## Not covered here

Rows landing in the sheet does not by itself make the dashboard show them — if
the dashboard bakes its data in at build time it still needs either a live read
or a build hook. See the chat discussion for options.
