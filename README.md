# Personalized Travel Itinerary Planner

A beginner-friendly full-stack project that helps you plan a simple trip.

You enter a destination, trip length, budget, and travel style. The app then shows a sample day-by-day itinerary. Milestone 1 uses a simple local generator — no paid APIs and no real API keys.

## Project structure

```
personalized-travel-itinerary-planner/
├── frontend/     React + Vite + JavaScript
├── backend/      Python FastAPI
├── README.md
└── .gitignore
```

## What you need installed

- [Node.js](https://nodejs.org/) (LTS) so you can run the React app
- [Python 3.10+](https://www.python.org/) so you can run the FastAPI server

## Setup steps

Do these in order. Open a terminal in the project folder (`personalized-travel-itinerary-planner`).

### 1. Frontend environment file

Copy the example file, then edit it if your backend URL is different.

**Windows (PowerShell):**

```powershell
copy frontend\.env.example frontend\.env
```

**macOS / Linux:**

```bash
cp frontend/.env.example frontend/.env
```

### 2. Backend environment file

**Windows (PowerShell):**

```powershell
copy backend\.env.example backend\.env
```

**macOS / Linux:**

```bash
cp backend/.env.example backend/.env
```

These files only contain placeholder names. Do not put real secrets in them for this milestone.

### 3. Install and start the backend

**Windows (PowerShell):**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

**macOS / Linux:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The API should start at `http://localhost:8000`.

Health check (keep this running, then open a second terminal or a browser):

- `http://localhost:8000/health`
- You should see JSON like `{"status":"ok"}`

### 4. Install and start the frontend

Open a **new** terminal in the project folder (leave the backend running).

```bash
cd frontend
npm install
npm run dev
```

The UI should start at `http://localhost:5173`.

## How to use the app

1. Type a destination (for example, `Kyoto`).
2. Choose how many days you will travel.
3. Pick a budget.
4. Pick a travel style: adventure, relaxation, culture, or food.
5. Click **Generate Itinerary**.
6. A simple day-by-day plan appears on the page.

## Useful commands

| Where | Command | What it does |
| --- | --- | --- |
| `frontend/` | `npm run dev` | Starts the React development server |
| `frontend/` | `npm run build` | Builds files for production |
| `backend/` (venv on) | `uvicorn main:app --reload` | Starts the FastAPI server with auto-reload |

## Notes for this milestone

- The itinerary is generated locally in the frontend so you can submit a working demo without paid APIs.
- The backend currently exposes a health endpoint so you can prove the API runs.
- Later milestones can connect the form to FastAPI and add more features.
