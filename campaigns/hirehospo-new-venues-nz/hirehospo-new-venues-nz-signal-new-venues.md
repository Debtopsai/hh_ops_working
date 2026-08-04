# Signal spec — "new & opening NZ venue"

The signal that removes the guesswork: instead of betting this operator needs kitchen gear, a new-venue event is evidence they do, right now.

> **Prerequisite honesty**: signals are complex and ~half underperform a good control. For HireHospo this *is* the natural first campaign (the whole segment is signal-defined), but treat the broad direct-frame A/B as the "control" and prove the fundamentals before adding sources #3–#4.

## Why this signal proves the pain

A venue that has just registered a food premises, been notified for a liquor licence, started hiring kitchen staff, or announced "opening soon" is — by definition — about to need a commercial kitchen it doesn't yet own. That's the tightest possible match to "finance kitchen equipment."

## Sources, recency window & scrape cadence

| # | Source | What it proves | Recency window | Cadence |
|---|---|---|---|---|
| 1 | Council **new food-premises registrations** | real, new, consented venue | registered ≤ 60 days | weekly |
| 2 | **On/off-licence public notifications** | new bar/restaurant, has capital | notified ≤ 60 days | weekly |
| 3 | **Pre-open hiring** (Seek/TradeMe/Indeed NZ, hospitality roles) | exists + has budget, pre-revenue | posted ≤ 30 days | daily (job data goes stale fast) |
| 4 | **"Opening soon" social + local media** | intent + a personalisation hook | announced ≤ 60 days | weekly |

Recency is the whole game — being late on a new-venue signal is worse than not using it (they've already bought the gear).

## Exclusions (build the exclusion list first)

- Equipment suppliers, refrigeration/hospitality-supply firms, distributors (a hiring/opening scrape pulls these in — exclude by keyword).
- National franchise openings with head-office-supplied fit-outs.
- Venues taking over a fully-fitted existing site with no replacement/expansion signal (weaker fit — deprioritise, don't hard-exclude).
- Anyone already in `data/customers.csv`.

## Enrichment chain (where signal projects die — plan it before scraping)

Most sources hand you a **venue**, not a person with an email:

```
venue (from signal)
  → identify owner/director (companies register / site "about" / Instagram / licence applicant name)
  → find PUBLISHED business/owner email (site, Google listing, IG bio, public register)   [NZ: published only]
  → verify (Million Verifier) → goods
                              → riskies → catch-all verify (Findymail)
  → write the 2–8 word personalisation from the signal itself
```

## Personalisation (2–8 words, from the signal — not from a readable bio)

Good, signal-derived: `"saw [venue] is opening in [suburb]"`, `"noticed you're hiring a chef for [venue]"`, `"congrats on the [venue] licence"`.
Bad (reads automated): anything lifted from an Instagram bio or a company description. Read 100 outputs before shipping; if <9/10 are accurate and human, kill the variable.

## Dedupe & routing

- **Permanent dedupe store is mandatory** — this runs daily/weekly and will re-contact the same venue without it. Key on domain + venue name.
- Route qualified, verified, personalised leads straight into the Instantly signal campaign. Signals decay — automate the push, don't hand-carry.

## Expected performance & limits

- Reply rate: signal plays commonly run **8–20%+** (vs 2–4% for a broad list) — but volume is capped by how many genuinely-new venues appear. Not scalable like a 100k pull; run it alongside the broad challenger, not instead of it.
- Tooling: Apify for scrapes; Clay **or** n8n/Make + Perplexity/Sonar for the enrichment/qualification/personalisation chain (Sonar is far cheaper than a Clay browsing agent for the research step).

## Feeds

This signal feeds the **primary reverse-lead-magnet campaign** (Variant A). The broad direct-frame (Variant B) can also draw from source #1–#2 for a larger, less time-sensitive pool.

Hand back to `cold-email-machine`.
