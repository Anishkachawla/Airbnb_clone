"""Mocked auth (pick a seeded user), profile, wishlist, host dashboard data and UI metadata."""
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from ..constants import CATEGORIES, PROPERTY_TYPES
from ..database import get_db
from ..deps import get_current_user, require_host
from ..models import Amenity, Booking, Listing, User, WishlistItem
from ..schemas import AmenityOut, BookingOut, ListingCard, MetaOut, UserOut
from ..services.serializers import to_booking, to_cards

router = APIRouter(tags=["users"])


# ---------- mocked auth ----------
@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    """Demo login: the frontend lets you choose which seeded user to act as."""
    return db.scalars(select(User).order_by(User.is_host.desc(), User.id)).all()


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/me/become-host", response_model=UserOut)
def become_host(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.is_host = True
    db.commit()
    return user


# ---------- metadata for filters / host form ----------
@router.get("/meta", response_model=MetaOut)
def meta(db: Session = Depends(get_db)):
    lo, hi = db.execute(select(func.min(Listing.price_per_night), func.max(Listing.price_per_night))).one()
    return MetaOut(
        property_types=PROPERTY_TYPES,
        categories=CATEGORIES,
        amenities=[AmenityOut.model_validate(a)
                   for a in db.scalars(select(Amenity).order_by(Amenity.section, Amenity.name))],
        price_min=lo or 10,
        price_max=hi or 1000,
    )


# ---------- wishlist ----------
@router.get("/me/wishlist", response_model=list[ListingCard])
def my_wishlist(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listings = db.scalars(
        select(Listing).join(WishlistItem, WishlistItem.listing_id == Listing.id)
        .where(WishlistItem.user_id == user.id).order_by(WishlistItem.created_at.desc())
        .options(selectinload(Listing.images), selectinload(Listing.host))
    ).all()
    return to_cards(db, list(listings), user)


@router.put("/me/wishlist/{listing_id}", status_code=204)
def save_listing(listing_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Idempotent: saving an already-saved listing is a no-op."""
    if not db.get(Listing, listing_id):
        raise HTTPException(404, "Listing not found")
    if not db.get(WishlistItem, (user.id, listing_id)):
        db.add(WishlistItem(user_id=user.id, listing_id=listing_id))
        db.commit()
    return Response(status_code=204)


@router.delete("/me/wishlist/{listing_id}", status_code=204)
def unsave_listing(listing_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    item = db.get(WishlistItem, (user.id, listing_id))
    if item:
        db.delete(item)
        db.commit()
    return Response(status_code=204)


# ---------- host dashboard ----------
@router.get("/host/listings", response_model=list[ListingCard])
def host_listings(db: Session = Depends(get_db), host: User = Depends(require_host)):
    listings = db.scalars(
        select(Listing).where(Listing.host_id == host.id).order_by(Listing.created_at.desc())
        .options(selectinload(Listing.images), selectinload(Listing.host))
    ).all()
    return to_cards(db, list(listings), host)


@router.get("/host/reservations", response_model=list[BookingOut])
def host_reservations(db: Session = Depends(get_db), host: User = Depends(require_host)):
    rows = db.scalars(
        select(Booking).join(Listing, Listing.id == Booking.listing_id).where(Listing.host_id == host.id)
        .order_by(Booking.check_in.desc())
        .options(selectinload(Booking.listing).selectinload(Listing.images))
    ).all()
    return [to_booking(b) for b in rows]
