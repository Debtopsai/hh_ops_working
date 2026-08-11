---
name: hirehospo-reel-caption
description: >-
  Produce ready-to-post HireHospo reel/social copy for Instagram AND Facebook, in the
  HireHospo brand voice, passing the NZ finance-ad compliance locks. Two modes. MODE A
  (transcribe): the user uploads or points to a video and wants it captioned. "write the
  reel caption", "transcribe this reel and caption it", "IG post copy for this video",
  "caption this reel", or attaches an .mp4/.mov. Reads the video's on-screen text (this
  environment has no audio speech-to-text). MODE B (build from copy): no video yet, the
  user wants a reel built from source copy or a topic. "build it for instagram and
  facebook", "turn this into a reel", "make a reel from the About Us page", "reel from
  this copy", "brand-story reel". Produces an editor-ready reel script plus the captions.
  Both modes apply every HireHospo lock: "kitchen equipment" not "gear", "minimal upfront
  cost", "low weekly payments", "pays for itself from day one", the "Comment BROCHURE"
  Instagram CTA, a link CTA for Facebook, "subject to credit approval" microcopy, "+GST"
  only on quoted prices, Auckland/NZ, and NEVER an em dash.
---

# HireHospo Reel Caption

Reel and social copy for Instagram and Facebook, in the real HireHospo voice, passing the
NZ finance-ad compliance locks. Works from an existing video (transcribe it) or from
source copy / a topic (build the reel).

**Hard rule for this skill (and everything HireHospo): never use an em dash.** Use a
comma, full stop, colon, or parentheses. See `CLAUDE.md` at the repo root for the full
voice and compliance memory; it always wins if anything here drifts from it.

## Pick the mode
- **Mode A — Transcribe an existing video.** The user uploaded or pointed to a reel and
  wants it captioned. Do Steps A1 to A3, then the shared Caption step.
- **Mode B — Build a reel from copy or a topic.** No video yet. The user wants a reel
  built from source material (e.g. the About Us page, a product, the sustainability
  mission) or a stated angle. Do Step B1, then the shared Caption step.

If it is unclear which, and a video path/attachment is present, assume Mode A; otherwise
Mode B.

## How transcription works here (Mode A, read first)
This environment has **no system ffmpeg** and **no audio speech-to-text** (no whisper,
site egress blocked). So the transcript is built from the video's **on-screen text**,
read off extracted frames. Almost every HireHospo reel burns its full script on screen
(they are watched muted), so the on-screen text is the script. If a reel ever carries
meaning in audio only, say so and ask the user for the voiceover script.

### A1 — Locate the video
Uploaded files usually land under `/root/.claude/uploads/<session>/<name>.mp4`. If the
user pasted an `@[...]` attachment, use that path. Confirm the file exists.

### A2 — Extract frames
Run the bundled helper (it auto-locates the static ffmpeg from imageio-ffmpeg; if the
import fails, run `pip install imageio-ffmpeg` once, then retry):

```
python3 .claude/skills/hirehospo-reel-caption/scripts/extract_frames.py \
  "<video_path>" "<scratchpad>/reel_frames" 2 720
```

Args: `<video_path> [out_dir] [fps] [width]`. Defaults fps=2, width=720. Use 2 fps for
most reels; bump to 3 for fast-cut edits, drop to 1 for long slow ones. It prints one
frame path per line and reports the count to stderr. Clean up the frames when done.

### A3 — Read the frames and build the transcript
Read the frames in order with the Read tool (they render as images). Transcribe the
on-screen text beat by beat, then join it into one continuous script line. Capture:
video length, aspect ratio (usually 9:16), any **real catalogue equipment** visible
(Rational, Starline, Turbofan, Convotherm, Waldorf, Blue Seal, etc.), and the end card
wording. If the reel is not what the user or you assumed, say so and show the corrected
transcript before writing the caption.

## Build a reel from copy or a topic (Mode B)
### B1 — Draft an editor-ready reel script
From the source copy or angle, write a beat-by-beat reel script in HireHospo's existing
visual system so the editor can build it:
- 9:16, watched muted, ~12 to 25s depending on the angle (brand story longer, price/speed
  shorter).
- Bold white on-screen text with **amber emphasis** on the key word per beat.
- Real kitchen footage and real catalogue equipment matched to the message.
- Open with a scroll-stopping hook (~3s); land the offer/idea through the middle; close on
  the **HireHospo end card** (wordmark + orange underline, "GET OUR LATEST STOCK LIST",
  navy "Get Stock List" button + arrow, "Subject to credit approval" microcopy).
- Output as a table: `t | On-screen text (amber = emphasis) | Visual`.

## Caption step (both modes)
Follow `references/caption-template.md`. Produce, in order:
1. **The transcript** (Mode A) or **the reel script table** (Mode B).
2. **Instagram caption** — hook, body in brand voice, "Comment BROCHURE" CTA, "subject to
   credit approval" microcopy, 8 to 12 hashtags.
3. **Facebook caption** — same story, but a **direct stock-list link CTA** (not Comment
   BROCHURE, which is IG-native), slightly more room for text, and the locked Facebook
   hashtag set. Link: **https://portal.hirehospo.com/brochure**.
4. **Notes** — compliance flags, figure decisions, and the auto-DM reminder.

Match the copy to the actual message of this video/source, not a template angle.

## Voice and compliance locks (apply every time)
- **No em dashes.** Ever.
- Say **"kitchen equipment"** or **"equipment"**. Never "gear", "kit", "kit out".
- Approved phrases: "minimal upfront cost" (not "zero"/"no upfront cost"), "low weekly
  payments", "let your equipment pay for itself" / "pays for itself from day one",
  "keep your cash working".
- **CTA:** Instagram uses "Comment BROCHURE" (auto-DM trigger, only works if the
  Meta/ManyChat auto-reply is configured, so flag it). Facebook uses a direct stock-list
  link. Both funnel to the stock list / brochure.
- **"+GST" attaches only to prices HireHospo quotes** (e.g. $4.66/day +GST). Never on a
  rhetorical figure like "a $50,000 oven", and never floating loose in a sentence.
- **"Subject to credit approval."** on finance ads. Never imply guaranteed approval.
  Approval timeframe is 1 to 2 business days; most applications under $25k.
- Real catalogue equipment/brands only. Never invent models or specs.
- Auckland-based and Auckland-serviced. NZD. NZ English.
- Do not mention Washpro in customer-facing copy. Keep "refurb" low-visibility, except
  sustainability angles where "recondition and redeploy" is a fair, low-key virtue.
- Keep green claims truthful and substantiatable (NZ Commerce Commission guidance).
- Warm, confident, direct voice. Exclamations are fine. Not a stiff "underwriter" tone.

## Output
Present the blocks in chat. If the user wants it filed, offer to save it under
`hirehospo-meta-launch/` (reels) or `hirehospo-web-copy/` (page copy), log a real video in
`03-video-scripts.md`, and pair matching ad primary-text/headline in `02-ad-copy.md`. Then
offer the auto-DM "BROCHURE" reply.
