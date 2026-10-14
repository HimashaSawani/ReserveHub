# ReserveHub

A resource reservation application for managing shared rooms and equipment.

## Technology

- Next.js App Router
- TypeScript
- PostgreSQL
- Prisma ORM 6
- Auth.js credentials authentication
- Tailwind CSS

## Features

- Member and administrator login
- Searchable resource catalogue
- Daily resource schedules
- Reservation creation
- Database-enforced prevention of overlapping bookings
- Personal reservation history and cancellation
- Administrator "All reservations" overview with member, date, and status filters
- Administrator resource creation, editing, activation, and deactivation
- Responsive interface

## Requirements

- Node.js compatible with the installed Next.js version
- npm
- Docker Desktop with Docker Compose

## Local setup

1. Clone the repository and open its directory.
2. Run `npm ci`.
3. Copy `.env.example` to `.env`.
4. Set DATABASE_URL to:
   postgresql://reservehub:reservehub_dev@localhost:5432/reservehub?schema=public
5. Generate AUTH_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
6. Paste the generated value into `.env`.
7. Set AUTH_URL to `http://localhost:3000`.
8. Start PostgreSQL:
   docker compose up -d
9. Apply migrations:
   npx prisma migrate dev
10. Generate the Prisma client:
    npx prisma generate
11. Create demo records:
    npm run db:seed
12. Start the application:
    npm run dev

Open http://localhost:3000.

## Local demo accounts

| Role | Name | Email | Default Password |
|---|---|---|---|
| Admin | ReserveHub Admin | admin@reservehub.local | ReserveHub123! |
| Member 1 | Kasun Fernando | member@reservehub.local | ReserveHub123! |
| Member 2 | Nadeesha Perera | nadeesha@reservehub.lk | ReserveHub123! |

These accounts and credentials are for local demonstration only. The seed password can be customized via the `SEED_PASSWORD` environment variable before running `npm run db:seed`. The login screen also provides quick-fill demo buttons to switch between accounts with a single click.

## Engineering decisions

### Booking conflicts
The application checks for overlapping bookings and PostgreSQL enforces an exclusion constraint on resource ID and the booking time range. The database constraint protects against simultaneous requests that could both pass an application-level availability check. Intervals use [start, end), so adjacent bookings are allowed.

### Authentication and permissions
Passwords are hashed with bcrypt. Auth.js handles authentication and cookie-based JWT sessions. Protected pages and every mutation check the current user on the server. Administrator actions read the current role from PostgreSQL. Members can cancel only their own upcoming confirmed reservations.

### Time handling
Database timestamps use timestamptz. Booking inputs and displayed times use Asia/Colombo.

### Resource lifecycle
Resources are deactivated instead of deleted. Deactivation prevents new bookings while preserving existing commitments and reservation history.

### Architecture
Server Components read database data. Client Components handle interactive filtering and booking form feedback. Server Actions validate and authorize mutations. The reservation service contains the booking rules. Prisma migrations record database changes, including custom SQL constraints.

## Assumptions

- Each resource is booked exclusively for an interval.
- Resource capacity describes a room; it does not enable shared bookings.
- A reservation covers one resource.
- Bookings are confirmed immediately.
- Only upcoming confirmed reservations can be cancelled.
- Existing bookings remain valid when a resource is deactivated.
- Accounts are seeded; public registration is outside this assessment scope.

## Verification

Run:
```bash
npx prisma validate
npx tsc --noEmit
npx eslint .
npm run build
npm run test:booking
npx tsx scripts/verify-admin-reservations.ts
```

The booking verification script checks simultaneous requests, back-to-back bookings, cancellation and rebooking, invalid times, and inactive resources using a temporary resource.

## Database design & ER diagram

```mermaid
erDiagram
    USER ||--o{ RESERVATION : "creates (1:N)"
    RESOURCE ||--o{ RESERVATION : "allocated_to (1:N)"

    USER {
        uuid id PK "Primary Key"
        string name "User full name"
        string email UK "Unique email address"
        string passwordHash "Bcrypt password hash"
        enum role "ADMIN | MEMBER"
        timestamptz createdAt "Creation timestamp"
        timestamptz updatedAt "Update timestamp"
    }

    RESOURCE {
        uuid id PK "Primary Key"
        string name "Resource name"
        enum type "MEETING_ROOM | EQUIPMENT | OTHER"
        string location "Physical location / room identifier"
        int capacity "Positive integer capacity (optional)"
        string description "Resource details & amenities (optional)"
        boolean isActive "Active status flag (soft-delete)"
        timestamptz createdAt "Creation timestamp"
        timestamptz updatedAt "Update timestamp"
    }

    RESERVATION {
        uuid id PK "Primary Key"
        uuid userId FK "References User.id (onDelete: Restrict)"
        uuid resourceId FK "References Resource.id (onDelete: Restrict)"
        timestamptz startAt "Reservation start time"
        timestamptz endAt "Reservation end time"
        string purpose "Reservation purpose / meeting title"
        enum status "CONFIRMED | CANCELLED"
        timestamptz createdAt "Creation timestamp"
        timestamptz updatedAt "Update timestamp"
    }
```

### Constraints & Concurrency Architecture

- **PostgreSQL Exclusion Lock (`btree_gist`)**: Confirmed reservations for the same resource cannot overlap. Enforced at the database engine level via `EXCLUDE USING gist ("resourceId" WITH =, tstzrange("startAt", "endAt", '[)') WITH &&) WHERE ("status" = 'CONFIRMED')`.
- **Half-Open Intervals `[)`**: `[startAt, endAt)` allows back-to-back bookings (e.g. 09:00–10:00 and 10:00–11:00) with zero collision.
- **Relational Integrity**: Foreign keys use `onDelete: Restrict` to preserve historical booking audit trails when users or resources exist.
- **Valid Time Check**: Enforced via `CHECK ("endAt" > "startAt")`.
- **Resource Capacity**: Enforced via `CHECK ("capacity" IS NULL OR "capacity" > 0)`.
- **Soft Deactivation**: Resources are marked `isActive: false` rather than deleted, keeping existing commitments valid.

## Scope and limitations

- No recurring bookings or approval workflows.
- No email or push notifications.
- Resource filters run in the browser for the small catalogue.
- Administrator resource management is designed for a small organization.
- Public deployment would require further operational hardening, including login rate limiting and deployment-specific configuration.
