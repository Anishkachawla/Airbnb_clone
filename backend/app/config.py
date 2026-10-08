"""Runtime settings, read from environment variables with local-dev defaults."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'airbnb.db'}")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))

# Comma-separated list of allowed frontend origins, e.g. "https://my-app.vercel.app"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

# Public base URL of this API, used to build absolute URLs for uploaded images
PUBLIC_API_URL = os.getenv("PUBLIC_API_URL", "http://localhost:8000").rstrip("/")

# Set SEED_ON_STARTUP=false to start with an empty database
SEED_ON_STARTUP = os.getenv("SEED_ON_STARTUP", "true").lower() == "true"

# Guest service fee as a share of the nightly subtotal (Airbnb charges guests roughly 14%)
SERVICE_FEE_RATE = 0.14
