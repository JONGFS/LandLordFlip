"""
Deterministic video renderer using MoviePy.
Assembles a 9:16 vertical MP4 from photos + scene plan + optional voiceover.
Falls back gracefully if moviepy or photos are unavailable.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from backend.models.schemas import SceneItem

OUTPUTS_DIR = Path(__file__).resolve().parents[1] / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

VIDEO_W = 1080
VIDEO_H = 1920
FONT_SIZE = 60
FONT_COLOR = "white"


def render_video(
    scenes: list[SceneItem],
    photo_paths: list[str],
    job_id: str,
    voiceover_path: Optional[str] = None,
) -> str | None:
    """
    Render a vertical MP4 from scene plan and photos.

    Returns the path to the rendered MP4, or None on failure.
    """
    if not photo_paths:
        return None

    try:
        from moviepy.editor import (
            AudioFileClip,
            CompositeVideoClip,
            ImageClip,
            TextClip,
            concatenate_videoclips,
        )
        from PIL import Image
        import numpy as np
    except ImportError as exc:
        print(f"[Renderer] Missing dependency: {exc}")
        return None

    clips = []

    for scene in scenes:
        idx = min(scene.photo_index, len(photo_paths) - 1)
        photo_file = photo_paths[idx]

        if not Path(photo_file).exists():
            continue

        # Load + crop to 9:16
        img = Image.open(photo_file).convert("RGB")
        img_w, img_h = img.size
        target_ratio = VIDEO_W / VIDEO_H

        if img_w / img_h > target_ratio:
            # Wider than needed — crop width
            new_w = int(img_h * target_ratio)
            left = (img_w - new_w) // 2
            img = img.crop((left, 0, left + new_w, img_h))
        else:
            # Taller than needed — crop height
            new_h = int(img_w / target_ratio)
            top = (img_h - new_h) // 2
            img = img.crop((0, top, img_w, top + new_h))

        img = img.resize((VIDEO_W, VIDEO_H), Image.LANCZOS)
        frame = np.array(img)

        base_clip = (
            ImageClip(frame)
            .set_duration(scene.duration_sec)
            .set_fps(30)
        )

        # Overlay text
        if scene.overlay_text:
            try:
                txt_clip = (
                    TextClip(
                        scene.overlay_text,
                        fontsize=FONT_SIZE,
                        color=FONT_COLOR,
                        font="DejaVu-Sans-Bold",
                        stroke_color="black",
                        stroke_width=2,
                        method="caption",
                        size=(VIDEO_W - 80, None),
                    )
                    .set_position(("center", VIDEO_H - 300))
                    .set_duration(scene.duration_sec)
                )
                scene_clip = CompositeVideoClip([base_clip, txt_clip])
            except Exception:
                scene_clip = base_clip
        else:
            scene_clip = base_clip

        clips.append(scene_clip)

    if not clips:
        return None

    final = concatenate_videoclips(clips, method="compose")

    if voiceover_path and Path(voiceover_path).exists():
        try:
            audio = AudioFileClip(voiceover_path).subclip(0, min(final.duration, AudioFileClip(voiceover_path).duration))
            final = final.set_audio(audio)
        except Exception as exc:
            print(f"[Renderer] Could not attach audio: {exc}")

    output_path = str(OUTPUTS_DIR / f"{job_id}_video.mp4")
    final.write_videofile(
        output_path,
        fps=30,
        codec="libx264",
        audio_codec="aac",
        verbose=False,
        logger=None,
    )

    return output_path
