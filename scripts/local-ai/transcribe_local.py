#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "faster-whisper>=1.2.0",
# ]
# ///

import json
import sys

from faster_whisper import WhisperModel


def main() -> int:
    payload = json.load(sys.stdin)
    audio_path = payload.get("audioPath")
    model_name = (payload.get("model") or "base").strip() or "base"
    prompt = (payload.get("prompt") or "").strip() or None

    if not audio_path:
        raise ValueError("Missing audioPath.")

    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        vad_filter=True,
        condition_on_previous_text=False,
        initial_prompt=prompt,
    )

    segment_items = list(segments)
    text = " ".join(segment.text.strip() for segment in segment_items if segment.text).strip()
    result = {
        "text": text,
        "raw": {
            "provider": "faster_whisper",
            "model": model_name,
            "language": info.language,
            "languageProbability": info.language_probability,
            "duration": info.duration,
            "segments": [
                {
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text.strip(),
                }
                for segment in segment_items
            ],
        },
    }
    json.dump(result, sys.stdout)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
