import os

from fastapi import FastAPI


app = FastAPI(
    title="LandlordFlip API",
    version="0.1.0",
    description="Backend scaffold for the LandlordFlip workspace.",
)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "LandlordFlip API is running"}


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host=host, port=port, reload=True)
