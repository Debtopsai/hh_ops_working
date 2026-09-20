# PRD — HireHospo P&L Tracking System

| | |
|---|---|
| **Status** | Draft for review |
| **Owner** | HireHospo (info@iwise.co.nz) |
| **Date** | 18 September 2026 |
| **Scope decision** | HireHospo as its own legal entity with its own Xero ledger; Washpro Limited treated as an intercompany counterparty |
| **Deliverable** | Data pipeline + dashboard in `hh_ops_working` |
| **Primary job** | Monthly management accounts |

---

## 1. Summary

HireHospo bills roughly **$5,224/week** across 47 equipment contracts (**$4,612/week**
from active customers) against a contracted book of about **$559,000**. Nobody can
currently answer, from a single source, whether HireHospo made money last month.

The contract book lives in a spreadsheet, the cash lives in GoCardless, the equipment
cost lives in Washpro's ledger, and HireHospo's own ledger is not reconciled to any of
them. This PRD specifies a pipeline and dashboard that assembles these into a monthly
HireHospo P&L that the owner can trust and act on.

**The commercial model is now confirmed: HireHospo does not own the equipment and takes
30% of the weekly payments.** Washpro owns the gear and keeps 70%. This was the single
largest open question in an earlier draft of this PRD, and settling it removes a large
part of the system that draft specified — there is no equipment to capitalise, nothing to
amortise, no depreciation, and no asset to write down on default. Section 7 is the
recognition model as it now stands; Section 7.3 records what is no longer needed and why.

What remains is a commission P&L on a small book, and the work is mostly plumbing:
recognise 30% of billed instalments, subtract the costs HireHospo actually bears, and
reconcile three systems that currently disagree.

---

## 2. Problem

HireHospo is a credit-led finance business: it buys equipment, wraps it in a 12- or
36-month payment schedule, and earns the spread. The economics are per-contract and they
unwind over years. The reporting is none of those things.

Concretely, today:

- **Revenue is knowable, profit is not.** The weekly billing total is a known figure. The
  equipment cost sitting behind those contracts is recorded nowhere in the contract
  register — there is no cost column at all. Gross margin cannot be computed for any
  contract in the book.
- **New business looks like a loss.** With no capitalisation and amortisation, a month
  with three deliveries shows the full equipment outlay as a cost against ten weeks of
  income. The better the month, the worse the accounts look.
- **Arrears are invisible in the P&L.** HH001 Selwyn Contractors signed a 36-month
  lease-for-ownership in September 2025 and has never paid. There is no provision, no
  write-off, and no machine rows against the contract — so the loss has never landed
  anywhere.
- **The book is running off unmeasured.** 15 contracts carrying **$1,297/week** — 28% of
  active billing — reach their scheduled end date within twelve months. 10 contracts are
  already past their scheduled end date with no recorded outcome.
- **The Washpro boundary is unreconciled.** Washpro's ledger books HireHospo lease income
  as Washpro revenue and HireHospo's cut as a direct cost. Whether that is the intended
  commercial model is an open question (Section 6.1), and until it is answered, two sets
  of books are describing the same transactions differently.

The cost of this is not bookkeeping tidiness. Deposit tiers, weekly pricing and credit
decisions are all being made without knowing what a contract actually earns.

---

## 3. Current state

### 3.1 What exists

| Asset | Location | State |
|---|---|---|
| Contract register | `data/customers.csv`, `data/machines.csv` | 29 customers, 47 machines; export of a Google Sheet |
| Canonical workbook | `data/HireHospo_Database.xlsx` | Same two sheets |
| Signed contract | `data/contracts/SELWYN_CONTRACTORS_lease_agreement.pdf` | One PDF; no systematic contract store |
| Washpro ledger | Xero (connected) | Full chart of accounts, no tracking categories |
| HireHospo ledger | Xero (**not connected to this workspace**) | Existence and contents unverified |
| Payments | GoCardless | Weekly direct debits; not integrated anywhere |

### 3.2 Portfolio shape

```
Contracts            47 machines across 29 customers
Active billing       $4,612.31 / week   (incl. month-to-month)
Gross billing        $5,223.52 / week   (incl. ended and bought-out)
Contracted value     ~$559,000
  Lease-to-Own 36m   $458,333   (36 machines)
  Rent 12m            $91,223   ( 9 machines)
  Other               $9,547

Customer status      active 24 · ended 2 · arrears 1 · bought_out 1 · month_to_month 1
Vintages             2024: 18 · 2025: 22 · 2026: 7
Past scheduled end   10 / 47 contracts
Expiring ≤12 months  15 contracts · $1,297.27 / week at risk
```

This is a **small book**. The system must be proportionate to it — a scheduled job and a
reporting layer, not a warehouse. Correctness and trust matter far more than throughput.

### 3.3 Data gaps that block a P&L

These are requirements, not observations. Each one makes some part of the P&L
uncomputable until it is closed.

| # | Gap | Blocks |
|---|---|---|
| G1 | **No equipment cost** on any machine row. *Substantially closed* — list price is now derived by formula for all 47 machines (7.7). Remaining unknown is the supply margin (Q4a), and whether cost belongs in this P&L at all (6.1) | Gross margin, contract profitability, amortisation |
| G2 | `Supplier` column empty on **47/47** rows | Intercompany split, purchase matching |
| G3 | `APS` (Washpro asset ref) on only **18/47** rows | Linking a contract to the asset and its purchase invoice |
| G4 | `Deposit` missing on 15 rows, and repeated at customer level on the rest | Deposit liability, upfront cash, security-deposit balance |
| G5 | No delivery, installation or LPG-conversion cost captured | Direct costs; these are quoted separately and currently untracked |
| G6 | HH001 arrears contract has **no machine rows** | Impairment; the exposure has no carrying value to write down |
| G7 | 10 contracts past end date with no recorded outcome | Run-off, end-of-term revenue, asset recovery |
| G8 | HH042 is a mis-imported duplicate of HH021 | Double-counted revenue if ingested as-is |

---

## 4. Goals and non-goals

### Goals

1. Produce a **monthly HireHospo management P&L** — GST-exclusive, on a consistent
   recognition basis — within 5 working days of month end.
2. Make **gross margin computable per contract**, which requires closing G1–G3.
3. **Reconcile three sources** that currently disagree: the contract register, GoCardless
   cash, and the Xero ledger. Report the variance rather than hiding it.
4. Show the **run-off profile** of the book so expiring revenue is seen before it lands.
5. Carry **arrears into the P&L** as a provision, on a stated policy, rather than leaving
   non-payment invisible until write-off.
6. Reconcile the **Washpro intercompany position** each month.

### Non-goals (this phase)

- Not a replacement for the accountant's statutory financial statements. The system
  produces management accounts and an annual reconciliation *to* the statutory basis.
- Not a balance sheet or cash-flow statement. Only the balances a P&L depends on
  (leased-asset carrying value, deposit liability, arrears provision) are tracked.
- Not a billing or collections engine. GoCardless and DebtOps keep those jobs.
- Not automated journal posting into Xero. The system reads the ledger and reports; it
  does not write to it. (Revisit in Phase 4.)
- Not per-contract IRR or pricing optimisation. Phase 3 at the earliest, and only once
  the monthly accounts are trusted.

---

## 5. Users

| User | Needs | Cadence |
|---|---|---|
| **Owner / director** | Did HireHospo make money? Which contracts earn, which leak? Can we afford to write more business? | Monthly, with a live dashboard between |
| **Accountant** | A defensible trail from contract to ledger; a reconciliation to the statutory basis at year end | Monthly review, annual close |
| **Sales / credit** | What does a deal at this deposit tier and weekly rate actually earn? | Per deal (Phase 3) |
| **Collections** | Arrears exposure valued in dollars, not just days overdue | Weekly |

The owner is the primary user. If the monthly pack does not answer their question in one
page, the system has failed regardless of what else it does.

---

## 6. Decisions required before build

These are **P0 blockers**. Each changes the reported P&L by a material amount, and no
sensible default exists — they are commercial and accounting-policy questions, not
engineering ones.

### 6.1 Principal or agent — RESOLVED: agent

**Confirmed by the owner, 20 September 2026: HireHospo does not own the equipment and
takes 30% of the weekly payments.** Washpro owns the gear and retains 70%.

Revenue is therefore commission, not gross lease income: about **$71,952/yr** on the
current active book, not the $239,840 that gross recognition would show. The evidence
below is retained because it corroborates the split and because both ledgers still need
to be aligned to it.

The rest of this section records how the question was settled.

Washpro's connected Xero ledger contains:

| Account | Type | Description |
|---|---|---|
| `2710` Hirehospo - Lease Oven | Revenue | "Ovens leased through HireHospo" |
| `2720` Hirehospo - Lease Dishwasher | Revenue | "Dishwasher leased through HireHospo" |
| `2730` Hirehospo - Lease others | Revenue | "Other equipments - leased through HireHospo" |
| `4035` Hirehospo 30% Commission on Lease | Direct cost | "Hirehospo 30% Commission on Equipments Leased (Oven & Dishwasher through HH)" |

Read literally, **Washpro** recognises the lease income and pays HireHospo a 30%
commission. That is an agency model. But the customer-facing contracts are written in
HireHospo's name — the Selwyn agreement is a HireHospo lease-for-ownership — which points
to a principal model.

| | **Model A — Principal** | **Model B — Agent** |
|---|---|---|
| Equipment | HireHospo buys from Washpro, owns it | Washpro retains ownership |
| Revenue | Gross lease income (~$240k/yr) | Commission only (~30% of lease income) |
| COGS | Equipment amortisation, delivery, install | Nil or minimal |
| Credit risk | HireHospo's | Depends on the agreement |
| Balance sheet | Leased assets and deposit liability sit here | Largely absent |

**Required:** a decision, and if Model A is correct, a correction to Washpro's account
structure so both ledgers describe the same transaction the same way. A hybrid — some
deals one way, some the other — is workable but must be identified per contract with a
field on the contract record.

**Corroborating evidence for the agency model.** The `HH Machines Finance Tracking` sheet
(Drive) carries a revenue split that is exactly 70/30:

| | Weekly | Annually |
|---|---|---|
| Washpro | $1,343.50 | $69,859.50 |
| HireHospo | $575.80 | $29,939.80 |
| **Total (GST incl.)** | **$1,919.20** | **$99,799.30** |

HireHospo's share is 30.00% to the cent, matching Washpro's account `4035`
*Hirehospo 30% Commission on Lease*. Two independent sources now describe the same split,
which makes some form of 70/30 revenue share live rather than theoretical.

**This decision determines whether Section 7.3 is needed at all.** If HireHospo contracts
with the customer but pays Washpro 70% of the lease stream for supplying the equipment,
then HireHospo never capitalises equipment: revenue is gross lease income, direct cost is
70% of it, and the two accrue in lockstep. The capitalisation and amortisation machinery
— and the matching problem this PRD treats as the system's defining job — largely
disappears, and the monthly P&L becomes materially simpler to build and to trust. If
instead HireHospo buys the equipment outright, 7.3 is essential and the cost ladder in 7.7
is on the critical path.

Resolving 6.1 therefore does not just change the numbers. It changes how much system there
is to build.

**Still to do, even though the model is settled:** Washpro's accounts `2710`/`2720`/`2730`
recognise HireHospo lease income as Washpro revenue while `4035` books the 30% as a cost.
That is consistent with the confirmed model, but HireHospo's own ledger must mirror it —
30% recognised as commission revenue, not 100% as lease income. If both ledgers book the
gross, the same revenue is counted twice across the two entities.

### 6.2 Lease classification: finance lease or operating lease?

36 of 47 machines are Lease-to-Own 36m where ownership transfers at end of term. Under
standard lessor accounting that is a **finance lease**: derecognise the asset at
inception, recognise selling profit upfront, then recognise interest income across the
term. Rent 12m, with no ownership transfer, is an **operating lease**: the asset stays on
the books, rental income is recognised over the term, depreciation is charged.

Applied to the same contract, these produce completely different monthly profiles — the
finance-lease view front-loads almost all the profit into month one.

**Recommendation for this system:** run monthly management accounts on the
**rental/accrual basis** described in Section 7 (revenue as billed, equipment cost
amortised over the term), because it matches how the owner thinks about the business and
how GoCardless actually collects. Treat the finance-lease view as an **annual
reconciliation to the statutory basis**, produced once for the accountant, not as the
monthly number. Build the recognition engine so the basis is a configuration choice, not
a hard-coded assumption.

### 6.3 Secondary decisions

| # | Decision | Default if unanswered |
|---|---|---|
| D1 | Rent 12m residual value and useful life for depreciation | 5-year life, 20% residual |
| D2 | Arrears provision matrix (see 7.5) | 30d 25% · 60d 50% · 90d 100% |
| D3 | Overhead allocation method to HireHospo | Direct costs only; overhead shown below gross profit, unallocated |
| D4 | Security deposit treatment — liability or deferred income | Liability (mirrors Washpro `8040`) |
| D5 | Is the HireHospo Xero the system of record, or the contract register? | Xero for the ledger, register as the contract sub-ledger; variance reported |

---

## 7. The P&L model

This section is the specification the engine implements. Everything is **GST-exclusive**;
all customer-facing weekly figures are quoted + GST and must be divided by 1.15 on
ingestion from GoCardless.

### 7.1 Report structure

Everything is **GST-exclusive**. Customer-facing weeklies are quoted + GST, so GoCardless
collections divide by 1.15 on ingestion.

```
REVENUE
  Commission — Lease-to-Own          30% of instalments billed
  Commission — Rent                  30% of instalments billed
  Fee income share                   late fees, admin fees — see Q5 below
= TOTAL REVENUE

DIRECT COSTS
  GoCardless transaction fees        per collection
  GoCardless failure fees            a cost of the product, not an overhead
  Credit check fees                  Equifax, per application
= GROSS PROFIT

  Movement in arrears provision      on HireHospo's 30% share only (7.5)
  Bad debts written off
= NET CONTRIBUTION

OVERHEADS
  Advertising and marketing          Meta; see 7.8 for actuals
  Software subscriptions             HubSpot, Plutio, SwipePages, ThriveDesk
  Wages and contractors
  Professional fees
  Bank fees and interest
  Other administrative
= NET PROFIT BEFORE TAX
```

**What is deliberately absent:** equipment cost, delivery, installation, LPG conversion,
depreciation and amortisation. Washpro owns the assets and bears those costs out of its
70%. If any of them appear in HireHospo's ledger, that is a coding error to investigate,
not a line to report.

### 7.2 Revenue recognition

Revenue is recognised **as billed on the contract schedule**, not as collected. A
contract in arrears keeps accruing revenue, and the collection failure shows separately
as a provision movement. This is deliberate: it keeps "did we sell" and "did we collect"
as two different questions with two different answers.

For a contract with weekly payment `W` (GST-exclusive) active for `d` days in the month:

```
monthly_revenue = W × (d / 7)
```

Contracts are recognised from the **delivery date**, not the contract signature date —
revenue starts when the customer has the equipment. Where delivery date is not recorded,
fall back to `Start` and flag the row.

### 7.3 Equipment amortisation — not applicable

An earlier draft made capitalisation and amortisation the centre of this system: capitalise
landed cost at delivery, release it over the term, and thereby stop months with new
business from showing as losses.

**Under the confirmed model none of that applies.** HireHospo never buys the equipment, so
there is no cost to capitalise and no carrying value to amortise. Revenue is 30% of each
instalment and the cost of the equipment is already netted out in Washpro's 70%. The two
move together by construction, so the matching problem does not arise.

This subsection is kept rather than deleted because the reasoning matters if the
commercial arrangement ever changes. If HireHospo begins buying equipment outright — or
takes ownership of recovered assets and re-leases them — capitalisation becomes necessary
and this section must be rewritten before those contracts are reported.

### 7.4 Contract-level margin

Every contract carries a computed lifetime view, which is what makes pricing and deposit
decisions possible later:

```
total_contract_value  = weekly × term_months × 52/12
total_capitalised_cost = equipment + delivery + install + LPG
lifetime_gross_margin  = (TCV − total_capitalised_cost) / TCV
break_even_week        = total_capitalised_cost / weekly
```

The monthly pack reports the distribution of these, not just the average — the useful
signal is which contracts sit in the bottom quartile.

### 7.5 Arrears provision

Non-payment currently never reaches the P&L. The provision matrix (D2) is applied to the
**outstanding receivable plus the unamortised carrying value** of the equipment, since
both are at risk:

| Days past due | Provision |
|---|---|
| 1–30 | 25% |
| 31–60 | 50% |
| 61–90 | 75% |
| 90+ or `status = arrears` | 100% |

The month's P&L charge is the **movement** in the provision, not the balance. HH001
Selwyn Contractors is the immediate test case: a 36-month contract signed 9 September
2025, never paid, and carrying no machine rows. Closing G6 gives it a carrying value to
provide against.

### 7.6 Intercompany reconciliation

Each month the system compares HireHospo's recorded position against Washpro's ledger:

- HireHospo equipment purchases ↔ Washpro sales to HireHospo
- HireHospo commission income or expense ↔ Washpro account `4035`
- HireHospo lease income ↔ Washpro accounts `2710` / `2720` / `2730`

Any of these three showing a non-zero net is a reconciling item that must be explained
before the month is closed. Under Model A, accounts `2710`–`2730` in Washpro's ledger
should be **nil** — if they are not, the same revenue is being recognised twice across
two entities.

### 7.7 Deriving equipment value from the weekly payment

**G1 is substantially closed.** The pricing model in `Pricing Sheet For Rental & Lease`
(Drive) shows that HireHospo prices every deal by formula off the machine's list price:

```
Lease-to-Own 36m :  weekly_ex_gst = list_price_ex_gst × 1.6 / 156
Rent 12m         :  weekly_ex_gst = list_price_ex_gst × 0.70 / 52
```

The 1.6 is the sheet's `Markup (Machine × 1.6)`; the 0.70 is its
`Rental Recoup = 70% (of total machine cost)`. Both invert cleanly:

```
list_price_ex_gst = weekly_ex_gst × 97.5      (lease 36m)
list_price_ex_gst = weekly_ex_gst × 74.2857   (rent 12m)
```

**Validation.** Tested against every price/weekly pair recorded in the pricing sheet, the
formulas reproduce the quoted weekly to within 5 cents on 9 of 11 pairs. The two
exceptions (APS816, ~2.4% high on both products) look like a manually adjusted price
rather than a formula failure.

Applied to the book, the derivation produces a list price for **47 of 47 machines**, of
which **46 fall inside the known catalogue range** of $795–$32,995. The single exception
is M060 at $35,100 — which is the row already flagged for a Type/Term contradiction, so
the outlier and the known defect are the same record.

One contract can be cross-checked against a catalogue price directly: M056
(Rational SCCWE101E, $236.48/wk) derives to **$23,057** against a known catalogue price of
**$22,995** for the equivalent Rational combi — **0.27% error**.

Output: `data/derived_equipment_prices.csv`, one row per machine with its derivation basis
and confidence. Total derived equipment list value across the book: **$463,229**.

**What this gives, and what it does not.** The derivation yields *list price* — the same
figure the brochure would have given, obtained from data already in the register. It is
still **not HireHospo's equipment cost**. The remaining step is the supply margin (Q4a),
and whether equipment cost belongs in HireHospo's P&L at all depends entirely on the
principal/agent decision in 6.1.

**Cost ladder, per contract:**

1. Washpro purchase invoice or bill in the ledger — `actual`
2. Recorded purchase price on the contract record — `actual`
3. Formula-derived list price less supply margin — `derived`, flagged
4. Category median less supply margin — `estimated`, flagged, excluded from any margin
   figure presented as fact

Every contract carries `cost_basis`; the monthly pack reports derived-cost contracts as a
separate count with their share of revenue. A margin figure that mixes bases is a hard
failure (FR8), not a footnote.

**The formulas are also a pricing control in their own right.** Because every deal should
sit on the curve, a contract whose weekly does not reproduce its list price is either
mispriced or miskeyed. Running the check across the book is a one-off exercise that needs
no new data, and it belongs in Phase 1.

---

## 8. Functional requirements

### FR1 — Xero ingestion (HireHospo)

Pull the trial balance, chart of accounts, invoices, bills and bank transactions from
HireHospo's own Xero for the reporting period. Map ledger accounts to the Section 7.1
report lines through a maintained mapping file, so a new account in Xero surfaces as an
*unmapped* warning rather than silently vanishing from the report.

**Blocked on:** HireHospo's Xero being connected to this workspace. Only Washpro Limited
is connected today. This is the single largest dependency in the project.

### FR2 — Contract register as sub-ledger

Promote the contract register from a spreadsheet export to the canonical contract
sub-ledger, extended with the fields identified in G1–G5 (Section 9.1). It must support:

- Contract lifecycle states: `quoted → approved → signed → delivered → active → {completed, bought_out, terminated, repossessed, written_off}`
- Delivery date distinct from contract start
- Per-machine cost, supplier and asset reference
- Per-contract deposit split into rent-in-advance and security deposit
- End-of-term outcome recorded for every expired contract

### FR3 — GoCardless ingestion

Pull payments, failures, retries, refunds and fees. Convert GST-inclusive collections to
GST-exclusive for the P&L. Reconcile collections against the billing schedule to produce
the arrears ageing that feeds FR6. Payment failure fees are a direct cost, not an
overhead — they are a cost of the finance product.

### FR4 — Recognition engine

Implement Sections 7.2–7.5. The recognition basis (rental vs finance lease, per 6.2) is
configuration. Given a contract set and a period, the engine emits the revenue,
amortisation and provision lines that period.

The engine must be **deterministic and re-runnable**: re-running a closed month with the
same inputs must produce identical output, and any change in output must be traceable to
a change in input.

### FR5 — Three-way reconciliation

Each month, reconcile:

```
Contract register (what we should have billed)
    ↕
GoCardless        (what we collected)
    ↕
Xero              (what the ledger says)
```

Report the variance on each leg with a per-contract breakdown. A variance the system
cannot explain is a finding to be surfaced, never a number to be silently adjusted. This
requirement is what makes the monthly number trustworthy; without it the pipeline is just
a different place to be wrong.

### FR6 — Monthly management accounts pack

One reproducible artifact per month containing:

1. **P&L** in the Section 7.1 structure, current month and year to date, against prior
   month and prior year
2. **One-page summary** — revenue, gross margin %, net profit, and the three biggest
   movements against prior month with a stated cause
3. **Portfolio position** — active contracts, weekly billing, contracted value remaining,
   new contracts written, contracts completed
4. **Run-off schedule** — contracted revenue by month for the next 24 months, with the
   $1,297/week expiring inside 12 months made explicit
5. **Arrears ageing** with the provision movement
6. **Contract margin distribution** — best and worst quartile by lifetime gross margin
7. **Reconciliation statement** (FR5) with any unexplained variance flagged
8. **Data quality report** (FR8)

### FR7 — Dashboard

A single page, refreshed on ingestion, covering: weekly billing run rate, current-month
P&L to date, gross margin trend, arrears exposure in dollars, and the 12-month run-off
curve. It must degrade honestly — where an input is missing or stale, the affected figure
says so rather than rendering a confident zero.

### FR8 — Data quality gate

Every run validates the register and refuses to publish a pack that would be misleading.

**Hard failures (block the pack):**
- A contract with revenue but no equipment cost on any basis (G1)
- A margin figure presented as actual that includes a `derived` or `estimated` cost (7.7)
- Total billing variance against GoCardless beyond a set tolerance
- A duplicate contract (HH042 / HH021, G8)
- An unmapped Xero account carrying a material balance

**Warnings (publish, but flag):**
- Missing supplier or asset reference (G2, G3)
- A contract past its end date with no recorded outcome (G7)
- Known register defects: the 9 `#ERROR!` phone numbers, M060's term/type mismatch,
  HH044's orphan ninth column

---

## 9. Data model

### 9.1 Contract (extends `machines.csv`)

Fields marked **new** close the gaps in Section 3.3.

| Field | Type | Notes |
|---|---|---|
| `machine_id` | string | M001–M060 |
| `customer_id` | string | HH001–HH044 |
| `description` | string | |
| `product_type` | enum | `lease_to_own` \| `rent` \| `month_to_month` |
| `term_months` | int | Must agree with `product_type` — M060 currently does not |
| `weekly_ex_gst` | decimal | **new** — register currently stores the + GST convention implicitly |
| `contract_date` | date | Signature |
| `delivery_date` | date | **new** — recognition starts here |
| `end_date` | date | Derived; overridden on early termination |
| `equipment_cost` | decimal | **new — G1, blocks gross margin** |
| `cost_basis` | enum | **new** — `actual` \| `derived` \| `estimated`, per the 7.7 ladder |
| `catalogue_sku` | string | **new** — matched brochure SKU |
| `catalogue_price_ex_gst` | decimal | **new** — brochure sell price, for C1/C2 |
| `catalogue_match_method` | enum | **new** — `aps_ref` \| `exact_name` \| `reviewed_manual` |
| `delivery_cost` | decimal | **new — G5** |
| `install_cost` | decimal | **new — G5** |
| `lpg_conversion_cost` | decimal | **new — G5** |
| `supplier` | string | **G2** — empty on all 47 rows |
| `aps_ref` | string | **G3** — present on 18 of 47 |
| `purchase_invoice_ref` | string | **new** — links to the Xero bill |
| `rent_in_advance` | decimal | **new** — split from the single `Deposit` field |
| `security_deposit` | decimal | **new** — liability per D4 |
| `principal_or_agent` | enum | **new** — per 6.1, if the model is hybrid |
| `status` | enum | Lifecycle per FR2 |
| `end_of_term_outcome` | enum | **new — G7** |
| `carrying_value` | decimal | Derived; unamortised capitalised cost |

### 9.2 Derived tables

- **`billing_schedule`** — one row per contract per week, generated from delivery date and
  term. The accrual basis for revenue and the comparison basis for arrears.
- **`period_recognition`** — engine output: revenue, amortisation and provision per
  contract per month. Immutable once a month is closed.
- **`reconciliation`** — per-month, per-leg variance from FR5.

---

## 10. Architecture

Deliberately modest, matching a 47-contract book.

```
  Xero (HireHospo) ──┐
  Xero (Washpro)   ──┤
  GoCardless       ──┼──► ingest ──► normalised store ──► recognition ──► reports ──► dashboard
  Contract register──┘      │          (SQLite/parquet)      engine        (FR6)      (FR7)
                            │                                  │
                            └──────────► data quality gate ◄────┘
                                              (FR8)
```

**Principles**

- **Raw data is immutable.** Each pull is stored as fetched, timestamped. Transformations
  are re-derived from raw, never edited in place. A month can always be rebuilt from
  source.
- **Recognition is pure.** The engine is a function of contracts and a period. No network
  calls, no clock reads — which makes it testable against worked examples.
- **Closed months are frozen.** Once published, a month's output does not change silently.
  A restatement is an explicit, logged action with a reason.
- **The pipeline reads, it does not write.** No journals are posted to Xero in this phase.

**Repository layout**

```
data/            raw pulls (gitignored where they carry PII), contract register
src/ingest/      xero.py, gocardless.py, register.py
src/model/       recognition.py, provisions.py, reconciliation.py
src/report/      pack.py, dashboard.py
config/          account_mapping.yaml, policy.yaml (rates, provision matrix, D1–D5)
tests/           worked examples per recognition rule
reports/         published monthly packs
```

**Accounting policy lives in `config/policy.yaml`, not in code.** Provision rates, useful
lives, residuals and the recognition basis are decisions the accountant owns and will
change; they should be editable without a code change or a developer.

---

## 11. Non-functional requirements

| Area | Requirement |
|---|---|
| **Privacy** | The register holds customer PII — names, phones, emails, addresses. Repo stays private. Raw pulls containing PII are gitignored. Reports carry customer IDs and names only where the owner needs them; no contact details in any published artifact. |
| **Credentials** | Xero and GoCardless credentials via environment or secret store. Never committed. |
| **Auditability** | Every figure in the pack traces to source rows. "Where did this number come from?" must be answerable in one step. |
| **Reproducibility** | Re-running a closed month yields byte-identical output. |
| **Timeliness** | Monthly pack within 5 working days of month end. Dashboard refreshed at least daily. |
| **Failure behaviour** | A failed or stale ingestion blocks the pack rather than publishing a partial one. Silence is safer than a confident wrong number. |
| **Maintainability** | One person maintains this alongside other work. Plain Python, few dependencies, tests on the recognition rules. |

---

## 12. Success criteria

The system works when:

1. The owner opens one page and knows whether HireHospo made money last month, without
   asking anyone.
2. Gross margin is computable for **100%** of active contracts (today: 0%, per G1).
3. The three-way reconciliation (FR5) closes to within **1%** on every leg, with any
   residual explained by name.
4. The monthly pack is produced within **5 working days** of month end for three
   consecutive months without manual intervention.
5. Arrears exposure appears in the P&L as a provision in the month it arises — HH001 is
   provided for rather than sitting invisible.
6. The 12-month run-off is visible early enough to act on: expiring revenue is a renewal
   conversation, not a surprise.
7. The accountant accepts the annual reconciliation to the statutory basis without
   rebuilding it from scratch.

**Leading indicator:** if the owner starts asking questions of the dashboard that they
did not previously know to ask, the system is working. If they still open the spreadsheet
first, it is not.

---

## 13. Phasing

### Phase 0 — Unblock (prerequisite, no code)

- Answer 6.1 (principal vs agent) and 6.2 (lease classification) with the accountant
- Connect HireHospo's Xero to this workspace
- Confirm or correct Washpro accounts `2710`–`2730` and `4035` per the 6.1 outcome
- Confirm the supply margin (Q4a), then apply the 7.7 cost ladder — Washpro purchase
  records where they exist, formula-derived and flagged where they do not. List price is
  already derived for all 47 machines in `data/derived_equipment_prices.csv`
- Backfill supplier and asset reference (G2–G3)
- Run the pricing control in 7.7 across the book and resolve any contract off the curve
- Resolve HH042 (duplicate) and HH001 (arrears contract with no machine rows)

**Nothing downstream is worth building until equipment cost exists.** Backfilling 47
contracts is a bounded task against Washpro purchase records, and it is the highest-value
work in the entire project.

### Phase 1 — Monthly management accounts (the committed deliverable)

FR1, FR2, FR3, FR4, FR6, FR8. Produces the monthly pack on the rental basis, reconciled
to GoCardless and Xero. Manual trigger is acceptable.

### Phase 2 — Reconciliation and dashboard

FR5 in full including the Washpro intercompany leg, FR7 dashboard, scheduled refresh.

### Phase 3 — Contract economics

Per-contract margin distribution, run-off modelling, deposit-tier and pricing analysis
fed back to sales and credit. Finance-lease view for the annual statutory reconciliation.

### Phase 4 — Candidates, not commitments

Automated journal posting to Xero; DebtOps collections integration so recovery outcomes
flow into the provision automatically; scenario modelling on new business volume.

---

## 14. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Equipment cost is unrecoverable for older contracts** | Gross margin impossible for 2024 vintages; the whole cost side degrades | Apply the cost ladder in 7.7: Washpro purchase records first, catalogue price less supply margin second. Flag every derived cost and never present it as actual |
| **Catalogue sell price is used as equipment cost** | Margin understated across the entire book by roughly the supply margin, consistently and invisibly | 7.7 makes the derivation explicit, puts `supply_margin` in config, and tags every contract with `cost_basis` |
| **6.1 is never resolved** | If agency is correct but gross lease income is recognised, revenue is overstated ~3.3× ($240k vs ~$72k). If principal is correct but only commission is recognised, it is understated ~70% | Phase 0 gate. Do not build on an unresolved model |
| **HireHospo Xero does not exist or is unmaintained** | FR1 has no source; the entity-scope decision collapses | Verify in Phase 0. Fallback is a segment carve-out of Washpro's ledger with tracking categories — a materially different project, so confirm early |
| **Register stays a manual spreadsheet** | Drift between register and ledger; reconciliation permanently fails | Make the register the sub-ledger of record with validation on write (FR2, FR8) |
| **Small book, high per-contract sensitivity** | One contract is ~2% of revenue; HH021 Eat Shop Do alone is ~16% of weekly billing. One data error visibly moves the P&L | Contract-level traceability; hard-fail validation rather than warnings |
| **Provision policy becomes a judgement lever** | Profit can be steered by moving provision rates | Rates live in `config/policy.yaml`, owned by the accountant, changes logged and disclosed in the pack |
| **Built, then unused** | Owner reverts to the spreadsheet | One-page summary first (FR6.2), built and reviewed with the owner before the detail |

---

## 15. Open questions

| # | Question | Owner | Blocks |
|---|---|---|---|
| Q1 | Principal or agent? (6.1) | Owner + accountant | Phase 0 |
| Q2 | Does HireHospo have its own Xero, and can it be connected? | Owner | FR1, Phase 0 |
| Q3 | Recognition basis for monthly accounts — confirm rental basis (6.2) | Accountant | FR4 |
| Q4 | Can **actual** equipment cost be recovered from Washpro purchase records, or is the formula-derived list price (7.7) the best available? | Washpro | Cost side, only under Model A |
| Q4a | What supply margin does Washpro actually charge HireHospo? The 30% in account `4035` is a commission rate, which may not be the equipment margin | Owner + Washpro | 7.7 derivation |
| Q5 | Useful life and residual for Rent 12m assets (D1) | Accountant | 7.3 |
| Q6 | Provision matrix sign-off (D2) | Accountant | 7.5 |
| Q7 | Is overhead allocated to HireHospo or shown unallocated (D3)? | Owner | 7.1 |
| Q8 | Which of the 10 past-end-date contracts renewed, ended, or bought out? (G7) | Owner | Run-off |
| Q9 | What is the actual recoverable position on HH001 Selwyn Contractors? | Owner | 7.5 |
| Q10 | Are delivery, install and LPG costs currently captured anywhere at all? | Ops | G5 |

---

## Appendix A — Evidence from Washpro's Xero

Read on 18 September 2026 from the connected Washpro Limited organisation (NZ, NZD,
Pacific/Auckland). Cited because it is the only hard evidence available about how
HireHospo transactions are recorded today.

**HireHospo-specific accounts**

| Code | Name | Class |
|---|---|---|
| — | `Washpro ltd/Hirehospo` | Bank |
| — | `GoCardless-NZD` | Bank |
| `2710` | Hirehospo - Lease Oven | Revenue |
| `2720` | Hirehospo - Lease Dishwasher | Revenue |
| `2730` | Hirehospo - Lease others | Revenue |
| `4035` | Hirehospo 30% Commission on Lease | Direct cost |

**Parallel lease accounts** (pre-existing Washpro leasing, separate from HireHospo):
`2800` Lease Income - Commercial Kitchen, `2810` Lease - Ovens, `2820` Lease - other food
equipment, `2850` Lease - Dishwashers, with `4020` / `4030` lease expenses and `3500`
Lease Direct expenses. Any carve-out must not confuse these with HireHospo lease income.

**Accounts a HireHospo P&L will need equivalents of:** `8040` Lease liability - Security
deposit, `4320` Bad Debts, `6110` less Provision for Doubtful Debts, `4090` Baycorp fees
and charges, `4160` Depreciation, `6300` Stock on Hand - Finished Goods.

**Two findings:**

1. **No tracking categories exist** (`total_count: 0`). There is currently no mechanism in
   Washpro's Xero to segment HireHospo activity other than by account code. If Q2 returns
   "no separate Xero", tracking categories become a Phase 0 prerequisite.
2. **No GoCardless fee account exists.** `5053` Stripe Fees and `4040` Bank Fees are
   present, but GoCardless transaction and failure fees have no home. Since GoCardless is
   the collection rail for every HireHospo contract, this is a real direct cost with
   nowhere to land.

## Appendix B — Register defects to resolve

Carried from `data/README.md` and verified against the CSVs on 18 September 2026:

| Ref | Defect | Disposition |
|---|---|---|
| G8 | HH042 "EAT SHOP DO RENTAL — JUNE 2026" duplicates HH021 | Delete before ingestion; hard-fail if present |
| — | M060: type "Lease-to-Own (36m)" but `Term = 12` | Correct at source |
| — | HH044 carries an orphan value in a ninth column | Identify and reassign |
| — | 9 phone numbers exported as `#ERROR!` | Warning only; no P&L impact |
| — | `Deposit` repeated at customer level across machine rows | Split per D4 into rent-in-advance and security deposit |
| — | One machine recorded as "Equipment (unspecified)" (M058, HH038) | Identify or close out with the ended contract |
| G6 | HH001 has a signed 36m contract but no machine rows | Create the machine record so the exposure has a carrying value |

## Appendix C — Source files in Google Drive

Located 20 September 2026. The brochure at `portal.hirehospo.com` is unreachable from this
environment (blocked by egress policy), but Drive holds better primary sources.

| File | What it gave |
|---|---|
| `Pricing Sheet For Rental & Lease` | **The pricing formulas** (7.7) — the `Machine × 1.6` lease markup and the `70% rental recoup`, plus 11 price/weekly pairs used to validate them |
| `HH Machines Finance Tracking` | **The 70/30 revenue split** (6.1); per-contract security deposit, weeks upfront, and weekly incl./excl. GST |
| `Bluemoon Sky NZ Ltd Calculation.xlsx` | A worked arrears position — see below |
| `Washpro to HH Inventory` | Empty. Named as though it holds the intercompany transfer register, which is exactly what Q4 needs |
| `Products/Active WP` | Not yet read — the active Washpro catalogue, the route to actual per-SKU prices |

**Bluemoon Sky NZ Ltd (HH009) is a live example of the reconciliation failure FR5 exists
to catch.** Every invoice from 30 June 2025 to 26 August 2026 sits *Awaiting Payment* in
the ledger while cash arrives in unmatched lumps:

```
Total invoiced                    $14,948.86
Cash received 31 Jan 2026          $5,450.00
Received via GoCardless            $3,428.90   "no invoice no mentioned in go cardless"
Payment 10 Aug 2026                $3,000.00
Cash received 25 Aug 2026          $2,000.00
Outstanding at 27 Aug 2026         $1,069.96
```

Two observations:

1. The customer is carried as `active` in the register, yet pays in irregular lumps that
   were never matched to invoices. Neither the ledger nor the register describes this
   correctly on its own.
2. The sheet shows weekly billing of **$303.52 + $57.50 = $361.02**, while the contract
   register records **$500.41/wk** for HH009. That gap survives a GST adjustment
   ($361.02 ÷ 1.15 = $313.93) and is unexplained. It is precisely the register-versus-
   ledger variance FR5 is specified to surface rather than absorb.
