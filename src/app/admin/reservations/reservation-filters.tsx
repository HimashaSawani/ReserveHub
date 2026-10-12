"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface ResourceOption {
  id: string;
  name: string;
}

interface ReservationFiltersProps {
  resources: ResourceOption[];
  currentResourceId: string;
  currentDate: string;
  currentStatus: string;
}

export default function ReservationFilters({
  resources,
  currentResourceId,
  currentDate,
  currentStatus,
}: ReservationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`/admin/reservations?${params.toString()}`);
  }

  function handleReset() {
    router.push("/admin/reservations");
  }

  const hasActiveFilters =
    (currentResourceId && currentResourceId !== "ALL") ||
    currentDate ||
    (currentStatus && currentStatus !== "ALL");

  return (
    <div className="rounded-2xl border border-[#e5e3da] bg-white p-5 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
        {/* Resource Filter */}
        <div>
          <label
            htmlFor="filter-resource"
            className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Resource
          </label>
          <select
            id="filter-resource"
            value={currentResourceId || "ALL"}
            onChange={(e) => updateQuery("resourceId", e.target.value)}
            className="rh-input text-xs"
          >
            <option value="ALL">All resources</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filter (overlapping selected day) */}
        <div>
          <label
            htmlFor="filter-date"
            className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Date (Day overlap)
          </label>
          <div className="relative">
            <input
              id="filter-date"
              type="date"
              value={currentDate || ""}
              onChange={(e) => updateQuery("date", e.target.value)}
              className="rh-input text-xs"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="filter-status"
            className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Booking status
          </label>
          <select
            id="filter-status"
            value={currentStatus || "ALL"}
            onChange={(e) => updateQuery("status", e.target.value)}
            className="rh-input text-xs"
          >
            <option value="ALL">All statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Action Button: Reset filters */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#d6d4cb] bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-[#f6f5ef] dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
