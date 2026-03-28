import json
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()

from backend.crew import run_pipeline
from backend.models.schemas import (
    GenerateRequest,
    GenerationResult,
    StatusResponse,
)
from backend.services import normalizer, tts, renderer

OUTPUTS_DIR = Path(__file__).resolve().parent / "outputs"
OUTPUTS_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="LandlordFlip API",
    version="1.0.0",
    description="AI-powered rental promo video generation pipeline.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job store (replace with Redis/DB for production)
_jobs: dict[str, StatusResponse] = {}


# ── helpers ───────────────────────────────────────────────────────────────────

async def _save_photos(files: list[UploadFile], job_id: str) -> list[str]:
    paths = []
    job_dir = OUTPUTS_DIR / job_id
    job_dir.mkdir(exist_ok=True)
    for i, file in enumerate(files):
        if not file.filename:
            continue
        suffix = Path(file.filename).suffix or ".jpg"
        dest = job_dir / f"photo_{i}{suffix}"
        content = await file.read()
        dest.write_bytes(content)
        paths.append(str(dest))
    return paths


def _run_job(job_id: str, listing_json: str, photo_paths: list[str]):
    """Background task: run the full crew pipeline and update job store."""
    from backend.models.schemas import GenerateRequest

    try:
        _jobs[job_id] = StatusResponse(job_id=job_id, status="running", stage="Analyst")

        req = GenerateRequest(**json.loads(listing_json))
        listing = normalizer.normalize(req, photo_count=len(photo_paths))

        pipeline_result = run_pipeline(listing)

        positioning = pipeline_result["market_positioning"]
        hooks_result = pipeline_result["hooks_and_scripts"]
        scene_plan = pipeline_result["scene_plan"]
        critique = pipeline_result["critique"]

        selected_idx = hooks_result.selected_variant_index
        selected_script = hooks_result.variants[selected_idx] if hooks_result.variants else None
        full_script = (
            f"{selected_script.hook} {selected_script.body_copy} {selected_script.cta}"
            if selected_script
            else ""
        )

        _jobs[job_id] = StatusResponse(job_id=job_id, status="running", stage="Voiceover")
        voice_path, _ = tts.generate_voiceover(full_script, job_id)

        _jobs[job_id] = StatusResponse(job_id=job_id, status="running", stage="Rendering")
        video_path = renderer.render_video(
            scenes=scene_plan.scene_sequence,
            photo_paths=photo_paths,
            job_id=job_id,
            voiceover_path=voice_path,
        )

        video_url = f"/api/video/{job_id}" if video_path else None
        voice_url = f"/api/audio/{job_id}" if voice_path else None

        result = GenerationResult(
            job_id=job_id,
            listing=listing,
            market_positioning=positioning,
            hooks=hooks_result.hooks,
            scripts=hooks_result.variants,
            selected_script_index=selected_idx,
            scene_sequence=scene_plan.scene_sequence,
            confidence_score=critique.confidence_score,
            strengths=critique.strengths,
            weaknesses=critique.weaknesses,
            improvement_notes=critique.improvement_notes,
            voiceover_url=voice_url,
            video_url=video_url,
        )

        _jobs[job_id] = StatusResponse(job_id=job_id, status="done", result=result)

    except Exception as exc:
        _jobs[job_id] = StatusResponse(job_id=job_id, status="error", error=str(exc))
        raise


# ── endpoints ─────────────────────────────────────────────────────────────────

@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "LandlordFlip API is running"}


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/generate", response_model=StatusResponse)
async def generate(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    price: str = Form(...),
    neighborhood: str = Form(...),
    square_footage: str = Form(None),
    beds: str = Form(None),
    baths: str = Form(None),
    amenities: str = Form("[]"),
    target_renter: str = Form("Young Professional"),
    leasing_special: str = Form(None),
    photos: list[UploadFile] = File(default=[]),
):
    job_id = str(uuid.uuid4())

    photo_paths = await _save_photos(photos, job_id)

    amenity_list: list[str] = json.loads(amenities) if amenities else []

    req = GenerateRequest(
        title=title,
        price=price,
        neighborhood=neighborhood,
        square_footage=square_footage,
        beds=beds,
        baths=baths,
        amenities=amenity_list,
        target_renter=target_renter,
        leasing_special=leasing_special,
    )

    _jobs[job_id] = StatusResponse(job_id=job_id, status="pending")

    listing_json = req.model_dump_json()
    background_tasks.add_task(_run_job, job_id, listing_json, photo_paths)

    return StatusResponse(job_id=job_id, status="pending")


@app.get("/api/status/{job_id}", response_model=StatusResponse)
def get_status(job_id: str) -> StatusResponse:
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/video/{job_id}")
def get_video(job_id: str):
    video_path = OUTPUTS_DIR / f"{job_id}_video.mp4"
    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")
    return FileResponse(str(video_path), media_type="video/mp4")


@app.get("/api/audio/{job_id}")
def get_audio(job_id: str):
    audio_path = OUTPUTS_DIR / f"{job_id}_voice.mp3"
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio not found")
    return FileResponse(str(audio_path), media_type="audio/mpeg")


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
