import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { formatColombo } from "@/lib/time";
import SubmitButton from "@/components/submit-button";
import ThemeToggle from "@/components/theme-toggle";
import { cancelReservation } from "./actions";

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

  const [total, reservations] = await Promise.all([
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

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 transition-colors sm:p-6 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="font-medium text-indigo-600 transition hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
            ← Dashboard
          </Link>
          <ThemeToggle />
        </div>

        <h1 className="mt-5 text-3xl font-bold">My reservations</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          All times are shown in Sri Lanka time.
        </p>

        {typeof query.notice === "string" && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300"
          >
            {query.notice.slice(0, 200)}
          </p>
        )}

        <div className="mt-6 space-y-4">
          {reservations.length === 0 && (
            <div className="rh-card">
              <p>No reservations on this page.</p>
              <Link href="/dashboard" className="rh-button mt-4">
                Browse resources
              </Link>
            </div>
          )}

          {reservations.map((reservation) => {
            const canCancel =
              reservation.status === "CONFIRMED" &&
              reservation.startAt > now;

            const label =
              reservation.status === "CANCELLED"
                ? "Cancelled"
                : reservation.endAt <= now
                  ? "Completed"
                  : reservation.startAt <= now
                    ? "In progress"
                    : "Upcoming";

            return (
              <article key={reservation.id} className="rh-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/resources/${reservation.resourceId}`}
                      className="text-xl font-semibold text-indigo-700 transition hover:underline dark:text-indigo-400"
                    >
                      {reservation.resource.name}
                    </Link>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {reservation.resource.location}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium dark:bg-slate-800 dark:text-slate-300">
                    {label}
                  </span>
                </div>

                <p className="mt-4 font-medium">
                  {formatColombo(reservation.startAt)} →{" "}
                  {formatColombo(reservation.endAt)}
                </p>

                <p className="mt-2 break-words text-slate-600 dark:text-slate-400">
                  {reservation.purpose}
                </p>

                {canCancel && (
                  <form action={cancelReservation} className="mt-4">
                    <input
                      type="hidden"
                      name="reservationId"
                      value={reservation.id}
                    />
                    <SubmitButton>Cancel reservation</SubmitButton>
                  </form>
                )}
              </article>
            );
          })}
        </div>

        <nav aria-label="Pagination" className="mt-6 flex items-center gap-4">
          {page > 1 && (
            <Link href={`/reservations?page=${page - 1}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              ← Previous
            </Link>
          )}
          <span className="text-sm text-slate-600 dark:text-slate-400">Page {page}</span>
          {page * pageSize < total && (
            <Link href={`/reservations?page=${page + 1}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Next →
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
