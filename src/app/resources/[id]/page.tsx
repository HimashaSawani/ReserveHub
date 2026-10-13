import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import Navbar from "@/components/navbar";
import {
  colomboToday,
  parseColomboDateTime,
} from "@/lib/time";
import BookingForm from "./booking-form";
import {
  ArrowLeft,
  Users,
  Video,
  Tent,
  MapPin,
  Clock,
  CalendarCheck,
} from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
};

function formatSlotTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Colombo",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default async function ResourcePage({
  params,
  searchParams,
}: Props) {
  const user = await requireUser();

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    notFound();
  }

  const resource = await prisma.resource.findUnique({
    where: { id },
  });

  if (!resource) {
    notFound();
  }

  const query = await searchParams;
  const requestedDate =
    typeof query.date === "string" ? query.date : colomboToday();

  const selectedDate = parseColomboDateTime(`${requestedDate}T00:00`)
    ? requestedDate
    : colomboToday();

  const dayStart = parseColomboDateTime(`${selectedDate}T00:00`)!;
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const reservations = await prisma.reservation.findMany({
    where: {
      resourceId: id,
      status: "CONFIRMED",
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
    },
    include: {
      user: {
        select: { id: true },
      },
    },
    orderBy: { startAt: "asc" },
  });

  // Dynamically generate 5 days starting from today in Colombo
  const todayColombo = parseColomboDateTime(`${colomboToday()}T00:00`)!;
  const daysList = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(todayColombo.getTime() + i * 24 * 60 * 60 * 1000);
    // Format YYYY-MM-DD
    const yyyy = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Colombo", year: "numeric" }).format(d);
    const mm = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Colombo", month: "2-digit" }).format(d);
    const dd = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Colombo", day: "2-digit" }).format(d);
    const isoString = `${yyyy}-${mm}-${dd}`;

    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      weekday: "short",
    }).format(d);
    const dayNumber = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Colombo",
      day: "numeric",
    }).format(d);

    return {
      dateString: isoString,
      weekday,
      dayNumber,
      isSelected: isoString === selectedDate,
    };
  });

  const isMeeting = resource.type === "MEETING_ROOM";
  const isEquipment = resource.type === "EQUIPMENT";

  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <Navbar user={user} currentPath="resources" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Back link */}
        <div className="mb-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0a3832] transition hover:text-[#0d463e] dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to resources</span>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left Column: Resource Details & Daily Schedule */}
          <div className="space-y-6">
            {/* Resource Info Card */}
            <section className="rounded-2xl border border-[#e5e3da] bg-white p-6 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md px-2.5 py-1 text-[13px] font-medium ${
                      isMeeting
                        ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                        : isEquipment
                          ? "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {isMeeting
                      ? "Meeting room"
                      : isEquipment
                        ? "Equipment"
                        : "Other"}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-1 text-[13px] font-medium ${
                      resource.isActive
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {resource.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a3832] text-white dark:bg-[#0e4840]">
                  {isMeeting ? (
                    <Users className="h-5 w-5" />
                  ) : isEquipment ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <Tent className="h-5 w-5" />
                  )}
                </div>
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {resource.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span>{resource.location}</span>
                </div>
                {resource.capacity !== null && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span>{resource.capacity === 1 ? "1 person" : `${resource.capacity} people`}</span>
                  </div>
                )}
              </div>

              {resource.description && (
                <p className="mt-4 text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {resource.description}
                </p>
              )}
            </section>

            {/* Daily Schedule Card */}
            <section className="rounded-2xl border border-[#e5e3da] bg-white p-6 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  Daily schedule
                </h2>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
                  <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>All times shown are in Sri Lanka time (UTC+05:30).</span>
                </div>
              </div>

              {/* Day Selector Pills Carousel: accurate weekdays generated from dates */}
              <div className="mt-5 grid grid-cols-5 gap-2">
                {daysList.map((day) => (
                  <Link
                    key={day.dateString}
                    href={`/resources/${resource.id}?date=${day.dateString}`}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition text-center ${
                      day.isSelected
                        ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
                        : "border border-[#e5e3da] bg-white text-slate-700 hover:bg-[#f6f5ef] dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200 dark:hover:bg-[#12332c]"
                    }`}
                  >
                    <span className="text-[12px] font-medium opacity-80">{day.weekday}</span>
                    <span className="text-[16px] font-semibold mt-0.5">{day.dayNumber}</span>
                  </Link>
                ))}
              </div>

              {/* Scheduled Intervals List: strictly separate states */}
              <div className="mt-6 space-y-3">
                {reservations.length === 0 ? (
                  <div className="flex items-center gap-3.5 rounded-xl border border-dashed border-[#d6d4cb] bg-[#faf9f4] p-5 dark:border-[#1a423b] dark:bg-[#0c2621]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <CalendarCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        No confirmed bookings for this day
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        This date is currently open for reservations.
                      </p>
                    </div>
                  </div>
                ) : (
                  reservations.map((res, index) => {
                    const isOwnBooking = res.user?.id === user.id;
                    const startTime = formatSlotTime(res.startAt);
                    const endTime = formatSlotTime(res.endAt);

                    return (
                      <div
                        key={res.id}
                        className="flex items-center justify-between overflow-hidden rounded-xl border border-[#e5e3da] bg-white p-3.5 shadow-sm transition dark:border-[#183e37] dark:bg-[#0c2621]"
                      >
                        <div className="flex items-center gap-3">
                          {/* Left indicator bar */}
                          <div
                            className={`h-8 w-1 rounded-full ${
                              isOwnBooking
                                ? "bg-teal-500"
                                : index % 2 === 0
                                  ? "bg-[#0a3832]"
                                  : "bg-amber-500"
                            }`}
                          />
                          <div>
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              {startTime} – {endTime}
                            </span>
                            <span className="ml-3 text-xs text-slate-600 dark:text-slate-300">
                              {isOwnBooking ? "Your booking" : "Reserved"}
                            </span>
                          </div>
                        </div>

                        {isOwnBooking && (
                          <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                            Your booking
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Reserve Form */}
          <BookingForm resourceId={resource.id} isActive={resource.isActive} />
        </div>
      </main>
    </div>
  );
}
