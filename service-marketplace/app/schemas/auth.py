import enum
from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.models.user import UserRole


# ── Sign-up ───────────────────────────────────────────────────────────────────
class SignUpRequest(BaseModel):
    username: str
    password: str
    role: UserRole
    email: str | None = None
    phone_number: str | None = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3 or len(v) > 50:
            raise ValueError("Username must be 3–50 characters")
        if not v.replace("_", "").isalnum():
            raise ValueError("Username may only contain letters, numbers, and underscores")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @model_validator(mode="after")
    def at_least_one_contact(self) -> "SignUpRequest":
        """
        Encourage users to supply at least one contact method.
        This is a soft validation — adjust to hard-enforce if needed.
        """
        # Currently permissive; remove the `pass` to enforce strictly:
        # if not self.email and not self.phone_number:
        #     raise ValueError("Provide at least one of email or phone_number")
        return self


# ── Login ─────────────────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


# ── Token response ────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole


# ── Internal token payload ────────────────────────────────────────────────────
class TokenData(BaseModel):
    user_id: int
    username: str
    role: UserRole
