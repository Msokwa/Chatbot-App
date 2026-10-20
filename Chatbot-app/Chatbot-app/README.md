# Chatbot app

A chatbot web application built with FastAPI, React, Vite, and Docker Compose.

## Project structure

- `backend/` - FastAPI service managed with `uv`
- `frontend/` - React application managed with Vite
- `docker-compose.yml` - local development orchestration

## Local development

### Backend

```powershell
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`. OpenAPI documentation is available at
`http://localhost:8000/docs`.

The starter chat endpoint accepts a JSON payload:

```http
POST /chat
Content-Type: application/json

{"message":"Hello"}
```

The response is streamed as `text/plain`, so the frontend can render the assistant's
response as it arrives.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The web application is available at `http://localhost:5173`.

## Docker Compose

```powershell
docker compose up --build
```

The frontend is available at `http://localhost:5173` and the API at
`http://localhost:8000`.
