import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app_name = os.getenv("APP_NAME", "Personalized Travel Itinerary Planner")
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app = FastAPI(title=app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Simple check that the API is running."""
    return {"status": "ok", "app": app_name}
