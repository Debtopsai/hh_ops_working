---
name: hirehospo-reel-caption
description: >-
  Transcribe a HireHospo reel/video from its on-screen text and generate a
  ready-to-post Instagram caption in the HireHospo brand voice. Use whenever the
  user uploads or points to a video and wants the caption/description written from
  it: "write the reel caption", "transcribe this reel and caption it", "IG post copy
  for this video", "caption this reel", "generate the description for this reel", or
  attaches an .mp4/.mov and asks for Instagram copy. Reads the video's on-screen text
  (this environment has no audio speech-to-text), then applies every HireHospo voice
  and compliance lock: "kitchen equipment" not "gear", "minimal upfront cost", "low
  weekly payments", "pays for itself from day one", the "Comment BROCHURE" CTA,
  "subject to credit approval" microcopy, "+GST" only on quoted prices, Auckland/NZ,
  and NEVER an em dash.
---

# HireHospo Reel Caption

One reel in, an on-screen-text transcript plus a ready-to-post Instagram caption out,
in the real HireHospo voice and passing the NZ finance-ad compliance locks.

**Hard rule for this skill (and everything HireHospo): never use an em dash.** Use a
comma, full stop, colon, or parentheses. See `CLAUDE.md` at the repo root for the full
voice and compliance memory; it always wins if anything here drifts from it.

## How transcription works here (read this first)
This environment has **no system ffmpeg** and **no audio speech-to-text** (no whisper,
site egress blocked). So the transcript is built from the video's **on-screen text**,
read off extracted frames. Almost every HireHospo reel burns its full script on screen
(they are watched muted), so the on-screen text is the script. If a reel ever carries
meaning in audio only, say so and ask the user for the voiceover script.

## Step 1 — Locate the video
Uploaded files usually land under `/root/.claude/uploads/<session>/<name>.mp4`. If the
user pasted an `@[...]` attachment, use that path. Confirm the file exists before
extracting.

## Step 2 — Extract frames
Run the bundled helper (it auto-locates the static ffmpeg from imageio-ffmpeg; if the
import fails, run `pip install imageio-ffmpeg` once, then retry):

```
python3 .claude/skills/hirehospo-reel-caption/scripts/extract_frames.py \
  "<video_path>" "<scratchpad>/reel_frames" 2 720
```

Args: `<video_path> [out_dir] [fps] [width]`. Defaults fps=2, width=720. Use 2 fps for
most reels; bump to 3 for fast-cut edits, drop to 1 for long slow ones. It prints one
frame path per line and reports the count and video info to stderr.

## Step 3 — Read the frames and build the transcript
Read the frames in order with the Read tool (they render as images). Transcribe the
on-screen text beat by beat, then join it into one continuous script line. Also capture:
video length, aspect ratio (usually 9:16), any **real catalogue equipment** visible
(Rational, Starline, Turbofan, Convotherm, Waldorf, Blue Seal, etc.), and the end card
wording. If the reel is not what the user or you assumed, say so and show the corrected
transcript before writing the caption.

## Step 4 — Write the caption
Follow `references/caption-template.md`. Produce: (1) the transcript, (2) a primary
caption, (3) a shorter alt, (4) notes. Match the caption's message to *this* video's
actual script, not a template angle.

## Voice and compliance locks (apply every time)
- **No em dashes.** Ever.
- Say **"kitchen equipment"** or **"equipment"**. Never "gear", "kit", "kit out".
- Approved phrases: "minimal upfront cost" (not "zero"/"no upfront cost"), "low weekly
  payments", "let your equipment pay for itself" / "pays for itself from day one",
  "keep your cash working".
- **CTA (Instagram):** "Comment BROCHURE" to get the stock list. It only works if the
  Meta/ManyChat auto-reply is configured, so flag that and offer to write the auto-DM.
- **"+GST" attaches only to prices HireHospo quotes** (e.g. $4.66/day +GST). Never on a
  rhetorical figure like "a $50,000 oven", and never floating loose in a sentence.
- **"Subject to credit approval."** on finance ads. Never imply guaranteed approval.
  Approval timeframe is 1 to 2 business days; most applications under $25k.
- Real catalogue equipment/brands only. Never invent models or specs.
- Auckland-based and Auckland-serviced. NZD. NZ English.
- Do not mention Washpro in customer-facing caption copy. Keep "refurb" low-visibility.
- Warm, confident, direct voice. Exclamations are fine. Not a stiff "underwriter" tone.

## Output
Present the four blocks in chat. If the user wants it filed, offer to log the reel as a
documented video in `hirehospo-meta-launch/03-video-scripts.md` and pair matching ad
primary-text/headline in `02-ad-copy.md`. Then offer the auto-DM "BROCHURE" reply.
