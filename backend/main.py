import json
import logging
import os
import sys
from pathlib import Path

# Add backend directory and parent directory to sys.path to allow flexible execution paths
backend_dir = Path(__file__).resolve().parent
parent_dir = backend_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client

# LLM & fallback imports
try:
    from backend.llm.groq_provider import GroqProvider
    from backend.llm.prompts import build_itinerary_prompt
    from backend.fallback_generator import generate_fallback_itinerary
except (ImportError, ModuleNotFoundError):
    from llm.groq_provider import GroqProvider
    from llm.prompts import build_itinerary_prompt
    from fallback_generator import generate_fallback_itinerary

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("itinerary_planner")

# Load environment variables
load_dotenv(backend_dir / ".env")
load_dotenv(parent_dir / ".env")

app_name = os.getenv("APP_NAME", "Personalized Travel Itinerary Planner")
cors_origins_raw = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000",
)
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app = FastAPI(title=app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def get_supabase_client(prefer_service_role: bool = False):
    """Obtain Supabase client using service role key (for server-side inserts) or anon key."""
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_ANON_KEY")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not url:
        raise HTTPException(
            status_code=503,
            detail="Supabase configuration is missing (SUPABASE_URL is not set).",
        )

    key = None
    if prefer_service_role and service_role_key:
        key = service_role_key
    elif anon_key:
        key = anon_key
    elif service_role_key:
        key = service_role_key

    if not key:
        raise HTTPException(
            status_code=503,
            detail="Supabase keys (SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY) are missing in backend environment.",
        )

    return create_client(url, key)


@app.get("/health")
def health():
    """Check whether the API is running."""
    return {
        "status": "ok",
        "app": app_name,
        "version": "1.0.0",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "supabase_configured": bool(os.getenv("SUPABASE_URL")),
    }


@app.get("/health/supabase")
def supabase_health():
    """Check whether the backend can query the itineraries table."""
    try:
        # Use anon key for health check query
        client = get_supabase_client(prefer_service_role=False)
        client.table("itineraries").select("id").limit(1).execute()
        return {"status": "ok", "database": "connected"}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Supabase health check failed: {exc}")
        raise HTTPException(
            status_code=503,
            detail="Supabase query failed. Check backend configuration and database permissions.",
        )


@app.post("/generate-itinerary")
async def generate_itinerary(request: ItineraryRequest):
    """Generate a day-by-day itinerary using Groq LLM with deterministic fallback."""
    preferences = request.model_dump()
    prompt = build_itinerary_prompt(preferences)

    ai_generated = False
    itinerary_data = None
    error_note = None

    # Check if Groq API key is configured
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        try:
            provider = GroqProvider()
            result_text = await provider.generate_text(prompt)
            parsed = json.loads(result_text)

            # Validate basic required keys
            if (
                isinstance(parsed, dict)
                and "days" in parsed
                and isinstance(parsed["days"], list)
                and len(parsed["days"]) > 0
            ):
                itinerary_data = parsed
                itinerary_data["is_fallback"] = False
                itinerary_data["source"] = "ai"
                ai_generated = True
            else:
                logger.warning("AI output JSON did not match expected schema structure.")
                error_note = "AI output format was incomplete; generated high-quality fallback."
        except json.JSONDecodeError as exc:
            logger.warning(f"AI JSON decode error: {exc}")
            error_note = "AI response was not valid JSON; generated high-quality fallback."
        except Exception as exc:
            logger.warning(f"AI generation call failed: {type(exc).__name__}: {exc}")
            error_note = f"AI service error ({type(exc).__name__}); generated high-quality fallback."
    else:
        error_note = "GROQ_API_KEY not configured; generated high-quality fallback."

    # If AI generation failed or wasn't available, produce deterministic local fallback
    if not itinerary_data:
        itinerary_data = generate_fallback_itinerary(preferences)
        if error_note:
            itinerary_data["fallback_reason"] = error_note

    # Ensure metadata fields are consistent
    itinerary_data["destination"] = preferences.get("destination", itinerary_data.get("destination"))
    itinerary_data["requested_days"] = preferences.get("days")

    return {
        "status": "ok",
        "itinerary": itinerary_data,
        "source": "ai" if ai_generated else "fallback",
        "is_fallback": not ai_generated,
    }


@app.post("/trips", status_code=201)
def create_trip(trip: TripCreate):
    """Save a generated trip itinerary to Supabase."""
    payload = trip.model_dump()
    if payload.get("itinerary") is None:
        payload["itinerary"] = {}

    # Attempt insert: try service role key first, then fallback to anon key
    last_error = None
    inserted_data = None

    for use_srv in [True, False]:
        try:
            client = get_supabase_client(prefer_service_role=use_srv)
            res = client.table("itineraries").insert(payload).execute()
            inserted_data = res.data
            break
        except Exception as exc:
            last_error = exc

    if inserted_data is not None:
        return {
            "status": "ok",
            "message": "Trip saved successfully.",
            "data": inserted_data,
        }

    # Handle insert failure with clear diagnostic
    err_str = str(last_error)
    logger.error(f"Trip insert failed: {last_error}")

    if (
        "42501" in err_str
        or "row-level security" in err_str.lower()
        or "permission denied" in err_str.lower()
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                "Supabase database permission / RLS restriction. "
                "Please run the 'supabase_rls_setup.sql' script in your Supabase SQL Editor "
                "to grant insert permissions on the 'itineraries' table."
            ),
        )

    raise HTTPException(
        status_code=500,
        detail=f"Could not save trip to database: {err_str}",
    )


@app.get("/trips")
def list_trips(limit: int = 10):
    """Retrieve recently saved trips."""
    try:
        client = get_supabase_client(prefer_service_role=False)
        res = (
            client.table("itineraries")
            .select("id, created_at, destination, days, budget, travel_style")
            .order("created_at", desc=True)
            .limit(min(limit, 50))
            .execute()
        )
        return {"status": "ok", "trips": res.data}
    except Exception as exc:
        logger.warning(f"Could not fetch trips: {exc}")
        return {"status": "ok", "trips": [], "notice": "Could not query trips list"}
