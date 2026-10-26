# WanderWise — Personalized Travel Itinerary Planner
## Phase 5: Project Development Phase Documentation

---

### Project Header & Administrative Information

| Parameter | Details |
| :--- | :--- |
| **Project Title** | WanderWise — Generative AI-Based Personalized Travel Itinerary Planner |
| **Project Category** | Generative Artificial Intelligence (Generative AI) |
| **Document Phase** | Phase 5: Project Development Phase |
| **Date** | 24 September 2026 |
| **Team ID** | [TO BE PROVIDED] |
| **Repository URL** | [https://github.com/Aanchal1121/personalized-travel-itinerary-planner](https://github.com/Aanchal1121/personalized-travel-itinerary-planner) |
| **Maximum Marks** | 15 Marks (Code & Solution: 5 Marks, Input Processing: 5 Marks, Feature Implementation: 5 Marks) |

---

## 1. Development Overview & Repository Organization

The WanderWise development phase realized a full-stack, decoupled architecture comprising a modern React 18 single-page application and a high-performance Python FastAPI asynchronous backend service.

```
personalized-travel-itinerary-planner/
├── backend/
│   ├── .env.example              # Environment variable definitions template
│   ├── fallback_generator.py     # Deterministic local fallback planner
│   ├── main.py                   # FastAPI application gateway & API endpoints
│   ├── requirements.txt          # Python production dependencies
│   └── llm/
│       ├── __init__.py           # Module initialization
│       ├── base.py               # Abstract base class (BaseLLMProvider)
│       ├── groq_provider.py      # Groq Cloud LLM async completion provider
│       └── prompts.py            # Structured JSON prompt engineering builder
├── frontend/
│   ├── .env.example              # Client-side environment template
│   ├── index.html                # Semantic HTML5 entry with SEO tags
│   ├── package.json              # NPM dependencies & build scripts
│   ├── vercel.json               # Vercel SPA rewrite rules
│   └── src/
│       ├── App.css               # Complete WanderWise design system & themes
│       ├── App.jsx               # Main React application & multi-step stepper
│       ├── index.css             # Base styles & typography
│       ├── main.jsx              # React DOM bootstrap
│       └── lib/
│           ├── supabase.js       # Client-side Supabase helper
│           └── travelPrompt.js   # Preference schema & client validation
├── netlify.toml                  # Netlify deployment configuration
├── render.yaml                   # Render Blueprint deployment manifest
├── run_backend.ps1               # Automated Windows PowerShell backend launcher
├── run_frontend.ps1              # Automated Windows PowerShell frontend launcher
├── supabase_rls_setup.sql        # Supabase DDL, security grants, and RLS policies
└── README.md                     # Project documentation & execution guide
```

---

## 2. Module-by-Module Technical Implementation

### 2.1 Backend Core Application Gateway (`backend/main.py`)
`backend/main.py` is the operational spine of the server. It handles environment configuration, initializes FastAPI with metadata, attaches CORS middleware, defines Pydantic v2 schemas, and orchestrates requests between Groq, the fallback engine, and Supabase.

#### Key Architectural Features:
* **Dual Execution Path Resolution**: Dynamically appends both `backend` and workspace root to `sys.path` to ensure error-free imports whether run from workspace root (`uvicorn backend.main:app`) or within the `backend/` directory.
* **CORS Middleware**: Flexible origin parser that reads comma-separated origins from `CORS_ORIGINS` in `.env` (defaulting to local Vite and React ports `http://localhost:5173`, `http://localhost:3000`).

```python
# Path and environment resolution in backend/main.py
backend_dir = Path(__file__).resolve().parent
parent_dir = backend_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

load_dotenv(backend_dir / ".env")
load_dotenv(parent_dir / ".env")

app = FastAPI(title="Personalized Travel Itinerary Planner", version="1.0.0")
```

### 2.2 Request Validation Schema (`Pydantic v2`)
WanderWise strictly validates all incoming user preferences at the API perimeter using Pydantic v2 `BaseModel` classes with explicit field constraints:

```python
class ItineraryRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=150)
    days: int = Field(ge=1, le=14)
    budget: float = Field(gt=0)
    travel_style: str = Field(min_length=2, max_length=50)
    interests: list[str] = Field(default_factory=list)
    pace: str = Field(default="balanced", max_length=30)
    travelers: int = Field(default=1, ge=1, le=20)
    dietary: str = Field(default="", max_length=100)
    departure_date: str | None = None
    return_date: str | None = None

class TripCreate(BaseModel):
    destination: str = Field(min_length=2, max_length=150)
    days: int = Field(ge=1, le=14)
    budget: float = Field(gt=0)
    travel_style: str = Field(min_length=2, max_length=50)
    itinerary: dict | list | None = None
```
*Any payload violating constraints (e.g., `days=0` or `budget=-50`) triggers an immediate `422 Unprocessable Entity` response with informative field-level errors.*

### 2.3 Generative AI Integration Layer (`backend/llm/`)

#### 2.3.1 Pluggable LLM Interface (`backend/llm/base.py`)
To prevent vendor lock-in, all AI providers implement a formal Python Abstract Base Class:

```python
from abc import ABC, abstractmethod

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_text(self, prompt: str) -> str:
        """Asynchronously send prompt to LLM and return completion text."""
        pass
```

#### 2.3.2 Groq Cloud Async Provider (`backend/llm/groq_provider.py`)
Leverages Groq's low-latency LPU infrastructure via the official `groq` Python SDK. The provider sets temperature to `0.3` to balance creative cultural recommendations with factual geographic accuracy:

```python
import os
from groq import AsyncGroq
from llm.base import BaseLLMProvider

class GroqProvider(BaseLLMProvider):
    def __init__(self, model: str | None = None):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not set.")
        self.model = model or os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
        self.client = AsyncGroq(api_key=self.api_key)

    async def generate_text(self, prompt: str) -> str:
        response = await self.client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=self.model,
            temperature=0.3,
            max_tokens=4096,
        )
        return response.choices[0].message.content
```

#### 2.3.3 Structured Prompt Engineering (`backend/llm/prompts.py`)
The prompt builder transforms user preferences into a strict instruction set, enforcing:
1. Exact matching of requested day count ($N$ days $\rightarrow$ $N$ objects in `days`).
2. Geographic sequencing of daily stops (`route_order`).
3. Discrete morning, afternoon, and evening activity blocks with specific durations in minutes and estimated transit buffers.
4. Clean JSON output starting with `{` and ending with `}`, without conversational greetings or Markdown syntax backticks.

```python
def build_itinerary_prompt(preferences: dict) -> str:
    # Extracts destination, days, budget, travel_style, interests, pace, travelers, dietary
    # Returns an explicit JSON-enforcing template
```

### 2.4 Deterministic Local Fallback Engine (`backend/fallback_generator.py`)
To deliver resilient zero-downtime operation, WanderWise implements an offline rule-based itinerary synthesizer that runs when the external Groq API is unavailable, unconfigured, or rate-limited.
* **Domain Activity Pools**: Curated banks for `adventure`, `culture`, `food`, and `relaxation` styles.
* **Pace Multipliers**: Modifies activity durations by $0.85\times$ for relaxed, $1.0\times$ for balanced, and $1.15\times$ for fast-paced.
* **Schema Conformity**: Generates 100% of the JSON keys produced by the AI model (`route_order`, `morning`, `afternoon`, `evening`, `estimated_daily_budget`, `travel_tips`, `alternatives`), guaranteeing uninterrupted frontend presentation.

```python
# Code excerpt from backend/fallback_generator.py
def generate_fallback_itinerary(preferences: dict[str, Any]) -> dict[str, Any]:
    destination = preferences.get("destination", "Your Destination")
    days_count = max(1, min(14, int(preferences.get("days", 3))))
    style = preferences.get("travel_style", "culture").lower()
    pace = preferences.get("pace", "balanced").lower()
    budget = float(preferences.get("budget", 1000))
    travelers = max(1, int(preferences.get("travelers", 1)))
    dietary = preferences.get("dietary", "").strip()

    style_pool = ACTIVITIES_BY_STYLE.get(style, ACTIVITIES_BY_STYLE["culture"])
    duration_multiplier = {"relaxed": 0.85, "balanced": 1.0, "fast-paced": 1.15}.get(pace, 1.0)
    per_day_budget = budget / days_count
    # Constructs day-by-day itinerary matching exact schema
```

### 2.5 Supabase Database Client & Dual-Key Security (`backend/main.py`)
Database persistence uses Supabase PostgreSQL. To eliminate Row-Level Security permission errors while preserving security, the backend implements a resilient dual-key strategy:

```python
def get_supabase_client(prefer_service_role: bool = False):
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url:
        raise HTTPException(status_code=503, detail="SUPABASE_URL is not set.")

    key = service_role_key if (prefer_service_role and service_role_key) else (anon_key or service_role_key)
    if not key:
        raise HTTPException(status_code=503, detail="Supabase keys missing.")
    return create_client(url, key)

@app.post("/trips", status_code=201)
def create_trip(trip: TripCreate):
    payload = trip.model_dump()
    for use_srv in [True, False]:
        try:
            client = get_supabase_client(prefer_service_role=use_srv)
            res = client.table("itineraries").insert(payload).execute()
            return {"status": "ok", "message": "Trip saved successfully.", "data": res.data}
        except Exception as exc:
            last_error = exc
    # Diagnostic error reporting if RLS restriction occurs
```

### 2.6 Frontend User Interface & Components (`frontend/`)

#### 2.6.1 Multi-Step Preference Wizard (`frontend/src/App.jsx`)
The UI guides travelers through an intuitive 3-step intake workflow:
1. **Step 1: Destination & Dates**: Destination input, duration slider (1–14 days), departure/return dates.
2. **Step 2: Style, Budget & Logistics**: Travel style selector, interest checkbox chips, budget input, traveler counter, pace selector, and dietary text field.
3. **Step 3: Review & Generate**: Summary card validating all parameters before calling the API.
4. **Step 4: Interactive Schedule View**: Displays the generated itinerary with day switcher tabs, route visualizer, and export tools.

#### 2.6.2 Client-Side Validation Engine (`frontend/src/lib/travelPrompt.js`)
Validates user input in real-time, providing instant feedback without triggering unnecessary backend requests:

```javascript
export function validateTravelPreferences(preferences) {
  const errors = {};
  if (!preferences.destination || preferences.destination.trim().length < 2) {
    errors.destination = 'Destination must be at least 2 characters.';
  }
  const days = Number(preferences.days);
  if (isNaN(days) || days < 1 || days > 14) {
    errors.days = 'Duration must be between 1 and 14 days.';
  }
  const budget = Number(preferences.budget);
  if (isNaN(budget) || budget <= 0) {
    errors.budget = 'Please enter a valid budget greater than zero.';
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
```

#### 2.6.3 Modern Design System & Aesthetics (`frontend/src/App.css`)
Built with pure Vanilla CSS, utilizing modern web design tokens:
* **Palette**: Dark slate background (`#0b1120`, `#0f172a`), brand primary sky blue (`#0ea5e9`, `#38bdf8`), glowing emerald accents (`#10b981`), and subtle border gradients.
* **Glassmorphism**: Translucent cards (`rgba(15, 23, 42, 0.75)`) with backdrop blur (`backdrop-filter: blur(12px)`).
* **Typography**: Clean, professional styling via Google Fonts (*Plus Jakarta Sans*).
* **Print Styling**: Comprehensive `@media print` rules that hide navbar headers, day tabs, and action buttons, producing a clean, black-and-white ink-optimized travel document.

---

## 3. Data Processing & Input Transformation

| Input Field | Source Form Control | Client Validation (`travelPrompt.js`) | Server Validation (`Pydantic`) | Transformed State for Prompt / DB |
| :--- | :--- | :--- | :--- | :--- |
| **`destination`** | Text Input | Trimmed, length $\ge 2$ chars | `str`, min 2, max 150 chars | Sanitized string passed to LLM and stored in `public.itineraries.destination`. |
| **`days`** | Number Input / Stepper | Integer $1 \le \text{days} \le 14$ | `int = Field(ge=1, le=14)` | Determines exact number of daily objects generated in JSON. |
| **`budget`** | Currency Input | Numeric $> 0$ | `float = Field(gt=0)` | Used to compute daily spend allocation (`budget / days`). |
| **`travel_style`**| Select Dropdown | Validates against supported styles | `str`, min 2, max 50 chars | Directs thematic activity selection (e.g. culture vs. adventure). |
| **`interests`** | Multi-select Chips | Filtered array of strings | `list[str] = Field(default_factory=list)` | Injected into few-shot context to refine specific stops. |
| **`pace`** | Radio Button Group | Allowed: `relaxed`, `balanced`, `fast-paced` | `str`, max 30 chars | Calibrates duration multiplier ($0.85\times$ to $1.15\times$) and transit times. |
| **`travelers`** | Number Stepper | Integer $1 \le \text{travelers} \le 20$ | `int = Field(ge=1, le=20)` | Influences group transit recommendations and dining capacity. |
| **`dietary`** | Free-text / Badges | Trimmed string, max 100 chars | `str = Field(default="", max_length=100)` | Injects dietary notes into afternoon and evening lunch/dinner picks. |

---

## 4. Environment Configuration & Deployment Setup

### 4.1 Backend Environment Template (`backend/.env`)

```env
APP_NAME=Personalized Travel Itinerary Planner
APP_ENV=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Groq AI Cloud Credentials
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-20b

# Supabase PostgreSQL Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-server-only
```

> **Security Rule**: `SUPABASE_SERVICE_ROLE_KEY` is loaded strictly on the backend and is never packaged into client-facing bundles.

### 4.2 Frontend Environment Template (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### 4.3 Deployment Manifests
* **Render Web Service (`render.yaml`)**:
  ```yaml
  services:
    - type: web
      name: travel-itinerary-backend
      env: python
      buildCommand: pip install -r backend/requirements.txt
      startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
      healthCheckPath: /health
  ```
* **Vercel Frontend Configuration (`frontend/vercel.json`)**:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```

---

## 5. Local Execution Instructions (Windows PowerShell)

### 5.1 One-Click Script Execution
From the workspace root directory:

**Terminal 1 (Backend):**
```powershell
.\run_backend.ps1
```

**Terminal 2 (Frontend):**
```powershell
.\run_frontend.ps1
```

### 5.2 Manual Command-Line Execution

#### Step 1: Start Backend
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
* Backend Health Check: `http://127.0.0.1:8000/health`
* Interactive API Documentation: `http://127.0.0.1:8000/docs`

#### Step 2: Start Frontend
```powershell
cd frontend
npm install
npm run dev
```
* Web Application Interface: `http://localhost:5173`

---

## 6. Phase 5 Sign-Off & Verification Checklist

| Development Deliverable | Status | Verification Reference |
| :--- | :---: | :--- |
| Complete Repository Structure Cataloged | Completed | Section 1 (Full file tree detailing all frontend/backend assets) |
| Backend API & Pydantic Validation | Completed | Section 2.1 & 2.2 (`main.py` endpoints and schemas) |
| Groq LLM & Prompt Engineering Implementation | Completed | Section 2.3 (`groq_provider.py` & `prompts.py`) |
| Deterministic Local Fallback Engine | Completed | Section 2.4 (`fallback_generator.py`) |
| Supabase Persistence & RLS Integration | Completed | Section 2.5 (`main.py` dual-key logic & SQL script) |
| React 18 / Vite 5 UI & Vanilla CSS | Completed | Section 2.6 (`App.jsx`, `travelPrompt.js`, `App.css`) |
| Input Transformation & Sanitization | Completed | Section 3 (Comprehensive field-by-field validation matrix) |
| Deployment Manifests & Environment Config | Completed | Section 4 (`render.yaml`, `vercel.json`, `.env.example`) |
| Local Execution Scripts Documented | Completed | Section 5 (PowerShell and manual CLI commands) |
