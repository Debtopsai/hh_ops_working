# Source discovery worksheet

The PRD is explicit: do not invent endpoints, selectors, pricing or auction
house behaviour. Where it says to discover something at build time, discover it
and record what was found here.

## Status: not done, and why

Discovery has **not** been completed. It was attempted on 17 September 2026 from
the build environment and every source host is blocked by that environment's
egress policy:

```
$ curl -sS -L https://auctions.allaboutauctions.co.nz/
curl: (56) CONNECT tunnel failed, response 403

$ curl -sS "$HTTPS_PROXY/__agentproxy/status"
  "recentRelayFailures": [
    { "kind": "connect_rejected", "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
      "host": "auctions.allaboutauctions.co.nz:443" },
    { ... "host": "www.number8.bid:443" },
    { ... "host": "live.mainlandauctions.nz:443" },
    { ... "host": "www.turners.co.nz:443" }
  ]
```

`washpro.co.nz` and `api.trademe.co.nz` are blocked the same way, so the brand
seed script has not been run against the live store either.

Nothing has been guessed to fill the gap. Every source ships with an empty
`config`, every adapter refuses to run without one, and Source health shows each
of them as "not configured" with the list of missing keys. The adapter engines,
the mapping layer, matching, dedupe, GST handling, region normalisation and
alerting are all built and tested; the discovered values are the only thing
between them and live listings.

Do this from a machine with ordinary internet access. It is an afternoon.

## What to capture, per source

For each source, record in the table at the bottom of this file:

1. The exact request the page makes for its listing data: method, full URL,
   query parameters, and any headers beyond the ordinary browser set.
2. The path to the array of items inside the response.
3. The field path for each of: external id, title, description, price, image
   URLs, lot number, auction name, closing time, viewing details, region or
   location, listing URL.
4. Whether prices on the page are GST inclusive or exclusive, and where the site
   says so.
5. The buyer's premium and whether it is quoted GST inclusive.
6. Pagination: how the page asks for the next page.

Then write it into the source's `config` column and run the validator below.

## Procedure, JSON backed sites (All About Auctions, Mainland, No. 8)

1. Open the catering or hospitality category in Chrome with DevTools on the
   Network tab, filter to Fetch/XHR.
2. Reload. The request that returns the lots is the one whose response contains
   the lot titles you can see on the page. Right click it, Copy as cURL.
3. Confirm it works outside the browser session: run the cURL with the cookie
   header removed. If it still returns lots, the adapter needs no session. If it
   does not, record exactly which header it needs.
4. Save a real response to `tests/fixtures/<slug>-live.json` so the field paths
   can be verified and re verified without hitting the site.
5. Fill in the config below.

All About Auctions and Mainland are expected to be the same white label
platform, on the evidence of identical URL patterns and page templates. Verify
that: if it holds, Mainland is this same config with a different base URL and no
new code, which is the payoff for writing the adapter against the platform
rather than the customer. If it does not hold, say so here and treat Mainland as
its own mapping.

No. 8 Solutions is a custom platform, not the white label engine. Nothing
carries across from All About Auctions except the normalised output shape. Its
item grid is client rendered, so a plain HTML fetch returns the page chrome and
no lots. Find the JSON call. Only fall back to a headless render if there is no
endpoint at all, because headless is slower, heavier and more fragile.

No. 8 also publishes a past sales archive with realised prices at
`https://www.number8.bid/pastsales/`. That is the cleanest valuation dataset in
this build. Capture it into `listings` with `sold_price_ex_gst` and `sold_at`
from day one: it costs almost nothing now and back filling history later is
impossible. It is out of scope for v1 to *use*, not to *collect*.

## Procedure, Turners

Turners result pages are server rendered, so there is no JSON endpoint to hunt
for. What is needed instead is the search URL template and the CSS selectors.

1. Run a keyword search across all General Goods, not the Business and Industry
   category. That category returned 21 results of which two were relevant, and
   it misses hospitality equipment listed elsewhere. The watch terms do the
   filtering.
2. Record the URL, with the keyword replaced by `{query}` and the page number by
   `{page}`.
3. In DevTools, Inspect a result card and record: the selector that matches one
   card, and within it the selectors for title, link, image, price, location and
   lot or listing reference.
4. Find a listing showing "Pricing coming soon" and confirm the price selector
   returns that text rather than an empty node. It must parse to a null price,
   not zero.
5. Save a real page to `tests/fixtures/turners-live.html`.

Also subscribe to Turners saved search email alerts into the same inbox as
Trade Me, as a second net. That is Phase 2 work.

## Config templates

`json_catalogue` sources:

```jsonc
{
  "discovered": true,
  "discoveredAt": "2026-09-__",
  "discoveredBy": "__",
  "baseUrl": "https://__",
  "userAgent": "WashproSourcingRadar/1.0 (sourcing@washpro.co.nz)",
  "priceBasisDefault": "inc_gst",   // whatever the site actually quotes in
  "itemsPath": "__",                 // path to the array of lots
  "endpoints": [
    { "label": "catering", "url": "https://__", "pages": { "from": 1, "to": 5 } }
  ],
  "fields": {
    "externalId":      { "path": "__" },
    "title":           { "path": "__", "transforms": ["trim"] },
    "description":     { "path": "__", "transforms": ["stripHtml"] },
    "price":           { "path": "__" },
    "images":          { "path": "__", "transforms": ["array"], "baseUrl": "https://__" },
    "url":             { "path": "__", "transforms": ["absoluteUrl"], "baseUrl": "https://__" },
    "lotNumber":       { "path": "__" },
    "auctionName":     { "path": "__" },
    "closesAt":        { "path": "__", "transforms": ["isoDate"] },
    "viewingDetails":  { "path": "__" },
    "region":          { "path": "__" },
    "soldPrice":       { "path": "__" },
    "soldAt":          { "path": "__", "transforms": ["isoDate"] }
  }
}
```

`html_listing` sources:

```jsonc
{
  "discovered": true,
  "discoveredAt": "2026-09-__",
  "discoveredBy": "__",
  "baseUrl": "https://www.turners.co.nz",
  "searchUrlTemplate": "https://www.turners.co.nz/__?keyword={query}&page={page}",
  "maxPages": 3,
  "itemSelector": "__",
  "priceBasisDefault": "unknown",
  "fields": {
    "title":  { "selector": "__" },
    "url":    { "selector": "__", "attr": "href" },
    "image":  { "selector": "__", "attr": "src" },
    "price":  { "selector": "__" },
    "region": { "selector": "__" },
    "externalId": { "selector": "__", "attr": "href", "regex": "/(\\d+)$" }
  }
}
```

## Verifying a config

```
npx tsx scripts/validate-source-config.ts <source-slug>
```

It runs the real adapter against the live site, prints the first few normalised
listings, and fails loudly on a missing title, a missing URL or a price that
parsed to zero where the page says "Pricing coming soon". Run it before enabling
a source, and again whenever a source starts reporting zero listings.

## Findings

Fill this in as discovery happens. It exists so the next person does not repeat
the work.

| Source | Platform | Data request | Items path | Prices quoted | Buyer's premium | Notes |
|---|---|---|---|---|---|---|
| All About Auctions | white label, AngularJS front end (per PRD, verify) | not discovered | not discovered | not discovered | 17.25 percent GST inclusive, from published recent sales | blocked by egress policy at build time |
| No. 8 Solutions | custom, client rendered grid | not discovered | not discovered | not discovered | not discovered | past sales archive at /pastsales/ to be captured from day one |
| Mainland Auctions | expected same white label as All About Auctions, verify | not discovered | not discovered | not discovered | not discovered | Christchurch, so most lots are out of region |
| Turners General Goods | server rendered | not discovered | n/a | not discovered | not discovered | search all General Goods, not the Business and Industry category |
