from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import CORS_ORIGINS, SEED_ON_STARTUP, UPLOAD_DIR
from .database import Base, SessionLocal, engine
from .routers import bookings, listings, reviews, uploads, users
from .seed import seed_if_empty


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create tables on boot (no migration tool needed for SQLite in this scope) and seed demo data
    Base.metadata.create_all(bind=engine)
    if SEED_ON_STARTUP:
        with SessionLocal() as db:
            seed_if_empty(db)
    yield


app = FastAPI(title="Airbnb Clone API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Vercel preview deployments
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (listings.router, bookings.router, reviews.router, users.router, uploads.router):
    app.include_router(r)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
