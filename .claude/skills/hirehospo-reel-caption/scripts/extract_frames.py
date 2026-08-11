#!/usr/bin/env python3
"""
Extract evenly-spaced frames from a reel/video so the on-screen text can be read.

This environment has NO system ffmpeg and NO audio speech-to-text. It DOES have a
static ffmpeg binary shipped with the pip package imageio-ffmpeg, which this script
locates automatically. The transcript is therefore built from ON-SCREEN TEXT read
off the frames, not from audio.

Usage:
    python3 extract_frames.py <video_path> [out_dir] [fps] [width]

Defaults: out_dir = <scratchpad>/reel_frames, fps = 2, width = 720
Prints one absolute frame path per line (sorted) on success.
"""
import os
import subprocess
import sys


def find_ffmpeg():
    # Preferred: the static binary bundled with imageio-ffmpeg (pip install imageio-ffmpeg).
    try:
        import imageio_ffmpeg
        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and os.path.exists(exe):
            return exe
    except Exception:
        pass
    # Fallback: a system ffmpeg, if one ever exists.
    from shutil import which
    exe = which("ffmpeg")
    if exe:
        return exe
    sys.exit(
        "ERROR: no ffmpeg found. Install the static binary with:\n"
        "    pip install imageio-ffmpeg"
    )


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: extract_frames.py <video_path> [out_dir] [fps] [width]")

    video = os.path.abspath(sys.argv[1])
    if not os.path.exists(video):
        sys.exit("ERROR: video not found: " + video)

    out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.join(
        os.getcwd(), "reel_frames"
    )
    fps = sys.argv[3] if len(sys.argv) > 3 else "2"
    width = sys.argv[4] if len(sys.argv) > 4 else "720"

    os.makedirs(out_dir, exist_ok=True)
    # Clear any stale frames so numbering stays clean between runs.
    for f in os.listdir(out_dir):
        if f.startswith("f_") and f.endswith(".png"):
            os.remove(os.path.join(out_dir, f))

    ffmpeg = find_ffmpeg()
    pattern = os.path.join(out_dir, "f_%03d.png")
    cmd = [
        ffmpeg, "-y", "-i", video,
        "-vf", "fps={},scale={}:-1".format(fps, width),
        pattern,
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        sys.stderr.write(proc.stderr[-2000:] + "\n")
        sys.exit("ERROR: ffmpeg failed (see stderr above).")

    frames = sorted(
        os.path.join(out_dir, f)
        for f in os.listdir(out_dir)
        if f.startswith("f_") and f.endswith(".png")
    )
    if not frames:
        sys.exit("ERROR: no frames were produced.")

    sys.stderr.write(
        "Extracted {} frames at {} fps (width {}) to {}\n".format(
            len(frames), fps, width, out_dir
        )
    )
    for fr in frames:
        print(fr)


if __name__ == "__main__":
    main()
