import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { formatColombo } from "@/lib/time";
import Navbar from "@/components/navbar";
import ReservationList, { type ReservationItem } from "./reservation-list";
import { CheckCircle2 } from "lucide-react";

type Props = {
  searchParams: Promise<{
    page?: string | string[];
    notice?: string | string[];
  }>;
};

export default async function ReservationsPage({ searchParams }: Props) {
  const user = await requireUser();
  const query = await searchParams;

  const requestedPage = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    requestedPage <= 100_000
      ? requestedPage
      : 1;

  const pageSize = 10;

  const [total, reservationsRaw] = await Promise.all([
    prisma.reservation.count({
      where: { userId: user.id },
    }),
    prisma.reservation.findMany({
      where: { userId: user.id },
      include: {
        resource: {
          select: { name: true, location: true },
        },
      },
      orderBy: [{ startAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const now = new Date();

  const reservations: ReservationItem[] = reservationsRaw.map((res) => {
    const canCancel = res.status === "CONFIRMED" && res.startAt > now;
    const stateLabel =
      res.status === "CANCELLED"
        ? "Cancelled"
        : res.endAt <= now
          ? "Completed"
          : res.startAt <= now
            ? "In progress"
            : "Upcoming";

    // Day number and Month in Colombo
    const dayNumber = formatColombo(res.startAt, { day: "numeric" });
    const monthShort = formatColombo(res.startAt, { month: "short" });
    const formattedTime = `${formatColombo(res.startAt, {
      weekday: "short",
      day: "numeric",
      month: "short",
    })} · ${formatColombo(res.startAt, {
      hour: "2-digit",
      minute: "2-digit",
    })} – ${formatColombo(res.endAt, {
      hour: "2-digit",
      minute: "2-digit",
    })} (Asia/Colombo)`;

    return {
      id: res.id,
      startAt: res.startAt.toISOString(),
      endAt: res.endAt.toISOString(),
      purpose: res.purpose,
      status: res.status,
      resource: res.resource,
      formattedTime,
      dayNumber,
      monthShort,
      canCancel,
      stateLabel,
    };
  });

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <Navbar user={user} currentPath="reservations" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Title and Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            My reservations
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {total} booking{total === 1 ? "" : "s"} · All times in Sri Lanka time — Asia/Colombo
          </p>
        </div>

        {/* Notice Alert Banner matching Image 1 */}
        {typeof query.notice === "string" && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-[#edf7f0] p-4 text-xs sm:text-sm font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {query.notice.toLowerCase().includes("cancelled")
                ? "Reservation cancelled. The time slot is free again. It remains below in history."
                : query.notice}
            </span>
          </div>
        )}

        <ReservationList
          reservations={reservations}
          total={total}
          page={page}
          pageSize={pageSize}
        />
      </main>
    </div>
  );
}
