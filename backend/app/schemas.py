"""Pydantic request/response models: the API contract shared with the frontend (see frontend/lib/types.ts)."""
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .constants import CATEGORIES, PROPERTY_TYPES


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- users ----------
class UserOut(ORM):
    id: int
    name: str
    email: str
    avatar_url: Optional[str]
    bio: Optional[str]
    is_host: bool
    is_superhost: bool
    created_at: datetime


class PublicUser(ORM):
    """What other people may see about a user (no email)."""
    id: int
    name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    is_superhost: bool
    created_at: datetime


# ---------- amenities / images ----------
class AmenityOut(ORM):
    id: int
    name: str
    icon: str
    section: str


class ImageOut(ORM):
    id: int
    url: str
    position: int


# ---------- listings ----------
class ListingCard(BaseModel):
    """Compact shape used by the explore grid, map, wishlists and host dashboard."""
    id: int
    title: str
    city: str
    state: Optional[str]
    country: str
    property_type: str
    category: str
    price_per_night: int
    latitude: float
    longitude: float
    bedrooms: int
    beds: int
    images: list[str]
    rating: Optional[float]
    review_count: int
    host_name: str
    is_superhost: bool
    is_wishlisted: bool = False
    # All-in price (nightly x nights + cleaning + service fee) for the searched dates, or 2 nights by default
    stay_nights: int
    stay_total: int


class ListingPage(BaseModel):
    items: list[ListingCard]
    total: int
    page: int
    page_size: int
    pages: int


class ReviewOut(ORM):
    id: int
    rating: int
    comment: str
    created_at: datetime
    author: PublicUser


class HostStats(BaseModel):
    listing_count: int
    review_count: int
    rating: Optional[float]


class ListingDetail(ORM):
    id: int
    host_id: int
    title: str
    description: str
    property_type: str
    category: str
    address: Optional[str]
    city: str
    state: Optional[str]
    country: str
    latitude: float
    longitude: float
    price_per_night: int
    cleaning_fee: int
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    min_nights: int
    host: PublicUser
    images: list[ImageOut]
    amenities: list[AmenityOut]
    reviews: list[ReviewOut]
    # Computed fields, filled by services.serializers.to_detail
    rating: Optional[float] = None
    review_count: int = 0
    is_wishlisted: bool = False
    host_stats: Optional[HostStats] = None


class ListingIn(BaseModel):
    """Create/replace payload for a listing (PUT sends the full object)."""
    title: str = Field(min_length=3, max_length=120)
    description: str = Field(min_length=10, max_length=5000)
    property_type: str
    category: str
    address: Optional[str] = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=80)
    state: Optional[str] = Field(default=None, max_length=80)
    country: str = Field(min_length=1, max_length=80)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    price_per_night: int = Field(gt=0, le=100_000)
    cleaning_fee: int = Field(default=0, ge=0, le=10_000)
    max_guests: int = Field(ge=1, le=16)
    bedrooms: int = Field(ge=0, le=50)
    beds: int = Field(ge=1, le=50)
    bathrooms: float = Field(ge=0, le=50)
    min_nights: int = Field(default=1, ge=1, le=365)
    image_urls: list[str] = Field(min_length=1, max_length=20)
    amenity_ids: list[int] = Field(default_factory=list)

    @field_validator("title", "description", "city", "country")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("This field is required")
        return v

    @field_validator("property_type")
    @classmethod
    def _known_type(cls, v: str) -> str:
        if v not in PROPERTY_TYPES:
            raise ValueError(f"Property type must be one of: {', '.join(PROPERTY_TYPES)}")
        return v

    @field_validator("category")
    @classmethod
    def _known_category(cls, v: str) -> str:
        if v not in CATEGORIES:
            raise ValueError(f"Category must be one of: {', '.join(CATEGORIES)}")
        return v

    @field_validator("image_urls")
    @classmethod
    def _valid_urls(cls, urls: list[str]) -> list[str]:
        cleaned = [u.strip() for u in urls if u.strip()]
        if not cleaned:
            raise ValueError("Add at least one photo")
        for u in cleaned:
            if not u.startswith(("http://", "https://")):
                raise ValueError(f"Photo URLs must start with http:// or https:// ({u[:40]})")
        return cleaned


class BookedRange(BaseModel):
    check_in: date
    check_out: date


# ---------- pricing / bookings ----------
class Quote(BaseModel):
    nightly_rate: int
    nights: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total: int


class BookingIn(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1, le=16)

    @model_validator(mode="after")
    def _dates_in_order(self):
        if self.check_out <= self.check_in:
            raise ValueError("Check-out must be after check-in")
        return self


class BookingListing(ORM):
    id: int
    title: str
    city: str
    state: Optional[str]
    country: str
    property_type: str
    address: Optional[str]
    host: PublicUser
    cover_image: Optional[str] = None


class BookingGuest(ORM):
    id: int
    name: str
    avatar_url: Optional[str]


class BookingOut(ORM):
    id: int
    check_in: date
    check_out: date
    guests: int
    nightly_rate: int
    nights: int
    cleaning_fee: int
    service_fee: int
    total_price: int
    status: str
    created_at: datetime
    listing: BookingListing
    guest: BookingGuest
    has_review: bool = False


# ---------- reviews ----------
class ReviewIn(BaseModel):
    booking_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=2000)

    @field_validator("comment")
    @classmethod
    def _strip(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Tell future guests a little more")
        return v


# ---------- metadata ----------
class MetaOut(BaseModel):
    property_types: list[str]
    categories: list[str]
    amenities: list[AmenityOut]
    price_min: int
    price_max: int
