# Facebook Instant Form — Lead Auto-Reply Email

Auto-reply sent the moment a lead submits the Facebook instant form for the
HireHospo lead-capture campaign. It confirms we've received the enquiry and
sets the expectation that **a real person will be in touch within 24 hours**.

## Files

| File | Use |
|---|---|
| `hirehospo-lead-autoreply.html` | The HTML email. Paste into your autoresponder's HTML body. |
| `hirehospo-lead-autoreply.txt` | Plain-text version. Add as the text/plain part for deliverability. |

## Subject line

**Primary:** `We've got your enquiry — we'll be in touch within 24 hours`

Alternates:
- `Thanks for your enquiry, {{first_name}} — here's what happens next`
- `Your HireHospo enquiry is in good hands`

**Preheader (hidden in-inbox line, already baked into the HTML):**
`A real person from our NZ team will be in touch within 24 hours. Here's how the next few days look.`

## Merge fields to fill in

Replace these placeholders in **both** the HTML and TXT files (or map them to
your tool's merge tags):

| Placeholder | Fill with |
|---|---|
| `{{first_name}}` | Lead's first name from the FB form (only used in the alt subject line; add a fallback like "there"). |
| `{{support_email}}` | Your reply-to / support inbox (e.g. the ThriveDesk address). |
| `{{support_phone}}` | Best contact number for the sales team. |
| `{{business_address}}` | HireHospo's NZ postal address (required for marketing-email compliance). |
| `{{unsubscribe_url}}` | Your tool's unsubscribe link. |

## What to swap before go-live

- **Logo:** the header currently sets the wordmark **"HireHospo"** in the
  display typeface (the flame accent is on "Hospo"). If you have the real logo
  PNG/SVG, drop it in as a hosted `<img>` in the header cell for a cleaner look.
  ⚠ No official logo asset was available in the repo — this is a text stand-in.
- **Button link:** points to `hirehospo.com/collections/all`. Swap to the
  campaign's SwipePages landing page if you'd rather keep leads in one funnel.

## Brand & compliance notes (why it's written this way)

Built to the HireHospo brand system — dark "service-kitchen" canvas with the
single **flame `#FF9B2E`** accent, mono type for money/labels, voice is
*underwriting, not selling* (confident, structured, zero pressure).

Compliance guardrails held in the copy:
- **No specific weekly/daily figure** — golden rule is no quote before credit
  approval, so the email sells the *model* ("low weekly payments + GST"), not a
  number.
- **"+ GST"** on every payment mention.
- **"Subject to credit approval / normal lending criteria apply"** microcopy in
  the footer.
- **"Approved in 24 to 48 hours"** — never "instant" or "guaranteed".
- No urgency/pressure language, no discount-shop wording, no invented specs.
- Washpro named as the party that delivers, installs and services (HireHospo
  does the finance).

## Colours used

| Token | Hex | Where |
|---|---|---|
| canvas | `#12141A` | card background |
| page | `#0C0E12` | outer background |
| surface | `#1C1F26` | reassurance panel, step 2/3 badges |
| line | `#2A2E37` | borders / hairlines |
| ink | `#F4F4F2` | headings / primary text |
| ink2 | `#B9BDC7` | body text |
| mute | `#838896` | captions |
| flame | `#FF9B2E` | top rule, "Hospo", step 1 badge, CTA button |
| approve | `#58C97B` | "Enquiry received" chip + check bullets |

## Testing before you send

Send yourself a test and check **Gmail (light + dark), Apple Mail / iOS Mail,
and Outlook** — dark-themed emails are the ones most worth spot-checking, since
some clients re-tint backgrounds. The layout is table-based with inline styles
and an Outlook VML button fallback, so it degrades cleanly.
