"""ORM models. See the README 'Database schema' section for the ER diagram."""
from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import (
    Boolean, CheckConstraint, Column, Date, DateTime, Float, ForeignKey, Index,
    Integer, String, Table, Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    """Naive UTC timestamp (SQLite has no timezone type)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

# Many-to-many join between listings and amenities (composite PK prevents duplicates)
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500))
    bio: Mapped[Optional[str]] = mapped_column(Text)
    is_host: Mapped[bool] = mapped_column(Boolean, default=False)
    is_superhost: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    listings: Mapped[list["Listing"]] = relationship(back_populates="host")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="guest")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    icon: Mapped[str] = mapped_column(String(40))  # icon key understood by the frontend
    section: Mapped[str] = mapped_column(String(40), default="Basics")  # grouping in "What this place offers"


class Listing(Base):
    __tablename__ = "listings"
    __table_args__ = (
        CheckConstraint("price_per_night > 0", name="ck_listing_price_positive"),
        CheckConstraint("cleaning_fee >= 0", name="ck_listing_cleaning_fee"),
        CheckConstraint("max_guests >= 1", name="ck_listing_guests_positive"),
        CheckConstraint("min_nights >= 1", name="ck_listing_min_nights"),
        Index("ix_listings_city", "city"),
        Index("ix_listings_category", "category"),
        Index("ix_listings_price", "price_per_night"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    host_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    property_type: Mapped[str] = mapped_column(String(30))  # house | apartment | guesthouse | hotel | cabin | villa ...
    category: Mapped[str] = mapped_column(String(30))       # category-bar tab: beachfront, cabins, pools ...
    address: Mapped[Optional[str]] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(80))
    state: Mapped[Optional[str]] = mapped_column(String(80))
    country: Mapped[str] = mapped_column(String(80))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    price_per_night: Mapped[int] = mapped_column(Integer)  # whole USD; integers avoid float rounding
    cleaning_fee: Mapped[int] = mapped_column(Integer, default=0)
    max_guests: Mapped[int] = mapped_column(Integer)
    bedrooms: Mapped[int] = mapped_column(Integer)
    beds: Mapped[int] = mapped_column(Integer)
    bathrooms: Mapped[float] = mapped_column(Float)
    min_nights: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    host: Mapped[User] = relationship(back_populates="listings")
    images: Mapped[list["ListingImage"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.position"
    )
    amenities: Mapped[list[Amenity]] = relationship(secondary=listing_amenities, order_by="Amenity.name")
    bookings: Mapped[list["Booking"]] = relationship(back_populates="listing", cascade="all, delete-orphan")
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan", order_by="Review.created_at.desc()"
    )


class ListingImage(Base):
    __tablename__ = "listing_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(500))
    position: Mapped[int] = mapped_column(Integer, default=0)  # 0 = cover photo

    listing: Mapped[Listing] = relationship(back_populates="images")


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("check_out > check_in", name="ck_booking_dates"),
        CheckConstraint("guests >= 1", name="ck_booking_guests"),
        CheckConstraint("status IN ('confirmed', 'cancelled')", name="ck_booking_status"),
        # The availability check filters on exactly these columns
        Index("ix_bookings_listing_dates", "listing_id", "check_in", "check_out"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"))
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    check_in: Mapped[date] = mapped_column(Date)
    check_out: Mapped[date] = mapped_column(Date)  # exclusive: the night of check_out is not part of the stay
    guests: Mapped[int] = mapped_column(Integer)
    # Price snapshot taken at booking time, so a later price edit doesn't rewrite past receipts
    nightly_rate: Mapped[int] = mapped_column(Integer)
    nights: Mapped[int] = mapped_column(Integer)
    cleaning_fee: Mapped[int] = mapped_column(Integer)
    service_fee: Mapped[int] = mapped_column(Integer)
    total_price: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(20), default="confirmed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    listing: Mapped[Listing] = relationship(back_populates="bookings")
    guest: Mapped[User] = relationship(back_populates="bookings")
    review: Mapped[Optional["Review"]] = relationship(
        back_populates="booking", uselist=False, cascade="all, delete-orphan"
    )


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (CheckConstraint("rating BETWEEN 1 AND 5", name="ck_review_rating"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    # Tying a review to a booking guarantees only real guests review, and UNIQUE means one review per stay
    booking_id: Mapped[int] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    listing: Mapped[Listing] = relationship(back_populates="reviews")
    author: Mapped[User] = relationship()
    booking: Mapped[Booking] = relationship(back_populates="review")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    # Composite PK = a user can save a listing at most once
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    listing_id: Mapped[int] = mapped_column(ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
