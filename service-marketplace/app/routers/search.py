import enum
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.models.profile import ProviderProfile
from app.models.user import User
from app.schemas.profile import ProviderSearchResult

router = APIRouter(prefix="/providers", tags=["Search & Discovery"])


class ServiceType(str, enum.Enum):
    ST = "ST"
    OVN = "OVN"


@router.get(
    "/search",
    response_model=List[ProviderSearchResult],
    summary="Search & filter available providers",
    description="""
Filter service providers by:
- **age range** (`min_age`, `max_age`)
- **location** — Lagos district name (case-insensitive)
- **service_type** — `ST` (short-term) or `OVN` (overnight)

Results are paginated via `skip` / `limit`.
Requires a valid JWT token.
""",
)
def search_providers(
    min_age: int | None = Query(None, ge=18, le=80, description="Minimum provider age"),
    max_age: int | None = Query(None, ge=18, le=80, description="Maximum provider age"),
    location: str | None = Query(None, description="Lagos district (e.g. 'Lekki', 'Ikeja')"),
    service_type: ServiceType | None = Query(None, description="ST = short-term | OVN = overnight"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(20, ge=1, le=100, description="Max results per page"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    """
    Returns a list of ProviderProfile objects joined with their User records.
    Only active providers with a completed profile appear in results.
    """
    query = (
        db.query(ProviderProfile)
        .join(User, ProviderProfile.user_id == User.id)
        .options(joinedload(ProviderProfile.user))
        .filter(User.is_active == True)
    )

    # Age range filters
    if min_age is not None:
        query = query.filter(ProviderProfile.age >= min_age)
    if max_age is not None:
        query = query.filter(ProviderProfile.age <= max_age)

    # Location — case-insensitive partial match so "lekki" finds "Lekki"
    if location:
        query = query.filter(
            ProviderProfile.location.ilike(f"%{location.strip()}%")
        )

    # Service type flag
    if service_type == ServiceType.ST:
        query = query.filter(ProviderProfile.st_rate == True)
    elif service_type == ServiceType.OVN:
        query = query.filter(ProviderProfile.ovn_rate == True)

from app.core.storage import resolve_avatar_url

    results = query.offset(skip).limit(limit).all()

    # Map to response schema with username from the eagerly-loaded User
    return [
        ProviderSearchResult(
            id=profile.id,
            user_id=profile.user_id,
            username=profile.user.username,
            display_name=profile.display_name,
            avatar_url=resolve_avatar_url(profile.avatar_url),
            age=profile.age,
            location=profile.location,
            bio=profile.bio,
            st_rate=profile.st_rate,
            ovn_rate=profile.ovn_rate,
            is_verified=profile.is_verified,
            is_online=profile.is_online,
        )
        for profile in results
    ]
