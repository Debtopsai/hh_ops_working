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

1. **Logo.** The header renders the wordmark **"HireHospo"** in white Merriweather
   inside the navy header band, with **"FINANCE"** in gold beside it (mirroring the
   live site header). If a hosted logo asset exists, replace the wordmark with a
   hosted `<img>` (max-width ~180px, include `alt`). No logo file was supplied in
   the repo, so this is a text stand-in.
2. **Button destination.** The "Browse the range" button points to
   `https://www.hirehospo.com/collections/all`. Swap to the campaign's
   SwipePages landing page if you'd rather keep leads inside one funnel.

## Test checklist

Send a live test to seed addresses and verify:

- [ ] Renders in **Gmail (light and dark)**, **Apple Mail / iOS Mail**, and **Outlook**. It's a light design, so spot-check dark-mode clients (Gmail app, Outlook.com) to confirm the navy header band and gold button aren't re-tinted.
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

Light navy + gold palette, matching the live HireHospo Finance catalog
(portal.hirehospo.com). The gold button uses navy text, mirroring the site's
"Enquiry List" button.

| Token | Hex | Where |
|---|---|---|
| navy | `#1C3D5A` | header band, headings, primary text, step 2/3 numbers, footer links |
| gold | `#F4A62A` | accent: gold rule, "FINANCE", step 1 badge, check ticks, CTA button |
| page | `#F4F5F7` | outer background |
| card | `#FFFFFF` | card background |
| panel | `#F6F8FA` | reassurance panel |
| navy-tint | `#EEF2F6` | step 2/3 number badges |
| line | `#E5E8EC` | borders / hairlines |
| body | `#3F4A57` | body text |
| muted | `#8A94A0` / `#A2ABB6` | captions / microcopy |
| gold-tint | `#FDF4E4` | "Enquiry received" chip background |

> Hex values are eyeballed from a screenshot of the live catalog. Swap for the
> official brand hex codes if you have them.

Type: Merriweather (headlines, serif), Inter (body and labels), each with a
web-safe fallback stack (Georgia/serif for Merriweather; Helvetica/Arial for
Inter). These are HireHospo's brand typefaces, confirmed from hirehospo.com.
