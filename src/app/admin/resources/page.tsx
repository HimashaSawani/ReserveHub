import { redirect } from "next/navigation";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import AdminClient from "./admin-client";

type Props = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function AdminResourcesPage({ searchParams }: Props) {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const query = await searchParams;
  const notice = typeof query.notice === "string" ? query.notice : undefined;

  const resources = await prisma.resource.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <Navbar user={user} currentPath="admin" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <AdminClient resources={resources} notice={notice} />
      </main>
    </div>
  );
}
