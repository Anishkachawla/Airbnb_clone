"""Builds response models that need aggregates (ratings, wishlist flags, host stats).

Aggregates are fetched in one grouped query per page rather than per listing, which avoids N+1 queries.
"""
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Booking, Listing, Review, User, WishlistItem
from ..services.pricing import DEFAULT_CARD_NIGHTS, quote_nights
from ..schemas import BookingOut, HostStats, ListingCard, ListingDetail


def rating_stats(db: Session, listing_ids: list[int]) -> dict[int, tuple[float, int]]:
    """listing_id -> (average rating, review count) for listings that have reviews."""
    if not listing_ids:
        return {}
    rows = db.execute(
        select(Review.listing_id, func.avg(Review.rating), func.count(Review.id))
        .where(Review.listing_id.in_(listing_ids))
        .group_by(Review.listing_id)
    ).all()
    return {lid: (round(float(avg), 2), count) for lid, avg, count in rows}


def wishlisted_ids(db: Session, user: Optional[User], listing_ids: list[int]) -> set[int]:
    if not user or not listing_ids:
        return set()
    return set(db.scalars(
        select(WishlistItem.listing_id)
        .where(WishlistItem.user_id == user.id, WishlistItem.listing_id.in_(listing_ids))
    ))


def to_cards(db: Session, listings: list[Listing], user: Optional[User],
             nights: int = DEFAULT_CARD_NIGHTS) -> list[ListingCard]:
    ids = [listing.id for listing in listings]
    stats = rating_stats(db, ids)
    saved = wishlisted_ids(db, user, ids)
    cards = []
    for listing in listings:
        rating, count = stats.get(listing.id, (None, 0))
        cards.append(ListingCard(
            id=listing.id, title=listing.title, city=listing.city, state=listing.state,
            country=listing.country, property_type=listing.property_type, category=listing.category,
            price_per_night=listing.price_per_night, latitude=listing.latitude, longitude=listing.longitude,
            bedrooms=listing.bedrooms, beds=listing.beds,
            images=[img.url for img in listing.images[:6]], rating=rating, review_count=count,
            host_name=listing.host.name, is_superhost=listing.host.is_superhost,
            is_wishlisted=listing.id in saved,
            stay_nights=nights, stay_total=quote_nights(listing, nights).total,
        ))
    return cards


def host_stats(db: Session, host_id: int) -> HostStats:
    listing_count = db.scalar(select(func.count(Listing.id)).where(Listing.host_id == host_id)) or 0
    avg, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .join(Listing, Listing.id == Review.listing_id)
        .where(Listing.host_id == host_id)
    ).one()
    return HostStats(listing_count=listing_count, review_count=count,
                     rating=round(float(avg), 2) if avg is not None else None)


def to_detail(db: Session, listing: Listing, user: Optional[User]) -> ListingDetail:
    detail = ListingDetail.model_validate(listing)
    detail.rating, detail.review_count = rating_stats(db, [listing.id]).get(listing.id, (None, 0))
    detail.is_wishlisted = listing.id in wishlisted_ids(db, user, [listing.id])
    detail.host_stats = host_stats(db, listing.host_id)
    return detail


def to_booking(booking: Booking) -> BookingOut:
    out = BookingOut.model_validate(booking)
    out.listing.cover_image = booking.listing.images[0].url if booking.listing.images else None
    out.has_review = booking.review is not None
    return out
