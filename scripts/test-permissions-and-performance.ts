import "dotenv/config";

const BASE_URL = process.env.AUTH_URL || "http://localhost:3000";

interface AuthResult {
  cookieHeader: string;
  userEmail: string;
}

// Extract cookies properly using getSetCookie()
function parseCookies(headers: Headers): Map<string, string> {
  const cookieMap = new Map<string, string>();
  const setCookies = "getSetCookie" in headers && typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : [headers.get("set-cookie") ?? ""];

  for (const str of setCookies) {
    if (!str) continue;
    const parts = str.split(";")[0].split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      cookieMap.set(key, val);
    }
  }
  return cookieMap;
}

function mapToHeader(cookieMap: Map<string, string>): string {
  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

// Authenticate via NextAuth and return cookie jar
async function authenticate(email: string, password = "ReserveHub123!"): Promise<AuthResult> {
  const t0 = performance.now();
  const jar = new Map<string, string>();

  // 1. Get CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  parseCookies(csrfRes.headers).forEach((v, k) => jar.set(k, v));
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  // 2. Post credentials
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

  parseCookies(loginRes.headers).forEach((v, k) => jar.set(k, v));
  const t1 = performance.now();
  console.log(`[Auth] Logged in as ${email} in ${(t1 - t0).toFixed(1)}ms (HTTP ${loginRes.status})`);

  return { cookieHeader: mapToHeader(jar), userEmail: email };
}

async function testRouteAccess(
  path: string,
  auth: AuthResult | null,
  roleLabel: string
): Promise<{ status: number; location: string | null; durationMs: number; html: string }> {
  const t0 = performance.now();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: auth ? { Cookie: auth.cookieHeader } : {},
    redirect: "manual",
  });
  const t1 = performance.now();
  const location = res.headers.get("location");
  const html = await res.text();
  const durationMs = Number((t1 - t0).toFixed(1));

  // Determine effective redirect: either HTTP header location or Next.js streaming redirect meta
  let effectiveRedirect = location;
  if (!effectiveRedirect) {
    const metaMatch = html.match(/<meta id="__next-page-redirect" http-equiv="refresh" content="[0-9]+;url=([^"]+)"/);
    if (metaMatch) {
      effectiveRedirect = metaMatch[1];
    }
  }

  console.log(
    `[Route Check] ${roleLabel.padEnd(12)} -> ${path.padEnd(22)} | HTTP: ${res.status} | Redirect: ${effectiveRedirect || "None (200 Render)"} | Time: ${durationMs}ms`
  );

  return { status: res.status, location: effectiveRedirect, durationMs, html };
}

async function main() {
  console.log(`Testing Production Server (next start) at: ${BASE_URL}\n`);

  console.log("=== 1. Route Authorization & Permissions Verification ===");
  
  // 1. Unauthenticated Visitor
  console.log("\n--- A. Unauthenticated Visitor ---");
  const unauth1 = await testRouteAccess("/dashboard", null, "Unauth");
  const unauth2 = await testRouteAccess("/admin/resources", null, "Unauth");
  const unauth3 = await testRouteAccess("/admin/reservations", null, "Unauth");

  console.log(`Unauth -> /dashboard:          ${unauth1.location === "/login" ? "PASS (redirects to /login)" : "FAIL"}`);
  console.log(`Unauth -> /admin/resources:    ${unauth2.location === "/login" ? "PASS (redirects to /login)" : "FAIL"}`);
  console.log(`Unauth -> /admin/reservations: ${unauth3.location === "/login" ? "PASS (redirects to /login)" : "FAIL"}`);

  // 2. Member User
  console.log("\n--- B. Member User (member@reservehub.local) ---");
  const memberAuth = await authenticate("member@reservehub.local");
  const memberDash = await testRouteAccess("/dashboard", memberAuth, "Member");
  const memberRes = await testRouteAccess("/reservations", memberAuth, "Member");
  const memberAdminRes = await testRouteAccess("/admin/resources", memberAuth, "Member");
  const memberAdminAll = await testRouteAccess("/admin/reservations", memberAuth, "Member");

  console.log(`Member -> /dashboard:          ${memberDash.status === 200 && !memberDash.location ? "PASS (200 OK)" : "FAIL"}`);
  console.log(`Member -> /reservations:       ${memberRes.status === 200 && !memberRes.location ? "PASS (200 OK)" : "FAIL"}`);
  console.log(`Member -> /admin/resources:    ${memberAdminRes.location === "/dashboard" ? "PASS (BLOCKED -> redirects to /dashboard)" : "FAIL"}`);
  console.log(`Member -> /admin/reservations: ${memberAdminAll.location === "/dashboard" ? "PASS (BLOCKED -> redirects to /dashboard)" : "FAIL"}`);

  // 3. Administrator User
  console.log("\n--- C. Administrator User (admin@reservehub.local) ---");
  const adminAuth = await authenticate("admin@reservehub.local");
  const adminDash = await testRouteAccess("/dashboard", adminAuth, "Admin");
  const adminRes = await testRouteAccess("/admin/resources", adminAuth, "Admin");
  const adminAll = await testRouteAccess("/admin/reservations", adminAuth, "Admin");

  console.log(`Admin -> /dashboard:          ${adminDash.status === 200 && !adminDash.location ? "PASS (200 OK)" : "FAIL"}`);
  console.log(`Admin -> /admin/resources:    ${adminRes.status === 200 && !adminRes.location ? "PASS (200 OK)" : "FAIL"}`);
  console.log(`Admin -> /admin/reservations: ${adminAll.status === 200 && !adminAll.location ? "PASS (200 OK)" : "FAIL"}`);

  console.log("\n=== 2. Real Production Speed Benchmarks ===");
  console.log(`- Member /dashboard Load Time:          ${memberDash.durationMs}ms`);
  console.log(`- Member /reservations Load Time:       ${memberRes.durationMs}ms`);
  console.log(`- Admin /admin/resources Load Time:     ${adminRes.durationMs}ms`);
  console.log(`- Admin /admin/reservations Load Time:  ${adminAll.durationMs}ms`);
}

main().catch(console.error);
