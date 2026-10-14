/**
 * DOUBLETREE BY HILTON HOTEL IN LOS ANGELES DOWNTOWN
 * Master Dataset - Downtown Los Angeles, California, USA
 */

const INITIAL_DATA = {
  hotelInfo: {
    name: "DOUBLETREE BY HILTON HOTEL IN LOS ANGELES DOWNTOWN",
    shortName: "DoubleTree by Hilton Los Angeles Downtown",
    tagline: "Warm Welcome, Iconic Hospitality & Scenic Rooftop Kyoto Gardens in DTLA",
    rating: 4.92,
    reviewCount: 512,
    stars: 4,
    address: "120 S Los Angeles St, Los Angeles, CA 90012, United States",
    neighborhood: "Downtown Los Angeles & Little Tokyo Arts District",
    phone: "+1 (213) 629-1200",
    tollFree: "+1 (800) 222-TREE",
    email: "doubletreehotel49@gmail.com",
    adminEmail: "doubletreehotel49@gmail.com",
    whatsapp: "+12136291200",
    whatsappAvailable: false,
    whatsappNotice: "WhatsApp Concierge is currently unavailable. For payment procedures and booking inquiries, please contact our General Manager directly via Gmail at doubletreehotel49@gmail.com.",
    whatsappDefaultMsg: "Hello DoubleTree by Hilton Los Angeles Downtown Manager, I am inquiring about room reservations and payment.",
    checkInTime: "3:00 PM",
    checkOutTime: "12:00 PM",
    currency: "USD",
    currencySymbol: "$",
    currencies: [
      { code: "USD", symbol: "$", rate: 1.0 },
      { code: "EUR", symbol: "€", rate: 0.92 },
      { code: "GBP", symbol: "£", rate: 0.78 },
      { code: "CAD", symbol: "CA$", rate: 1.36 }
    ]
  },

  roomTypes: [
    {
      id: "deluxe-king",
      name: "Deluxe DTLA Skyline King Room",
      category: "Deluxe",
      basePrice: 289,
      capacity: { adults: 2, children: 1, maxGuests: 3 },
      bedConfig: "1 Sweet Dreams® King Plush Bed",
      size: "420 sq ft / 39 sqm",
      floor: "Floors 12-18",
      view: "Panoramic Downtown Los Angeles Skyline",
      shortDescription: "Floor-to-ceiling vistas of the vibrant DTLA skyline, custom ergonomic workspace, and Sweet Dreams® plush bedding.",
      fullDescription: "Immerse yourself in contemporary Californian luxury with breathtaking views over downtown Los Angeles. Featuring our signature Sweet Dreams® by DoubleTree king bed, an executive ergonomic work desk with universal charging, Crabtree & Evelyn bath amenities, 55\" 4K HDTV with casting capability, and refrigerator.",
      images: [
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["DTLA Skyline View", "Sweet Dreams® Plush Bed", "Warm DoubleTree Cookie on Arrival", "Complimentary High-Speed Wi-Fi", "55\" 4K Smart TV", "Cuisinart Coffee Maker", "Ergonomic Workstation", "Digital Climate Control", "In-Room Laptop Safe"],
      featured: true,
      badge: "Guest Favorite"
    },
    {
      id: "presidential-suite",
      name: "The Presidential Skyline Penthouse Suite",
      category: "Presidential",
      basePrice: 850,
      capacity: { adults: 4, children: 2, maxGuests: 6 },
      bedConfig: "1 King Master + 1 Queen Bedroom",
      size: "1,450 sq ft / 135 sqm",
      floor: "Penthouse Floor (Level 21)",
      view: "360° Los Angeles Basin & San Gabriel Mountains",
      shortDescription: "The premier downtown residence with expansive living salon, dining area for 8, wet bar, and private Kyoto Gardens VIP access.",
      fullDescription: "Our signature penthouse suite commanding unobstructed 360-degree vistas of the Los Angeles skyline and mountain horizon. Boasts a master bedroom with spa soaking tub, separate guest bedroom, parlor living salon with grand wet bar, 8-person conference dining table, VIP concierge service, and complimentary valet parking.",
      images: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["360° Los Angeles Basin View", "Executive Parlor & Wet Bar", "Dedicated VIP Concierge", "Complimentary Valet Parking", "Kyoto Gardens Access", "Soaking Marble Jacuzzi", "Walk-in Wardrobe", "Keurig Gourmet Espresso", "Bose Bluetooth Audio"],
      featured: true,
      badge: "Signature Penthouse"
    },
    {
      id: "executive-club",
      name: "Executive Corner King Suite",
      category: "Executive",
      basePrice: 385,
      capacity: { adults: 2, children: 1, maxGuests: 3 },
      bedConfig: "1 King Bed + Pull-out Sofa Bed",
      size: "620 sq ft / 58 sqm",
      floor: "Floors 15-20",
      view: "Little Tokyo & Civic Center Skyline",
      shortDescription: "Spacious corner layout with separate living area, panoramic dual-aspect windows, and Executive Club privileges.",
      fullDescription: "Engineered for discerning corporate travelers and weekend explorers. Highlights include dual corner picture windows overlooking Downtown LA, private seating salon with sleeper sofa, marble bathroom with walk-in rainfall shower, and complimentary daily buffet breakfast and evening hors d'oeuvres at Justice Urban Tavern.",
      images: [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Dual Aspect Corner Windows", "Executive Living Area", "High-Speed Mesh Wi-Fi", "Complimentary Daily Breakfast", "Crabtree & Evelyn Toiletries", "Ergonomic Workstation", "Cuisinart Single-Serve Brewer", "Robes & Slippers"],
      featured: true,
      badge: "Executive Level"
    },
    {
      id: "junior-garden",
      name: "Kyoto Garden View Suite",
      category: "Junior Suite",
      basePrice: 295,
      capacity: { adults: 2, children: 1, maxGuests: 3 },
      bedConfig: "1 California King Bed",
      size: "510 sq ft / 47 sqm",
      floor: "Floors 3-5",
      view: "Historic Rooftop Kyoto Japanese Gardens & Waterfalls",
      shortDescription: "Direct, peaceful views overlooking our historic half-acre rooftop Kyoto Japanese Gardens and cascading waterfalls.",
      fullDescription: "A serene Japanese-inspired haven in the heart of Downtown LA. Step into tranquility with windows framing our lush half-acre rooftop garden, authentic stone lanterns, and serene koi ponds. Features minimalist Japanese cedar aesthetics, plush velvet seating, and deep soaking tub.",
      images: [
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Kyoto Garden Views", "Tranquil Waterfall Soundscape", "Sweet Dreams® King Bed", "Soaking Bath & Shower", "Green Tea Ceremony Set", "Ultra High-Speed Wi-Fi", "Digital Key Access"],
      featured: false,
      badge: "Tranquil Oasis"
    },
    {
      id: "family-grand",
      name: "Family Two-Queen Bed Suite",
      category: "Family",
      basePrice: 340,
      capacity: { adults: 4, children: 2, maxGuests: 6 },
      bedConfig: "2 Sweet Dreams® Queen Beds",
      size: "580 sq ft / 54 sqm",
      floor: "Floors 8-14",
      view: "Los Angeles City View",
      shortDescription: "Comfortable two-queen layout with pull-out sleeper sofa, mini-refrigerator, and ample space for families.",
      fullDescription: "Perfect for family vacations in Los Angeles, located minutes from Universal Studios Hollywood and Crypto.com Arena. Offers two plush queen beds, seating lounge with sofa bed, 55\" streaming television, family dining breakfast nook, and adjoining room options.",
      images: [
        "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Two Queen Beds", "Family Seating Area", "Kids Welcome Treat Pack", "55\" TV with Streaming Apps", "Mini-Refrigerator & Microwave", "Connecting Room Availability", "Complimentary Crib on Request"],
      featured: false,
      badge: "Family Choice"
    },
    {
      id: "classic-standard",
      name: "DoubleTree Classic King Room",
      category: "Standard",
      basePrice: 199,
      capacity: { adults: 2, children: 0, maxGuests: 2 },
      bedConfig: "1 King Bed",
      size: "350 sq ft / 32 sqm",
      floor: "Floors 6-10",
      view: "Los Angeles City Center",
      shortDescription: "Essential DoubleTree hospitality with Sweet Dreams® bedding, warm cookie welcome, and high-speed Wi-Fi.",
      fullDescription: "Clean, contemporary comfort tailored for business or leisure. Features a signature Sweet Dreams® King bed, well-lit executive desk with ergonomic chair, Crabtree & Evelyn toiletries, and easy access to Little Tokyo dining.",
      images: [
        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Sweet Dreams® Bedding", "Downtown City View", "Warm Chocolate Chip Cookie", "High-Speed Wi-Fi", "Workstation & Ergonomic Chair", "In-Room Safe"],
      featured: false,
      badge: "Great Value"
    }
  ],

  // Physical rooms inventory (All reset to Available & Clean)
  physicalRooms: [
    { roomNumber: "601", roomTypeId: "classic-standard", status: "Available", floor: 6, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Standard King, DTLA city view" },
    { roomNumber: "602", roomTypeId: "classic-standard", status: "Available", floor: 6, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Standard King, quiet corridor" },
    { roomNumber: "703", roomTypeId: "junior-garden", status: "Available", floor: 7, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Overlooking Kyoto Garden waterfalls" },
    { roomNumber: "704", roomTypeId: "junior-garden", status: "Available", floor: 7, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Kyoto Garden view with balcony" },
    
    { roomNumber: "1201", roomTypeId: "deluxe-king", status: "Available", floor: 12, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Prime DTLA skyline view" },
    { roomNumber: "1202", roomTypeId: "deluxe-king", status: "Available", floor: 12, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Panoramic skyline King" },
    { roomNumber: "1203", roomTypeId: "deluxe-king", status: "Available", floor: 12, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "High floor deluxe suite" },
    { roomNumber: "1404", roomTypeId: "family-grand", status: "Available", floor: 14, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Two Queen beds ready" },
    { roomNumber: "1405", roomTypeId: "family-grand", status: "Available", floor: 14, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Family suite, spacious layout" },

    { roomNumber: "1801", roomTypeId: "executive-club", status: "Available", floor: 18, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Executive corner layout" },
    { roomNumber: "1802", roomTypeId: "executive-club", status: "Available", floor: 18, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Executive club lounge access" },
    { roomNumber: "1803", roomTypeId: "deluxe-king", status: "Available", floor: 18, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "High floor panoramic view" },
    { roomNumber: "1804", roomTypeId: "executive-club", status: "Available", floor: 18, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Executive floor King" },

    { roomNumber: "2101", roomTypeId: "presidential-suite", status: "Available", floor: 21, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Kyoto Garden Penthouse ready" },
    { roomNumber: "2102", roomTypeId: "presidential-suite", status: "Available", floor: 21, cleaningStatus: "Clean", lastCleaned: "2026-10-13 12:00", notes: "Skyline Presidential Penthouse ready" }
  ],

  // Live Reservations Database (Clean slate - 0 bookings)
  reservations: [],

  // Registered Guest / User Accounts Database (Admin can activate & deactivate)
  userAccounts: [],

  // Facilities & Hotel Amenities
  facilities: [
    {
      id: "kyoto-gardens",
      title: "Rooftop Kyoto Japanese Gardens & Waterfalls",
      category: "Historic Sanctuary",
      hours: "06:00 AM - 10:00 PM Daily",
      description: "Our world-renowned half-acre rooftop sanctuary created in the authentic Japanese tradition, featuring tranquil koi ponds, cascading waterfalls, Japanese maples, and a stunning backdrop of the DTLA skyline.",
      image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      features: ["Half-Acre Rooftop Garden", "Cascading Waterfalls & Koi Ponds", "Stunning Downtown LA Skyline Views", "Outdoor Wedding & Event Lawn", "Peaceful Meditation Walkways"]
    },
    {
      id: "justice-tavern",
      title: "Justice Urban Tavern & Craft Beer Bar",
      category: "Gastronomy & Libations",
      hours: "Breakfast: 06:30 AM - 11:00 AM | Dinner: 05:00 PM - 11:00 PM",
      description: "A vibrant culinary tribute to Downtown Los Angeles featuring locally crafted beers on tap, artisanal flatbreads, prime California burgers, and sustainable local farm-to-table specialties.",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      features: ["California Farm-to-Table Menu", "Extensive Local Craft Beer Taps", "Indoor & Patio Seating", "Warm Cookie Dessert Creations", "Happy Hour Specials"]
    },
    {
      id: "rendezvous-lounge",
      title: "Rendezvous Lounge & Cocktail Bar",
      category: "Cocktails & Social",
      hours: "04:00 PM - 12:00 AM Daily",
      description: "An elegant atrium lounge serving signature craft cocktails, California Napa Valley wines by the glass, Japanese whiskeys, and delicious light bites after a day exploring the city.",
      image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
      features: ["California & Japanese Whiskey Flight", "Artisan Craft Cocktails", "Light Bites & Shareable Platters", "Comfortable Atrium Seating", "High-Definition Sports Screens"]
    },
    {
      id: "fitness-center",
      title: "24/7 Panoramic Fitness Center",
      category: "Fitness & Wellness",
      hours: "24 Hours / 7 Days a Week",
      description: "Equipped with state-of-the-art Precor cardio machines with personal television screens, free weight stations, resistance gear, and exercise balls.",
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80",
      features: ["Precor Cardio with Personal Screens", "Free Weights & Dumbbells", "Filtered Water & Towel Service", "Accessible 24 Hours with Room Key", "Stretching & Yoga Mats"]
    },
    {
      id: "golden-ballroom",
      title: "Golden State Ballroom & Summit Center",
      category: "Meetings & Events",
      hours: "By Reservation (24/7 Event Team)",
      description: "Over 21,000 sq. ft. of versatile event space including our grand ballroom accommodating up to 450 guests, along with 16 breakout executive boardrooms.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      features: ["21,000+ sq ft Flexible Event Space", "Capacity up to 450 Guests", "Integrated Audio-Visual & 4K Projection", "Dedicated Event & Banquet Planning", "Rooftop Garden Reception Space"]
    },
    {
      id: "valet-transit",
      title: "Executive Valet & DTLA Express Transit",
      category: "Guest Convenience",
      hours: "24/7 On Site",
      description: "Convenient covered valet parking on-site with EV charging stations. Located steps from the Metro Little Tokyo/Arts District station with rapid access to LAX, Hollywood, and Santa Monica.",
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80",
      features: ["Covered On-Site Valet Parking", "Tesla & Universal EV Charging", "Steps to Metro Regional Connector", "Luggage Storage & Bell Service", "Ride-Share Pick-Up Court"]
    }
  ],

  // Restaurant Menu
  menu: {
    breakfast: [
      { name: "DoubleTree Classic American Breakfast", price: 24, desc: "Two farm-fresh eggs any style, applewood smoked bacon or pork sausage, breakfast potatoes, toasted artisanal sourdough", dietary: ["American Classic"], image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80" },
      { name: "California Avocado Tartine", price: 21, desc: "Hass avocado, vine-ripened heirloom tomatoes, pickled red onion, cotija cheese, organic poached egg on country bread", dietary: ["Vegetarian", "Healthy Choice"], image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80" },
      { name: "Brioche French Toast & Berry Compote", price: 19, desc: "Cinnamon vanilla egg-dipped brioche, organic maple syrup, fresh California strawberries and blueberries, whipped butter", dietary: ["Vegetarian"], image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80" },
      { name: "Downtown Breakfast Burrito", price: 18, desc: "Scrambled eggs, spicy chorizo, tater tots, cheddar jack cheese, roasted salsa roja, warm flour tortilla", dietary: ["Local Favorite"], image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80" }
    ],
    lunch: [
      { name: "Justice Tavern Burger", price: 25, desc: "Half-pound Angus beef patty, aged white cheddar, caramelized balsamic onions, garlic aioli, brioche bun, seasoned garlic fries", dietary: ["Signature"], image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80" },
      { name: "Grilled Santa Barbara Sea Bass", price: 34, desc: "Pacific sea bass, lemon-thyme glaze, grilled baby asparagus, roasted fingerling potatoes", dietary: ["Gluten-Free", "Seafood"], image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80" },
      { name: "Burrata & Mission Fig Salad", price: 22, desc: "California fresh burrata, arugula, sweet Mission figs, candied pecans, 15-year Modena balsamic drizzle", dietary: ["Vegetarian"], image: "https://images.unsplash.com/photo-1592417817098-8f3d69109853?auto=format&fit=crop&w=600&q=80" }
    ],
    dinner: [
      { name: "Charbroiled USDA Prime Ribeye 14oz", price: 54, desc: "Center-cut prime beef, roasted garlic herb butter, broccolini, Yukon gold potato purée", dietary: ["Gluten-Free", "Chef's Cut"], image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
      { name: "Pacific Diver Sea Scallops", price: 42, desc: "Pan-seared jumbo sea scallops, sweet corn emulsion, crispy prosciutto chips, micro cilantro", dietary: ["Seafood", "Gluten-Free"], image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80" },
      { name: "Wild Mushroom & Truffle Pappardelle", price: 32, desc: "Fresh handmade pasta, chanterelles, shaved black truffles, aged Parmigiano Reggiano, white wine reduction", dietary: ["Vegetarian"], image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80" },
      { name: "Warm DoubleTree Cookie Skillet Sundae", price: 14, desc: "Freshly baked DoubleTree chocolate chip cookie served warm in cast iron with Madagascar vanilla ice cream and caramel drizzle", dietary: ["Iconic Signature Dessert"], image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" }
    ],
    cocktails: [
      { name: "Downtown Angel City Old Fashioned", price: 19, desc: "Woodford Reserve Bourbon, spiced demerara, angostura & orange bitters, expressed orange peel", dietary: ["Craft Classic"], image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80" },
      { name: "Little Tokyo Yuzu Blossom", price: 18, desc: "Roku Japanese Gin, fresh yuzu juice, elderflower liqueur, sparkling club soda, cucumber ribbon", dietary: ["Little Tokyo Special"], image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80" },
      { name: "Napa Valley Cabernet Sauvignon Flight", price: 24, desc: "A curated trio of premier California vintage cabernets from Napa and Sonoma County", dietary: ["California Wine"], image: "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80" }
    ]
  },

  // Gallery
  gallery: [
    { title: "DoubleTree by Hilton DTLA Exterior", category: "Architecture", url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80" },
    { title: "Rooftop Kyoto Japanese Gardens", category: "Pool & Spa", url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80" },
    { title: "Deluxe DTLA Skyline King Suite", category: "Rooms", url: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80" },
    { title: "Presidential Skyline Penthouse Parlor", category: "Rooms", url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80" },
    { title: "Justice Urban Tavern Craft Bar", category: "Dining", url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80" },
    { title: "Warm DoubleTree Chocolate Chip Cookie", category: "Dining", url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80" },
    { title: "Golden State Grand Ballroom", category: "Events", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80" },
    { title: "Executive Corner King Bedroom", category: "Rooms", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80" },
    { title: "Downtown Los Angeles Evening Skyline", category: "Architecture", url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80" },
    { title: "Rendezvous Lounge Cocktails", category: "Dining", url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80" },
    { title: "Precor Panoramic Fitness Pavilion", category: "Pool & Spa", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80" },
    { title: "Grand Atrium Lobby", category: "Architecture", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" }
  ],

  // Customer Reviews
  reviews: [
    {
      id: "rev-1",
      guestName: "Amanda Richardson",
      country: "Beverly Hills, CA, USA",
      date: "October 2026",
      roomType: "The Presidential Skyline Penthouse Suite",
      rating: 5,
      categories: { cleanliness: 5, comfort: 5, staff: 5, location: 5, facilities: 5, value: 5 },
      title: "The Kyoto Gardens on the roof are magical!",
      comment: "We loved our stay at DoubleTree Downtown LA! Receiving warm chocolate chip cookies right at check-in set the tone. The rooftop Japanese garden was a serene retreat amidst the vibrant DTLA skyline. Walking to Little Tokyo restaurants was effortless.",
      verified: true
    },
    {
      id: "rev-2",
      guestName: "Hiroshi Tanaka",
      country: "Tokyo, Japan",
      date: "October 2026",
      roomType: "Deluxe DTLA Skyline King Room",
      rating: 5,
      categories: { cleanliness: 5, comfort: 5, staff: 5, location: 5, facilities: 4.9, value: 4.8 },
      title: "Perfect location for business and Little Tokyo",
      comment: "Superb location right on Los Angeles St. The Sweet Dreams bed was exceptionally comfortable, and the staff were welcoming. Justice Urban Tavern served great California craft beers. Highly recommend for any DTLA visitor.",
      verified: true
    },
    {
      id: "rev-3",
      guestName: "Matthew Campbell",
      country: "New York, NY, USA",
      date: "September 2026",
      roomType: "Executive Corner King Suite",
      rating: 4.9,
      categories: { cleanliness: 5, comfort: 4.9, staff: 5, location: 4.9, facilities: 4.8, value: 4.9 },
      title: "Great conference venue and spacious corner suite",
      comment: "Attended a summit in the Golden State Ballroom. The AV setup was seamless. My room had incredible views of Downtown LA and the mountains. Fast Wi-Fi and friendly valet service made it an effortless trip.",
      verified: true
    },
    {
      id: "rev-4",
      guestName: "Jennifer & Mark Davis",
      country: "Chicago, IL, USA",
      date: "August 2026",
      roomType: "Kyoto Garden View Suite",
      rating: 5,
      categories: { cleanliness: 5, comfort: 5, staff: 5, location: 5, facilities: 5, value: 5 },
      title: "An unexpected tranquil oasis in the city!",
      comment: "Waking up to the waterfall sounds of the rooftop Kyoto Gardens right outside our window was unforgettable. Quick walk to Grand Central Market and the Broad museum. We will stay here every time we visit Los Angeles.",
      verified: true
    }
  ],

  // Active Promo Codes
  promotions: [
    {
      code: "DTLA15",
      discountPercent: 15,
      description: "15% off Downtown Los Angeles stays on all Deluxe & Suite rooms",
      minNights: 2,
      active: true,
      expiry: "2026-12-31"
    },
    {
      code: "WEEKEND20",
      discountPercent: 20,
      description: "20% off Friday to Sunday DTLA weekend getaways",
      minNights: 2,
      active: true,
      expiry: "2026-11-30"
    },
    {
      code: "HILTON25",
      discountPercent: 25,
      description: "25% off Hilton Honors member stays with complimentary parking",
      minNights: 3,
      active: true,
      expiry: "2026-12-31"
    },
    {
      code: "WELCOME10",
      discountPercent: 10,
      description: "10% first-time guest discount across all room categories",
      minNights: 1,
      active: true,
      expiry: "2026-12-31"
    }
  ],

  // Housekeeping task queue (Clean initial state)
  housekeepingTasks: [],

  // Staff Accounts & Roles
  staff: [
    { id: "st-1", name: "Marcus Vance", role: "Super Administrator", email: "marcus.vance@doubletreela.com", status: "Active", permissions: "Full Access" },
    { id: "st-2", name: "Sophia Chen", role: "General Manager", email: "sophia.chen@doubletreela.com", status: "Active", permissions: "Operations, Reports, Content" },
    { id: "st-3", name: "David Miller", role: "Front Office Manager", email: "david.miller@doubletreela.com", status: "Active", permissions: "Reservations, Check-In/Out" },
    { id: "st-4", name: "Elena Rodriguez", role: "Housekeeping Supervisor", email: "elena.rodriguez@doubletreela.com", status: "Active", permissions: "Rooms, Housekeeping" }
  ],

  // Frequently Asked Questions
  faqs: [
    {
      q: "Where is DoubleTree by Hilton Hotel Los Angeles Downtown located?",
      a: "We are located at 120 S Los Angeles St, Los Angeles, CA 90012, in the heart of Downtown Los Angeles at the gateway to Little Tokyo. We are walking distance from City Hall, Grand Park, the Walt Disney Concert Hall, and the Metro Little Tokyo/Arts District Station."
    },
    {
      q: "What are your check-in and check-out times?",
      a: "Standard check-in begins at 3:00 PM and check-out is at 12:00 PM (noon). Early check-in and late check-out can be requested upon booking or arranged with the front desk, subject to availability. Every guest receives our warm DoubleTree chocolate chip cookie upon arrival!"
    },
    {
      q: "What is your reservation cancellation policy?",
      a: "Direct website reservations may be cancelled free of charge up to 48 hours prior to your scheduled arrival time (3:00 PM PST). Cancellations within 48 hours may incur a one-night room and tax charge."
    },
    {
      q: "Do you have parking available at the hotel?",
      a: "Yes, we provide secure on-site covered valet parking 24 hours daily with in-and-out privileges and dedicated electric vehicle (EV) charging stations including Tesla chargers."
    },
    {
      q: "What is the famous rooftop Kyoto Garden?",
      a: "Our tranquil half-acre rooftop Kyoto Japanese Garden is a historic treasure featuring authentic Japanese landscaping, tranquil koi ponds, cascading waterfalls, and scenic viewpoints of the Downtown Los Angeles skyline. It is accessible to registered hotel guests daily."
    },
    {
      q: "Can I book without creating an account?",
      a: "Yes! Guest checkout is fully supported. You can reserve any available room by simply entering your contact information, without creating a password. You will receive an instant unique booking reference code."
    }
  ]
};

// Export to window
if (typeof window !== "undefined") {
  window.INITIAL_DATA = INITIAL_DATA;
}
