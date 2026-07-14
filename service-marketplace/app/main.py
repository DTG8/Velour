from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import models so Alembic / Base.metadata picks them up
import app.models  # noqa: F401
from app.database import engine, Base
from app.routers import auth, profile, search, messages, conversations, media as catalogue

from app.socket_manager import sio
import socketio

socket_app = socketio.ASGIApp(sio, other_asgi_app=None)




@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    """
    Create all tables on startup if they don't exist.
    In production, prefer Alembic migrations over this.
    Remove create_all() once migrations are in place.
    """
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Service Marketplace API",
    description=(
        "A private service marketplace backend with JWT authentication, "
        "provider profiles, and location-aware search optimised for Lagos."
    ),
    version="1.0.0",
    lifespan=lifespan,
    # Disable docs in production if desired:
    # docs_url=None, redoc_url=None,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Tighten `allow_origins` to your frontend domain(s) in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(search.router)
app.include_router(messages.router)
app.include_router(conversations.router)
app.include_router(catalogue.router)



app.mount("/socket.io", socket_app)



@app.get("/health", tags=["Health"])
def health_check() -> dict:
    return {"status": "ok"}
