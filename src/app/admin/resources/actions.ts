"use server";

import { z } from "zod";
import { ResourceType } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

const resourceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.nativeEnum(ResourceType),
  location: z.string().trim().min(2).max(150),
  description: z.string().trim().max(1000),
  capacity: z.preprocess(
    (value) => (value === "" || value === null ? null : value),
    z.coerce.number().int().min(1).max(10_000).nullable(),
  ),
});

function returnToAdmin(message: string): never {
  redirect(`/admin/resources?notice=${encodeURIComponent(message)}`);
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function saveResource(formData: FormData) {
  await requireAdmin();

  const rawId = formData.get("id");
  const id = typeof rawId === "string" && rawId ? rawId : null;
  if (id && !z.string().uuid().safeParse(id).success) {
    returnToAdmin("Invalid resource.");
  }

  const parsed = resourceSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    location: formData.get("location"),
    description: formData.get("description"),
    capacity: formData.get("capacity"),
  });

  if (!parsed.success) {
    returnToAdmin("Check all fields. Capacity must be a positive whole number.");
  }

  try {
    if (id) {
      await prisma.resource.update({
        where: { id },
        data: parsed.data,
      });
    } else {
      await prisma.resource.create({
        data: parsed.data,
      });
    }
  } catch (error) {
    console.error("Resource save failed:", error);
    returnToAdmin("Unable to save. Please try again.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/resources");
  revalidatePath("/resources", "layout");
  returnToAdmin("Resource saved successfully.");
}

export async function setResourceActive(formData: FormData) {
  await requireAdmin();

  const id = z.string().uuid().safeParse(formData.get("id"));
  const active = formData.get("active");

  if (!id.success || (active !== "true" && active !== "false")) {
    returnToAdmin("Invalid resource update.");
  }

  try {
    await prisma.resource.update({
      where: { id: id.data },
      data: { isActive: active === "true" },
    });
  } catch (error) {
    console.error("Resource status update failed:", error);
    returnToAdmin("Unable to update resource.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin/resources");
  revalidatePath("/resources", "layout");
  returnToAdmin("Resource availability updated.");
}
