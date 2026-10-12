# ReserveHub database design

```mermaid
erDiagram
    USER ||--o{ RESERVATION : creates
    RESOURCE ||--o{ RESERVATION : receives

    USER {
        uuid id PK
        string name
        string email UK
        string passwordHash
        enum role
        timestamptz createdAt
        timestamptz updatedAt
    }

    RESOURCE {
        uuid id PK
        string name
        enum type
        string location
        int capacity
        string description
        boolean isActive
        timestamptz createdAt
        timestamptz updatedAt
    }

    RESERVATION {
        uuid id PK
        uuid userId FK
        uuid resourceId FK
        timestamptz startAt
        timestamptz endAt
        string purpose
        enum status
        timestamptz createdAt
        timestamptz updatedAt
    }
```

## Constraints

- User email is unique.
- Reservation end time must be after start time.
- Capacity must be positive when specified.
- Confirmed reservations for the same resource cannot overlap.
- Booking intervals use [start, end), allowing back-to-back bookings.
- Foreign keys prevent deletion of users/resources with reservations.
- Cancelled reservations are retained as history.
