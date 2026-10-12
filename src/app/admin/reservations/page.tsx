import Link from "next/link";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { parseColomboDateTime } from "@/lib/time";
import Navbar from "@/components/navbar";
import ReservationFilters from "./reservation-filters";
import {
  MapPin,
  Clock,
  User,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";

type Props = {
  searchParams: Promise<{
    page?: string | string[];
    resourceId?: string | string[];
    date?: string | string[];
    status?: string | string[];
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

export default async function AdminReservationsPage({ searchParams }: Props) {
  // Enforce ADMIN authorization on server before querying data
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const query = await searchParams;
  const currentResourceId =
    typeof query.resourceId === "string" ? query.resourceId : "ALL";
  const currentDate = typeof query.date === "string" ? query.date : "";
  const currentStatus =
    typeof query.status === "string" ? query.status : "ALL";

  const requestedPage = Number(query.page ?? 1);
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const pageSize = 10;

  // Build Prisma Where clause
  const where: Prisma.ReservationWhereInput = {};
  const andClauses: Prisma.ReservationWhereInput[] = [];

  // Resource filter
  if (currentResourceId && currentResourceId !== "ALL") {
    andClauses.push({ resourceId: currentResourceId });
  }

  // Date filter: overlapping bookings for selected day in Asia/Colombo
  if (currentDate && /^\d{4}-\d{2}-\d{2}$/.test(currentDate)) {
    const dayStart = parseColomboDateTime(`${currentDate}T00:00`);
    if (dayStart) {
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      andClauses.push({
        startAt: { lt: dayEnd },
        endAt: { gt: dayStart },
      });
    }
  }

  // Status filter (derived from status and startAt/endAt times)
  const now = new Date();
  if (currentStatus === "CANCELLED") {
    andClauses.push({ status: "CANCELLED" });
  } else if (currentStatus === "UPCOMING") {
    andClauses.push({
      status: "CONFIRMED",
      startAt: { gt: now },
    });
  } else if (currentStatus === "IN_PROGRESS") {
    andClauses.push({
      status: "CONFIRMED",
      startAt: { lte: now },
      endAt: { gt: now },
    });
  } else if (currentStatus === "COMPLETED") {
    andClauses.push({
      status: "CONFIRMED",
      endAt: { lte: now },
    });
  }

  if (andClauses.length > 0) {
    where.AND = andClauses;
  }

  // Fetch resources for filter dropdown, matching reservations, and total count in parallel
  const [resources, totalMatching, reservationsRaw] = await Promise.all([
    prisma.resource.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      include: {
        resource: {
          select: { name: true, location: true, type: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: [{ startAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize));

  // Derive status and formatted dates/times for each reservation
  const reservations = reservationsRaw.map((res) => {
    const stateLabel =
      res.status === "CANCELLED"
        ? "Cancelled"
        : res.endAt <= now
          ? "Completed"
          : res.startAt <= now
            ? "In progress"
            : "Upcoming";

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
      resourceName: res.resource.name,
      resourceLocation: res.resource.location,
      userName: res.user.name,
      userEmail: res.user.email,
      purpose: res.purpose,
      status: res.status,
      stateLabel,
      formattedTime,
      dayNumber,
      monthShort,
    };
  });

  // Helper for pagination query string preserving current filters
  function getPageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (currentResourceId && currentResourceId !== "ALL") {
      params.set("resourceId", currentResourceId);
    }
    if (currentDate) {
      params.set("date", currentDate);
    }
    if (currentStatus && currentStatus !== "ALL") {
      params.set("status", currentStatus);
    }
    params.set("page", String(targetPage));
    return `/admin/reservations?${params.toString()}`;
  }

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <Navbar user={user} currentPath="admin-reservations" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header Row */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                All reservations
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                <Shield className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Admin View</span>
              </span>
            </div>
            <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
              {totalMatching} {totalMatching === 1 ? "reservation" : "reservations"} across all members · All times shown are in Sri Lanka time (UTC+05:30).
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <ReservationFilters
            resources={resources}
            currentResourceId={currentResourceId}
            currentDate={currentDate}
            currentStatus={currentStatus}
          />
        </div>

        {/* Reservations List OR Empty State */}
        {reservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6d4cb] bg-white p-12 text-center dark:border-[#183e37] dark:bg-[#0a2520]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f3ec] text-slate-600 dark:bg-[#12332c] dark:text-slate-300">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No reservations found
            </h3>
            <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
              No bookings match the selected resource, date, or status filter.
            </p>
            <Link
              href="/admin/reservations"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#0a3832] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d463e]"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {reservations.map((item) => (
              <article
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e5e3da] bg-white p-5 shadow-sm transition hover:shadow-md dark:border-[#183e37] dark:bg-[#0a2520]"
              >
                <div className="flex items-start gap-4">
                  {/* Left: Date Tile */}
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0a3832] text-white shadow-inner dark:bg-[#0e4840]">
                    <span className="text-xl font-bold leading-none">{item.dayNumber}</span>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-200/90 font-medium mt-0.5">
                      {item.monthShort}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] font-semibold text-slate-900 dark:text-white">
                        {item.resourceName}
                      </h3>

                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-medium ${
                          item.stateLabel === "Upcoming"
                            ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                            : item.stateLabel === "In progress"
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : item.stateLabel === "Completed"
                                ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.stateLabel}
                      </span>
                    </div>

                    {/* Member Name and Email */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#0a3832] dark:text-emerald-400" />
                        <span>{item.userName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-normal">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{item.userEmail}</span>
                      </div>
                    </div>

                    {/* Location & Time */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{item.resourceLocation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{item.formattedTime}</span>
                      </div>
                    </div>

                    {/* Purpose */}
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      <span className="text-slate-500 font-medium">Purpose: </span>
                      {item.purpose}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Footer */}
        {totalMatching > pageSize && (
          <div className="mt-8 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <div>
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalMatching)} of{" "}
              {totalMatching} {totalMatching === 1 ? "reservation" : "reservations"}
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={getPageHref(Math.max(1, page - 1))}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border border-[#d6d4cb] bg-white transition hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] ${
                  page <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={getPageHref(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-medium transition ${
                    p === page
                      ? "bg-[#0a3832] text-white dark:bg-[#0e4840]"
                      : "border border-[#d6d4cb] bg-white text-slate-700 hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
                  }`}
                >
                  {p}
                </Link>
              ))}

              <Link
                href={getPageHref(Math.min(totalPages, page + 1))}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border border-[#d6d4cb] bg-white transition hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] ${
                  page >= totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
