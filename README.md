# LandlordFlip

This repo is now organized as a simple full-stack workspace for building `LandlordFlip`.

## Project structure

```text
backend/   FastAPI API scaffold
frontend/  Vite + React app for LandlordFlip
Procfile   Deployment entrypoint for the backend
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/main.py
```

The API runs on `http://localhost:8000`.

## Notes

- `frontend/` contains the current LandlordFlip product UI.
- `backend/` is a clean API scaffold you can extend as the app grows.
- The frontend and backend are separated on purpose so product work can start without root-level clutter.

## Deployment

For PaaS-style backend deployments, use:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```
