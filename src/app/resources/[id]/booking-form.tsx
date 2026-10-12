"use client";

import { useActionState } from "react";
import {
  createReservation,
  type BookingState,
} from "@/app/reservations/actions";
import { Loader2, AlertCircle, Calendar } from "lucide-react";

const initialState: BookingState = { error: "" };

export default function BookingForm({
  resourceId,
  isActive = true,
}: {
  resourceId: string;
  isActive?: boolean;
}) {
  const [state, action, pending] = useActionState(
    createReservation,
    initialState,
  );

  return (
    <div className="space-y-6">
      {/* Signature Dark Forest Green Card */}
      <div className="rounded-2xl bg-[#0a3832] p-6 text-white shadow-md dark:bg-[#072520]">
        <h2 className="text-xl font-bold tracking-tight text-white">
          Reserve this resource
        </h2>

        <form action={action} className="mt-5 space-y-4">
          <input type="hidden" name="resourceId" value={resourceId} />

          <div>
            <label
              htmlFor="startAt"
              className="mb-1.5 block text-xs font-semibold text-emerald-100"
            >
              Start date &amp; time
            </label>
            <div className="relative">
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                step={60}
                required
                disabled={pending || !isActive}
                className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="endAt"
              className="mb-1.5 block text-xs font-semibold text-emerald-100"
            >
              End date &amp; time
            </label>
            <div className="relative">
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                step={60}
                required
                disabled={pending || !isActive}
                className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="purpose"
              className="mb-1.5 block text-xs font-semibold text-emerald-100"
            >
              Purpose
            </label>
            <input
              id="purpose"
              name="purpose"
              type="text"
              minLength={3}
              maxLength={500}
              required
              disabled={pending || !isActive}
              placeholder="e.g. Design critique with frontend team"
              className="w-full rounded-xl bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
          </div>

          {/* Primary Action Button: Warm Amber / Gold */}
          <button
            type="submit"
            disabled={pending || !isActive}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d97706] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#b45309] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Confirming reservation...</span>
              </>
            ) : (
              "Confirm reservation"
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-emerald-200/70">
            Times are saved in Asia/Colombo. Past start times are rejected.
          </p>
        </form>
      </div>

      {/* Validation & Conflict Feedback Card */}
      <div className="rounded-2xl border border-[#e5e3da] bg-white p-5 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Validation &amp; conflict feedback
        </h3>

        {state.error ? (
          <div className="mt-3 space-y-2">
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">{state.error}</p>
              </div>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              End must be after start · Start cannot be in the past
            </p>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Select a future time range to verify slot availability.</span>
          </div>
        )}

        {!isActive && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span className="font-semibold block">Inactive resource preview</span>
            This resource is deactivated. Existing reservations are preserved, but new bookings are blocked.
          </div>
        )}
      </div>
    </div>
  );
}
