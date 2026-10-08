"""Date-overlap rules.

Stays are half-open ranges [check_in, check_out): the guest sleeps the nights check_in .. check_out-1.
Two stays overlap iff  existing.check_in < requested.check_out  AND  existing.check_out > requested.check_in.
So a stay ending on the 10th does NOT conflict with one starting on the 10th (same-day turnover),
exactly like Airbnb.
"""
from datetime import date
from typing import Optional

from fastapi import HTTPException
from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from ..models import Booking, Listing

MAX_STAY_NIGHTS = 90


def ranges_overlap(a_in: date, a_out: date, b_in: date, b_out: date) -> bool:
    """Pure-Python version of the SQL rule below (used in tests and for readability)."""
    return a_in < b_out and a_out > b_in


def overlap_clause(check_in: date, check_out: date):
    """SQL condition: a confirmed booking overlaps the requested [check_in, check_out)."""
    return and_(
        Booking.status == "confirmed",
        Booking.check_in < check_out,
        Booking.check_out > check_in,
    )


def is_available(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    stmt = (
        select(Booking.id)
        .where(Booking.listing_id == listing_id, overlap_clause(check_in, check_out))
        .limit(1)
    )
    return db.scalar(stmt) is None


def validate_stay(
    db: Session, listing: Listing, check_in: date, check_out: date, guests: Optional[int] = None
) -> None:
    """Raise a 400/409 describing the first rule the requested stay breaks."""
    if check_out <= check_in:
        raise HTTPException(400, "Check-out must be after check-in")
    if check_in < date.today():
        raise HTTPException(400, "Check-in can't be in the past")
    nights = (check_out - check_in).days
    if nights < listing.min_nights:
        raise HTTPException(400, f"This place has a {listing.min_nights}-night minimum")
    if nights > MAX_STAY_NIGHTS:
        raise HTTPException(400, f"Stays can be at most {MAX_STAY_NIGHTS} nights")
    if guests is not None and guests > listing.max_guests:
        raise HTTPException(400, f"This place allows up to {listing.max_guests} guests")
    if not is_available(db, listing.id, check_in, check_out):
        raise HTTPException(409, "Those dates are no longer available")
