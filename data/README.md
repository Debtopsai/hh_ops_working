# HireHospo Customer Database

Source: Google Sheet export uploaded 19 July 2026 (two identical .xlsx exports
were provided; `HireHospo_Database.xlsx` is the canonical copy, with the two
sheets also split out as `customers.csv` and `machines.csv`).

Contains customer PII (names, phones, emails, addresses) — keep this repo private.

## Sheets

### Customers (29 rows)
`ID, Name, Contact, Phone, Email, Address, Status, Notes`
- IDs HH001–HH044 (non-contiguous — gaps likely deleted/inactive records)
- Status values: `active` (26), `ended` (1: HH017 Cinnamon Squared),
  `bought_out` (1: HH022 Life Health Foods), `month_to_month` (1: HH028 Rescued)
- Mostly Auckland; HH026 is Waikato (Ngaruawahia), HH032 is Palmerston North

### Machines (47 rows)
`ID, Description, CustID, Type, Term, Weekly, Start, Deposit, APS, Supplier, Notes`
- IDs M001–M060 (non-contiguous)
- Types: Lease-to-Own 36m (36), Rent 12m (9), Month-to-Month (1),
  "Lease-to-Own (Standard)" (1 — HH044's M059)
- `Weekly` is the weekly payment in NZD (+ GST convention applies)
- `APS` = equipment asset/SKU reference (Washpro)
- `Deposit` appears to repeat the customer's total deposit on each of their
  machine rows (e.g. all five HH007 rows show 1054.00) — treat as
  customer-level, not per-machine, until confirmed
- Start dates range Feb 2024 – Apr 2026

## Portfolio snapshot (as of this export)

- Total weekly billing across all machines: **$5,223.52/wk** (~$271.6k/yr)
- From active customers: $4,796.81/wk across 44 machines
- Top accounts by weekly: Eat Shop Do ($725), BlueOceanNZ/Caviar Kitchen
  ($514.15), BlueMoonSkyNZZ ($500.41), Lazy Betty ($414.50), Mama Sila
  Catering ($347.85), IPG Hotels/SOHO ($338.04)
- Repeat-relationship signal: Julian Baleli holds two accounts (HH005 Gem
  Seafood, HH024 Manaia Eatery); Dil Bahadur Barala holds two (HH009
  BlueMoonSkyNZZ, HH030 BlueOceanNZ)

## Known data-quality issues

1. **9 phone numbers exported as `#ERROR!`** (formula artifacts in the source
   sheet): HH008, HH014, HH015, HH016, HH020, HH022, HH027, HH028, HH031
2. **Inconsistent phone formats** — mix of `64...`, `021...`, `09...`, and one
   `6402108581017` (HH010, likely a typo'd concatenation)
3. **HH042** ("EAT SHOP DO RENTAL - RENTAL | JUNE 2026", auto-added 2/06/2026)
   is a mis-imported record, not a real customer — likely a duplicate artifact
   of HH021 Eat Shop Do
4. **HH038 Lazy Betty** — no address, no phone, contact first-name only, and
   its machine M058 is "Equipment (unspecified)" at $414.50/wk
5. **HH001 Selwyn Contractors** — active customer with no machine rows
6. **M060** — Type says "Lease-to-Own (36m)" but Term = 12
7. **HH044** row carries an extra orphan value in a ninth column
   (9429041xxxxx — possibly a phone or GST number that slipped a column)
