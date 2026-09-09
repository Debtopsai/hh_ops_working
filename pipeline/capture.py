#!/usr/bin/env python3
"""
HireHospo sales-call capture.

Watches a folder for new call recordings, transcribes them with Whisper, and writes a
transcript plus a JSON sidecar ready for lead matching and coaching.

Runs on the Mac that holds the recordings — it needs local audio, so it cannot run in a
remote session.

    python3 capture.py --watch                 # poll forever
    python3 capture.py --once                  # process what is there and exit
    python3 capture.py --file /path/to/a.m4a   # one file

Source folders (--source, repeatable). Default is both:
  1. macOS Voice Memos   ~/Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings
  2. A manual drop box   ~/HireHospo/calls/inbox

Output goes to ~/HireHospo/calls/processed/<slug>/ as transcript.txt, transcript.json and
call.json. Processed files are recorded in state.json and never re-transcribed.

Requires: pip install faster-whisper     (or: pip install openai-whisper)
Neither is imported until a file actually needs transcribing.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

AUDIO_SUFFIXES = {".m4a", ".mp3", ".wav", ".mp4", ".aac", ".caf", ".flac", ".ogg", ".m4v", ".mov"}

HOME = Path.home()
VOICE_MEMOS = HOME / "Library/Group Containers/group.com.apple.VoiceMemos.shared/Recordings"
DROP_BOX = HOME / "HireHospo/calls/inbox"
OUT_ROOT = HOME / "HireHospo/calls/processed"
STATE_FILE = HOME / "HireHospo/calls/state.json"

POLL_SECONDS = 30
# A file still syncing from iCloud keeps growing. Require its size to hold steady across
# two checks this many seconds apart before touching it.
SETTLE_SECONDS = 5


# --------------------------------------------------------------------------- state


def load_state(path: Path) -> dict:
    if not path.exists():
        return {"processed": {}}
    try:
        with path.open(encoding="utf-8") as fh:
            state = json.load(fh)
    except (json.JSONDecodeError, OSError) as exc:
        print(f"  ! state file unreadable ({exc}); starting fresh", file=sys.stderr)
        return {"processed": {}}
    state.setdefault("processed", {})
    return state


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".json.tmp")
    with tmp.open("w", encoding="utf-8") as fh:
        json.dump(state, fh, indent=2, sort_keys=True)
    tmp.replace(path)


def file_key(path: Path) -> str:
    """Identify a recording by name + size, so a re-synced copy is not redone."""
    try:
        return f"{path.name}:{path.stat().st_size}"
    except OSError:
        return path.name


# --------------------------------------------------------------------------- discovery


def is_settled(path: Path) -> bool:
    """True once the file has stopped growing — i.e. iCloud has finished syncing it."""
    try:
        first = path.stat().st_size
    except OSError:
        return False
    if first == 0:
        return False
    time.sleep(SETTLE_SECONDS)
    try:
        return path.stat().st_size == first
    except OSError:
        return False


def discover(sources: list[Path], state: dict) -> list[Path]:
    found: list[Path] = []
    seen: set[Path] = set()
    for source in sources:
        if not source.is_dir():
            continue
        for path in sorted(source.rglob("*")):
            if not path.is_file() or path.suffix.lower() not in AUDIO_SUFFIXES:
                continue
            resolved = path.resolve()
            if resolved in seen:
                continue
            seen.add(resolved)
            if file_key(path) in state["processed"]:
                continue
            found.append(path)
    return found


def slugify(text: str, when: datetime) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    text = re.sub(r"[\s_-]+", "-", text)[:60].strip("-")
    return f"{when:%Y-%m-%d-%H%M}-{text or 'call'}"


# --------------------------------------------------------------------------- transcription


_MODEL = None
_BACKEND = None


def get_model(model_size: str):
    """Load faster-whisper if available, else openai-whisper. Cached across files."""
    global _MODEL, _BACKEND
    if _MODEL is not None:
        return _MODEL, _BACKEND

    try:
        from faster_whisper import WhisperModel

        print(f"  loading faster-whisper ({model_size})…")
        _MODEL, _BACKEND = WhisperModel(model_size, device="auto", compute_type="int8"), "faster"
        return _MODEL, _BACKEND
    except ImportError:
        pass

    try:
        import whisper

        print(f"  loading openai-whisper ({model_size})…")
        _MODEL, _BACKEND = whisper.load_model(model_size), "openai"
        return _MODEL, _BACKEND
    except ImportError:
        sys.exit(
            "No Whisper backend installed.\n"
            "  pip install faster-whisper      (recommended — faster, lighter)\n"
            "  pip install openai-whisper      (alternative)"
        )


def transcribe(path: Path, model_size: str, language: str) -> dict:
    model, backend = get_model(model_size)
    started = time.monotonic()

    if backend == "faster":
        segments, info = model.transcribe(str(path), language=language, vad_filter=True)
        segs = [
            {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()}
            for s in segments
        ]
        duration = round(info.duration, 2)
    else:
        result = model.transcribe(str(path), language=language)
        segs = [
            {"start": round(s["start"], 2), "end": round(s["end"], 2), "text": s["text"].strip()}
            for s in result.get("segments", [])
        ]
        duration = round(segs[-1]["end"], 2) if segs else 0.0

    return {
        "segments": segs,
        "text": " ".join(s["text"] for s in segs).strip(),
        "duration_seconds": duration,
        "transcribe_seconds": round(time.monotonic() - started, 1),
        "model": model_size,
        "backend": backend,
    }


def render_transcript(result: dict) -> str:
    lines = []
    for seg in result["segments"]:
        mm, ss = divmod(int(seg["start"]), 60)
        lines.append(f"[{mm:02d}:{ss:02d}] {seg['text']}")
    return "\n".join(lines) + "\n"


# --------------------------------------------------------------------------- processing


def process(path: Path, model_size: str, language: str, state: dict) -> Path | None:
    key = file_key(path)
    print(f"\n→ {path.name}")

    if not is_settled(path):
        print("  … still syncing or empty; leaving for the next pass")
        return None

    try:
        recorded = datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).astimezone()
    except OSError as exc:
        print(f"  ! cannot stat ({exc}); skipping", file=sys.stderr)
        return None

    slug = slugify(path.stem, recorded)
    out_dir = OUT_ROOT / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    try:
        result = transcribe(path, model_size, language)
    except Exception as exc:  # noqa: BLE001 - a bad file must not kill the watcher
        print(f"  ! transcription failed: {exc}", file=sys.stderr)
        return None

    (out_dir / "transcript.txt").write_text(render_transcript(result), encoding="utf-8")
    (out_dir / "transcript.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # The record Claude enriches: lead matching, scoring and coaching all fill in from here.
    call = {
        "call_id": slug,
        "source_file": str(path),
        "recorded_at": recorded.isoformat(),
        "duration_seconds": result["duration_seconds"],
        "transcript_path": str(out_dir / "transcript.txt"),
        "status": "awaiting_match",
        # --- filled in by the matching step (HubSpot) ---
        "lead": {
            "matched_by": None,
            "confidence": None,
            "hubspot_contact_id": None,
            "name": None,
            "company": None,
            "phone": None,
            "email": None,
            "form_name": None,
            "form_answer_equipment": None,
            "submitted_at": None,
            "speed_to_lead_hours": None,
        },
        # --- filled in from the Meta ids HubSpot embeds in hs_analytics_first_url ---
        "ad": {
            "ad_account_id": None,
            "campaign_id": None,
            "campaign_name": None,
            "adset_id": None,
            "ad_id": None,
        },
        # --- filled in by hirehospo-sales-coach ---
        "coaching": {
            "score_total": None,
            "dimensions": {},
            "compliance": {"G1_credit_before_quote": None, "G2_plus_gst": None,
                           "G3_no_approval_hype": None, "G4_no_delivery_promise": None},
            "outcome": None,
            "next_step": None,
            "reviewed_at": None,
        },
    }
    (out_dir / "call.json").write_text(
        json.dumps(call, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    mins, secs = divmod(int(result["duration_seconds"]), 60)
    words = len(result["text"].split())
    print(f"  ✓ {mins}m{secs:02d}s · {words} words · {result['transcribe_seconds']}s to transcribe")
    print(f"    {out_dir}")

    state["processed"][key] = {
        "call_id": slug,
        "processed_at": datetime.now(timezone.utc).isoformat(),
        "out_dir": str(out_dir),
    }
    return out_dir


# --------------------------------------------------------------------------- entry point


def main() -> int:
    parser = argparse.ArgumentParser(description="Transcribe HireHospo sales calls.")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--watch", action="store_true", help="poll continuously")
    mode.add_argument("--once", action="store_true", help="process pending files and exit")
    mode.add_argument("--file", type=Path, help="transcribe a single file")
    parser.add_argument("--source", type=Path, action="append",
                        help="folder to watch (repeatable; defaults to Voice Memos + drop box)")
    parser.add_argument("--model", default="small",
                        help="Whisper model: tiny/base/small/medium/large-v3 (default: small)")
    parser.add_argument("--language", default="en", help="spoken language (default: en)")
    parser.add_argument("--interval", type=int, default=POLL_SECONDS,
                        help=f"seconds between polls (default: {POLL_SECONDS})")
    args = parser.parse_args()

    if not (args.watch or args.once or args.file):
        args.once = True

    state = load_state(STATE_FILE)
    DROP_BOX.mkdir(parents=True, exist_ok=True)
    OUT_ROOT.mkdir(parents=True, exist_ok=True)

    if args.file:
        if not args.file.is_file():
            print(f"Not a file: {args.file}", file=sys.stderr)
            return 1
        process(args.file, args.model, args.language, state)
        save_state(STATE_FILE, state)
        return 0

    sources = args.source or [VOICE_MEMOS, DROP_BOX]
    live = [s for s in sources if s.is_dir()]
    for s in sources:
        print(f"{'watching' if s.is_dir() else 'not found'}: {s}")
    if not live:
        print("\nNo readable source folder.", file=sys.stderr)
        print("Either enable Voice Memos iCloud sync, or drop recordings into "
              f"{DROP_BOX} and re-run.", file=sys.stderr)
        return 1

    def sweep() -> int:
        pending = discover(live, state)
        if pending:
            print(f"\n{len(pending)} new recording(s)")
            for path in pending:
                process(path, args.model, args.language, state)
            save_state(STATE_FILE, state)
        return len(pending)

    if args.once:
        if sweep() == 0:
            print("\nNothing new.")
        return 0

    print(f"\nPolling every {args.interval}s. Ctrl-C to stop.")
    try:
        while True:
            sweep()
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\nStopped.")
        save_state(STATE_FILE, state)
    return 0


if __name__ == "__main__":
    sys.exit(main())
