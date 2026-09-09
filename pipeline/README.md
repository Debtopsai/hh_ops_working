# Sales Call + Lead Capture Pipeline

Joins three sources into one record per lead: the **Meta ad** that produced them, the **HubSpot
contact** carrying their details, and the **sales call** you had with them.

## How the pieces actually fit

```
Meta lead form  ──sync──▶  HubSpot contact        ── the lead's identity + form answers
   (Brochure Form)          hs_analytics_source      + the Meta ids, embedded in
                            = PAID_SOCIAL            hs_analytics_first_url
                                   │
                                   │ hsa_cam / hsa_ad
                                   ▼
                            Meta Ads MCP           ── spend, CPL, the creative they saw
                                   │
Voice Memo ──▶ capture.py ──▶ transcript.json      ── what was said
   (your Mac)   (Whisper)          │
                                   ▼
                          match on phone (E.164)
                                   │
                                   ▼
                    tracker row + hirehospo-sales-coach review
```

### Two things worth knowing before you start

**The Meta Ads MCP cannot give you individual leads.** It is an ads *management* API — campaigns,
ad sets, creatives, audiences, insights. There is no per-submission endpoint. This does not matter,
because **HubSpot already has every lead**, synced from the Meta lead form with the campaign, ad set
and ad ids stamped into the contact. HubSpot is the lead source; Meta is the ad context. Verified
live against ad account `2139666836427566` and HubSpot portal `47462529`.

**`capture.py` has to run on your Mac.** It needs local audio files. It cannot run in a remote
Claude session. Everything after transcription — matching, enrichment, scoring — can happen in any
session, because that stage only needs the transcript plus MCP access.

---

## Setup — about ten minutes, once

### 1. Whisper

```bash
pip3 install faster-whisper
```

`faster-whisper` is the lighter, quicker option. `openai-whisper` also works; the script tries
`faster-whisper` first and falls back automatically. Models download on first run: `small` (~460 MB)
is the right default for phone audio — `medium` is noticeably better on a bad speakerphone recording
if you have the patience.

### 2. Voice Memos sync (optional but recommended)

System Settings → your name → iCloud → *Apps using iCloud* → turn on **Voice Memos**. Recordings
made on your phone then appear on the Mac at:

```
~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings/
```

That is the real path on modern macOS — **not** `~/Library/Mobile Documents/com~apple~VoiceMemos/`,
which does not exist and is a common wrong turn.

If you'd rather not sync, skip this entirely and use the drop box instead — the script watches both:

```
~/HireHospo/calls/inbox/
```

### 3. Run it

```bash
python3 pipeline/capture.py --once     # process what's there, exit
python3 pipeline/capture.py --watch    # poll every 30s, leave it running
```

To keep it running in the background, `launchd` is the clean way; `nohup python3 pipeline/capture.py
--watch &` is the two-second way.

---

## Recording calls

NZ is a **one-party consent** jurisdiction, so recording a call you are party to is lawful without
the other side's agreement. Telling people anyway tends to cost nothing and occasionally earns
trust — your call.

Quality, in order of how much it matters:

1. **AirPods or a wired headset beat speakerphone by a wide margin.** Speakerphone in a room with
   any hard surfaces produces thin, echoing audio, and Whisper's accuracy drops sharply on the
   customer's side — which is the half you most need for coaching.
2. **Rename the recording to the lead's name or phone number** before it syncs. This makes every
   match `high` confidence and takes three seconds. It is the single highest-value habit here.
3. Say the lead's name and business early in the call. Good practice anyway, and it gives the
   matcher a fallback.

---

## What you get per call

```
~/HireHospo/calls/processed/2026-09-08-0940-richard-anthony/
├── transcript.txt      timestamped, readable — [00:42] So how long have you been open?
├── transcript.json     segments with start/end times, for scoring against timestamps
└── call.json           the record: lead / ad / coaching, ready to be filled in
```

`call.json` starts with `"status": "awaiting_match"` and empty `lead`, `ad` and `coaching` blocks.
Those get filled in the next stage.

State lives in `~/HireHospo/calls/state.json`, keyed by filename + size, so nothing is transcribed
twice and a re-synced copy is not redone. Delete an entry there to force a re-run.

---

## After transcription — in any Claude session

> "Match and score the calls in `~/HireHospo/calls/processed/`"

That stage:

1. Reads each `transcript.txt`
2. Finds the lead in HubSpot by phone (last 8 digits, so `+64211751881` and `021 175 1881` match)
3. Pulls the Meta ids out of `hs_analytics_first_url` and the campaign spend from the Meta Ads MCP
4. Computes **speed to lead** — `first_called_at` − `submitted_at`
5. Runs **`hirehospo-sales-coach`** for the scored debrief
6. Appends the row to the tracker per `tracker-schema.md`

Matching rules and confidence levels are in `tracker-schema.md`. An unmatched call is never
guessed at — it lands in the tracker with the call columns filled and identity blank.

---

## Privacy

Transcripts contain customer PII and commercial terms, and live **outside this repo** under
`~/HireHospo/calls/`. Keep it that way — `.gitignore` covers the paths in case anything is ever
copied in. `data/` in this repo already holds customer PII and the repo must stay private.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| `not found:` on the Voice Memos path | iCloud sync for Voice Memos is off, or nothing has synced yet. Use the drop box in the meantime |
| `… still syncing or empty` | The file is mid-download from iCloud. It is picked up on the next pass — not an error |
| `No Whisper backend installed` | `pip3 install faster-whisper` |
| Transcript is garbled | Speakerphone audio. Try `--model medium`, and switch to a headset for future calls |
| A call re-transcribes | Its size changed — usually an iCloud re-sync. Harmless |
| Only your side is audible | The recorder was not on speaker and had no access to the earpiece. This is an iOS limitation, not a script bug |
