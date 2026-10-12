import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import ResourceList from "./resource-list";
import { Shield } from "lucide-react";

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
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <Navbar user={user} currentPath="dashboard" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Administrator Banner if user is ADMIN */}
        {user.role === "ADMIN" && (
          <div className="mb-6 flex items-center justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <Shield className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Viewing as Administrator — Manage resources enabled</span>
            </div>
          </div>
        )}

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Find a space or gear
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {resources.length} active resources · Availability depends on the time you pick
          </p>
        </div>

        {/* Resource List Component */}
        <ResourceList resources={resources} />
      </main>
    </div>
  );
}
