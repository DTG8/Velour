from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user, require_provider
from app.models.profile import ProviderProfile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileRead, ProfileUpdate

router = APIRouter(prefix="/profile", tags=["Provider Profile"])


@router.post(
    "/",
    response_model=ProfileRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create your provider profile (Providers only)",
)
def create_profile(
    payload: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider),
) -> ProviderProfile:
    existing = db.query(ProviderProfile).filter(
        ProviderProfile.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists — use PATCH /profile to update it",
        )

    profile = ProviderProfile(
        user_id=current_user.id,
        **payload.model_dump(),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/me",
    response_model=ProfileRead,
    summary="Retrieve your own profile (Providers only)",
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider),
) -> ProviderProfile:
    profile = db.query(ProviderProfile).filter(
        ProviderProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found — create one first via POST /profile",
        )
    return profile


@router.patch(
    "/",
    response_model=ProfileRead,
    summary="Update your provider profile (Providers only)",
)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider),
) -> ProviderProfile:
    profile = db.query(ProviderProfile).filter(
        ProviderProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found — create one first via POST /profile",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile


@router.patch(
    "/online",
    response_model=ProfileRead,
    summary="Toggle online status (Providers only)",
)
def set_online_status(
    online: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_provider),
) -> ProviderProfile:
    profile = db.query(ProviderProfile).filter(
        ProviderProfile.user_id == current_user.id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile found",
        )

    profile.is_online = online
    db.commit()
    db.refresh(profile)
    return profile


@router.get(
    "/{user_id}",
    response_model=ProfileRead,
    summary="View any provider's public profile",
)
def get_provider_profile(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),  # any authenticated user can view
) -> ProviderProfile:
    profile = db.query(ProviderProfile).filter(
        ProviderProfile.user_id == user_id
    ).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Provider profile not found",
        )
    return profile
