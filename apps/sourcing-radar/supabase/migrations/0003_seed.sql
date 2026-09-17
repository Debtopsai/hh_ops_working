-- Seed data.
--
-- Two things in here are deliberately incomplete, and both are surfaced in the
-- app rather than filled with a plausible default:
--
--   1. sources.config is '{}' for every adapter. The endpoints, JSON field
--      paths and HTML selectors are discovered at build time and written into
--      that column. See docs/DISCOVERY.md. A source with an empty config
--      records a 'not_configured' run and shows as such on Source health.
--   2. Buyer's premium is only known for All About Auctions (17.25 percent GST
--      inclusive, from published recent sales). The others stay null.

-- --------------------------------------------------------------------------
-- Sources
-- --------------------------------------------------------------------------
insert into sources (slug, name, adapter_type, enabled, poll_interval_seconds, region_default, buyers_premium_pct, buyers_premium_basis) values
  ('all_about_auctions', 'All About Auctions', 'json_catalogue', true,  1800, 'Auckland',     17.25, 'inc_gst'),
  ('number8',            'No. 8 Solutions',    'json_catalogue', true,  1800, 'Auckland',     null,  null),
  ('mainland',           'Mainland Auctions',  'json_catalogue', false, 1800, 'Christchurch', null,  null),
  ('turners',            'Turners General Goods', 'html_listing', false, 3600, null,          null,  null),
  ('trademe_email',      'Trade Me (saved search alerts)', 'email_inbound', false, 0, null, null, null),
  ('facebook',           'Facebook Marketplace', 'extension',    false, 0,    'Auckland',     null,  null),
  ('manual_clip',        'Manual clip',        'manual_clip',    true,  0,    null,           null,  null)
on conflict (slug) do nothing;

-- --------------------------------------------------------------------------
-- Brands
--
-- Taken from the PRD seed list. The authoritative list is the Shopify vendor
-- field on washpro.co.nz, which `npm run seed:brands` reads at setup. Until
-- that script has been run against the live store, source_note records that
-- these rows are unverified.
-- --------------------------------------------------------------------------
insert into brands (name, source_note) values
  ('Starline', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Rational', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Hobart', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Moffat', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Electrolux', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Convotherm', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Winterhalter', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Blue Seal', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Fimar', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Festive Devon', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Talsa', 'PRD seed list, not yet verified against the Shopify vendor field'),
  ('Bizerba', 'PRD seed list, not yet verified against the Shopify vendor field')
on conflict (name) do nothing;

insert into categories (name) values
  ('commercial dishwashers'), ('glasswashers'), ('combi ovens'), ('convection ovens'),
  ('pizza ovens'), ('deep fryers'), ('gas burners and cooktops'), ('chargrills'),
  ('bratt pans'), ('mixers'), ('refrigeration'), ('holding and display cabinets'),
  ('toasters'), ('food prep')
on conflict (name) do nothing;

-- --------------------------------------------------------------------------
-- Global negative keywords
--
-- Seed list from the PRD. The founder extends this in the Watchlist screen,
-- and the first fortnight of tuning matters more than any feature (see 17).
-- --------------------------------------------------------------------------
insert into global_negative_keywords (keyword) values
  ('domestic'), ('home'), ('kitchenaid'), ('benchtop mixer'), ('toy'),
  ('parts only'), ('for parts'), ('not working')
on conflict (keyword) do nothing;

-- --------------------------------------------------------------------------
-- Watch terms
--
-- One per seed brand plus the category terms. max_price_ex_gst is left null
-- everywhere: the founder has not given price bands yet, and a guessed ceiling
-- would silently downrank real machines.
-- --------------------------------------------------------------------------
insert into watch_terms (label, keywords, category, source_slugs)
select
  b.name,
  array[lower(b.name)],
  null,
  array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']
from brands b
on conflict do nothing;

insert into watch_terms (label, keywords, category, source_slugs) values
  ('Commercial dishwasher', array['commercial dishwasher','passthrough dishwasher','pass through dishwasher','hood dishwasher','undercounter dishwasher'], 'commercial dishwashers', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Glasswasher',           array['glasswasher','glass washer'], 'glasswashers', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Combi oven',            array['combi oven','combi steamer','combination oven'], 'combi ovens', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Convection oven',       array['convection oven'], 'convection ovens', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Pizza oven',            array['pizza oven','deck oven'], 'pizza ovens', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Deep fryer',            array['deep fryer','commercial fryer','twin basket fryer'], 'deep fryers', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Gas burners and cooktops', array['gas cooktop','six burner','6 burner','four burner','cook top','gas range'], 'gas burners and cooktops', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Chargrill',             array['chargrill','char grill','charbroiler'], 'chargrills', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Bratt pan',             array['bratt pan','bratt-pan'], 'bratt pans', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Commercial mixer',      array['planetary mixer','spiral mixer','dough mixer','commercial mixer'], 'mixers', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Refrigeration',         array['underbench fridge','upright fridge','blast chiller','commercial freezer','glass door fridge'], 'refrigeration', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Holding and display',   array['bain marie','holding cabinet','heated display','food warmer'], 'holding and display cabinets', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Conveyor toaster',      array['conveyor toaster','commercial toaster'], 'toasters', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip']),
  ('Food prep',             array['vegetable prep','food processor','meat slicer','vacuum packer','dough roller'], 'food prep', array['all_about_auctions','number8','mainland','turners','trademe_email','facebook','manual_clip'])
on conflict do nothing;
