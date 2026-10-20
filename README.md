# WanderWise — Personalized Travel Itinerary Planner

An autonomous, full-stack AI travel planner that creates custom, day-by-day travel itineraries. WanderWise features multi-step preference collection, intelligent geographic route sequencing to reduce backtracking, realistic visit durations, estimated transit buffers, and vibe-based personalization powered by the Groq LLM API and Supabase database.

---

## 🌟 Key Features

1. **Multi-Step Preference Engine (Epic 3)**:
   - Collects destination, dates (1 to 14 days), group size, budget, primary travel style, specific interests, pace, and dietary restrictions.
   - Comprehensive client-side and server-side validation with helpful inline feedback.
   - Preference review screen before generating itineraries.

2. **AI-Powered Itinerary Generation (Epic 4.1)**:
   - Uses Groq API (`openai/gpt-oss-20b` or `llama-3.3-70b-versatile`) with structured prompt engineering.
   - Produces clean, typed JSON matching the exact day count requested.
   - Detailed morning, afternoon, and evening activities with specific times, durations, and local tips.
   - High-quality deterministic local fallback generator if the AI provider is offline or rate-limited.

3. **Smart Route & Time Optimization (Epic 4.2)**:
   - Attractions ordered in sensible geographic sequence to minimize backtracking.
   - Realistic visit durations and estimated transit times between consecutive stops.
   - Visual route flow representation (`1st Stop ➔ 2nd Stop ➔ 3rd Stop`).

4. **Vibe-Based Personalization (Epic 4.3)**:
   - Explains the rationale behind activity curation based on traveler style, interests, pace, and budget.
   - Practical budget allocation guidance without inventing fictitious exact prices.
   - Practical tips and sensible alternative activities for each day.

5. **Full Productization & UX (Epic 5)**:
   - Modern, responsive design system built with custom Vanilla CSS and Google Fonts (*Plus Jakarta Sans*).
   - Dynamic loading indicators with animated step tickers.
   - Day switcher tabs (`View All`, `Day 1`, `Day 2`, ...).
   - One-click clipboard copy and print/PDF export features.

6. **Secure Supabase Persistence (Epic 2)**:
   - Secure server-side database integration to save generated trips.
   - Row-Level Security (RLS) setup and least-privilege SQL migration scripts (`supabase_rls_setup.sql`).
   - Service-role key kept exclusively on the backend, never leaked to the client.

7. **Production Deployment Ready (Epic 6)**:
   - Ready-to-use deployment manifests: `render.yaml` for FastAPI backend, `vercel.json` and `netlify.toml` for Vite frontend.

---

## 🏗️ Technology Stack & Architecture

- **Frontend**: React 18, Vite 5, Vanilla CSS Design System, JavaScript (ESM)
- **Backend**: FastAPI, Pydantic v2, Uvicorn, Python 3.10+
- **AI Provider**: Groq API (`groq` Python SDK)
- **Database**: Supabase PostgreSQL with PostgREST
- **Deployment**: Render (Backend Web Service), Vercel / Netlify (Frontend Static/SPA)

```
[ User Browser (React/Vite) ]
              │
       HTTP / JSON
              ▼
[ FastAPI Backend (Python) ] ◄───► [ Groq Cloud LLM ]
              │
         PostgREST
              ▼
[ Supabase PostgreSQL (RLS) ]
```

---

## 📁 Repository Structure

```
personalized-travel-itinerary-planner/
├── backend/
│   ├── .env.example              # Backend environment template
│   ├── fallback_generator.py     # Deterministic local fallback planner
│   ├── main.py                   # FastAPI application & API endpoints
│   ├── requirements.txt          # Python dependencies
│   └── llm/
│       ├── __init__.py           # Package exports
│       ├── base.py               # Abstract base class for LLM providers
│       ├── groq_provider.py      # Groq API async integration
│       └── prompts.py            # Structured prompt engineering builder
├── frontend/
│   ├── .env.example              # Frontend environment template
│   ├── index.html                # HTML entry point with SEO metadata
│   ├── package.json              # NPM dependencies & scripts
│   ├── vercel.json               # Vercel deployment rewrite rules
│   └── src/
│       ├── App.css               # WanderWise modern design system
│       ├── App.jsx               # Main React application & multi-step form
│       ├── index.css             # Base styles & typography
│       ├── main.jsx              # Application bootstrap
│       └── lib/
│           ├── supabase.js       # Safe frontend Supabase client helper
│           └── travelPrompt.js   # Preference schema & validation
├── netlify.toml                  # Netlify deployment configuration
├── render.yaml                   # Render deployment configuration
├── run_backend.ps1               # Windows PowerShell script to start backend
├── run_frontend.ps1              # Windows PowerShell script to start frontend
├── supabase_rls_setup.sql        # Supabase table creation, grants & RLS policies
└── README.md                     # Project documentation
```

---

## ⚙️ Environment Configuration

### 1. Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```env
APP_NAME=Personalized Travel Itinerary Planner
APP_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Groq AI Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-server-only
```

> [!IMPORTANT]
> Never commit `.env` files to Git. `SUPABASE_SERVICE_ROLE_KEY` must remain strictly server-side and never be included in frontend builds.

### 2. Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

---

## 🗄️ Supabase Table & Row-Level Security (RLS) Setup

If your Supabase project throws `42501` or `permission denied for table itineraries`, run the provided SQL setup script:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to the **SQL Editor** on the left menu.
3. Open `supabase_rls_setup.sql` from this repository, paste the contents into the query box, and click **Run**.

### Included SQL Commands:
```sql
-- Ensure public.itineraries table exists
CREATE TABLE IF NOT EXISTS public.itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    destination TEXT NOT NULL,
    days INT NOT NULL CHECK (days >= 1 AND days <= 14),
    budget NUMERIC NOT NULL CHECK (budget > 0),
    travel_style TEXT NOT NULL,
    itinerary JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS) safely
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Grant required permissions to PostgREST roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.itineraries TO service_role;
GRANT SELECT, INSERT ON TABLE public.itineraries TO anon, authenticated;

-- Allow public inserts
DROP POLICY IF EXISTS "Allow public insert to itineraries" ON public.itineraries;
CREATE POLICY "Allow public insert to itineraries"
ON public.itineraries FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow public queries
DROP POLICY IF EXISTS "Allow public select from itineraries" ON public.itineraries;
CREATE POLICY "Allow public select from itineraries"
ON public.itineraries FOR SELECT TO anon, authenticated
USING (true);
```

---

## 🚀 Running the Project Locally (Windows PowerShell)

### Method A: One-Click PowerShell Scripts

From the repository root:

**Terminal 1 (Backend):**
```powershell
.\run_backend.ps1
```

**Terminal 2 (Frontend):**
```powershell
.\run_frontend.ps1
```

---

### Method B: Manual Commands

#### 1. Start the Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health Check: `http://127.0.0.1:8000/health`
- Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`

#### 2. Start the Frontend

Open a new PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 📡 API Endpoint Documentation

| Method | Endpoint | Description | Request Body / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server status and provider check | None |
| `GET` | `/health/supabase` | Validates Supabase database connectivity | None |
| `POST` | `/generate-itinerary` | Generates a structured travel itinerary | `ItineraryRequest` JSON |
| `POST` | `/trips` | Saves a trip to Supabase `itineraries` table | `TripCreate` JSON |
| `GET` | `/trips` | Lists recent saved trips (limit 10–50) | `?limit=10` |

### Sample `POST /generate-itinerary` Request:
```json
{
  "destination": "Kyoto, Japan",
  "days": 3,
  "budget": 1200,
  "travel_style": "culture",
  "interests": ["culture", "food"],
  "pace": "balanced",
  "travelers": 2,
  "dietary": "vegetarian"
}
```

### Sample Response Structure:
```json
{
  "status": "ok",
  "source": "ai",
  "is_fallback": false,
  "itinerary": {
    "destination": "Kyoto, Japan",
    "summary": "A 3-day cultural exploration...",
    "personalization": {
      "travel_style": "Culture-centric visits...",
      "interests": ["culture", "food"],
      "pace": "Balanced spacing with unhurried dining...",
      "budget_strategy": "Averaging $400/day across sights and meals...",
      "dietary_notes": "Curated with vegetarian Japanese specialties..."
    },
    "days": [
      {
        "day": 1,
        "title": "Historic Temples and Gion",
        "route_order": ["Kiyomizu-dera", "Gion district", "Yasaka Shrine"],
        "morning": {
          "time": "9:00 AM",
          "activity": "Kiyomizu-dera Temple",
          "duration_minutes": 90,
          "travel_from_previous_minutes": 0,
          "notes": "Arrive early to avoid crowds."
        },
        "afternoon": {
          "time": "1:00 PM",
          "activity": "Lunch & walking in Gion",
          "duration_minutes": 120,
          "travel_from_previous_minutes": 25,
          "notes": "Sample seasonal vegetarian cuisine."
        },
        "evening": {
          "time": "6:00 PM",
          "activity": "Yasaka Shrine & Maruyama Park",
          "duration_minutes": 90,
          "travel_from_previous_minutes": 20,
          "notes": "Atmospheric evening lantern walk."
        },
        "estimated_daily_budget": "Moderate entry and transit allocations.",
        "travel_tips": ["Use the Kyoto City Bus 1-day pass."],
        "alternatives": ["Switch to an indoor tea ceremony if raining."]
      }
    ]
  }
}
```

---

## 🚢 Production Deployment

### 1. Backend on [Render](https://render.com)
The project includes a ready `render.yaml` Blueprint file:
1. Connect your GitHub repository to Render.
2. Create a new **Blueprint** service pointing to the repository.
3. Configure the following environment variables in Render:
   - `GROQ_API_KEY`: Your Groq API key
   - `GROQ_MODEL`: `openai/gpt-oss-20b` (or preferred model)
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `CORS_ORIGINS`: Your production frontend URL (e.g. `https://your-app.vercel.app`)
4. Build command: `pip install -r backend/requirements.txt`
5. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### 2. Frontend on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
The project includes `frontend/vercel.json` and root `netlify.toml`:
1. Import the repository into Vercel or Netlify.
2. Set Root Directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable:
   - `VITE_API_URL`: Your deployed Render backend URL (e.g. `https://travel-itinerary-backend.onrender.com`)

---

## 📋 Final Verification Checklist

| Check | Component | Status | Notes |
| :--- | :--- | :---: | :--- |
| Python syntax & imports | Backend | ✅ PASSED | Dual-import paths support root and subfolder execution |
| FastAPI Health Endpoint | Backend | ✅ PASSED | `GET /health` returns 200 OK |
| Supabase Health Endpoint | Backend | ✅ PASSED | `GET /health/supabase` returns 200 OK |
| Input Validation | Backend | ✅ PASSED | 422 returned on invalid days, budget, or destination |
| Groq AI Generation | Backend | ✅ PASSED | Real structured JSON returned with route order and times |
| Deterministic Fallback | Backend | ✅ PASSED | Validated when AI provider is offline or missing key |
| Frontend Production Build | Frontend | ✅ PASSED | `npm run build` completes with 0 errors |
| Frontend UI & Aesthetics | Frontend | ✅ PASSED | Full design system with stepper, tabs, route flow, badges |
| RLS Security | Database | ✅ PASSED | Service-role key server-only; RLS migration provided |

---

## ⚠️ Known Limitations & Notes

- **Transit Times**: Estimated travel times between activities are heuristic approximations designed for scheduling and pacing; real-world conditions (live traffic, transit delays) vary.
- **Supabase Insert Permissions**: If you receive an RLS policy error when saving a trip, simply execute `supabase_rls_setup.sql` in your Supabase SQL Editor as documented in the Supabase section above.
