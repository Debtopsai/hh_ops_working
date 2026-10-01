# Command Dashboard: role-based UI flow, phases 0 and 1

Status: draft for Raj's approval, 1 October 2026.

## 1. Where it sits in Ops Desk

The dashboard is a new **Command** entry at the top of the existing Insights section of the Ops Desk sidebar, route `/insights`. The name `/command` is already taken by the product catalogue Command Center, so it is not reused.

| Route | View | Owner | Sales and ops manager |
| --- | --- | --- | --- |
| `/insights` | Scorecard (landing) | Full | Operational tiles only |
| `/insights/pnl` | P&L | Full | Hidden from nav. Direct URL shows "You do not have access to this view" |
| `/insights/book` | Book | Full | Full, customer level |
| `/insights/collections` | Collections | Full | Full, customer level |
| `/insights/thread` | Deal thread and data health (admin) | Full | Read only |
| `/insights/records/[metric]` | Drill-through for any tile | Full | Only for metrics they can see |

The existing `/business-intelligence` and `/finance` pages stay until phase 1 is signed off. They then get a banner pointing to `/insights` and are retired, so the business has one computation site per stat.

Server-side access checks run on every page and API route. Hiding a nav item is not the control; row level security is.

## 2. Shared tile anatomy

Every tile has the same layout, so the owner reads every tile the same way.

```
+------------------------------------------------+
| Weekly revenue + GST                    [i]    |
| $4,412.30                                      |
| Last week $4,380.10   4-wk avg $4,301.77       |
| ▲ $32.20 on last week                          |
| GoCardless 4 min ago · MYOB 52 min ago         |
| [amber] MYOB variance 1.8% in week of 15 Sep   |
+------------------------------------------------+
```

- **Value line.** This week, which is the current week to date. A toggle at page top switches to "last complete week". The Monday read uses last complete week.
- **Comparison line.** Last week and the 4-week average, both for complete weeks.
- **Rates.** The count sits beside the rate, for example "Failure rate 6.3% (4 of 63)".
- **Freshness stamp.** One stamp per source the tile uses. It turns amber, naming the source, when a source is more than twice its interval late.
- **Status line.** Shown only when not `ok`:
  - `partial` (COGS: "GoCardless fees only. Advertising added in phase 2")
  - `stale`
  - `unreconciled`
  - `not enough history`
  - `variance` (from reconciliation)
- **The [i] control** opens the metric's plain-English definition, read from the same metric registry the SQL uses.
- **Clicking the value** opens the drill-through with the rows behind it. The rows' total is shown at the bottom and equals the tile.
- **No colour coding of rates** until a minimum count is reached `[TBC, Raj: PRD risk "small numbers"]`. Until then, rates are shown neutral.
- **Money labels.** Every money value carries "+ GST" on the tile title or directly after the value, never neither.

## 3. Owner flow (Raj)

**Monday morning read, from Melbourne**

1. Open Ops Desk. Land on `/insights` with "last complete week" preselected on Mondays.
2. The scorecard strip reads left to right: weekly revenue, cash collected, COGS (partial), gross margin (partial), weekly contracted revenue, active agreements, active customers, failure rate, data health.
3. Any amber flag sits on its tile. Clicking the flag opens the reconciliation result: check name, expected, actual, variance, inputs, and run time.
4. To check a number, click it to open the drill-through. Rows behind weekly revenue are one row per agreement-week: customer, agreement, weekly rate, the period it covers, and whether advance or direct debit covers it. Export CSV.
5. Open **P&L**. MYOB months are badged "Not reconciled" after the reconciled-to date. The weekly run-rate panel shows warehouse revenue and COGS beside MYOB, and intercompany sits in its own excluded block.
6. Open **Book**. Check net new agreements, end-of-term in 90 days and Rent rollovers. Open an agreement to see its thread and last 8 collections.
7. Open **Collections**. See today's failures and arrears by age.

**Owner-only settings, on the Deal thread page**

- **MYOB reconciled-to date.** Records who set it and when.
- **COGS components.** Enable or disable each component, with an effective-from date. Washpro cost is ready but disabled pending open question 3.
- **Agreement status overrides.** For default and recovery, with a mandatory reason. Every override is logged.

## 4. Sales and operations manager flow (Urman)

**Daily**

1. Land on `/insights`. Operational tiles only:
   - active customers;
   - active agreements;
   - weekly contracted revenue;
   - cash collected;
   - failure rate;
   - data health.
   Revenue, COGS and margin tiles are absent, not blank.
2. Open **Collections** and work today's failed payments. Each row links to the Ops Desk customer and the GoCardless payment ID. The dashboard takes no action; collections actions stay in GoCardless and Ops Desk.
3. Open **Book** and check agreements ending in 90 days and Rent rollovers.
4. Open **Deal thread** and work the unmatched and ambiguous list. Each row says which IDs are missing and in which system. Urman fixes the source system by hand; the dashboard never writes IDs.

**Phase 2 additions (not built now):** approved with no quote after 24 hours, quotes with no follow-up, and signed with no deposit cleared after 5 days.

## 5. Empty, error and degraded states

| State | What the user sees |
| --- | --- |
| Source never connected | Tile shows "Not connected: GoCardless". No number |
| Source late | The number shows, with an amber freshness stamp naming the source and how late it is |
| No data for the week, source fresh | The real zero, for example "$0.00 + GST, no payouts this week" |
| Not enough history | "Not enough history: 4 of 12 weeks" |
| Reconciliation variance | Amber flag with variance % and a link to the run |
| No permission | "You do not have access to this view". No partial data |

## 6. Accessibility and layout

- Works at 1280 px and on a phone, because the owner reads it remotely.
- Tiles stack to one column under 640 px.
- Numbers use tabular figures.
- Colour is never the only signal: amber states always carry text.
- Charts in phase 1:
  - a 12-week line per scorecard tile in the drill-through;
  - a monthly bar for P&L;
  - a stacked bar for the Rent and Lease to Own mix.
