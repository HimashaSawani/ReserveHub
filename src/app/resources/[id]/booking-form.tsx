"use client";

import { useActionState } from "react";
import {
  createReservation,
  type BookingState,
} from "@/app/reservations/actions";
import { Loader2, AlertCircle } from "lucide-react";

const initialState: BookingState = { error: "" };

export default function BookingForm({
  resourceId,
  isActive = true,
  userName,
  userEmail,
}: {
  resourceId: string;
  isActive?: boolean;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const [state, action, pending] = useActionState(
    createReservation,
    initialState,
  );

  return (
    <div className="space-y-4">
      {/* Light Theme Booking Card: White with Teal Heading & Button */}
      <div className="rounded-2xl border border-[#e5e3da] bg-white p-6 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
        <h2 className="text-xl font-semibold tracking-tight text-[#0a3832] dark:text-emerald-300">
          Reserve this resource
        </h2>

        {userName && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-1.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
            <span>
              Booking as <strong>{userName}</strong>
              {userEmail && <span className="opacity-80"> ({userEmail})</span>}
            </span>
          </div>
        )}

        {!isActive ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
            <span className="font-semibold block">Resource unavailable</span>
            This resource is deactivated. Existing reservations are preserved, but new bookings are blocked.
          </div>
        ) : (
          <form action={action} className="mt-5 space-y-4">
            <input type="hidden" name="resourceId" value={resourceId} />

            <div>
              <label
                htmlFor="startAt"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Start date &amp; time
              </label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                step={60}
                required
                disabled={pending}
                className="rh-input"
              />
            </div>

            <div>
              <label
                htmlFor="endAt"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                End date &amp; time
              </label>
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                step={60}
                required
                disabled={pending}
                className="rh-input"
              />
            </div>

            <div>
              <label
                htmlFor="purpose"
                className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
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
                disabled={pending}
                placeholder="e.g. Design critique with frontend team"
                className="rh-input"
              />
            </div>

            {/* Error state: only displayed when there is an actual validation/booking error */}
            {state.error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <div>
                  <p className="font-semibold">{state.error}</p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    End time must be after start time, and start time must be in the future.
                  </p>
                </div>
              </div>
            )}

            {/* Teal Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] text-sm font-medium text-white shadow-sm transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#0d9488] dark:hover:bg-[#14b8a6]"
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

            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              All times shown are in Sri Lanka time (UTC+05:30).
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
