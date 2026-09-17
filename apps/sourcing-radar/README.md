# Washpro Sourcing Radar

One feed of every used commercial kitchen equipment listing in New Zealand that
matches Washpro's buying profile, with a direct link through to bid or message.

This is Phase 1 of the PRD: auth, data model, watchlist CRUD, feed, alerting,
source health, the auction house adapters and the manual clip path. Phase 2
(email ingestion) and Phase 3 (the Facebook Marketplace extension) are not built
yet, by design. Ship and use Phase 1 first.

All money is ex GST in NZD and written "+ GST" wherever it is displayed.

## Read this before running anything

**No source endpoints have been discovered yet.** The PRD says not to invent
endpoints, selectors or auction house behaviour, and discovery was blocked in
the build environment by its network policy. So every source ships with an empty
`config`, every adapter refuses to run without one, and Source health shows each
as "not configured" with the list of missing keys.

`docs/DISCOVERY.md` has the evidence, the procedure and the config templates.
Working through it is the first task, and it is an afternoon's work from a
machine with ordinary internet access. Everything downstream of it is built and
tested.

## Looking at it without a database

```
npm install
PREVIEW_MODE=1 npm run dev     # http://localhost:3000/feed
```

Preview mode runs all four screens on sample data with no Supabase project, no
credentials and no discovered endpoints, so the interface can be walked through
before any of that exists. A banner on every screen says the data is sample
data. It refuses to start if `SUPABASE_SERVICE_ROLE_KEY` is set, so it cannot be
left on in front of live data, and the buttons and forms deliberately do nothing
because there is nothing behind them.

The sample dataset is `src/lib/preview.ts`. Edit it to try a different mix of
listings, run states or seats.

## Running it properly

```
cp .env.example .env.local     # then fill it in
npm install
npm run test                   # 83 tests, no network or database needed
npm run dev
```

Database:

```
supabase db push               # applies supabase/migrations in order
```

Then, in Supabase: create a storage bucket named `listing-images`, invite the
three users in Auth, and insert a matching row in `app_users` for each, with
exactly one `admin`.

Once a source's config is discovered:

```
npx tsx scripts/validate-source-config.ts all_about_auctions
```

and only then set `enabled = true` on that source.

## How it fits together

```
Inngest cron  ->  runner  ->  adapter.fetch()      raw items from one source
                            adapter.normalise()    the shared listing shape
                            upsert                 dedupe within the source
                            match                  against the watch terms
                            dedupe                 against the other sources
                            queue                  one alert per listing per person
Inngest cron  ->  dispatcher                       WhatsApp template, plus email
```

| Path | What it is |
|---|---|
| `src/lib/money.ts` | GST conversion, null prices, the only money formatter the UI uses |
| `src/lib/region.ts` | Free text location to a controlled region list, out of region badging |
| `src/lib/matching.ts` | Watch terms, negative keywords, scoring |
| `src/lib/dedupe.ts` | Cross source similarity over title, price and image hash |
| `src/adapters/mapping.ts` | The declarative field mapping engine |
| `src/adapters/json-catalogue.ts` | Any source backed by a JSON endpoint |
| `src/adapters/html-listing.ts` | Any server rendered source, Turners being the one |
| `src/ingest/runner.ts` | One pass over one source, with adapter isolation |
| `src/alerts/planner.ts` | Digest grouping, quiet hours batching, the hourly cap |
| `src/alerts/dispatch.ts` | Sending, the email fallback, recording the outcome |
| `supabase/migrations/` | Schema, RLS on every table, seed data |

### Adding a source

A new auction house on a platform already supported is **one row in `sources`**
with a discovered `config`. That is the point of the mapping engine: the adapter
is written against the platform, not against the customer. A house on a new
platform is one adapter file plus one row.

## Decisions worth knowing

**Nothing is invented.** Unknown endpoints, an unknown WhatsApp template rate, an
unknown freight cost and unset price ceilings are all surfaced in Settings under
Open items rather than filled with a plausible default. A made up number here
quietly becomes a decision later.

**A null price is a real value.** Turners shows "Pricing coming soon" on items
awaiting valuation. Those lots are written with a null price, never skipped and
never zero, and the feed renders them as "price TBC".

**Nothing is auto merged.** The same machine appearing on two sources writes a
`duplicate_candidates` row and both cards stay in the feed carrying each other's
source badge. A wrong merge hides a real machine, which is worse than showing a
pair.

**Out of region is badged, not filtered.** A Rational combi at the right price in
Christchurch is still worth buying with freight included. Region is on the card
face so the founder never has to open a listing to find out where it is.

**A lone overnight alert is sent as a single alert at 6am, not a digest of one.**
The PRD calls the overnight batch "the 6am digest". A batch of more than one goes
as the digest template; a batch of exactly one goes as the single template, which
carries the title, price and link that a digest of one would lose. The timing is
identical either way. This is the one place the implementation reads the intent
rather than the words, and it is easy to reverse in `src/alerts/planner.ts`.

**An unconfigured source is not a broken source.** It records a `not_configured`
run and does not raise a health alert, because unfinished setup and a snapped
selector need different responses from whoever is looking at the screen.

## Testing what the PRD asks for

Phase 1 acceptance, criterion by criterion:

| Criterion | Test |
|---|---|
| Lot appears in the feed, matched to the right term | `tests/ingest.test.ts` |
| Correct ex GST pricing, working link | `tests/ingest.test.ts`, `tests/money.test.ts` |
| No duplicate on the following poll | `tests/ingest.test.ts` |
| Alert delivered once, template plus email, to all three, outcome recorded per recipient | `tests/alerts.test.ts` |
| A forced WhatsApp failure falls back to email | `tests/alerts.test.ts` |
| Six matches from one run arrive as one digest | `tests/alerts.test.ts`, `tests/planner.test.ts` |
| An alert raised in quiet hours arrives at 6am and not before | `tests/alerts.test.ts`, `tests/quiet-hours.test.ts` |
| No GST inclusive figure appears unlabelled | `tests/money.test.ts` |
| No alert fires twice for the same listing | `tests/ingest.test.ts`, `tests/alerts.test.ts` |

What the tests cannot prove, because discovery has not happened: that any real
source returns the shape the fixtures use. `tests/fixtures/README.md` says so
plainly, and `scripts/validate-source-config.ts` is what closes that gap against
the live sites.

## Lead time items, start these on day one

Both are waits rather than work, and both block Phase 1 acceptance if they are
left until the code is done:

1. **The WhatsApp dedicated number and template approval.** Two templates to
   submit, `sourcing_listing_alert` and `sourcing_digest_alert`; the exact
   variables are in `src/alerts/templates.ts` and on the Settings screen.
2. **The Trade Me API application**, to api-marketplace@trademe.co.nz, describing
   the use case honestly as internal sourcing for an in trade seller. If the key
   lands, the API replaces the Phase 2 email parser and nothing downstream
   changes.
