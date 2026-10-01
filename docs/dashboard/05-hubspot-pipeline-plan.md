# HubSpot pipeline plan (written, not run)

Status: proposal. **Nothing here has been run.** It needs Raj's go-ahead (open question 21). Phase 1 does not depend on it; phase 2 funnel views do.

## 1. Current state, checked live on 1 October 2026

- **Two deal pipelines.** "Sales Pipeline" (`default`) and "Contract Pipeline" (`148114589`), both on HubSpot default stage names.
- **50 deals:**
  - 47 in Contract Pipeline stage `251084371` (Prospect Inquiry);
  - 1 in stage `251084375`;
  - 2 with no pipeline.
- **Deal source.** Every deal is created by a **Pabbly Connect** integration at contract time, not by Ops Desk. Names follow "<COMPANY> - Lease agreement" or "- Rent agreement".
- **Currency.** `deal_currency_code` is USD on every deal. The amounts are NZD.

## 2. Target Contract Pipeline

Rebuild pipeline `148114589` in place. The pipeline ID is kept so existing deals and reports keep their links.

| Order | Stage | Entered when | Closed? | Probability |
| --- | --- | --- | --- | --- |
| 1 | Enquiry | Optional; deals are normally created at stage 2 | No | `[TBC]` |
| 2 | Credit submitted | Application sent to Checkmate. **The deal is created here, not at contract** | No | `[TBC]` |
| 3 | Approved | Credit decision approved | No | `[TBC]` |
| 4 | Declined | Credit decision declined | Closed lost | 0 |
| 5 | Quote sent | Quote email sent after approval | No | `[TBC]` |
| 6 | Contract sent | Agreement sent for signing | No | `[TBC]` |
| 7 | Signed | Agreement signed | No | `[TBC]` |
| 8 | Deposit cleared | Deposit in the bank (this is "funded") | Closed won | 100 |
| 9 | Dispatched | Washpro dispatch confirmed | Closed won | 100 |
| 10 | Lost | Any loss after approval, with a required lost reason | Closed lost | 0 |

Probabilities are left `[TBC]` because no forecasting is in scope.

The Sales Pipeline (`default`) is left alone until Raj decides whether to archive it.

## 3. Deal properties to add (group "HireHospo")

| Internal name | Label | Type | Required at stage |
| --- | --- | --- | --- |
| `hh_credit_decision` | Credit decision | Enumeration: approved, declined, referred | Approved or Declined |
| `hh_credit_decided_on` | Credit decided on | Date | Approved or Declined |
| `hh_risk_tier` | Risk tier | Enumeration `[TBC, Raj: tier names]` | Approved |
| `hh_deposit_structure` | Deposit structure | Enumeration: 10+10, 8+8, 6+6, 4+3, other | Quote sent |
| `hh_product` | Product | Enumeration: Rent, Lease to Own | Quote sent |
| `hh_weekly_rate` | Weekly rate (+ GST) | Number, NZD | Contract sent |
| `hh_meta_lead_id` | Meta lead ID | Single-line text | Not required (referrals have none) |
| `hh_plutio_agreement_no` | Plutio agreement number | Single-line text | Signed |
| `hh_gocardless_customer_id` | GoCardless customer ID | Single-line text | Deposit cleared |
| `hh_opsdesk_deal_id` | Ops Desk deal ID | Single-line text | Signed |

The weekly rate moves out of `amount`. `amount` becomes the total contract value or stays empty `[TBC, Raj]`. Using `amount` for a weekly figure is what lets a deposit slip in unnoticed, as with Lahoria's 490.

Only the decision, tier and date are stored. A credit report is never stored.

## 4. Currency fix

Set the portal's company currency to NZD, then set `deal_currency_code = NZD` on all 50 deals. HubSpot does not convert amounts when the code changes, so the amounts stay as they are. `[TBC, confirm in HubSpot settings whether multi-currency is on]`

## 5. Merge list

Keep the deal with a non-zero amount, then the earlier deal. Merge the other into it.

| Keep | Merge into it | Company |
| --- | --- | --- |
| 34820394781 | 34867942530 | Hiraya Collective |
| 36119275385 | 36114811251 | BlueMoonSkyNZZ (Rent) |
| 38666618466 | 38640503335 | Selwyn Contractors |
| 43844401964 | 43837933412 | Sugar Spice & Everything Nice |
| 51560053798 | 51530603022 | Homely Flavors |

BlueMoonSkyNZZ's Lease deal `44038739285` is a separate agreement and is **not** merged.

## 6. Archive list (test, internal or blank)

| Deal IDs | What they are |
| --- | --- |
| 22974225813, 22973775407, 22973301147, 38755918346, 46819745968, 58522716534, 58509734508 | IWise, internal |
| 38640522857 | rajurman co, test |
| 38636515651, 38638948719 | Pabbly Connect, test |
| 38662555036 | Simple Test HH |
| 58338743480, 58311736740 | Joels Video Editing, test at $10 |
| 38633347359, 38623982165, 38638907543 | Blank company name |

That is 16 deals.

## 7. Moving existing deals to the new stages

Map each kept real deal to its true stage. Funded means GoCardless shows a collected deposit. This waits on GoCardless access, so the stage of each deal is decided from the matching report, not guessed.

## 8. Change to the Pabbly flow

The flow creates the deal at contract time. Under this plan the deal exists from "Credit submitted", so the flow must **update** the existing deal at signing rather than create a new one. Otherwise every signing creates a duplicate.

The flow must:

1. Look up the deal by `hh_opsdesk_deal_id` or company.
2. Set the stage to Signed.
3. Write `hh_plutio_agreement_no`.

This depends on confirming who owns the Pabbly flow and what triggers it. `[TBC, Raj]`

## 9. How it would be run, once approved

A one-off script (`scripts/hubspot/apply-pipeline-plan.ts`) that:

- needs a separate token with write scopes, used once and then deleted;
- defaults to a dry run that prints every change;
- writes only with `--apply`;
- logs every change to a file kept in the repo.

The warehouse token stays read-only.
