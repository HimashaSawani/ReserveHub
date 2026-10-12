import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";

export class BookingError extends Error {}

type BookingInput = {
  userId: string;
  resourceId: string;
  startAt: Date;
  endAt: Date;
  purpose: string;
};

export async function reserveResource(
  db: PrismaClient,
  input: BookingInput,
): Promise<string> {
  const { userId, resourceId, startAt, endAt, purpose } = input;

  if (
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime()) ||
    endAt <= startAt
  ) {
    throw new BookingError("End time must be after start time.");
  }

  if (startAt.getTime() <= Date.now()) {
    throw new BookingError("Choose a start time in the future.");
  }

  const cleanedPurpose = purpose.trim();
  if (cleanedPurpose.length < 3 || cleanedPurpose.length > 500) {
    throw new BookingError("Purpose must contain 3–500 characters.");
  }

  const id = randomUUID();

  try {
    await db.$transaction(async (tx) => {
      // This lock also coordinates with administrator resource updates.
      const resources = await tx.$queryRaw<
        { id: string; isActive: boolean }[]
      >`
        SELECT "id", "isActive"
        FROM "Resource"
        WHERE "id" = ${resourceId}::uuid
        FOR SHARE
      `;

      if (!resources[0]?.isActive) {
        throw new BookingError("This resource is unavailable for booking.");
      }

      const overlap = await tx.reservation.findFirst({
        where: {
          resourceId,
          status: "CONFIRMED",
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
        select: { id: true },
      });

      if (overlap) {
        throw new BookingError(
          "This resource is already booked during that time.",
        );
      }

      // The database exclusion constraint protects concurrent requests.
      await tx.$executeRaw`
        INSERT INTO "Reservation" (
          "id",
          "userId",
          "resourceId",
          "startAt",
          "endAt",
          "purpose",
          "status",
          "createdAt",
          "updatedAt"
        ) VALUES (
          ${id}::uuid,
          ${userId}::uuid,
          ${resourceId}::uuid,
          ${startAt},
          ${endAt},
          ${cleanedPurpose},
          'CONFIRMED'::"ReservationStatus",
          NOW(),
          NOW()
        )
      `;
    });

    return id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2010" &&
      String(error.meta?.code) === "23P01"
    ) {
      throw new BookingError(
        "This time slot was just reserved. Please choose another time.",
      );
    }
    throw error;
  }
}
