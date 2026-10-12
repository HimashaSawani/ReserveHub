CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Reservation"
ADD CONSTRAINT "reservation_valid_time"
CHECK ("endAt" > "startAt");

ALTER TABLE "Resource"
ADD CONSTRAINT "resource_positive_capacity"
CHECK ("capacity" IS NULL OR "capacity" > 0);

ALTER TABLE "Reservation"
ADD CONSTRAINT "reservation_no_overlap"
EXCLUDE USING gist (
  "resourceId" WITH =,
  tstzrange("startAt", "endAt", '[)') WITH &&
)
WHERE ("status" = 'CONFIRMED');