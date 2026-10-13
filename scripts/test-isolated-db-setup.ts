import "dotenv/config";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// Get base connection parameters from DATABASE_URL
const mainDbUrl = process.env.DATABASE_URL!;
const urlObj = new URL(mainDbUrl);
const testDbName = "reservehub_test";
const adminDbUrl = `${urlObj.protocol}//${urlObj.username}:${urlObj.password}@${urlObj.host}/postgres`;
const testDbUrl = `${urlObj.protocol}//${urlObj.username}:${urlObj.password}@${urlObj.host}/${testDbName}?schema=public`;

async function main() {
  console.log("=== 1. Fresh Database & Migration Verification ===");

  // Connect to postgres default db via PrismaClient to drop & recreate test database
  const adminPrisma = new PrismaClient({ datasources: { db: { url: adminDbUrl } } });
  await adminPrisma.$connect();

  console.log(`Creating fresh isolated test database '${testDbName}'...`);
  // Disconnect any lingering sessions to testDbName if needed
  try {
    await adminPrisma.$executeRawUnsafe(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${testDbName}'`
    );
  } catch {}
  await adminPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${testDbName}`);
  await adminPrisma.$executeRawUnsafe(`CREATE DATABASE ${testDbName}`);
  await adminPrisma.$disconnect();
  console.log(`Database '${testDbName}' created successfully.`);

  // Run migrations against test database
  console.log("Applying Prisma migrations via 'prisma migrate deploy'...");
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "inherit",
  });

  // Verify constraints exist in PostgreSQL system catalogs
  const testPrisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });
  await testPrisma.$connect();

  const constraints = await testPrisma.$queryRawUnsafe<Array<{ conname: string; contype: string }>>(`
    SELECT conname, contype 
    FROM pg_constraint 
    WHERE conname IN ('reservation_no_overlap', 'reservation_valid_time', 'resource_positive_capacity')
  `);

  console.log("\nConstraints found in pg_constraint:");
  for (const c of constraints) {
    console.log(`  - ${c.conname} (Type: ${c.contype === "x" ? "EXCLUSION" : c.contype === "c" ? "CHECK" : c.contype})`);
  }

  const foundNames = constraints.map(c => c.conname);
  if (!foundNames.includes("reservation_no_overlap")) {
    throw new Error("FAIL: 'reservation_no_overlap' constraint was NOT created!");
  }
  console.log("PASS: reservation_no_overlap exclusion constraint verified.");

  console.log("\n=== 2. Seed Idempotency & Repeatability Verification ===");
  // Seed first time
  console.log("Running seed pass 1...");
  execSync("npx tsx prisma/seed.ts", {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "inherit",
  });

  const usersCount1 = await testPrisma.user.count();
  const resourcesCount1 = await testPrisma.resource.count();
  console.log(`After Pass 1 -> Users: ${usersCount1}, Resources: ${resourcesCount1}`);

  // Seed second time
  console.log("Running seed pass 2 (testing repeatability)...");
  execSync("npx tsx prisma/seed.ts", {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: "inherit",
  });

  const usersCount2 = await testPrisma.user.count();
  const resourcesCount2 = await testPrisma.resource.count();
  console.log(`After Pass 2 -> Users: ${usersCount2}, Resources: ${resourcesCount2}`);

  if (usersCount1 !== usersCount2 || resourcesCount1 !== resourcesCount2) {
    throw new Error("FAIL: Seeding is not idempotent! Duplicate records were created.");
  }
  console.log("PASS: Seeding is idempotent and repeatable with zero duplicates.");

  // Confirm 'Book up to 4 hours' is absent
  const focusBooth = await testPrisma.resource.findFirst({ where: { name: "Focus Booth 07" } });
  if (focusBooth?.description?.includes("Book up to 4 hours")) {
    throw new Error("FAIL: 'Book up to 4 hours' found in seeded Focus Booth 07!");
  }
  console.log("PASS: 'Book up to 4 hours' is absent from seeded resource descriptions.");

  console.log("\n=== 3. Direct PostgreSQL Constraint Enforcement Tests ===");
  const member = await testPrisma.user.findFirstOrThrow({ where: { role: "MEMBER" } });
  const allResources = await testPrisma.resource.findMany({ orderBy: { name: "asc" } });
  const resourceA = allResources[0];
  const resourceB = allResources[1];

  const t1 = new Date("2026-10-20T09:00:00Z");
  const t2 = new Date("2026-10-20T10:00:00Z");
  const t3 = new Date("2026-10-20T11:00:00Z");
  const t1_30 = new Date("2026-10-20T09:30:00Z");

  // A. Insert first confirmed booking: 09:00 - 10:00 on Resource A
  const b1 = await testPrisma.reservation.create({
    data: {
      userId: member.id,
      resourceId: resourceA.id,
      startAt: t1,
      endAt: t2,
      purpose: "Team Sync",
      status: "CONFIRMED",
    },
  });
  console.log("PASS: Booking 1 created (09:00 - 10:00 on Resource A)");

  // B. Exact duplicate overlap: 09:00 - 10:00 on Resource A -> MUST FAIL
  let exactBlocked = false;
  try {
    await testPrisma.reservation.create({
      data: {
        userId: member.id,
        resourceId: resourceA.id,
        startAt: t1,
        endAt: t2,
        purpose: "Colliding booking",
        status: "CONFIRMED",
      },
    });
  } catch (err: unknown) {
    exactBlocked = true;
    console.log("PASS: Exact duplicate blocked by constraint:", String((err as Error).message).slice(0, 80));
  }
  if (!exactBlocked) throw new Error("FAIL: Exact duplicate was not blocked!");

  // C. Partial overlap: 09:30 - 11:00 on Resource A -> MUST FAIL
  let partialBlocked = false;
  try {
    await testPrisma.reservation.create({
      data: {
        userId: member.id,
        resourceId: resourceA.id,
        startAt: t1_30,
        endAt: t3,
        purpose: "Partial overlap",
        status: "CONFIRMED",
      },
    });
  } catch {
    partialBlocked = true;
    console.log("PASS: Partial overlap blocked by constraint.");
  }
  if (!partialBlocked) throw new Error("FAIL: Partial overlap was not blocked!");

  // D. Back-to-back: 10:00 - 11:00 on Resource A -> MUST SUCCEED (boundary [start, end))
  await testPrisma.reservation.create({
    data: {
      userId: member.id,
      resourceId: resourceA.id,
      startAt: t2,
      endAt: t3,
      purpose: "Back to back",
      status: "CONFIRMED",
    },
  });
  console.log("PASS: Back-to-back booking (10:00 - 11:00 on Resource A) succeeded.");

  // E. Different resource: 09:00 - 10:00 on Resource B -> MUST SUCCEED
  await testPrisma.reservation.create({
    data: {
      userId: member.id,
      resourceId: resourceB.id,
      startAt: t1,
      endAt: t2,
      purpose: "Resource B booking",
      status: "CONFIRMED",
    },
  });
  console.log("PASS: Same time slot on different Resource B succeeded.");

  // F. Invalid time: endAt <= startAt -> MUST FAIL
  let invalidTimeBlocked = false;
  try {
    await testPrisma.reservation.create({
      data: {
        userId: member.id,
        resourceId: resourceA.id,
        startAt: t2,
        endAt: t1,
        purpose: "End before start",
        status: "CONFIRMED",
      },
    });
  } catch {
    invalidTimeBlocked = true;
    console.log("PASS: End <= start blocked by reservation_valid_time CHECK constraint.");
  }
  if (!invalidTimeBlocked) throw new Error("FAIL: End <= start was not blocked!");

  // G. Cancel Booking 1 and verify interval is released
  await testPrisma.reservation.update({
    where: { id: b1.id },
    data: { status: "CANCELLED" },
  });
  console.log("Booking 1 marked CANCELLED.");

  // Now re-booking 09:00 - 10:00 on Resource A MUST SUCCEED
  await testPrisma.reservation.create({
    data: {
      userId: member.id,
      resourceId: resourceA.id,
      startAt: t1,
      endAt: t2,
      purpose: "Rebooked after cancellation",
      status: "CONFIRMED",
    },
  });
  console.log("PASS: Interval released upon cancellation; re-booking succeeded.");

  // Clean up
  await testPrisma.$disconnect();

  const cleanPrisma = new PrismaClient({ datasources: { db: { url: adminDbUrl } } });
  await cleanPrisma.$connect();
  try {
    await cleanPrisma.$executeRawUnsafe(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${testDbName}'`
    );
  } catch {}
  await cleanPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS ${testDbName}`);
  await cleanPrisma.$disconnect();
  console.log(`\nTest database '${testDbName}' dropped cleanly.`);
  console.log("=== ALL FRESH SETUP & CONSTRAINT TESTS PASSED ===");
}

main().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
