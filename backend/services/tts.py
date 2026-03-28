"""
Text-to-speech service using OpenAI TTS.
Falls back gracefully if OPENAI_API_KEY is not set.
"""

from __future__ import annotations

import os
from pathlib import Path


OUTPUTS_DIR = Path(__file__).resolve().parents[1] / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)


def generate_voiceover(script_text: str, job_id: str) -> tuple[str | None, float | None]:
    """
    Generate a voiceover MP3 for the given script text.

    Returns:
        (file_path, duration_seconds) or (None, None) if TTS is unavailable.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None, None

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        audio_path = OUTPUTS_DIR / f"{job_id}_voice.mp3"

        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=script_text,
        )
        response.stream_to_file(str(audio_path))

        # Estimate duration: ~150 words per minute
        word_count = len(script_text.split())
        duration = round((word_count / 150) * 60, 1)

        return str(audio_path), duration

    except Exception as exc:
        print(f"[TTS] Failed to generate voiceover: {exc}")
        return None, None
