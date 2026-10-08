"""Single source of truth for price calculation, used both for quotes and when a booking is created,
so the price a guest sees is exactly the price that gets stored."""
from datetime import date

from ..config import SERVICE_FEE_RATE
from ..models import Listing
from ..schemas import Quote


DEFAULT_CARD_NIGHTS = 2  # cards show "₹X for 2 nights" when no dates are searched, like Airbnb


def quote(listing: Listing, check_in: date, check_out: date) -> Quote:
    return quote_nights(listing, (check_out - check_in).days)


def quote_nights(listing: Listing, nights: int) -> Quote:
    subtotal = listing.price_per_night * nights
    service_fee = round(subtotal * SERVICE_FEE_RATE)
    return Quote(
        nightly_rate=listing.price_per_night,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=listing.cleaning_fee,
        service_fee=service_fee,
        total=subtotal + listing.cleaning_fee + service_fee,
    )
