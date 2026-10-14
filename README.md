# 🏨 DOUBLETREE BY HILTON HOTEL IN LOS ANGELES DOWNTOWN - Complete Hotel Management & Booking Platform

A full-featured premier hotel web application and integrated hotel operations management system for **DoubleTree by Hilton Hotel Los Angeles Downtown** (California, USA), built with modern web technologies (HTML5, CSS3, ES6+ JavaScript, and Python).

---

## 🌟 Key Features Overview

### 1. Customer-Facing Hotel Website
- **Branded Design System**: Refined contemporary luxury aesthetic reflecting DoubleTree by Hilton's hospitality (Deep Obsidian `#070B14`, Warm Gold `#D4AF37`, Champagne Cream `#F3E5AB`).
- **Signature DoubleTree Welcome**: Featuring the iconic warm chocolate chip cookie upon arrival and Hilton Honors VIP guest recognition.
- **Sticky Navigation**: Brand crest (`DT`), multi-section navigation, global currency switcher (`USD $`, `EUR €`, `GBP £`, `CAD $`), and direct 1-click **Admin Portal** toggle.
- **Hero & Live Fast Booking Bar**:
  - Interactive check-in & check-out date pickers with automatic minimum date enforcement.
  - Party size selectors (Adults, Children, Number of Rooms).
  - Duration calculation with night counters.
  - "Search Availability" triggers the 5-step booking engine.
- **Value Guarantees Strip**: Hilton Honors Best Price Guarantee, Signature Sweet Dreams® Sleep Experience, Free 48-Hour Cancellation, and Warm Cookie Welcome at Check-In.
- **Featured & Complete Room Catalog**:
  - Category filters: *All, Deluxe, Presidential, Executive Club, Junior Suite, Family Residence, Classic Standard*.
  - Sort by: *Recommended, Price (Low to High), Price (High to Low), Guest Capacity*.
  - DTLA Suites & Rooms: *Kyoto Garden Penthouse Suite, DTLA Skyline Executive Suite, Corner Skyline King Room, Kyoto Garden View Suite, Double Queen City View Room, Classic Downtown King Room*.
  - High-definition room photography, square footage, bedding configuration, max capacity, amenity chips, and instant booking buttons.
- **Individual Suite Details Modal**:
  - Interactive multi-photo gallery thumbnail previewer.
  - Architectural overview and specifications table.
  - Detailed check-in/out policies, complimentary breakfast info, and cancellation guarantees.
  - Sticky booking widget and similar room recommendations.
- **Hotel Facilities & Signature Amenities**:
  - Half-Acre Rooftop Kyoto Japanese Gardens & Waterfalls.
  - Justice Urban Tavern & California Craft Beer Bar.
  - Precor 24/7 Modern Fitness Center.
  - Golden State Ballroom & Conference Pavilion (450-guest capacity).
  - Little Tokyo & DTLA Concierge, EV Charging & Valet Parking.
  - Executive Club Lounge with complimentary breakfast and evening social hour.
- **Gastronomy & Restaurant Services**:
  - *Justice Urban Tavern* showcase (gastropub classics, California craft beers, farm-fresh ingredients).
  - Digital interactive menu tabs: *Breakfast, Lunch, Dinner, Signature Cocktails*.
  - Dietary badges: *Chef Special, California Favorite, Vegetarian, Gluten-Free, Signature*.
  - **Online Table Reservation Modal**: Pick date, seating time, party size, and seating preference (Kyoto Garden Terrace, Main Tavern Hall, Craft Beer Bar) with instant booking confirmation code.
- **Photo & Video Gallery**:
  - Filterable by: *All, Suites & Penthouses, Pool & Spa, Gastronomy, Architecture, Events*.
  - Full-screen interactive **Lightbox** with previous/next controls and keyboard support.
- **Customer Reviews & Rating System**:
  - Comprehensive scorecard: **4.92 / 5.0** based on 520+ verified guest stays.
  - Category breakdown bars: Cleanliness (5.0), Staff Service (4.9), Comfort (4.9), Location (5.0), Facilities (4.8), Value (4.9).
  - Real guest reviews from visitors exploring DTLA, Little Tokyo, and conventions.
  - **"Write a Guest Review" Modal**: Instant submission that immediately publishes to the live review feed.
- **Special Offers & Promotional Packages**:
  - Promos: `DTLA15` (15% off Downtown LA stays), `WEEKEND20` (20% weekend getaway), `HILTON25` (25% Hilton Honors advance rate), `WELCOME10` (10% first-time guests).
  - 1-click "Copy Promo Code" button and "Book with This Offer" quick launcher.
- **Contact, Location & FAQ**:
  - Address: **120 S Los Angeles St, Los Angeles, CA 90012, United States**.
  - Direct telephone: **+1 (213) 629-1200** • Hilton Central Reservations: **+1 (800) HILTONS**.
  - Interactive map coordinates: **34.0505° N, 118.2437° W (Downtown Los Angeles, CA, USA)**.
  - Google Maps launcher pointing directly to DoubleTree by Hilton Hotel Los Angeles Downtown.
  - Client-validated direct inquiry form sent to Front Desk & Concierge.
  - Interactive FAQ accordion for parking, valet, check-in, pet policy, and Kyoto Garden access.
  - **Floating WhatsApp Concierge Widget**: Expandable floating bubble with preset message draft for instant guest inquiries.
  - Newsletter subscription with immediate promo voucher incentive.

---

## 2. Room Booking & Reservation System
- **5-Step Booking Flow Modal**:
  1. **Dates & Party Size**: Select dates, calculate nights, and select guest counts.
  2. **Suite Selection**: Real-time availability check that guarantees no overlapping bookings for the same room.
  3. **Guest Details Form**: Lead guest name, email, phone, country dropdown (USA, Canada, Japan, UK, etc.), estimated arrival time, and custom stay preferences (Warm DoubleTree Cookies on Arrival, High Floor DTLA Skyline View, Quiet Kyoto Garden Facing, Feather-Free Bedding, Valet Parking with EV Charging).
  4. **Summary & Pricing Ledger**: Itemized room rate x nights, promo code discount input, California/Los Angeles Transient Occupancy Tax (14%), and total calculated price.
  5. **Instant Confirmation Screen**:
     - Generates unique reference ID (e.g. `DTLA-2026-8942`).
     - Real-time `Confirmed` status pill.
     - **🖨️ Print / Download Confirmation (Receipt)**.
     - **📅 Add to Calendar (.ics)** download for Apple Calendar, Outlook, and Google Calendar with accurate DTLA address.
- **Guest Checkout**: Supports fast checkout without creating a password or mandatory login.

---

## 3. Customer Account & Self-Service Portal
- **Member Sign In & Guest Lookup**:
  - Look up any reservation instantly using the Reference Code + Email.
  - Member profile view with VIP Tier (`Hilton Honors Diamond Member`, `Hilton Honors Gold Member`).
- **My Reservations Manager**:
  - View all active, checked-in, and past stays.
  - View itemized guest receipts.
  - 1-click Free Cancellation with instant room inventory release back into availability.

---

## 4. Admin Dashboard & Hotel Operations Management
Access by clicking the **"⚙️ Hotel Admin"** button in the header or footer (or accessing `#admin`):

### 🔐 Admin Authentication Credentials
- **Username**: `doubletree`
- **Password**: `Admin1234`
- **Official Admin Gmail**: `doubletreehotel49@gmail.com`

### 🛠️ Operations Features
- **Operations Overview & Database Control**:
  - Real-time KPI metrics: *Confirmed Revenue ($), Occupancy Rate %, Today's Arrivals, Today's Departures, Needs Cleaning, In Maintenance*.
  - **🗑️ Clear All Database**: 1-click button to completely clear live reservations and reset all 15 physical rooms to 'Available' and 'Clean'.
  - **Interactive Room Rack & Floor Matrix**: Visual representation of physical rooms (601-2102) across floors 6 to 21 color-coded by live status:
    - 🟢 *Available*
    - 🔵 *Occupied* (shows in-house guest name)
    - 🟡 *Needs Cleaning*
    - 🔴 *Under Maintenance*
  - Clicking any room tile opens the **Quick Status Card** to toggle cleaning, occupancy, or maintenance on the fly.
  - **Recent Reservations Table**: Live queue of arrivals with 1-click **Check-In** and **Check-Out** actions.
- **Reservation Management**:
  - Search reservations by Guest Name, Reference, Email, or Room Number.
  - Filter by status: *All, Confirmed, Checked In, Checked Out, Cancelled*.
  - **Record Front-Desk Walk-In Booking**: Create immediate on-the-spot reservations with physical room assignment.
  - 1-click **Guest Check-In** (marks suite as Occupied).
  - 1-click **Guest Check-Out** (marks suite as Needs Cleaning and automatically dispatches a turn-down task to Housekeeping).
- **User Accounts & CRM Access Control**:
  - Aggregated guest profiles, contact numbers, countries, total stays, lifetime spend, and Hilton Honors tier.
  - **Activate & Deactivate User Accounts**: Admin can deactivate any user account with 1-click to immediately prevent them from booking or logging in; can reactivate at any time.
  - **+ Add User Account**: Admin can manually register user accounts and set access permissions.
- **Physical Room Inventory**:
  - Add new physical suites (Room number, floor, category, initial status).
  - 1-click Maintenance Mode toggle (instantly prevents customers from booking that room).
- **Housekeeping Operations Board**:
  - Kanban board: *Needs Cleaning | In Progress | Clean & Inspected*.
  - Assign housekeeping staff, track high-priority departures, and complete supervisor inspections.
- **Billing & Guest Folio Records**:
  - Complete list of guest folios.
  - **Official Tax Invoice Viewer**: Professional, printable hotel tax invoice with DoubleTree DTLA letterhead, 14% CA/LA occupancy tax, itemized rates, discounts, taxes, and balance due.
- **Promotions Management**:
  - Create and manage discount codes, discount percentages, expiration dates, and active/disabled statuses.
- **Staff Administration & Session Controls**:
  - Staff permissions directory (General Manager Marcus Vance, Guest Services Dir. Sophia Chen, etc.).
  - Perspective switcher: *General Manager, Operations Director, Front Desk Manager, Housekeeping Supervisor*.
  - **Log Out**: Session sign-out in topbar and sidebar.
- **Booking Payment Flow via Admin Gmail**:
  - Upon completing a reservation, the user receives an instant confirmation reference and an official **Booking Payment Procedure** box.
  - Because WhatsApp is currently offline, booking details (guest name, reference code, room category, check-in, check-out, duration, guests, and total amount) follow along directly to the admin Gmail (`doubletreehotel49@gmail.com`).
  - Users can click **"✉️ Open in Gmail Web"**, **"📧 Send via Email Client"**, or **"📋 Copy Booking Details"** to communicate directly with the General Manager to finalize payment.

---

## 🚀 How to Run Locally

### Option 1: Python Web Server (Recommended)
Run the included zero-dependency server:
```bash
python server.py 8000
```
Then open your browser at:
- **Customer Website**: [http://localhost:8000/](http://localhost:8000/)
- **Admin Management Portal**: [http://localhost:8000/#admin](http://localhost:8000/#admin) (Log in with Username: `doubletree` | Password: `Admin1234`)

### Option 2: Open Directly
Double-click `index.html` in your file explorer to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## 📁 File Structure

```
c:\Users\Jason Evans\Desktop\hotEL\
├── index.html              # Main application shell with customer views, booking wizard & admin views
├── server.py               # Local Python web server with CORS, health check, and dev banner
├── README.md               # Complete platform documentation
├── css/
│   ├── main.css            # Design tokens, variables, typography, reset, grid utilities, toasts
│   ├── components.css      # Header, Hero, Booking bar, Room cards, Facilities, Dining, Lightbox, Modals
│   ├── admin.css           # Admin dashboard, KPI cards, Room rack matrix, Kanban board, Invoices
│   └── responsive.css      # Mobile navigation drawer, adaptive grids, media queries
└── js/
    ├── data.js             # Initial dataset: DTLA suites, rooms 601-2102, Justice Tavern menu, reviews, promos, staff
    ├── state.js            # HotelState reactive store with localStorage persistence & overlap prevention
    ├── booking.js          # BookingEngine: 5-step wizard, date calculations, promo discounts, calendar export
    ├── admin.js            # AdminManager: operations overview, room rack, check-in/out, housekeeping, billing
    └── app.js              # MainApp: routing, room filters, lightbox, dining viewer, reviews, account portal
```

---

## 🔒 Availability & Overlap Protection Logic
The system implements robust client-side date collision checking in `js/state.js`:
- An overlap is detected when: `(CheckIn_A < CheckOut_B) && (CheckOut_A > CheckIn_B)`.
- Physical rooms in `Under Maintenance` are automatically omitted from inventory.
- When all physical rooms for a category are booked or under maintenance for the selected dates, the system flags the suite as **Sold Out** and prevents double bookings.
