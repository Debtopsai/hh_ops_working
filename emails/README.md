# Developer Setup: Facebook Lead Auto-Reply Email

Auto-reply that fires the moment a lead submits the **Facebook instant form**
for the HireHospo lead-capture campaign. It confirms the enquiry and sets the
expectation that a real person will be in touch **within 24 hours**.

This folder is the complete handoff. Everything below is ready to configure.

## Files to load

| File | Where it goes |
|---|---|
| `hirehospo-lead-autoreply.html` | The `text/html` body of the email. Paste as-is into the ESP / autoresponder template. |
| `hirehospo-lead-autoreply.txt` | The `text/plain` alternative part. Set this as the plain-text version (do not auto-generate it) so multipart clients and spam filters see clean text. |

Both are self-contained: table-based layout, all CSS inlined, Google Fonts
loaded with web-safe fallbacks, and an Outlook (VML) button fallback. No
external images. Do not run them through a "CSS inliner" again.

## Send settings

| Setting | Value |
|---|---|
| From name | `HireHospo` |
| From address | `info@hirehospo.com` |
| Reply-To | `info@hirehospo.com` |
| Subject | `We've got your enquiry, we'll be in touch within 24 hours` |
| Preheader | Already baked into the HTML (hidden span at top). No action needed. |
| Send trigger | On Facebook instant-form submission (lead created). Send once, immediately. |
| Type | Transactional / autoresponder (not a marketing broadcast). |

Alternate subject lines (optional A/B):
- `Thanks {{first_name}}, here's what happens next`
- `Your HireHospo enquiry is in good hands`

## Merge fields to wire up

The support email and phone are **already hardcoded** in both files. Only three
tokens remain. Replace the string, or map it to your platform's merge tag:

| Token | Appears in | Set to |
|---|---|---|
| `{{first_name}}` | Alt subject line only (not the body) | Lead's first name from the FB form. Add a fallback of `there` for blank values. |
| `{{business_address}}` | Footer of HTML + TXT | HireHospo's NZ postal address (required for bulk/marketing-email compliance). |
| `{{unsubscribe_url}}` | Footer of HTML + TXT | Your platform's unsubscribe link / merge tag (e.g. `{{ unsubscribe }}`). |

> If the platform treats this strictly as a 1:1 transactional autoresponse, the
> unsubscribe line can be dropped. If there's any doubt it counts as marketing,
> keep it and populate both tokens.

## Two things to confirm before go-live

1. **Logo.** The header renders the wordmark **"HireHospo"** in the display
   typeface (flame accent on "Hospo"). If a hosted logo asset exists, replace
   the wordmark cell with a hosted `<img>` (max-width ~180px, include `alt`).
   No logo file was supplied in the repo, so this is a text stand-in.
2. **Button destination.** The "Browse the range" button points to
   `https://www.hirehospo.com/collections/all`. Swap to the campaign's
   SwipePages landing page if you'd rather keep leads inside one funnel.

## Test checklist

Send a live test to seed addresses and verify:

- [ ] Renders in **Gmail (light and dark)**, **Apple Mail / iOS Mail**, and **Outlook**. Dark-themed emails are the ones worth spot-checking, since some clients re-tint backgrounds.
- [ ] Subject and hidden preheader show correctly in the inbox preview.
- [ ] `{{first_name}}`, `{{business_address}}`, `{{unsubscribe_url}}` all resolve (no raw `{{ }}` left).
- [ ] The `info@hirehospo.com` and `+64 20 4100 9064` links open mail/dialer.
- [ ] The button and both footer links open correctly.
- [ ] Plain-text part is attached and readable.

## Copy / compliance (do not edit without a check)

The wording is built to HireHospo's finance-compliance rules. If copy changes
are requested, keep these intact:

- **No specific weekly or daily price** anywhere (no quote before credit approval).
- **"+ GST"** stays on every payment mention.
- **"Subject to credit approval; normal lending criteria apply"** stays in the footer.
- Approval framed as **"24 to 48 hours"**, never "instant" or "guaranteed".
- No urgency / pressure wording; Washpro stays credited for delivery, install and service.

## Brand colours used

| Token | Hex | Where |
|---|---|---|
| page | `#0C0E12` | outer background |
| canvas | `#12141A` | card background |
| surface | `#1C1F26` | reassurance panel, step 2/3 badges |
| line | `#2A2E37` | borders / hairlines |
| ink | `#F4F4F2` | headings / primary text |
| ink2 | `#B9BDC7` | body text |
| mute | `#838896` | captions |
| flame | `#FF9B2E` | top rule, "Hospo", step 1 badge, CTA button |
| approve | `#58C97B` | "Enquiry received" chip and check bullets |

Type: Space Grotesk (display), Inter (body), JetBrains Mono (money and labels),
each with a web-safe fallback stack.
