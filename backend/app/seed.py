"""Seeds a demo dataset on first startup (or `python -m app.seed --reset`).

Bookings are generated relative to today so the demo always has past stays (with reviews)
and upcoming stays (which block dates on the calendar)."""
import random
import sys
from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import SERVICE_FEE_RATE
from .models import Amenity, Booking, Listing, ListingImage, Review, User, WishlistItem
from .seed_data import (AMENITIES, DESCRIPTION_TEMPLATE, EXTRA_LISTINGS, LISTINGS, PHOTOS, REVIEW_TEXTS, U,
                        USERS, VIEWS)


def _photos(theme: str, offset: int) -> list[str]:
    """Five photos: a themed cover/exterior plus interior shots, rotated per listing."""
    pool = PHOTOS[theme]
    interiors = PHOTOS["interior"]
    picks = [pool[offset % len(pool)], pool[(offset + 1) % len(pool)]]
    picks += [interiors[(offset * 3 + i) % len(interiors)] for i in range(3)]
    return [U.format(p) for p in picks]


def _booking(listing: Listing, guest: User, check_in: date, nights: int, guests: int) -> Booking:
    subtotal = listing.price_per_night * nights
    fee = round(subtotal * SERVICE_FEE_RATE)
    return Booking(
        listing=listing, guest=guest, check_in=check_in, check_out=check_in + timedelta(days=nights),
        guests=guests, nightly_rate=listing.price_per_night, nights=nights, cleaning_fee=listing.cleaning_fee,
        service_fee=fee, total_price=subtotal + listing.cleaning_fee + fee, status="confirmed",
        created_at=datetime.combine(check_in - timedelta(days=20), datetime.min.time()),
    )


def seed(db: Session) -> None:
    rng = random.Random(42)  # deterministic demo data
    today = date.today()

    amenities = {name: Amenity(name=name, icon=icon, section=section) for name, icon, section in AMENITIES}
    db.add_all(amenities.values())

    users = [
        User(name=n, email=e, is_host=h, is_superhost=s, bio=b, avatar_url=f"https://i.pravatar.cc/240?img={a}",
             created_at=datetime(2016 + i % 8, 1 + i, 1))
        for i, (n, e, h, s, b, a) in enumerate(USERS)
    ]
    db.add_all(users)
    hosts = users[:5]
    guests = users[5:]

    listings = []
    for i, row in enumerate(LISTINGS + EXTRA_LISTINGS):
        (title, ptype, cat, city, state, country, lat, lng, price, cleaning, max_g, bedrooms, beds, baths,
         theme, host_idx, amenity_names) = row
        view, activity = VIEWS[cat]
        listing = Listing(
            host=hosts[host_idx], title=title, property_type=ptype, category=cat, city=city, state=state,
            country=country, address=f"{city}{', ' + state if state else ''}, {country}", latitude=lat,
            longitude=lng, price_per_night=price, cleaning_fee=cleaning, max_guests=max_g, bedrooms=bedrooms,
            beds=beds, bathrooms=baths, min_nights=2 if price > 20000 else 1,
            description=DESCRIPTION_TEMPLATE.format(title=title, view=view, activity=activity,
                                                    guests=max_g, bedrooms=bedrooms),
            images=[ListingImage(url=u, position=p) for p, u in enumerate(_photos(theme, i))],
            amenities=[amenities[a] for a in amenity_names] + [amenities["Smoke alarm"]],
            created_at=datetime(2023, 1 + i % 12, 1 + i % 27),
        )
        listings.append(listing)
    db.add_all(listings)

    # Past stays with reviews: 2-6 per listing, non-overlapping, walking backwards from last week
    for listing in listings:
        cursor = today - timedelta(days=rng.randint(5, 20))
        for _ in range(rng.randint(2, 6)):
            nights = rng.randint(2, 5)
            check_in = cursor - timedelta(days=nights)
            guest = rng.choice(guests)
            booking = _booking(listing, guest, check_in, nights, min(listing.max_guests, rng.randint(1, 4)))
            rating, text = rng.choice(REVIEW_TEXTS)
            booking.review = Review(listing=listing, author=guest, rating=rating, comment=text,
                                    created_at=datetime.combine(booking.check_out + timedelta(days=2),
                                                                datetime.min.time()))
            db.add(booking)
            cursor = check_in - timedelta(days=rng.randint(3, 25))

    # Upcoming stays that block calendar dates: roughly every other listing
    for listing in listings[::2]:
        check_in = today + timedelta(days=rng.randint(4, 20))
        db.add(_booking(listing, rng.choice(guests), check_in, rng.randint(2, 5), 2))
        later = check_in + timedelta(days=rng.randint(12, 30))
        db.add(_booking(listing, rng.choice(guests), later, rng.randint(2, 6), 2))

    # A completed, not-yet-reviewed stay for the default guest so "Leave a review" is demoable
    aarav = guests[0]
    db.add(_booking(listings[1], aarav, today - timedelta(days=4), 2, 2))

    # A couple of saved listings for the default guest
    db.flush()  # assign ids so the composite-key wishlist rows can reference them
    db.add_all([WishlistItem(user_id=aarav.id, listing_id=listings[i].id) for i in (0, 6, 18)])
    db.commit()


def seed_if_empty(db: Session) -> None:
    if db.scalar(select(User.id).limit(1)) is None:
        seed(db)


if __name__ == "__main__":
    from .database import Base, SessionLocal, engine

    if "--reset" in sys.argv:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_if_empty(session)
    print("Database ready.")
