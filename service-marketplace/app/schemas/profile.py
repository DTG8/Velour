from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.models.constants import LAGOS_DISTRICTS


class ProfileCreate(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100, description="Public display name")
    age: int = Field(..., ge=18, le=80, description="Provider age (18–80)")
    location: str = Field(..., description="Lagos district name")
    bio: str | None = Field(None, max_length=1000)
    avatar_url: str | None = None
    st_rate: bool = False
    ovn_rate: bool = False

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str) -> str:
        v = v.strip().title()
        if v not in LAGOS_DISTRICTS:
            raise ValueError(
                f"'{v}' is not a recognised Lagos district. "
                f"Valid options: {', '.join(LAGOS_DISTRICTS)}"
            )
        return v

    @field_validator("bio")
    @classmethod
    def sanitize_bio(cls, v: str | None) -> str | None:
        return v.strip() if v else v


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(None, min_length=2, max_length=100)
    age: int | None = Field(None, ge=18, le=80)
    location: str | None = None
    bio: str | None = Field(None, max_length=1000)
    avatar_url: str | None = None
    st_rate: bool | None = None
    ovn_rate: bool | None = None
    is_online: bool | None = None

    @field_validator("location")
    @classmethod
    def validate_location(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip().title()
        if v not in LAGOS_DISTRICTS:
            raise ValueError(f"'{v}' is not a recognised Lagos district.")
        return v


class ProfileRead(BaseModel):
    id: int
    user_id: int
    display_name: str
    avatar_url: str | None
    age: int
    location: str
    bio: str | None
    st_rate: bool
    ovn_rate: bool
    is_verified: bool
    is_online: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProviderSearchResult(BaseModel):
    """Response for the search/discovery endpoint — includes everything the card needs."""
    id: int
    user_id: int
    username: str
    display_name: str
    avatar_url: str | None
    age: int
    location: str
    bio: str | None
    st_rate: bool
    ovn_rate: bool
    is_verified: bool
    is_online: bool

    model_config = {"from_attributes": True}
