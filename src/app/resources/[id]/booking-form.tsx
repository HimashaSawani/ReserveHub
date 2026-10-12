"use client";

import { useActionState } from "react";
import {
  createReservation,
  type BookingState,
} from "@/app/reservations/actions";

const initialState: BookingState = { error: "" };

export default function BookingForm({
  resourceId,
}: {
  resourceId: string;
}) {
  const [state, action, pending] = useActionState(
    createReservation,
    initialState,
  );

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="resourceId" value={resourceId} />

      <p className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
        All times are in Sri Lanka time — Asia/Colombo.
      </p>

      <div>
        <label htmlFor="startAt" className="mb-2 block font-medium">
          Start
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
        <label htmlFor="endAt" className="mb-2 block font-medium">
          End
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
        <label htmlFor="purpose" className="mb-2 block font-medium">
          Purpose
        </label>
        <textarea
          id="purpose"
          name="purpose"
          rows={3}
          minLength={3}
          maxLength={500}
          required
          disabled={pending}
          placeholder="For example, weekly project planning"
          className="rh-input"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button disabled={pending} type="submit" className="rh-button w-full">
        {pending ? "Reserving..." : "Confirm reservation"}
      </button>
    </form>
  );
}
