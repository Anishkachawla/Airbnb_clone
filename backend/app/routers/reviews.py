"""Guests can review a listing once per completed stay."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user
from ..models import Booking, Review, User
from ..schemas import ReviewIn, ReviewOut

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewOut, status_code=201)
def create_review(data: ReviewIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.get(Booking, data.booking_id)
    if not booking or booking.guest_id != user.id:
        raise HTTPException(404, "Reservation not found")
    if booking.status != "confirmed" or booking.check_out > date.today():
        raise HTTPException(400, "You can review a stay once it's complete")
    if booking.review is not None:
        raise HTTPException(409, "You've already reviewed this stay")
    review = Review(listing_id=booking.listing_id, author_id=user.id, booking_id=booking.id,
                    rating=data.rating, comment=data.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review
