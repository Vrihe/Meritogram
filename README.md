# This is a fork of the original project: the original uses an API for code review, while this fork uses Ollama.

# Student Learning Dashboard

Desktop + web dashboard with FastAPI backend, React/Electron frontend, MongoDB, and Ollama-based code review.

## Requirements

- Docker Desktop (Compose v2 enabled)
- Node.js 18+
- npm 9+

## Quick Start (recommended)

From the project root:

```powershell
cd "c:\Users\Смерть в нищите\Desktop\da v2\Learning"
npm install
npm run dev:desktop:ai
```

What this does:

1. Creates `Backend/.env` from `Backend/.env.example` if missing.
2. Pulls Ollama model `qwen2.5-coder:3b` (faster) into Docker volume.
3. Starts `ollama` + `backend` in Docker and opens Electron desktop app locally.

Open:

- Desktop app: opens automatically
- Web frontend (if running docker web mode): http://localhost:5173
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs

## First Run Notes

- The first launch may take several minutes (image build + model pull).
- Subsequent launches are faster because Docker cache and Ollama volume are reused.

## Daily Run Commands

- Desktop mode with AI (Docker backend + local Electron auto-open):

```powershell
npm run dev:desktop:ai
```

- Desktop mode without model pre-pull:

```powershell
npm run dev:desktop
```

- Docker web mode with AI (no Electron window):

```powershell
npm run dev:docker:ai
```

- Docker web mode without pre-pulling model (no Electron window):

```powershell
npm run dev:docker
```

- Stop services:

```powershell
npm run stop
```

## Ollama Helper Commands

- Start only Ollama service:

```powershell
npm run ollama:up
```

- Pull model manually:

```powershell
npm run ollama:pull
```

- Pull bigger but slower model (optional):

```powershell
npm run ollama:pull:7b
```

- List models in container volume:

```powershell
npm run ollama:list
```

## Environment Setup

`Backend/.env.example` already contains defaults for Ollama:

- `OLLAMA_URL=http://localhost:11434` for local (non-Docker) run.
- In Docker Compose backend uses internal URL `http://ollama:11434`.

Add your own values in `Backend/.env` for:

- `MONGO_URL`
- `SECRET_KEY`
- `GOOGLE_CLIENT_ID`

## Troubleshooting

- If Docker is not running, start Docker Desktop first.
- If ports are busy, free `5173`, `8000`, and `11434`.
- If AI says model is missing, run:

```powershell
npm run ollama:pull
```
