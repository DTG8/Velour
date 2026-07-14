from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

# psycopg2 is synchronous — suitable for standard production deployments.
# For async (asyncpg), swap to create_async_engine + AsyncSession.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,       # Detect stale connections before use
    pool_size=10,             # Keep 10 connections ready
    max_overflow=20,          # Allow 20 extra under high load
    echo=False,               # Set True only for SQL debugging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass
