from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProviderProfile(Base):
    __tablename__ = "provider_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    # One-to-one with User (only providers have profiles)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    # ── Public identity ───────────────────────────────────────────────────────
    display_name: Mapped[str] = mapped_column(
        String(100), nullable=False, comment="Public-facing display name"
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(500), nullable=True, comment="Profile photo path or presigned URL key"
    )

    # Profile fields
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Service duration flags
    st_rate: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Offers short-term service"
    )
    ovn_rate: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Offers overnight service"
    )

    # ── Status flags ──────────────────────────────────────────────────────────
    is_verified: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Admin-verified provider"
    )
    is_online: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Currently online"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationship back to User (lazy loaded by default)
    user: Mapped["User"] = relationship("User", backref="profile")  # type: ignore[name-defined]
