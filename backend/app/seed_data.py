"""Static seed content: users, amenities and listing templates. Kept separate from seed.py's insertion logic."""

U = "https://images.unsplash.com/photo-{}?auto=format&fit=crop&w=1200&q=70"

# Photo pools by theme; each listing takes a rotating slice so cards don't look identical.
PHOTOS = {
    "beach": ["1499793983690-e29da59ef1c2", "1520250497591-112f2f40a3f4", "1571896349842-33c89424de2d",
              "1566073771259-6a8506099945", "1582268611958-ebfd161ef9cf", "1602343168117-bb8ffe3e2e9f"],
    "cabin": ["1449158743715-0a90ebb6d2d8", "1510798831971-661eb04b3739", "1587061949409-02df41d5e562",
              "1518780664697-55e3ad937233", "1464146072230-91cabc968266"],
    "house": ["1564013799919-ab600027ffc6", "1568605114967-8130f3a36994", "1570129477492-45c003edd2be",
              "1580587771525-78b9dba3b914", "1600596542815-ffad4c1539a9", "1600585154340-be6161a56a0c",
              "1523217582562-09d0def993a6", "1576941089067-2de3c901e126"],
    "villa": ["1613490493576-7fde63acd811", "1613977257363-707ba9348227", "1512917774080-9991f1c4c750",
              "1582268611958-ebfd161ef9cf", "1602343168117-bb8ffe3e2e9f"],
    "apartment": ["1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688", "1560448204-e02f11c3d0e2",
                  "1493809842364-78817add7ffb", "1507089947368-19c1da9775ae"],
    "interior": ["1505691938895-1758d7feb511", "1600607687939-ce8a6c25118c", "1600566753190-17f0baa2a6c3",
                 "1600210492486-724fe5c67fb0", "1586023492125-27b2c045efd7", "1484154218962-a197022b5858",
                 "1556909114-f6e7ad7d3136", "1616594039964-ae9021a400a0", "1540518614846-7eded433c457",
                 "1554995207-c18c203602cb", "1595526114035-0d45ed16cfbf"],
}

# (name, icon key, section in the "What this place offers" modal)
AMENITIES = [
    ("Wifi", "wifi", "Internet and office"), ("Dedicated workspace", "workspace", "Internet and office"),
    ("Kitchen", "kitchen", "Kitchen and dining"), ("BBQ grill", "bbq", "Kitchen and dining"),
    ("Pool", "pool", "Outdoor"), ("Hot tub", "hottub", "Outdoor"), ("Beachfront", "beach", "Location features"),
    ("Lake access", "lake", "Location features"), ("Mountain view", "mountain", "Scenic views"),
    ("Air conditioning", "ac", "Heating and cooling"), ("Heating", "heating", "Heating and cooling"),
    ("Fireplace", "fireplace", "Heating and cooling"), ("Washer", "washer", "Bathroom and laundry"),
    ("TV", "tv", "Entertainment"), ("Gym", "gym", "Entertainment"), ("Pets allowed", "pets", "Services"),
    ("Self check-in", "key", "Services"), ("Free parking on premises", "parking", "Parking and facilities"),
    ("EV charger", "ev", "Parking and facilities"), ("Smoke alarm", "alarm", "Home safety"),
]

# (name, email, is_host, is_superhost, bio, pravatar index)
USERS = [
    ("Priya Sharma", "priya@example.com", True, True,
     "Architect turned host. I restore old homes along the Konkan coast and love sharing them.", 47),
    ("Daniel Brooks", "daniel@example.com", True, True,
     "Mountain guide by day. My cabins are where I'd want to stay after a long climb.", 12),
    ("Mei Tanaka", "mei@example.com", True, False,
     "Designer based in Kyoto and Lisbon. I host small, quiet apartments with good light.", 45),
    ("Rahul Mehta", "rahul@example.com", True, False,
     "Hospitality runs in the family. Ask me for the best thali in town.", 53),
    ("Sofia Rossi", "sofia@example.com", True, True,
     "Born in Florence, living by the sea. I host villas with my brother Marco.", 44),
    ("Aarav Patel", "aarav@example.com", False, False, "Weekend traveller, mostly chasing beaches.", 59),
    ("Emma Wilson", "emma@example.com", False, False, "Remote worker. Always looking for fast wifi and a view.", 32),
    ("Kabir Singh", "kabir@example.com", False, False, "Hiker and amateur photographer.", 60),
    ("Lena Fischer", "lena@example.com", False, False, "Slow traveller from Berlin.", 25),
]

# (title, property_type, category, city, state, country, lat, lng, price, cleaning, guests, bedrooms, beds,
#  baths, photo_theme, host_index, amenity names)
LISTINGS = [
    ("Sea-facing Portuguese villa with plunge pool", "villa", "beach", "Candolim", "Goa", "India", 15.518, 73.762, 18500, 2500, 8, 4, 5, 4, "villa", 0, ["Wifi", "Pool", "Kitchen", "Air conditioning", "Beachfront", "Free parking on premises", "BBQ grill"]),
    ("Palm-shaded cottage, two minutes to the sand", "cottage", "beach", "Palolem", "Goa", "India", 15.010, 74.023, 6200, 800, 3, 1, 2, 1, "beach", 0, ["Wifi", "Air conditioning", "Beachfront", "Self check-in"]),
    ("Restored Konkan house with mango orchard", "house", "countryside", "Alibag", "Maharashtra", "India", 18.641, 72.872, 12800, 1500, 6, 3, 3, 3, "house", 0, ["Wifi", "Kitchen", "Free parking on premises", "Pets allowed", "BBQ grill"]),
    ("Pine cabin with wood stove and valley views", "cabin", "cabins", "Manali", "Himachal Pradesh", "India", 32.239, 77.189, 7400, 900, 4, 2, 2, 1, "cabin", 1, ["Wifi", "Fireplace", "Heating", "Mountain view", "Kitchen"]),
    ("A-frame above the clouds", "cabin", "cabins", "Kasol", "Himachal Pradesh", "India", 32.010, 77.315, 5600, 700, 2, 1, 1, 1, "cabin", 1, ["Wifi", "Heating", "Mountain view", "Self check-in"]),
    ("Ski-in chalet with hot tub", "cabin", "skiing", "Gulmarg", "Jammu and Kashmir", "India", 34.048, 74.380, 16900, 2000, 6, 3, 4, 2, "cabin", 1, ["Wifi", "Hot tub", "Fireplace", "Heating", "Mountain view", "Kitchen"]),
    ("Glass cabin on the edge of a pine forest", "cabin", "cabins", "Banff", "Alberta", "Canada", 51.178, -115.571, 24500, 3000, 4, 2, 2, 1, "cabin", 1, ["Wifi", "Hot tub", "Fireplace", "Mountain view", "Kitchen", "EV charger"]),
    ("Lakeside log cabin with private dock", "cabin", "lakefront", "Lake Tahoe", "California", "United States", 39.096, -120.032, 28900, 3500, 8, 4, 5, 3, "cabin", 1, ["Wifi", "Lake access", "Fireplace", "Kitchen", "BBQ grill", "Washer"]),
    ("Machiya townhouse near Gion", "house", "iconic", "Kyoto", None, "Japan", 35.003, 135.778, 15200, 2200, 4, 2, 3, 1.5, "interior", 2, ["Wifi", "Air conditioning", "Heating", "Kitchen", "Washer"]),
    ("Light-filled loft in Alfama", "apartment", "iconic", "Lisbon", None, "Portugal", 38.711, -9.130, 9800, 1200, 2, 1, 1, 1, "apartment", 2, ["Wifi", "Kitchen", "Dedicated workspace", "Washer", "Self check-in"]),
    ("Minimal studio with river view", "apartment", "design", "Tokyo", None, "Japan", 35.708, 139.796, 8400, 1000, 2, 1, 1, 1, "apartment", 2, ["Wifi", "Air conditioning", "Dedicated workspace", "TV"]),
    ("Concrete-and-cedar house in the hills", "house", "design", "Hakone", None, "Japan", 35.233, 139.106, 21500, 2800, 6, 3, 3, 2, "house", 2, ["Wifi", "Hot tub", "Mountain view", "Kitchen", "Heating"]),
    ("Heritage haveli suite near Hawa Mahal", "guesthouse", "iconic", "Jaipur", "Rajasthan", "India", 26.924, 75.826, 5400, 600, 3, 1, 2, 1, "interior", 3, ["Wifi", "Air conditioning", "TV", "Self check-in"]),
    ("Lake Pichola rooftop apartment", "apartment", "lakefront", "Udaipur", "Rajasthan", "India", 24.576, 73.680, 7900, 900, 4, 2, 2, 2, "apartment", 3, ["Wifi", "Air conditioning", "Lake access", "Kitchen"]),
    ("Bandra sea-link view apartment", "apartment", "iconic", "Mumbai", "Maharashtra", "India", 19.054, 72.823, 11200, 1500, 4, 2, 2, 2, "apartment", 3, ["Wifi", "Air conditioning", "Dedicated workspace", "Gym", "TV", "Washer"]),
    ("Tea-estate bungalow with fireplace", "house", "countryside", "Munnar", "Kerala", "India", 10.089, 77.059, 8800, 1000, 6, 3, 3, 2, "house", 3, ["Wifi", "Fireplace", "Mountain view", "Kitchen", "Free parking on premises"]),
    ("Backwater houseboat with chef", "boat", "lakefront", "Alleppey", "Kerala", "India", 9.498, 76.338, 13500, 0, 4, 2, 2, 2, "beach", 3, ["Air conditioning", "Lake access", "Kitchen"]),
    ("Tiny home among coffee plantations", "tiny home", "tiny", "Coorg", "Karnataka", "India", 12.337, 75.806, 4200, 500, 2, 1, 1, 1, "cabin", 3, ["Wifi", "Free parking on premises", "BBQ grill", "Pets allowed"]),
    ("Cliffside villa over the Amalfi coast", "villa", "pools", "Positano", "Campania", "Italy", 40.628, 14.485, 52000, 5000, 8, 4, 4, 4, "villa", 4, ["Wifi", "Pool", "Air conditioning", "Kitchen", "Beachfront"]),
    ("Tuscan farmhouse among olive groves", "house", "countryside", "Chianti", "Tuscany", "Italy", 43.467, 11.250, 23800, 3000, 10, 5, 6, 4, "house", 4, ["Wifi", "Pool", "Kitchen", "Free parking on premises", "BBQ grill", "Pets allowed"]),
    ("Santorini cave house with caldera view", "house", "iconic", "Oia", "Santorini", "Greece", 36.461, 25.375, 31500, 2500, 4, 2, 2, 2, "villa", 4, ["Wifi", "Hot tub", "Air conditioning", "Self check-in"]),
    ("Infinity-pool villa in the rice terraces", "villa", "pools", "Ubud", "Bali", "Indonesia", -8.506, 115.262, 14600, 1500, 4, 2, 2, 2, "villa", 4, ["Wifi", "Pool", "Air conditioning", "Kitchen", "Gym"]),
    ("Overwater bungalow with lagoon steps", "bungalow", "tropical", "Maafushi", None, "Maldives", 3.941, 73.490, 38900, 3000, 2, 1, 1, 1, "beach", 4, ["Wifi", "Air conditioning", "Beachfront", "Pool"]),
    ("Jungle treehouse with outdoor shower", "treehouse", "treehouses", "Tulum", "Quintana Roo", "Mexico", 20.211, -87.465, 11900, 1200, 2, 1, 1, 1, "cabin", 4, ["Wifi", "Beachfront", "Self check-in"]),
    ("Treehouse in the Western Ghats", "treehouse", "treehouses", "Wayanad", "Kerala", "India", 11.685, 76.132, 9600, 800, 2, 1, 1, 1, "cabin", 0, ["Wifi", "Mountain view", "BBQ grill"]),
    ("Modernist house with lap pool", "house", "pools", "Palm Springs", "California", "United States", 33.830, -116.545, 34500, 3500, 6, 3, 3, 3, "house", 1, ["Wifi", "Pool", "Hot tub", "Air conditioning", "Kitchen", "EV charger"]),
    ("Clifftop mansion with cinema room", "mansion", "mansions", "Malibu", "California", "United States", 34.025, -118.779, 98000, 8000, 12, 6, 8, 7, "villa", 1, ["Wifi", "Pool", "Hot tub", "Gym", "TV", "Beachfront", "Kitchen"]),
    ("Colonial mansion with walled garden", "mansion", "mansions", "Fort Kochi", "Kerala", "India", 9.965, 76.242, 27500, 3000, 10, 5, 6, 5, "house", 3, ["Wifi", "Pool", "Air conditioning", "Kitchen", "Free parking on premises"]),
    ("Beach shack on a quiet bay", "cottage", "beach", "Gokarna", "Karnataka", "India", 14.546, 74.318, 3900, 400, 2, 1, 1, 1, "beach", 0, ["Wifi", "Beachfront", "Pets allowed"]),
    ("Tropical garden villa near Kandy", "villa", "tropical", "Kandy", None, "Sri Lanka", 7.290, 80.633, 10500, 1200, 6, 3, 3, 3, "villa", 4, ["Wifi", "Pool", "Air conditioning", "Kitchen"]),
    ("Cozy tiny cabin with stargazing deck", "tiny home", "tiny", "Joshua Tree", "California", "United States", 34.135, -116.313, 12400, 1500, 2, 1, 1, 1, "cabin", 1, ["Wifi", "Hot tub", "Self check-in", "BBQ grill"]),
    ("Fjord cabin with sauna", "cabin", "lakefront", "Geiranger", None, "Norway", 62.101, 7.206, 26800, 2500, 4, 2, 3, 1, "cabin", 2, ["Wifi", "Fireplace", "Lake access", "Heating", "Mountain view"]),
    ("Chamonix chalet facing Mont Blanc", "cabin", "skiing", "Chamonix", "Haute-Savoie", "France", 45.924, 6.869, 41500, 4000, 8, 4, 5, 3, "cabin", 4, ["Wifi", "Hot tub", "Fireplace", "Heating", "Mountain view", "Kitchen"]),
    ("Design apartment in the Gothic Quarter", "apartment", "design", "Barcelona", "Catalonia", "Spain", 41.383, 2.177, 13200, 1500, 4, 2, 2, 1, "apartment", 2, ["Wifi", "Air conditioning", "Kitchen", "Washer", "Dedicated workspace"]),
    ("Brownstone garden floor in Brooklyn", "apartment", "iconic", "New York", "New York", "United States", 40.686, -73.977, 21800, 2500, 4, 2, 2, 1, "apartment", 1, ["Wifi", "Kitchen", "Washer", "Heating", "Pets allowed"]),
    ("Coastal farmhouse with surf boards", "house", "beach", "Byron Bay", "New South Wales", "Australia", -28.643, 153.612, 25600, 3000, 8, 4, 4, 2, "house", 4, ["Wifi", "Pool", "Beachfront", "Kitchen", "BBQ grill", "Washer"]),
    ("Pondicherry French Quarter suite", "guesthouse", "iconic", "Puducherry", None, "India", 11.934, 79.836, 6800, 700, 2, 1, 1, 1, "interior", 0, ["Wifi", "Air conditioning", "Self check-in", "Washer"]),
    ("Rishikesh riverside retreat", "house", "countryside", "Rishikesh", "Uttarakhand", "India", 30.130, 78.320, 6900, 800, 5, 2, 3, 2, "house", 3, ["Wifi", "Mountain view", "Kitchen", "Dedicated workspace"]),
]

DESCRIPTION_TEMPLATE = (
    "{title}. Wake up to {view}, spend the afternoon {activity}, and end the day with dinner on the terrace.\n\n"
    "The space\nThe home sleeps {guests} across {bedrooms} bedroom(s), with fresh linens, a fully stocked kitchen "
    "and plenty of light. Everything has been chosen to feel calm and lived-in rather than staged.\n\n"
    "Guest access\nYou'll have the whole place to yourself. Self check-in details are shared the day before arrival.\n\n"
    "Other things to note\nNo parties or events. Quiet hours are 10pm to 7am."
)

VIEWS = {
    "beach": ("the sound of waves", "swimming and reading in a hammock"),
    "cabins": ("mist rolling over the pines", "hiking the nearby trails"),
    "skiing": ("fresh snow on the slopes", "skiing straight from the door"),
    "countryside": ("birdsong and open fields", "cycling through the villages"),
    "iconic": ("the city coming to life", "wandering markets and cafés"),
    "design": ("clean lines and soft morning light", "exploring galleries nearby"),
    "lakefront": ("still water outside the window", "kayaking and fishing"),
    "pools": ("a private pool glittering in the sun", "lounging poolside"),
    "tropical": ("palm fronds and warm breezes", "snorkelling the reef"),
    "treehouses": ("a canopy of green", "spotting birds from the deck"),
    "mansions": ("sweeping views across the grounds", "hosting a long lunch"),
    "tiny": ("a sky full of stars", "unplugging completely"),
}

REVIEW_TEXTS = [
    (5, "Exactly like the photos, maybe better. The host thought of everything and check-in was effortless."),
    (5, "One of the best stays we've had. Spotless, peaceful and the view is unreal."),
    (5, "We extended our trip by a day just to stay longer. Highly recommend."),
    (4, "Lovely place and great location. The wifi dropped a couple of times but nothing major."),
    (5, "Super responsive host and a beautifully designed space. Would book again in a heartbeat."),
    (4, "Comfortable beds and a well-equipped kitchen. A little noisy in the mornings."),
    (5, "Perfect for a family getaway. The kids loved it and so did we."),
    (3, "Nice spot but smaller than expected and the parking was tricky."),
    (5, "Peaceful, clean and thoughtfully furnished. Already planning our next visit."),
    (4, "Great value for the location. Directions from the host were very clear."),
]

# More homes in the regions featured as rows on the home page, so each carousel is full.
# Same tuple layout as LISTINGS.
_W = ["Wifi", "Kitchen", "Air conditioning", "Self check-in"]
EXTRA_LISTINGS = [
    # Goa
    ("Whitewashed villa steps from Anjuna beach", "villa", "beach", "Anjuna", "Goa", "India", 15.574, 73.740, 14200, 1800, 6, 3, 4, 3, "villa", 0, _W + ["Pool", "Beachfront"]),
    ("Siolim river cottage with hammock garden", "cottage", "countryside", "Siolim", "Goa", "India", 15.620, 73.760, 5900, 700, 3, 1, 2, 1, "house", 3, _W + ["Pets allowed"]),
    ("Assagao heritage house with courtyard pool", "house", "pools", "Assagao", "Goa", "India", 15.594, 73.778, 21800, 2500, 8, 4, 5, 4, "villa", 4, _W + ["Pool", "BBQ grill"]),
    ("Panjim Latin Quarter flat in Fontainhas", "apartment", "iconic", "Panaji", "Goa", "India", 15.497, 73.832, 4800, 500, 2, 1, 1, 1, "apartment", 2, _W + ["Dedicated workspace"]),
    ("Sea-view studio above Vagator cliffs", "apartment", "beach", "Vagator", "Goa", "India", 15.600, 73.734, 6500, 600, 2, 1, 1, 1, "beach", 0, _W + ["Beachfront"]),
    ("Jungle treehouse near Agonda", "treehouse", "treehouses", "Agonda", "Goa", "India", 15.045, 73.990, 7300, 600, 2, 1, 1, 1, "cabin", 3, ["Wifi", "Beachfront", "Self check-in"]),
    # Kerala
    ("Varkala clifftop cottage with sunset deck", "cottage", "beach", "Varkala", "Kerala", "India", 8.737, 76.703, 6100, 600, 3, 1, 2, 1, "beach", 0, _W + ["Beachfront"]),
    ("Kumarakom lakeside villa with private jetty", "villa", "lakefront", "Kumarakom", "Kerala", "India", 9.617, 76.430, 16400, 2000, 6, 3, 3, 3, "villa", 4, _W + ["Pool", "Lake access"]),
    ("Thekkady spice-garden bungalow", "bungalow", "tropical", "Thekkady", "Kerala", "India", 9.602, 77.161, 7700, 800, 4, 2, 2, 2, "house", 3, _W + ["Mountain view"]),
    ("Kovalam beach flat with lighthouse view", "apartment", "beach", "Kovalam", "Kerala", "India", 8.400, 76.978, 5200, 500, 3, 1, 2, 1, "apartment", 2, _W + ["Beachfront", "Pool"]),
    # Himachal Pradesh
    ("Old Manali stone cottage by the river", "cottage", "cabins", "Old Manali", "Himachal Pradesh", "India", 32.259, 77.180, 4600, 500, 3, 1, 2, 1, "cabin", 1, ["Wifi", "Heating", "Mountain view", "Kitchen"]),
    ("Dharamkot hillside home with Dhauladhar views", "house", "countryside", "Dharamkot", "Himachal Pradesh", "India", 32.255, 76.330, 5300, 600, 4, 2, 2, 1, "house", 1, ["Wifi", "Heating", "Mountain view", "Dedicated workspace"]),
    ("Shimla colonial cottage with fireplace", "cottage", "cabins", "Shimla", "Himachal Pradesh", "India", 31.104, 77.173, 8200, 900, 5, 2, 3, 2, "house", 3, ["Wifi", "Fireplace", "Heating", "Kitchen"]),
    ("Tirthan valley log cabin over the stream", "cabin", "cabins", "Tirthan Valley", "Himachal Pradesh", "India", 31.640, 77.450, 5800, 600, 4, 2, 2, 1, "cabin", 1, ["Wifi", "Fireplace", "Mountain view", "BBQ grill"]),
    # Rajasthan
    ("Jaisalmer sandstone haveli with rooftop", "guesthouse", "iconic", "Jaisalmer", "Rajasthan", "India", 26.915, 70.908, 4900, 500, 3, 1, 2, 1, "interior", 3, _W + ["TV"]),
    ("Jodhpur blue-city home below the fort", "house", "iconic", "Jodhpur", "Rajasthan", "India", 26.298, 73.018, 6300, 700, 5, 2, 3, 2, "house", 3, _W + ["Washer"]),
    ("Pushkar lake-view suite with courtyard", "guesthouse", "lakefront", "Pushkar", "Rajasthan", "India", 26.490, 74.551, 3900, 400, 2, 1, 1, 1, "interior", 0, _W + ["Lake access"]),
    ("Aravalli farm villa with pool near Jaipur", "villa", "pools", "Jaipur", "Rajasthan", "India", 26.960, 75.900, 15800, 2000, 8, 4, 4, 4, "villa", 4, _W + ["Pool", "Free parking on premises"]),
    ("Mount Abu bungalow among the hills", "bungalow", "countryside", "Mount Abu", "Rajasthan", "India", 24.593, 72.708, 7100, 800, 6, 3, 3, 2, "house", 1, _W + ["Mountain view", "Fireplace"]),
    # Maharashtra
    ("Lonavala valley villa with infinity pool", "villa", "pools", "Lonavala", "Maharashtra", "India", 18.750, 73.407, 19500, 2500, 10, 5, 6, 5, "villa", 0, _W + ["Pool", "Mountain view", "BBQ grill"]),
    ("Pune Koregaon Park designer flat", "apartment", "design", "Pune", "Maharashtra", "India", 18.536, 73.893, 5600, 600, 3, 1, 2, 1, "apartment", 2, _W + ["Dedicated workspace", "Gym"]),
    ("Mahabaleshwar strawberry-farm cottage", "cottage", "countryside", "Mahabaleshwar", "Maharashtra", "India", 17.925, 73.658, 6700, 700, 4, 2, 2, 1, "house", 3, _W + ["Mountain view", "Pets allowed"]),
    ("Colaba art-deco flat near the Gateway", "apartment", "iconic", "Mumbai", "Maharashtra", "India", 18.915, 72.826, 9400, 1000, 3, 1, 2, 1, "apartment", 2, _W + ["TV", "Washer"]),
    # Karnataka
    ("Chikmagalur coffee-estate bungalow", "bungalow", "countryside", "Chikmagalur", "Karnataka", "India", 13.316, 75.773, 8100, 900, 6, 3, 3, 2, "house", 3, _W + ["Mountain view", "BBQ grill"]),
    ("Bengaluru Indiranagar loft with terrace", "apartment", "design", "Bengaluru", "Karnataka", "India", 12.972, 77.641, 4700, 500, 2, 1, 1, 1, "apartment", 2, _W + ["Dedicated workspace"]),
    ("Hampi boulder-view cottage", "cottage", "iconic", "Hampi", "Karnataka", "India", 15.335, 76.462, 3600, 400, 2, 1, 1, 1, "cabin", 0, ["Wifi", "Self check-in", "Mountain view"]),
    ("Kabini riverside villa by the forest", "villa", "lakefront", "Kabini", "Karnataka", "India", 11.951, 76.350, 17900, 2000, 6, 3, 3, 3, "villa", 4, _W + ["Pool", "Lake access"]),
    # Italy
    ("Florence loft overlooking the Duomo", "apartment", "iconic", "Florence", "Tuscany", "Italy", 43.773, 11.256, 17600, 2000, 3, 1, 2, 1, "apartment", 4, _W + ["Washer"]),
    ("Lake Como villa with boathouse", "villa", "lakefront", "Bellagio", "Lombardy", "Italy", 45.986, 9.261, 46500, 4500, 8, 4, 4, 4, "villa", 4, _W + ["Lake access", "Pool"]),
    ("Puglia trullo with olive grove pool", "cottage", "countryside", "Alberobello", "Apulia", "Italy", 40.784, 17.236, 15900, 1800, 4, 2, 2, 2, "house", 4, _W + ["Pool", "BBQ grill"]),
    # Japan
    ("Niseko ski chalet with onsen tub", "cabin", "skiing", "Niseko", "Hokkaido", "Japan", 42.804, 140.687, 33500, 3500, 8, 4, 5, 2, "cabin", 2, ["Wifi", "Hot tub", "Heating", "Mountain view", "Kitchen"]),
    ("Osaka canal-side design flat", "apartment", "design", "Osaka", None, "Japan", 34.669, 135.501, 7900, 900, 3, 1, 2, 1, "apartment", 2, _W + ["Washer"]),
    ("Okinawa beach house with sea terrace", "house", "tropical", "Onna", "Okinawa", "Japan", 26.497, 127.853, 19800, 2200, 6, 3, 3, 2, "beach", 2, _W + ["Beachfront", "BBQ grill"]),
]
