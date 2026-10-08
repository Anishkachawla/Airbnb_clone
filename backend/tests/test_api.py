from datetime import date, timedelta

from .conftest import GUEST, HOST, OTHER_HOST

FAR = date.today() + timedelta(days=200)


def _new_listing(client, **overrides):
    body = {
        "title": "Test hut", "description": "A small hut for testing things.", "property_type": "cabin",
        "category": "cabins", "city": "Testville", "country": "India", "latitude": 10, "longitude": 70,
        "price_per_night": 1000, "cleaning_fee": 100, "max_guests": 2, "bedrooms": 1, "beds": 1,
        "bathrooms": 1, "image_urls": ["https://example.com/a.jpg"], "amenity_ids": [1, 2],
    }
    body.update(overrides)
    return client.post("/listings", json=body, headers=HOST)


def test_search_paginates(client):
    r = client.get("/listings", params={"page_size": 5})
    assert r.status_code == 200
    data = r.json()
    assert len(data["items"]) == 5 and data["total"] > 5 and data["pages"] > 1


def test_search_filters(client):
    data = client.get("/listings", params={"location": "goa"}).json()
    assert data["total"] >= 1 and all(i["state"] == "Goa" for i in data["items"])
    data = client.get("/listings", params={"max_price": 6000, "page_size": 48}).json()
    assert all(i["price_per_night"] <= 6000 for i in data["items"])


def test_booking_flow_blocks_dates(client):
    listing_id = _new_listing(client).json()["id"]
    ci, co = FAR, FAR + timedelta(days=3)

    quote = client.get(f"/listings/{listing_id}/quote", params={"check_in": ci, "check_out": co}).json()
    assert quote["nights"] == 3 and quote["total"] == 3000 + 100 + quote["service_fee"]

    r = client.post("/bookings", json={"listing_id": listing_id, "check_in": str(ci), "check_out": str(co), "guests": 2},
                    headers=GUEST)
    assert r.status_code == 201, r.text
    assert r.json()["total_price"] == quote["total"]

    # overlapping request is rejected
    r = client.post("/bookings", json={"listing_id": listing_id, "check_in": str(ci + timedelta(days=1)),
                                       "check_out": str(co + timedelta(days=1)), "guests": 1}, headers=GUEST)
    assert r.status_code == 409

    # same-day turnover is allowed
    r = client.post("/bookings", json={"listing_id": listing_id, "check_in": str(co),
                                       "check_out": str(co + timedelta(days=2)), "guests": 1}, headers=GUEST)
    assert r.status_code == 201

    # dates appear as booked and the listing drops out of a date-filtered search
    assert {"check_in": str(ci), "check_out": str(co)} in client.get(f"/listings/{listing_id}/availability").json()
    ids = [i["id"] for i in client.get("/listings", params={"location": "Testville", "check_in": ci,
                                                            "check_out": co}).json()["items"]]
    assert listing_id not in ids

    assert any(b["listing"]["id"] == listing_id for b in client.get("/bookings/mine", headers=GUEST).json())


def test_booking_validation(client):
    listing_id = _new_listing(client).json()["id"]
    bad = [
        ({"check_in": str(FAR), "check_out": str(FAR), "guests": 1}, 422),          # zero nights
        ({"check_in": str(date.today() - timedelta(days=2)), "check_out": str(date.today()), "guests": 1}, 400),
        ({"check_in": str(FAR), "check_out": str(FAR + timedelta(days=1)), "guests": 9}, 400),  # too many guests
    ]
    for body, status in bad:
        assert client.post("/bookings", json={"listing_id": listing_id, **body}, headers=GUEST).status_code == status
    # hosts can't book their own place
    r = client.post("/bookings", json={"listing_id": listing_id, "check_in": str(FAR),
                                       "check_out": str(FAR + timedelta(days=1)), "guests": 1}, headers=HOST)
    assert r.status_code == 400


def test_cancel_frees_dates(client):
    listing_id = _new_listing(client).json()["id"]
    body = {"listing_id": listing_id, "check_in": str(FAR), "check_out": str(FAR + timedelta(days=2)), "guests": 1}
    booking_id = client.post("/bookings", json=body, headers=GUEST).json()["id"]
    assert client.post(f"/bookings/{booking_id}/cancel", headers=GUEST).json()["status"] == "cancelled"
    assert client.post("/bookings", json=body, headers=GUEST).status_code == 201


def test_host_crud_and_ownership(client):
    created = _new_listing(client, title="Original title").json()
    lid = created["id"]
    payload = {**{k: created[k] for k in ("description", "property_type", "category", "city", "country", "latitude",
                                          "longitude", "price_per_night", "cleaning_fee", "max_guests", "bedrooms",
                                          "beds", "bathrooms", "min_nights")},
               "title": "Renamed", "image_urls": ["https://example.com/b.jpg"], "amenity_ids": [3]}
    assert client.put(f"/listings/{lid}", json=payload, headers=OTHER_HOST).status_code == 403
    r = client.put(f"/listings/{lid}", json=payload, headers=HOST)
    assert r.status_code == 200 and r.json()["title"] == "Renamed" and len(r.json()["amenities"]) == 1
    assert client.post("/listings", json=payload, headers=GUEST).status_code == 403  # guests can't host
    assert client.delete(f"/listings/{lid}", headers=HOST).status_code == 204
    assert client.get(f"/listings/{lid}").status_code == 404


def test_delete_blocked_by_upcoming_booking(client):
    lid = _new_listing(client).json()["id"]
    client.post("/bookings", json={"listing_id": lid, "check_in": str(FAR), "check_out": str(FAR + timedelta(days=1)),
                                   "guests": 1}, headers=GUEST)
    assert client.delete(f"/listings/{lid}", headers=HOST).status_code == 409


def test_wishlist_toggle(client):
    assert client.put("/me/wishlist/5", headers=GUEST).status_code == 204
    assert client.put("/me/wishlist/5", headers=GUEST).status_code == 204  # idempotent
    assert 5 in [l["id"] for l in client.get("/me/wishlist", headers=GUEST).json()]
    assert client.get("/listings/5", headers=GUEST).json()["is_wishlisted"] is True
    client.delete("/me/wishlist/5", headers=GUEST)
    assert 5 not in [l["id"] for l in client.get("/me/wishlist", headers=GUEST).json()]


def test_review_after_completed_stay(client):
    trips = client.get("/bookings/mine", headers=GUEST).json()
    done = next(t for t in trips if not t["has_review"] and date.fromisoformat(t["check_out"]) <= date.today()
                and t["status"] == "confirmed")
    r = client.post("/reviews", json={"booking_id": done["id"], "rating": 5, "comment": "Lovely stay"}, headers=GUEST)
    assert r.status_code == 201
    assert client.post("/reviews", json={"booking_id": done["id"], "rating": 4, "comment": "Again"},
                       headers=GUEST).status_code == 409
    upcoming = next(t for t in trips if date.fromisoformat(t["check_in"]) > date.today())
    assert client.post("/reviews", json={"booking_id": upcoming["id"], "rating": 5, "comment": "Too early"},
                       headers=GUEST).status_code == 400


def test_meta_matches_seed_and_validation(client):
    """Guards against the frontend's category/type lists drifting from what the API accepts."""
    meta = client.get("/meta").json()
    page = client.get("/listings", params={"page_size": 100}).json()
    assert {l["category"] for l in page["items"]} <= set(meta["categories"])
    assert {l["property_type"] for l in page["items"]} <= set(meta["property_types"])
    assert all(a["section"] for a in meta["amenities"])
    assert meta["price_min"] <= meta["price_max"]


def test_every_category_and_type_can_be_created(client):
    meta = client.get("/meta").json()
    for category, ptype in zip(meta["categories"], meta["property_types"] * 2):
        r = _new_listing(client, category=category, property_type=ptype)
        assert r.status_code == 201, (category, ptype, r.text)
    assert _new_listing(client, category="not-a-category").status_code == 422


def test_unknown_or_missing_user(client):
    assert client.get("/me").status_code == 401
    assert client.get("/me", headers={"X-User-Id": "9999"}).status_code == 401
    assert client.get("/bookings/mine", headers=GUEST).status_code == 200


def test_card_total_matches_checkout_quote(client):
    """The 'for N nights' price on a card must equal what checkout will charge."""
    ci, co = FAR + timedelta(days=30), FAR + timedelta(days=33)
    card = client.get("/listings", params={"check_in": ci, "check_out": co, "page_size": 1}).json()["items"][0]
    quote = client.get(f"/listings/{card['id']}/quote", params={"check_in": ci, "check_out": co}).json()
    assert card["stay_nights"] == 3 and card["stay_total"] == quote["total"]
    default = client.get("/listings", params={"page_size": 1}).json()["items"][0]
    assert default["stay_nights"] == 2
