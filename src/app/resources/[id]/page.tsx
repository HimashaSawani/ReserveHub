import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import ThemeToggle from "@/components/theme-toggle";
import {
  colomboToday,
  parseColomboDateTime,
  formatColombo,
} from "@/lib/time";
import BookingForm from "./booking-form";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
};

export default async function ResourcePage({
  params,
  searchParams,
}: Props) {
  await requireUser();

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

  const selectedDate = parseColomboDateTime(
    `${requestedDate}T00:00`,
  )
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
    select: {
      id: true,
      startAt: true,
      endAt: true,
    },
    orderBy: { startAt: "asc" },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 transition-colors sm:p-6 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="font-medium text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            ← Resources
          </Link>
          <ThemeToggle />
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rh-card">
            <h1 className="text-3xl font-bold">{resource.name}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">{resource.location}</p>

            {resource.capacity !== null && (
              <p className="mt-2 text-slate-700 dark:text-slate-300">Capacity: {resource.capacity} people</p>
            )}

            <p className="mt-4 text-slate-600 dark:text-slate-400">{resource.description}</p>

            {!resource.isActive && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300">
                This resource is inactive. Existing reservations are preserved.
              </p>
            )}

            <h2 className="mt-8 text-xl font-semibold">Daily schedule</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Confirmed bookings in Sri Lanka time. Unlisted intervals are
              currently free; availability is checked again when booking.
            </p>

            <form className="mt-4 flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="date" className="mb-2 block text-sm">
                  Select date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={selectedDate}
                  required
                  className="rh-input"
                />
              </div>

              <button className="rh-button" type="submit">
                View schedule
              </button>
            </form>

            {reservations.length === 0 ? (
              <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
                No confirmed bookings overlap this day.
              </p>
            ) : (
              <ul className="mt-5 space-y-3">
                {reservations.map((reservation) => (
                  <li
                    key={reservation.id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <p className="font-semibold">Reserved</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {formatColombo(reservation.startAt)} →{" "}
                      {formatColombo(reservation.endAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rh-card">
            <h2 className="text-xl font-semibold">Reserve this resource</h2>
            {resource.isActive ? (
              <BookingForm resourceId={resource.id} />
            ) : (
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                New reservations are disabled.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
