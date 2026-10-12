import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import Navbar from "@/components/navbar";
import ReservationList, { type ReservationItem } from "./reservation-list";
import { CheckCircle2 } from "lucide-react";

type Props = {
  searchParams: Promise<{
    page?: string | string[];
    notice?: string | string[];
  }>;
};

function formatSlotTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

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

    // Date tile must strictly match each booking's actual date in Asia/Colombo
    const dayNumber = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      day: "numeric",
    }).format(res.startAt);

    const monthShort = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      month: "short",
    }).format(res.startAt);

    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      weekday: "short",
    }).format(res.startAt);

    const startTime = formatSlotTime(res.startAt);
    const endTime = formatSlotTime(res.endAt);
    const formattedTime = `${weekday}, ${dayNumber} ${monthShort} · ${startTime} – ${endTime} (UTC+05:30)`;

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

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Title and Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            My reservations
          </h1>
          <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
            {total} {total === 1 ? "booking" : "bookings"} · All times shown are in Sri Lanka time (UTC+05:30).
          </p>
        </div>

        {/* Separate Notice State: only rendered when a notice parameter is present */}
        {typeof query.notice === "string" && (
          <div
            role="status"
            className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-[#edf7f0] p-4 text-sm font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {query.notice.toLowerCase().includes("cancelled")
                ? "Reservation cancelled. The time slot is now available for other bookings."
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
