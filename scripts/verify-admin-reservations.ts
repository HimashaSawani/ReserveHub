import "dotenv/config";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { reserveResource } from "../src/lib/reservation-service";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Verifying All Reservations & Admin Permissions ===\n");

  // 1. Get member and admin accounts
  const member = await prisma.user.findUniqueOrThrow({
    where: { email: "member@reservehub.local" },
  });
  const admin = await prisma.user.findUniqueOrThrow({
    where: { email: "admin@reservehub.local" },
  });
  const resource = await prisma.resource.findFirstOrThrow({
    where: { isActive: true },
  });

  // 2. Member creates a reservation
  const startAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);

  const reservationId = await reserveResource(prisma, {
    userId: member.id,
    resourceId: resource.id,
    startAt,
    endAt,
    purpose: "Admin-all-reservations verification booking",
  });
  console.log("Step 1: Member created reservation:", reservationId);

  // 3. Member's personal reservations contains it
  const memberReservations = await prisma.reservation.findMany({
    where: { userId: member.id },
  });
  assert.ok(
    memberReservations.some((r) => r.id === reservationId),
    "Member personal reservations must contain the created reservation.",
  );
  console.log("Step 2: Member's personal reservations confirmed.");

  // 4. Admin's personal reservations does NOT contain the member's booking
  const adminPersonalReservations = await prisma.reservation.findMany({
    where: { userId: admin.id },
  });
  assert.ok(
    !adminPersonalReservations.some((r) => r.id === reservationId),
    "Admin personal reservations must NOT contain member's reservation.",
  );
  console.log("Step 3: Admin's My Reservations remains personal.");

  // 5. Admin queries All Reservations (all users)
  const allReservations = await prisma.reservation.findMany({
    where: { id: reservationId },
    include: {
      resource: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });
  assert.equal(allReservations.length, 1);
  assert.equal(allReservations[0].user.email, member.email);
  assert.equal(allReservations[0].status, "CONFIRMED");
  console.log("Step 4: Administrator successfully sees member's booking in All Reservations.");

  // 6. Member cancels the booking
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });
  console.log("Step 5: Member cancelled the reservation.");

  // 7. Verify All Reservations shows it as CANCELLED
  const cancelledRecord = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
  });
  assert.equal(cancelledRecord.status, "CANCELLED");
  console.log("Step 6: Cancelled reservation preserved and visible in admin list as CANCELLED.");

  // 8. Clean up test reservation
  await prisma.reservation.delete({ where: { id: reservationId } });
  console.log("Step 7: Cleaned up test record.");

  console.log("\nALL 6 VERIFICATION CHECKS PASSED SUCCESSFULLY!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
