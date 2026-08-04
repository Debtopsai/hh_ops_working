# ICP, filters & list build — hirehospo-new-venues-nz

Pillar two. Relevance is the spam defence — and in NZ it's also the legal argument (UEMA requires the message be relevant to a conspicuously-published role address). Qualification is therefore mandatory, not optional.

## Who to target

- **Decision makers only**: owner / co-owner / founder / director. For owner-operated venues, one person.
- **Blue-ocean fit**: new/young hospitality venues are exactly the "has budget, gets few B2B emails, no entrenched vendor" balance point the method hunts for.
- **Never**: managers, duty managers, "coordinators", head office of a franchise.

## Sourcing route — this is a LOCAL + SIGNAL audience, not a clean LinkedIn pull

New NZ venues mostly aren't on LinkedIn with a tidy decision-maker record, and many are pre-opening. So the list is **built from signals**, then enriched to a published owner email. Full pipeline in `-signal-new-venues.md`. Sources, in priority order:

1. **New food-premises registrations** — councils publish registered food businesses (Food Act verification). The cleanest "this venue is real and new" source.
2. **New on/off-licence public notifications** — alcohol licence applications are publicly notified (council + public notice channels). Strong signal for bars/restaurants.
3. **Pre-open hiring bursts** — Seek / TradeMe Jobs / Indeed NZ: a new venue hiring chefs/baristas/FOH before opening is telling you it exists and has budget. Scrape fresh (job data goes stale fast).
4. **"Opening soon" social + local media** — Instagram/Facebook new-venue announcements, local "new openings" roundups (Metro, Neat Places, regional press).

**Sourcing must stay inside NZ compliance**: use the venue's genuinely **published** business/owner email (their own site, Google listing, Instagram bio, public register) — never guessed `firstname@` pattern addresses, never harvested lists. The offer must be relevant to that published role. Both are legal requirements here, not preferences.

## Filters (applied during enrichment/qualification, since there's no single Apollo pull)

| Filter | Setting |
|---|---|
| Location | New Zealand (company/venue location) |
| Business type | independent hospitality venue (cafe, restaurant, bakery, bar, food truck, catering, cloud kitchen) |
| Recency | opened ≤ ~90 days **or** pre-open (licence/registration/hiring in last ~60 days) |
| Employee count | 1–50; exclude 1-person shells with no premises |
| Include keywords | cafe, eatery, restaurant, bistro, kitchen, bakery, roastery, bar, taproom, food truck, catering, brunch, dessert |
| **Exclude keywords** (highest-leverage filter) | equipment, supplies, refrigeration services, commercial kitchen supplier, distributor, wholesaler, franchise HQ; plus supermarket/petrol/QSR chains |
| Email status | published business/owner address, verified |

## Verification

1. Bulk-verify everything (Million Verifier or equiv). Send **only to goods**.
2. Resolve riskies (catch-all/unknown) separately via Findymail; ~half are deliverable.
3. Verify **close to send** — a small TAM means the list sits longer, so re-verify before each load. Stale = hard bounces.

## Qualification (the highest-ROI step — expect it to cut 30–50%)

Run every lead through an AI qualification pass before it enters Instantly. Scrape ~**2×** the volume you intend to send, because this will (correctly) remove a third to a half.

```
You are an expert sales assistant for HireHospo, an NZ finance provider for
commercial kitchen equipment (equipment delivered/installed/serviced by Washpro).

Decide if this lead is a good fit to approach about financing kitchen equipment
for a NEW or recently-opened NZ hospitality venue.

Good fit: an independent NZ cafe/restaurant/bakery/bar/food-truck/caterer/cloud
kitchen that is opening or recently opened and will need commercial kitchen
equipment (dishwasher, cooking line, refrigeration, prep, holding).

Disqualifiers: equipment suppliers/resellers, refrigeration or hospitality-supply
businesses, distributors/wholesalers, national franchise head offices with
supplied fit-outs, non-hospitality businesses, existing HireHospo customers,
venues clearly already fully equipped with no expansion signal.

Lead info: <venue name, type, location, opening status, website/Instagram, role/title, published email>

Output exactly one word, yes or no. No explanation, no punctuation.
```

Run it where the model can browse (Clay agent, or Perplexity/Sonar research call + LLM judgement in n8n/Make, or a Claude Code pipeline to a Turso/Supabase table).

## Block list (non-negotiable before load)

- **Load every email + domain from `data/customers.csv` into the block list** so no existing/past HireHospo customer is ever cold-emailed (24 active, plus ended/bought-out/arrears records). Do not paste that PII into this campaign folder — reference the source file and feed it into Instantly's block sheet + the CRM automation.
- Also block: Washpro, suppliers/partners, competitors, and every prior opt-out.
- Add "write to the block sheet" as a step in the CRM automation so a newly-signed customer is auto-removed from cold reach.

## Recommended pipeline

```
signal scrape (daily) → recency filter → dedupe vs permanent "contacted" store
  → AI qualification (removes 30–50%) → enrich venue→owner→published email
  → bulk verify → goods ; riskies → catch-all verify → recovered goods
  → block-list check (customers.csv + suppliers + opt-outs)
  → Instantly
```

Keep a **permanent store of everyone contacted + outcome** — it's what makes recycling and dedupe possible when you delete leads from the sequencer to control cost.

## Expected yield & cost (rough, refine with real data)

- Signal sources → maybe 100–300 raw new-venue candidates/month nationally.
- After qualification (−30–50%) + verification → ~50–150 usable, published, verified owner emails/month.
- Cost per usable lead: low (scraping + verification credits) — the labour is the enrichment chain, not the data.

Hand back to `cold-email-machine`.
