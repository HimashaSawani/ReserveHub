"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { parseColomboDateTime } from "@/lib/time";
import {
  BookingError,
  reserveResource,
} from "@/lib/reservation-service";

const bookingSchema = z.object({
  resourceId: z.string().uuid(),
  startAt: z.string(),
  endAt: z.string(),
  purpose: z.string().trim().min(3).max(500),
});

export type BookingState = {
  error: string;
};

export async function createReservation(
  _previousState: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const user = await requireUser();

  const parsed = bookingSchema.safeParse({
    resourceId: formData.get("resourceId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    purpose: formData.get("purpose"),
  });

  if (!parsed.success) {
    return {
      error: "Check the dates and enter a purpose of 3–500 characters.",
    };
  }

  const startAt = parseColomboDateTime(parsed.data.startAt);
  const endAt = parseColomboDateTime(parsed.data.endAt);

  if (!startAt || !endAt) {
    return { error: "Enter valid start and end dates." };
  }

  try {
    await reserveResource(prisma, {
      userId: user.id,
      resourceId: parsed.data.resourceId,
      startAt,
      endAt,
      purpose: parsed.data.purpose,
    });
  } catch (error) {
    if (error instanceof BookingError) {
      return { error: error.message };
    }

    console.error("Booking failed:", error);
    return { error: "Unable to save the booking. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/resources/${parsed.data.resourceId}`);
  revalidatePath("/reservations");
  revalidatePath("/admin/reservations");
  redirect("/reservations?notice=Booking%20confirmed");
}

export async function cancelReservation(formData: FormData) {
  const user = await requireUser();

  const parsed = z.string().uuid().safeParse(formData.get("reservationId"));
  if (!parsed.success) {
    redirect("/reservations?notice=Invalid%20reservation");
  }

  let count = 0;

  try {
    const result = await prisma.reservation.updateMany({
      where: {
        id: parsed.data,
        userId: user.id,
        status: "CONFIRMED",
        startAt: { gt: new Date() },
      },
      data: {
        status: "CANCELLED",
      },
    });

    count = result.count;
  } catch (error) {
    console.error("Cancellation failed:", error);
    redirect("/reservations?notice=Unable%20to%20cancel%20reservation");
  }

  revalidatePath("/reservations");
  revalidatePath("/admin/reservations");
  revalidatePath("/resources", "layout");
  redirect(
    count
      ? "/reservations?notice=Reservation%20cancelled"
      : "/reservations?notice=Only%20your%20upcoming%20confirmed%20bookings%20can%20be%20cancelled",
  );
}
