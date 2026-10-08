"""Booking lifecycle: create (with availability check), list trips, view, cancel."""
import threading
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..deps import get_current_user
from ..models import Booking, Listing, User
from ..schemas import BookingIn, BookingOut
from ..services import pricing
from ..services.availability import validate_stay
from ..services.serializers import to_booking

router = APIRouter(prefix="/bookings", tags=["bookings"])

# The availability check and the INSERT must happen atomically, otherwise two simultaneous requests
# for the same dates could both pass the check. SQLite means a single API process, so a process-wide
# lock is enough; on Postgres this would become an exclusion constraint or SELECT ... FOR UPDATE.
_booking_lock = threading.Lock()


def _visible_booking(db: Session, booking_id: int, user: User) -> Booking:
    """A booking is visible to its guest and to the host of its listing; anyone else gets a 404."""
    booking = db.get(Booking, booking_id)
    if not booking or user.id not in (booking.guest_id, booking.listing.host_id):
        raise HTTPException(404, "Reservation not found")
    return booking


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(data: BookingIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listing = db.get(Listing, data.listing_id)
    if not listing:
        raise HTTPException(404, "Listing not found")
    if listing.host_id == user.id:
        raise HTTPException(400, "You can't book your own listing")

    with _booking_lock:
        validate_stay(db, listing, data.check_in, data.check_out, data.guests)
        q = pricing.quote(listing, data.check_in, data.check_out)
        booking = Booking(
            listing_id=listing.id, guest_id=user.id, check_in=data.check_in, check_out=data.check_out,
            guests=data.guests, nightly_rate=q.nightly_rate, nights=q.nights, cleaning_fee=q.cleaning_fee,
            service_fee=q.service_fee, total_price=q.total, status="confirmed",
        )
        db.add(booking)
        db.commit()
    db.refresh(booking)
    return to_booking(booking)


@router.get("/mine", response_model=list[BookingOut])
def my_trips(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(Booking).where(Booking.guest_id == user.id).order_by(Booking.check_in.desc())
        .options(selectinload(Booking.listing).selectinload(Listing.images))
    ).all()
    return [to_booking(b) for b in rows]


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return to_booking(_visible_booking(db, booking_id, user))


@router.post("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """The guest or the listing's host may cancel an upcoming stay. Cancelling frees the dates."""
    booking = _visible_booking(db, booking_id, user)
    if booking.status == "cancelled":
        raise HTTPException(400, "This reservation is already cancelled")
    if booking.check_in <= date.today():
        raise HTTPException(400, "Stays that have already started can't be cancelled")
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return to_booking(booking)
