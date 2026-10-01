# Interim matching: HubSpot deals vs customer book export

Run on 1 October 2026.

**Inputs**
- HubSpot portal 47462529: all 50 deals, read-only.
- `data/customers.csv` and `data/machines.csv`, exported 19 July 2026.

The book weekly figure is the sum of `Weekly` across a customer's machine rows, in NZD + GST. HubSpot deals are identified by deal ID and customers by book ID only. Names are in the source files.

**Method**
1. A token pass on normalised company names.
2. Every candidate pair reviewed by hand.
3. False pairs from shared generic words removed: HH007 against Dundee Catering, HH008 against Lotus Hospitality, HH022 against Gold Ribbon Foods, and HH014/HH026/HH030 against Victoria's Kitchen.

## Matched (17 book customers)

| Book ID | Book status | Book weekly | HubSpot deal IDs | HubSpot amount(s) | Result |
| --- | --- | --- | --- | --- | --- |
| HH001 | arrears | no machine rows | 38640503335, 38666618466 | 0, 61.45 | Duplicate deal. Book has no machine rows for this contract |
| HH005 | active | 255.00 | 39633939618 | 0 | Deal amount 0 |
| HH009 | active | 500.41 | 36119275385, 36114811251, 44038739285 | 263.93, 263.93, 236.48 | Agrees: 263.93 rent + 236.48 lease = 500.41. Rent deal duplicated |
| HH011 | active | 78.00 | 34867942530, 34820394781 | 0, 78 | Agrees. Duplicate deal (one at 0) |
| HH013 | active | 130.30 | 43901255078 | 130.3 | Agrees |
| HH014 | active | 163.66 | 56623906356 | 124.76 | Differs by 38.90: book has 4 machines, deal covers 3 (M020 + M022 + M057) |
| HH015 | active | 50.00 | 42325584921 | 50 | Agrees |
| HH016 | active | 65.00 | 33617872008 | 65 | Rate agrees. Product differs: deal says Rent, book says Lease to Own 36m |
| HH017 | ended | 33.57 | 30676455314 | 35 | Differs by 1.43 |
| HH019 | active | 54.00 | 43776675151 | 50 | Differs by 4.00 |
| HH020 | active | 189.17 | 51932132975 | 189.17 | Agrees |
| HH025 | active | 65.00 | 38796746163 | 490 | Deal amount is the book deposit (490.00), not the weekly rate |
| HH027 | active | 115.00 | 43310485834 | 60 | Differs by 55.00: second machine added 12 March 2026 with no deal |
| HH028 | month_to_month | 230.00 | 59444292230 | 200 | Differs by 30.00 |
| HH029 | active | 248.25 | 51560053798, 51530603022 | 248.25, 248.25 | Agrees. Duplicate deal |
| HH032 | active | 70.90 | 39043509372 | 63 | Differs by 7.90 |
| HH044 | active | 61.20 | 59707330121 | 61.2 | Agrees |

Agree to the cent: HH009, HH011, HH013, HH015, HH016 (rate only), HH020, HH029, HH044. That is **8**.
Differ: HH001, HH005, HH014, HH017, HH019, HH025, HH027, HH028, HH032. That is **9**.

## Book customers with no HubSpot deal (11)

HH003, HH007, HH008, HH010, HH021, HH022 (bought out), HH024, HH026, HH030, HH031, HH038 (ended).

Combined book weekly for the 9 of these still marked active: **$2,336.42 + GST**. HH021 alone is $725.00.

Nine of the 11 have their first machine start date before October 2024, when the first Pabbly deal appears. HH021 (18 August 2025) and HH024 (28 October 2025) started later and still have no deal.

## Real HubSpot deals with no book customer (12 deals, 11 companies)

22963659576, 32093638691, 39569812548, 41367422785, 41359096964, 42042449552, 43844401964 and 43837933412 (duplicates), 58672291713, 64166307992, 64362884903, 294417491390.

Three were signed after the 19 July 2026 export (64166307992, 64362884903, 294417491390). For the rest, it is not known whether they funded. GoCardless will answer that once it is connected.

## Test, internal and blank deals to archive (16)

22974225813, 22973775407, 22973301147, 38633347359, 38623982165, 38638907543, 38640522857, 38636515651, 38638948719, 38662555036, 38755918346, 46819745968, 58338743480, 58311736740, 58522716534, 58509734508.

## Not yet matched

The GoCardless and MYOB sides are not matched yet: there are no credentials. See `../04-credentials-checklist.md`.
