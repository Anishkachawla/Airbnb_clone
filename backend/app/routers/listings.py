"""Public browse/search, listing detail, availability/quote, and host CRUD for listings."""
import math
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import exists, func, or_, select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_optional_user, require_host
from ..models import Amenity, Booking, Listing, ListingImage, User, listing_amenities
from ..schemas import BookedRange, ListingDetail, ListingIn, ListingPage, Quote
from ..services import pricing
from ..services.pricing import DEFAULT_CARD_NIGHTS
from ..services.availability import overlap_clause, validate_stay
from ..services.serializers import to_cards, to_detail

router = APIRouter(prefix="/listings", tags=["listings"])


def _csv(value: Optional[str]) -> list[str]:
    return [v.strip() for v in value.split(",") if v.strip()] if value else []


@router.get("", response_model=ListingPage)
def search_listings(
    location: Optional[str] = Query(None, description="Matches city, state, country or title"),
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = Query(None, ge=1),
    category: Optional[str] = None,
    property_types: Optional[str] = Query(None, description="Comma-separated, e.g. house,cabin"),
    min_price: Optional[int] = Query(None, ge=0),
    max_price: Optional[int] = Query(None, ge=0),
    bedrooms: Optional[int] = Query(None, ge=0),
    beds: Optional[int] = Query(None, ge=0),
    bathrooms: Optional[int] = Query(None, ge=0),
    amenities: Optional[str] = Query(None, description="Comma-separated amenity ids; listing must have all"),
    superhost: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    stmt = select(Listing)

    if location:
        like = f"%{location.strip()}%"
        stmt = stmt.where(or_(Listing.city.ilike(like), Listing.state.ilike(like),
                              Listing.country.ilike(like), Listing.title.ilike(like)))
    if check_in and check_out:
        if check_out <= check_in:
            raise HTTPException(400, "Check-out must be after check-in")
        # Hide listings that have any confirmed booking overlapping the requested stay
        stmt = stmt.where(~exists().where(Booking.listing_id == Listing.id, overlap_clause(check_in, check_out)))
        stmt = stmt.where(Listing.min_nights <= (check_out - check_in).days)
    if guests:
        stmt = stmt.where(Listing.max_guests >= guests)
    if category:
        stmt = stmt.where(Listing.category == category)
    if types := _csv(property_types):
        stmt = stmt.where(Listing.property_type.in_(types))
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if bedrooms:
        stmt = stmt.where(Listing.bedrooms >= bedrooms)
    if beds:
        stmt = stmt.where(Listing.beds >= beds)
    if bathrooms:
        stmt = stmt.where(Listing.bathrooms >= bathrooms)
    for amenity_id in (int(a) for a in _csv(amenities) if a.isdigit()):
        stmt = stmt.where(exists().where(listing_amenities.c.listing_id == Listing.id,
                                         listing_amenities.c.amenity_id == amenity_id))
    if superhost:
        stmt = stmt.where(Listing.host.has(User.is_superhost.is_(True)))

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
    rows = db.scalars(
        stmt.options(selectinload(Listing.images), selectinload(Listing.host))
        .order_by(Listing.id).offset((page - 1) * page_size).limit(page_size)
    ).all()
    nights = (check_out - check_in).days if check_in and check_out else DEFAULT_CARD_NIGHTS
    return ListingPage(items=to_cards(db, list(rows), user, nights), total=total, page=page,
                       page_size=page_size, pages=max(1, math.ceil(total / page_size)))


def _load(db: Session, listing_id: int) -> Listing:
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    return listing


@router.get("/{listing_id}", response_model=ListingDetail)
def get_listing(listing_id: int, db: Session = Depends(get_db),
                user: Optional[User] = Depends(get_optional_user)):
    return to_detail(db, _load(db, listing_id), user)


@router.get("/{listing_id}/availability", response_model=list[BookedRange])
def get_booked_ranges(listing_id: int, db: Session = Depends(get_db)):
    """Confirmed upcoming stays. The calendar greys out these nights."""
    _load(db, listing_id)
    rows = db.scalars(select(Booking).where(
        Booking.listing_id == listing_id, Booking.status == "confirmed", Booking.check_out > date.today()
    ).order_by(Booking.check_in)).all()
    return [BookedRange(check_in=b.check_in, check_out=b.check_out) for b in rows]


@router.get("/{listing_id}/quote", response_model=Quote)
def get_quote(listing_id: int, check_in: date, check_out: date, guests: int = Query(1, ge=1),
              db: Session = Depends(get_db)):
    """Validates the stay (same rules as booking) and returns the price breakdown."""
    listing = _load(db, listing_id)
    validate_stay(db, listing, check_in, check_out, guests)
    return pricing.quote(listing, check_in, check_out)


# ---------- host CRUD ----------
def _apply(db: Session, listing: Listing, data: ListingIn) -> None:
    """Copy a validated payload onto a listing (used by both create and update)."""
    for field, value in data.model_dump(exclude={"image_urls", "amenity_ids"}).items():
        setattr(listing, field, value)
    # delete-orphan cascade removes the old image rows
    listing.images = [ListingImage(url=url, position=i) for i, url in enumerate(data.image_urls)]
    listing.amenities = list(db.scalars(select(Amenity).where(Amenity.id.in_(set(data.amenity_ids)))))


def _owned(db: Session, listing_id: int, host: User) -> Listing:
    listing = _load(db, listing_id)
    if listing.host_id != host.id:
        raise HTTPException(403, "You can only manage your own listings")
    return listing


@router.post("", response_model=ListingDetail, status_code=201)
def create_listing(data: ListingIn, db: Session = Depends(get_db), host: User = Depends(require_host)):
    listing = Listing(host_id=host.id)
    _apply(db, listing, data)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return to_detail(db, listing, host)


@router.put("/{listing_id}", response_model=ListingDetail)
def update_listing(listing_id: int, data: ListingIn, db: Session = Depends(get_db),
                   host: User = Depends(require_host)):
    listing = _owned(db, listing_id, host)
    _apply(db, listing, data)
    db.commit()
    db.refresh(listing)
    return to_detail(db, listing, host)


@router.delete("/{listing_id}", status_code=204)
def delete_listing(listing_id: int, db: Session = Depends(get_db), host: User = Depends(require_host)):
    listing = _owned(db, listing_id, host)
    upcoming = db.scalar(select(func.count(Booking.id)).where(
        Booking.listing_id == listing.id, Booking.status == "confirmed", Booking.check_out > date.today()))
    if upcoming:
        raise HTTPException(
            409, f"This listing has {upcoming} upcoming reservation(s). Cancel them before deleting it.")
    db.delete(listing)
    db.commit()
    return Response(status_code=204)
