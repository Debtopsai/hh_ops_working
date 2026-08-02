# Developer Setup: Facebook Lead Auto-Reply (personal email from Urman)

Auto-reply that fires when a lead submits the **Facebook instant form** for the
HireHospo lead-capture campaign. It is written to read as a **genuine personal
email from Urman**, not a designed marketing template: plain text, first person,
warm. Urman introduces himself, says he'll be in touch soon, offers to work on
the price personally, and asks the lead to check the brochure and note the
machines they're interested in before the call.

Keep it looking like a real person typed it. Do not add a header banner, hero
image, buttons, or heavy branding.

## Files to load

| File | Where it goes |
|---|---|
| `hirehospo-lead-autoreply.txt` | The `text/plain` body. This is the canonical human version. |
| `hirehospo-lead-autoreply.html` | The `text/html` body: the same words in minimal HTML (plain paragraphs, clickable links, no template). Use if the platform sends HTML. |

If the platform lets you send **plain text only**, do that. It feels the most
personal and lands in the primary inbox.

## Send settings

| Setting | Value |
|---|---|
| From name | `Urman at HireHospo` (or `Urman` + Urman's own address if he has one) |
| From address | `info@hirehospo.com` (swap to Urman's direct address for authenticity) |
| Reply-To | `info@hirehospo.com` (or Urman's direct address) |
| Subject | `Thanks for your enquiry (a quick note from Urman)` |
| Preheader | Baked into the HTML. No action needed. |
| Send trigger | On Facebook instant-form submission. Send once, immediately. |
| Type | Transactional / personal autoresponse (not a marketing broadcast). |

Alternate subject lines:
- `Urman here, thanks for reaching out`
- `Thanks for your enquiry, I'll be in touch soon`

## Merge fields

| Token | Appears in | Set to |
|---|---|---|
| `{{first_name}}` | Greeting | Lead's first name from the FB form. Set a fallback of `there` so a blank never shows. |

Everything else is hardcoded: Urman's name, the contact details
(`info@hirehospo.com`, `+64 20 4100 9064`), and the brochure link
(`https://portal.hirehospo.com/brochure`).

## Confirm before go-live

1. **Urman's contact details.** If Urman has a direct email and/or mobile, use
   them as the From/Reply-To and in the signature. It reads as more personal
   than the general inbox, and replies reach him directly.
2. **Urman's sign-off.** Add a job title under his name if he wants one (e.g.
   "Urman, Finance"). Left off by default to keep it casual.
3. **Brochure link.** Points to `https://portal.hirehospo.com/brochure`. Confirm
   that is the customer-facing brochure URL you want leads to open.

## Opt-out / compliance

Because this is a personal reply to someone who just enquired, the body is kept
clean of a formal unsubscribe block. Two options depending on how your platform
classifies the send:

- **Transactional (1:1 reply):** the single "subject to credit approval" line is
  enough. A lead can simply reply to opt out.
- **Marketing (bulk sender rules apply):** add your platform's unsubscribe link
  and a postal address in a small footer line. NZ's Unsolicited Electronic
  Messages Act requires a working unsubscribe on commercial messages.

Ask whoever owns deliverability which applies before launch.

## Copy notes (keep these if the wording is edited)

- **Human, first person, NZ English.** No corporate template voice.
- **No specific price or weekly figure.** "Work on the price with you" is about
  personal service, not a quoted number (the golden rule: no quote before
  credit approval).
- The **"subject to credit approval"** line stays.
- No pressure or urgency language.
- No em dashes (use commas, colons or full stops).

## Test checklist

- [ ] Renders cleanly in Gmail, Apple Mail / iOS Mail and Outlook. It's plain,
      so there is little to break; check the links and the line breaks.
- [ ] `{{first_name}}` resolves (no raw `{{ }}`), and the fallback works when blank.
- [ ] `info@hirehospo.com`, `+64 20 4100 9064` and the brochure link all open.
- [ ] Plain-text part is attached and readable.
