import Link from "next/link";
import { signOut } from "@/auth";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import ResourceList from "./resource-list";

export default async function DashboardPage() {
  const user = await requireUser();

  const resources = await prisma.resource.findMany({
    where: {
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      capacity: true,
      description: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <p className="text-sm font-semibold text-indigo-600">ReserveHub</p>
            <h1 className="mt-1 text-2xl font-bold">
              Welcome, {user.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Signed in as {user.role.toLowerCase()}
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-xl border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50"
            >
              Sign out
            </button>
          </form>
        </header>

        <nav
          aria-label="Main navigation"
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link href="/dashboard" className="rh-button">
            Resources
          </Link>
          <Link
            href="/reservations"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium"
          >
            My reservations
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin/resources"
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium"
            >
              Manage resources
            </Link>
          )}
        </nav>

        <ResourceList resources={resources} />
      </div>
    </main>
  );
}
