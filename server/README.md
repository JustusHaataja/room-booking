# Meeting Room Reservation API

A professional room booking backend API built with Express.js, TypeScript, and Supabase PostgreSQL. Provides endpoints for managing rooms, creating bookings, and checking availability with professional timezone handling.

## 🎯 Overview

This is the backend server for a room reservation MVP. It handles:
- **Room Management**: List, create, and delete meeting rooms
- **Booking Management**: Create, read, and cancel room bookings
- **Availability Checking**: Prevent double-bookings automatically
- **Admin Operations**: Protected endpoints for room management with API key authentication
- **Timezone Handling**: All bookings stored in ISO 8601 format with timezone information

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | Latest |
| **Framework** | Express.js | 4.18.2 |
| **Validation** | Zod | 3.22.0 |
| **Database** | Supabase (PostgreSQL) | Latest |
| **Client** | @supabase/supabase-js | Latest |

## 📋 Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **npm** or yarn
- **Supabase account** (free tier: [supabase.com](https://supabase.com))
  - PostgreSQL database with `rooms` and `bookings` tables
  - Project URL and anon public key
- **Git** for version control

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# Server Configuration
NODE_ENV=development
PORT=3000

# Admin API Key (for room management)
ADMIN_API_KEY=your-secret-admin-key-12345
```

**Get your Supabase credentials:**
1. Go to [supabase.com](https://supabase.com) and create a project
2. Settings → API → Copy Project URL and anon public key
3. Run the SQL schema below to create tables

### 3. Create Database Schema

In Supabase SQL Editor, paste and run:

```sql
-- Create rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT DEFAULT 1,
  price DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_name VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_time > start_time)
);

-- Seed example rooms
INSERT INTO rooms (name, description, capacity, price) VALUES
('Conference Room A', 'Large conference room', 10, 150.00),
('Meeting Room B', 'Small meeting space', 4, 50.00),
('Board Room', 'Executive board room', 20, 300.00),
('Phone Booth', 'Private 1-person booth', 1, 0.00),
('Training Room', 'Room with AV setup', 15, 120.00);
```

### 4. Run Locally

```bash
npm run dev
```

Server runs on `http://localhost:3000`

You should see:
```
╔═══════════════════════════════════════════════════════╗
║  Meeting Room Reservation API                         ║
║  Running on http://localhost:3000                     ║
╚═══════════════════════════════════════════════════════╝
```

## 📡 API Endpoints

### Health Check

#### `GET /`
Root endpoint - API status.

**Response:**
```json
{
  "status": "Online",
  "service": "Meeting Room Reservation API",
  "version": "1.0.0"
}
```

#### `GET /health`
Simple health check.

**Response:**
```json
{
  "status": "healthy"
}
```

---

### Room Management

#### `GET /api/rooms`
List all rooms. **Public - no authentication required.**

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Conference Room A",
    "description": "Large conference room",
    "capacity": 10,
    "price": 150.00,
    "created_at": "2026-05-14T10:00:00+00:00",
    "updated_at": "2026-05-14T10:00:00+00:00"
  }
]
```

---

#### `GET /api/rooms/:room_id`
Get a single room by ID. **Public - no authentication required.**

**Parameters:**
- `room_id` (integer, required) - Room ID

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Conference Room A",
  "description": "Large conference room",
  "capacity": 10,
  "price": 150.00,
  "created_at": "2026-05-14T10:00:00+00:00",
  "updated_at": "2026-05-14T10:00:00+00:00"
}
```

**Errors:**
- `400` - Room ID must be a valid number
- `404` - Room not found

---

#### `POST /api/rooms`
Create a new room. **Admin only - requires X-Admin-Key header.**

**Headers:**
```
X-Admin-Key: your-secret-admin-key-12345
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "VIP Lounge",
  "description": "Luxury meeting space",
  "capacity": 8,
  "price": 250
}
```

**Response:** `201 Created`
```json
{
  "id": 6,
  "name": "VIP Lounge",
  "description": "Luxury meeting space",
  "capacity": 8,
  "price": 250,
  "created_at": "2026-05-14T12:30:00+00:00",
  "updated_at": "2026-05-14T12:30:00+00:00"
}
```

**Errors:**
- `400` - Invalid field (name, capacity, price)
- `401` - Missing or invalid X-Admin-Key header

---

#### `DELETE /api/rooms/:room_id`
Delete a room. **Admin only - requires X-Admin-Key header.**

**Headers:**
```
X-Admin-Key: your-secret-admin-key-12345
```

**Parameters:**
- `room_id` (integer, required) - Room ID to delete

**Response:** `204 No Content`

**Errors:**
- `400` - Room ID must be a valid number
- `401` - Missing or invalid X-Admin-Key header
- `404` - Room not found

---

### Booking Management

#### `POST /api/bookings`
Create a new booking. **Public - no authentication required.**

⚠️ **Important**: Timestamps must include timezone information (ISO 8601 format).

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "room_id": 1,
  "user_name": "John Doe",
  "start_time": "2026-05-15T14:00:00+02:00",
  "end_time": "2026-05-15T15:00:00+02:00"
}
```

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "room_id": 1,
  "user_name": "John Doe",
  "start_time": "2026-05-15T14:00:00+02:00",
  "end_time": "2026-05-15T15:00:00+02:00",
  "created_at": "2026-05-14T12:30:00+00:00",
  "updated_at": "2026-05-14T12:30:00+00:00"
}
```

**Validation Rules:**
1. Room must exist
2. Timestamps must be in ISO 8601 format with timezone (e.g., `+02:00` or `Z`)
3. Start time cannot be in the past
4. Start time must be before end time
5. No overlapping bookings allowed (room already booked)
6. Times must be in 15-minute blocks (00, 15, 30, 45 minutes)
7. Minimum duration is 15 minutes

**Errors:**
- `400` - Invalid timestamp format or time validation failed
- `404` - Room not found
- `409` - Room already booked for requested time period

---

#### `GET /api/bookings`
Get all bookings. **Public - no authentication required.**

**Query Parameters:**
- `from_now=true` (optional) - Only return future bookings

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "room_id": 1,
    "user_name": "John Doe",
    "start_time": "2026-05-15T14:00:00+02:00",
    "end_time": "2026-05-15T15:00:00+02:00",
    "created_at": "2026-05-14T12:30:00+00:00",
    "updated_at": "2026-05-14T12:30:00+00:00"
  }
]
```

---

#### `GET /api/rooms/:room_id/bookings`
Get all bookings for a specific room. **Public - no authentication required.**

**Parameters:**
- `room_id` (integer, required) - Room ID

**Query Parameters:**
- `from_now=true` (optional) - Only return future bookings

**Response:** `200 OK`
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "room_id": 1,
    "user_name": "John Doe",
    "start_time": "2026-05-15T14:00:00+02:00",
    "end_time": "2026-05-15T15:00:00+02:00",
    "created_at": "2026-05-14T12:30:00+00:00",
    "updated_at": "2026-05-14T12:30:00+00:00"
  }
]
```

**Errors:**
- `400` - Room ID must be a valid number
- `404` - Room not found

---

#### `DELETE /api/bookings/:booking_id`
Cancel a booking. **Public - no authentication required.**

⚠️ **Security Note**: For production, add user authentication so users can only cancel their own bookings.

**Parameters:**
- `booking_id` (UUID string, required) - Booking ID to cancel

**Response:** `204 No Content`

**Errors:**
- `404` - Booking not found

---

## 🔑 Authentication

### Admin API Key

The following endpoints require the `X-Admin-Key` header:
- `POST /api/rooms` - Create room
- `DELETE /api/rooms/:room_id` - Delete room

**Usage:**
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-secret-admin-key-12345" \
  -d '{
    "name": "New Room",
    "capacity": 6,
    "price": 100
  }'
```

Set `ADMIN_API_KEY` in your `.env` file. For production, use a strong random key (e.g., from `openssl rand -hex 32`).

---

## 📅 Timezone Handling

All timestamps must be ISO 8601 format with timezone information:

✅ **Valid:**
- `2026-05-15T14:30:00+02:00` (UTC+2)
- `2026-05-15T14:30:00Z` (UTC)
- `2026-05-15T14:30:00+00:00` (UTC)
- `2026-05-15T14:30:00-05:00` (UTC-5)

❌ **Invalid:**
- `2026-05-15T14:30:00` (missing timezone)
- `2026-05-15 14:30` (not ISO 8601)

**Why?** Timezone-aware timestamps prevent ambiguity in booking overlaps and ensure consistent comparisons across different regions.

---

## 🗄️ Database Schema

### `rooms` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-incrementing room ID |
| `name` | VARCHAR(255) | NOT NULL | Room name |
| `description` | TEXT | NULLABLE | Room description |
| `capacity` | INTEGER | DEFAULT 1 | Max occupancy |
| `price` | DECIMAL(10,2) | DEFAULT 0 | Nightly rate |
| `created_at` | TIMESTAMP WITH TZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TZ | DEFAULT NOW() | Last update timestamp |

### `bookings` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique booking ID |
| `room_id` | INTEGER | FK (rooms.id) | Which room is booked |
| `user_name` | VARCHAR(255) | NOT NULL | Person making booking |
| `start_time` | TIMESTAMP WITH TZ | NOT NULL | Booking start |
| `end_time` | TIMESTAMP WITH TZ | NOT NULL | Booking end |
| `created_at` | TIMESTAMP WITH TZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP WITH TZ | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- `end_time > start_time` (enforced at database level)
- Foreign key: `room_id` references `rooms(id)` with CASCADE delete

---

##  Project Structure

```
server/
├── src/
│   ├── index.ts                 # Express app setup & routes registration
│   ├── lib/
│   │   └── supabase.ts          # Supabase client singleton
│   ├── middleware/
│   │   ├── cors.ts              # CORS configuration
│   │   └── errorHandler.ts      # Global error handling
│   ├── repositories/            # Data access layer
│   │   ├── booking.repository.ts # Booking queries
│   │   └── room.repository.ts   # Room queries
│   ├── routes/                  # Express route handlers
│   │   ├── bookings.ts          # Booking endpoints
│   │   └── rooms.ts             # Room endpoints
│   ├── services/                # Business logic
│   │   └── booking.service.ts   # Booking validation & rules
│   ├── types/                   # TypeScript interfaces
│   │   └── booking.ts           # Booking & Room types
│   └── utils/
├── .env.example                 # Environment variables template
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## 🧪 Testing

### Test All Endpoints

```bash
# Health check
curl http://localhost:3000/health

# List rooms
curl http://localhost:3000/api/rooms

# Create booking
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "user_name": "John Doe",
    "start_time": "2026-05-15T14:00:00+02:00",
    "end_time": "2026-05-15T15:00:00+02:00"
  }'

# List all bookings
curl http://localhost:3000/api/bookings

# Create room (requires admin key)
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: your-secret-key" \
  -d '{
    "name": "Test Room",
    "capacity": 5,
    "price": 100
  }'
```

---

## 🛠️ Development

### Build

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/` folder.

### Run Compiled Code

```bash
npm start
```

### Watch Mode

```bash
npm run dev
```

Auto-recompiles on file changes.

---

## 📝 Environment Variables

Create `.env` file (copy from `.env.example`):

```env
# Required
SUPABASE_URL=                   # Your Supabase project URL
SUPABASE_ANON_KEY=              # Your Supabase anon public key
ADMIN_API_KEY=                  # Secret key for room admin endpoints

# Optional
NODE_ENV=development            # development or production
PORT=3000                       # Server port (default 3000)
```

⚠️ **Never commit `.env` to Git!** Use `.env.example` as a template for documentation.

---

## ⚠️ Error Handling

The API returns structured error responses:

```json
{
  "error": "Error message",
  "status": 400
}
```

Common error codes:
- `400` Bad Request - Invalid input or validation failed
- `401` Unauthorized - Missing/invalid admin key
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Double-booking detected
- `500` Internal Server Error - Unexpected server error

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ISO 8601 DateTime Format](https://en.wikipedia.org/wiki/ISO_8601)

---

## 📄 License

Proprietary - Room Booking MVP

---

## 👥 Support

Built with ❤️ and 🤖
