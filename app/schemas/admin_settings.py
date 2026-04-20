from pydantic import BaseModel, ConfigDict, EmailStr, Field


class PlatformSettingsRead(BaseModel):
    maintenance_mode: bool
    session_timeout_minutes: int = Field(ge=5, le=240)
    max_login_attempts: int = Field(ge=1, le=20)
    country_access_mode: str = Field(pattern='^(allow_all|block_specific)$')
    model_config = ConfigDict(from_attributes=True)


class PlatformSettingsUpdate(BaseModel):
    maintenance_mode: bool
    session_timeout_minutes: int = Field(ge=5, le=240)
    max_login_attempts: int = Field(ge=1, le=20)
    country_access_mode: str = Field(pattern='^(allow_all|block_specific)$', default='allow_all')


class AdminCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class BlockedIPRuleRead(BaseModel):
    id: int
    ip_address: str
    reason: str | None = None
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class BlockedIPRuleCreate(BaseModel):
    ip_address: str = Field(min_length=3, max_length=64)
    reason: str | None = Field(default=None, max_length=500)


class CountryAccessRead(BaseModel):
    mode: str = Field(pattern='^(allow_all|block_specific)$')
    blocked_countries: list[str]


class CountryAccessUpdate(BaseModel):
    mode: str = Field(pattern='^(allow_all|block_specific)$')
    blocked_countries: list[str] = Field(default_factory=list)
