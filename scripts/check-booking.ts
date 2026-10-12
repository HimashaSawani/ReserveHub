import "dotenv/config";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import {
  BookingError,
  reserveResource,
} from "../src/lib/reservation-service";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "member@reservehub.local" },
  });

  const resource = await prisma.resource.create({
    data: {
      name: "Temporary concurrency test resource",
      type: "EQUIPMENT",
      location: "Test location",
    },
  });

  try {
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

    const input = {
      userId: user.id,
      resourceId: resource.id,
      startAt,
      endAt,
      purpose: "Concurrency verification",
    };

    const results = await Promise.allSettled([
      reserveResource(prisma, input),
      reserveResource(prisma, input),
    ]);

    assert.equal(
      results.filter((result) => result.status === "fulfilled").length,
      1,
      "Exactly one simultaneous booking must succeed.",
    );

    const rejected = results.find(
      (result) => result.status === "rejected",
    );
    assert.ok(
      rejected?.status === "rejected" &&
        (rejected.reason instanceof BookingError || rejected.reason?.name === "BookingError"),
      "The second request must receive a booking conflict.",
    );

    const adjacentId = await reserveResource(prisma, {
      ...input,
      startAt: endAt,
      endAt: new Date(endAt.getTime() + 60 * 60 * 1000),
      purpose: "Back-to-back booking",
    });
    assert.ok(adjacentId);

    await prisma.reservation.updateMany({
      where: { resourceId: resource.id },
      data: { status: "CANCELLED" },
    });

    const replacementId = await reserveResource(prisma, input);
    assert.ok(replacementId);

    await assert.rejects(
      reserveResource(prisma, {
        ...input,
        startAt: new Date(Date.now() - 120_000),
        endAt: new Date(Date.now() - 60_000),
      }),
      BookingError,
    );

    await assert.rejects(
      reserveResource(prisma, {
        ...input,
        endAt: startAt,
      }),
      BookingError,
    );

    await prisma.resource.update({
      where: { id: resource.id },
      data: { isActive: false },
    });

    await assert.rejects(
      reserveResource(prisma, {
        ...input,
        startAt: new Date(endAt.getTime() + 2 * 60 * 60 * 1000),
        endAt: new Date(endAt.getTime() + 3 * 60 * 60 * 1000),
      }),
      BookingError,
    );

    console.log(
      "PASS: concurrent conflicts, adjacent bookings, cancellation, invalid times, and inactive resources.",
    );
  } finally {
    await prisma.reservation.deleteMany({
      where: { resourceId: resource.id },
    });

    await prisma.resource.delete({
      where: { id: resource.id },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
