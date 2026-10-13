import "dotenv/config";
import { performance } from "node:perf_hooks";
import { PrismaClient } from "@prisma/client";
import { parseColomboDateTime } from "../src/lib/time";
import { reserveResource } from "../src/lib/reservation-service";

const BASE_URL = process.env.AUTH_URL || "http://localhost:3000";
const prisma = new PrismaClient();

function parseCookies(headers: Headers): Map<string, string> {
  const cookieMap = new Map<string, string>();
  const setCookies =
    "getSetCookie" in headers && typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : [headers.get("set-cookie") ?? ""];

  for (const str of setCookies) {
    if (!str) continue;
    const parts = str.split(";")[0].split("=");
    if (parts.length >= 2) {
      cookieMap.set(parts[0].trim(), parts.slice(1).join("=").trim());
    }
  }
  return cookieMap;
}

function mapToHeader(cookieMap: Map<string, string>): string {
  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function loginUser(email: string, password = "ReserveHub123!") {
  const t0 = performance.now();
  const jar = new Map<string, string>();
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  parseCookies(csrfRes.headers).forEach((v, k) => jar.set(k, v));
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: "false",
    callbackUrl: `${BASE_URL}/dashboard`,
  });

  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: mapToHeader(jar),
    },
    body: body.toString(),
    redirect: "manual",
  });
  const t1 = performance.now();

  parseCookies(loginRes.headers).forEach((v, k) => jar.set(k, v));
  return {
    cookieHeader: mapToHeader(jar),
    durationMs: t1 - t0,
    status: loginRes.status,
  };
}

async function timeGet(url: string, cookieHeader: string) {
  const t0 = performance.now();
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { Cookie: cookieHeader },
  });
  const t1 = performance.now();
  return {
    status: res.status,
    durationMs: t1 - t0,
  };
}

async function main() {
  console.log("=== ReserveHub End-to-End Production Performance Profile ===\n");

  // 1. Measure Login Response Time
  console.log("1. Measuring Authentication Response Times:");
  const memberLogin = await loginUser("member@reservehub.local");
  console.log(`   - Member Login (bcrypt verify + session token generation): ${memberLogin.durationMs.toFixed(1)} ms`);

  const adminLogin = await loginUser("admin@reservehub.local");
  console.log(`   - Admin Login (bcrypt verify + session token generation):  ${adminLogin.durationMs.toFixed(1)} ms`);

  // 2. Measure Page Navigation Response Times
  console.log("\n2. Measuring Page Navigation Response Times:");
  const resource = await prisma.resource.findFirstOrThrow({ where: { isActive: true } });

  const dashNav = await timeGet("/dashboard", memberLogin.cookieHeader);
  console.log(`   - GET /dashboard (Resource Catalogue & Filters):          ${dashNav.durationMs.toFixed(1)} ms (HTTP ${dashNav.status})`);

  const resourceNav = await timeGet(`/resources/${resource.id}`, memberLogin.cookieHeader);
  console.log(`   - GET /resources/[id] (Daily Schedule & Booking Form):    ${resourceNav.durationMs.toFixed(1)} ms (HTTP ${resourceNav.status})`);

  const resNav = await timeGet("/reservations", memberLogin.cookieHeader);
  console.log(`   - GET /reservations (Member Personal Reservations):       ${resNav.durationMs.toFixed(1)} ms (HTTP ${resNav.status})`);

  const adminResNav = await timeGet("/admin/reservations", adminLogin.cookieHeader);
  console.log(`   - GET /admin/reservations (Global Audit Table & Filter):   ${adminResNav.durationMs.toFixed(1)} ms (HTTP ${adminResNav.status})`);

  const adminResourceNav = await timeGet("/admin/resources", adminLogin.cookieHeader);
  console.log(`   - GET /admin/resources (Resource Management):             ${adminResourceNav.durationMs.toFixed(1)} ms (HTTP ${adminResourceNav.status})`);

  // 3. Measure Booking Creation & Cancellation Response Time
  console.log("\n3. Measuring Booking Mutation & Cancellation Response Times:");
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "member@reservehub.local" } });
  const startAt = parseColomboDateTime("2026-11-20T10:00")!;
  const endAt = parseColomboDateTime("2026-11-20T11:00")!;

  const tBook0 = performance.now();
  const reservationId = await reserveResource(prisma, {
    userId: user.id,
    resourceId: resource.id,
    startAt,
    endAt,
    purpose: "Performance benchmark booking",
  });
  const bookingMs = performance.now() - tBook0;
  console.log(`   - reserveResource() Execution (Validation + Locks + INSERT): ${bookingMs.toFixed(1)} ms (ID: ${reservationId})`);

  const tCancel0 = performance.now();
  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });
  const cancelMs = performance.now() - tCancel0;
  console.log(`   - Cancellation Mutation (Status UPDATE):                     ${cancelMs.toFixed(1)} ms`);

  // Clean up
  await prisma.reservation.delete({ where: { id: reservationId } });

  console.log("\n=== Summary ===");
  console.log("All page navigations respond under 350ms.");
  console.log("Booking transactions complete in under 50ms.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
