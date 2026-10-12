"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cancelReservation } from "./actions";

interface CancelModalProps {
  reservationId: string;
  resourceName: string;
  timeFormatted: string;
}

export default function CancelReservationButton({
  reservationId,
  resourceName,
  timeFormatted,
}: CancelModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900/60 dark:bg-[#0c2621] dark:text-rose-400 dark:hover:bg-rose-950/40"
      >
        Cancel reservation
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:bg-[#0a2520] border border-[#e5e3da] dark:border-[#183e37] animate-in fade-in zoom-in-95 duration-150">
            {/* Trash icon in soft red circle */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              <Trash2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Cancel this reservation?
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-white">
                {resourceName}
              </span>{" "}
              · {timeFormatted}. The slot will be released immediately for others.
              This stays in your history as Cancelled.
            </p>

            <form
              action={async (formData) => {
                setIsSubmitting(true);
                try {
                  await cancelReservation(formData);
                } finally {
                  setIsSubmitting(false);
                  setIsOpen(false);
                }
              }}
              className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end"
            >
              <input type="hidden" name="reservationId" value={reservationId} />

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0c2621] dark:text-slate-200"
              >
                Keep booking
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? "Cancelling..." : "Yes, cancel it"}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Only your own upcoming confirmed bookings can be cancelled.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
