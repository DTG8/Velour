from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.security import create_access_token, hash_password, verify_password
from app.dependencies import get_db, get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, SignUpRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Response schema for /auth/me ──────────────────────────────────────────────
class UserRead(BaseModel):
    id: int
    username: str
    role: UserRole
    email: str | None
    phone_number: str | None
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Client or Provider account",
)
def signup(payload: SignUpRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """
    Create a new user. Returns an access token immediately so the client
    doesn't need a separate login step after registration.
    """
    # Clean and convert empty strings to None to prevent unique constraint conflicts
    email = payload.email.strip() if payload.email and payload.email.strip() else None
    phone_number = payload.phone_number.strip() if payload.phone_number and payload.phone_number.strip() else None

    new_user = User(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        email=email,
        phone_number=phone_number,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this username, email, or phone number already exists",
        )

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role.value})
    return TokenResponse(access_token=token, role=new_user.role)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive a JWT access token",
)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.username == payload.username).first()

    # Use constant-time comparison via verify_password even on None
    # to prevent timing-based user enumeration
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current authenticated user info",
)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """
    Returns the authenticated user's profile information.
    Used by the frontend to hydrate user state on page refresh.
    """
    avatar_url = None
    if current_user.role == UserRole.provider:
        from app.models.profile import ProviderProfile
        from app.core.storage import resolve_avatar_url
        profile = db.query(ProviderProfile).filter(ProviderProfile.user_id == current_user.id).first()
        if profile:
            avatar_url = resolve_avatar_url(profile.avatar_url)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "avatar_url": avatar_url
    }
