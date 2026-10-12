"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CancelReservationButton from "./cancel-modal";

export type ReservationItem = {
  id: string;
  startAt: string;
  endAt: string;
  purpose: string;
  status: "CONFIRMED" | "CANCELLED";
  resource: {
    name: string;
    location: string;
  };
  formattedTime: string;
  dayNumber: string;
  monthShort: string;
  canCancel: boolean;
  stateLabel: "Upcoming" | "In progress" | "Completed" | "Cancelled";
};

export default function ReservationList({
  reservations,
  total,
  page,
  pageSize,
}: {
  reservations: ReservationItem[];
  total: number;
  page: number;
  pageSize: number;
}) {
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "PAST" | "CANCELLED">("ALL");

  const filtered = reservations.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "UPCOMING") return item.stateLabel === "Upcoming";
    if (filter === "PAST")
      return item.stateLabel === "Completed" || item.stateLabel === "In progress";
    if (filter === "CANCELLED") return item.stateLabel === "Cancelled";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      {/* Filter Tabs Header */}
      <div className="flex flex-wrap items-center justify-end gap-1.5 pb-4">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === "ALL"
              ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
              : "border border-[#d6d4cb] bg-white text-slate-700 hover:bg-[#f6f5ef] dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("UPCOMING")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === "UPCOMING"
              ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
              : "border border-[#d6d4cb] bg-white text-slate-700 hover:bg-[#f6f5ef] dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
          }`}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setFilter("PAST")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === "PAST"
              ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
              : "border border-[#d6d4cb] bg-white text-slate-700 hover:bg-[#f6f5ef] dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
          }`}
        >
          Past
        </button>
        <button
          type="button"
          onClick={() => setFilter("CANCELLED")}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            filter === "CANCELLED"
              ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
              : "border border-[#d6d4cb] bg-white text-slate-700 hover:bg-[#f6f5ef] dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Reservation Cards List OR Empty State (Strictly separate states) */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d6d4cb] bg-white p-12 text-center dark:border-[#1a423b] dark:bg-[#0a2520]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f3ec] text-slate-600 dark:bg-[#12332c] dark:text-slate-300">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No reservations found
            </h3>
            <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
              {filter === "ALL"
                ? "Once you reserve a resource, it will appear here with its status."
                : `No reservations under the ${filter.toLowerCase()} filter.`}
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#0a3832] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0d463e]"
            >
              Browse resources
            </Link>
          </div>
        ) : (
          filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e5e3da] bg-white p-5 shadow-sm transition hover:shadow-md dark:border-[#183e37] dark:bg-[#0a2520]"
            >
              <div className="flex items-start gap-4">
                {/* Left: Date Tile accurately matching each reservation's startAt date */}
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#0a3832] text-white shadow-inner dark:bg-[#0e4840]">
                  <span className="text-xl font-bold leading-none">{item.dayNumber}</span>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-200/90 font-medium mt-0.5">
                    {item.monthShort}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[18px] font-semibold text-slate-900 dark:text-white">
                      {item.resource.name}
                    </h3>

                    {/* Status Pill */}
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

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.resource.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.formattedTime}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="text-slate-500 font-medium">Purpose: </span>
                    {item.purpose}
                  </p>
                </div>
              </div>

              {/* Right Action / Status note */}
              <div className="flex shrink-0 items-center justify-end">
                {item.canCancel ? (
                  <CancelReservationButton
                    reservationId={item.id}
                    resourceName={item.resource.name}
                    timeFormatted={item.formattedTime}
                  />
                ) : item.stateLabel === "Cancelled" ? (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Slot released - kept in history
                  </span>
                ) : (
                  <span className="text-sm text-slate-500 dark:text-slate-400">No actions</span>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {total > pageSize && (
        <div className="mt-8 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of{" "}
            {total} {total === 1 ? "reservation" : "reservations"}
          </div>

          <div className="flex items-center gap-1">
            <Link
              href={`/reservations?page=${Math.max(1, page - 1)}`}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-[#d6d4cb] bg-white transition hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] ${
                page <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/reservations?page=${p}`}
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
              href={`/reservations?page=${Math.min(totalPages, page + 1)}`}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border border-[#d6d4cb] bg-white transition hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] ${
                page >= totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
