# Ripon Limo - React Native Expo Mobile Suite

This repository (`riponlimo_app_react_native_expo`) is a single unified repository containing the complete mobile ecosystem for **Ripon Limo**:

```
riponlimo_app_react_native_expo/
├── client_app/    # Luxury Executive Client Booking App (iOS & Android)
├── driver_app/    # Professional Chauffeur Dispatch & Trip Command App (iOS & Android)
└── admin_app/     # Executive Command Center, Dispatch & Fleet Management App (iOS & Android)
```

---

## Applications Overview

### 1. Client App (`client_app`)
- **Executive Limousine Booking Flow**: 3-step booking with hourly charter, airport transfers, and one-way trips.
- **Trip Mileage & Duration**: Single line summary `[ Distance: X miles • Duration: Y • ETA: Z ]`.
- **Specialty Services**: Child seats (Rear-facing, Front-facing, Booster) with direct counters, pet travel, flight tracker, and meet & greet.
- **Fleet Showcase**: Luxury vehicle specifications, luggage capacities, and pricing.
- **Rides History & Live Status**: View upcoming, active, and completed rides.

### 2. Chauffeur / Driver App (`driver_app`)
- **Duty Mode**: Live On-Duty / Off-Duty shift switch with shift metrics (Hours, Trips, Earnings).
- **Active Trip Command Center**: 5-phase status workflow (`ACCEPTED` ➔ `EN ROUTE` ➔ `ARRIVED` ➔ `PASSENGER ONBOARD` ➔ `COMPLETED`).
- **Turn-by-Turn Navigation**: 1-tap Apple Maps & Google Maps navigation for pickup and drop-off.
- **Passenger Contacts**: 1-tap direct call and SMS.
- **Flight & Airport Telemetry**: Live flight arrival tracking.
- **Dispatch Marketplace**: Claim unassigned rides released by dispatchers.

### 3. Admin Command Center (`admin_app`)
- **Executive Analytics & 7-Day Revenue Chart**: Visual native bar chart with daily averages, peak volume, and business forecast.
- **Booking Status Pipeline**: Progress tracking for Pending, Confirmed, In Progress, Completed, and Cancelled orders.
- **Order & Dispatch Manager**: Real-time reservations management with 1-tap chauffeur assignment modal, status progression, and direct passenger/driver communication.
- **Fleet Inventory & Asset Control**: Full vehicle directory with live status toggling (`AVAILABLE`, `MAINTENANCE`, `OUT_OF_SERVICE`), rate overrides, and add/edit modal.
- **Chauffeur Roster**: Active driver tracking, on-trip status, direct phone/SMS, and new chauffeur enrollment.
- **VIP Client Directory**: Client history, total bookings count, and referral tracking.
- **Server Configuration**: Live Next.js backend endpoint switcher (port 3010) with fallback demo mode.
- **Dual Theme Support**: Executive Luxury Dark (`#0B0E14` Obsidian / `#D4AF37` Gold) and Crisp Light Mode.

---

## Quick Start Instructions

Ensure your Next.js backend server (`riponlimo`) is running on port 3010:
```bash
cd /path/to/riponlimo
npm run dev # Runs on http://localhost:3010
```

### Run Client App
```bash
cd client_app
npm start
# Press 'i' for iOS Simulator or 'a' for Android Emulator
```

### Run Driver App
```bash
cd driver_app
npm start
# Press 'i' for iOS Simulator or 'a' for Android Emulator
# Demo Chauffeur: driver1@riponlimo.com / password123
```

### Run Admin App
```bash
cd admin_app
npm start
# Press 'i' for iOS Simulator or 'a' for Android Emulator
# Demo Admin: admin@riponlimo.com / password123
# Demo Superadmin: superadmin@riponlimo.com / password123
```

---

## Backend Authentication & APIs

The Next.js backend in `riponlimo` supports both web sessions and mobile Expo applications via:
- `/api/auth/login` (Mobile credential authentication with bcrypt)
- `/api/admin/analytics` (Mobile admin verification via headers / adminId)
- `/api/admin/bookings` (Reservations queue & status / driver updates)
- `/api/admin/cars` (Fleet asset management & status updates)
- `/api/admin/drivers` (Chauffeur roster & new driver registration)
- `/api/admin/users` (Registered clients directory)
