import Link from "next/link";
import { redirect } from "next/navigation";
import type { Resource } from "@prisma/client";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import SubmitButton from "@/components/submit-button";
import { saveResource, setResourceActive } from "./actions";

function ResourceFields({ resource }: { resource?: Resource }) {
  const prefix = resource?.id ?? "new";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${prefix}-name`} className="mb-2 block text-sm">
          Name
        </label>
        <input
          id={`${prefix}-name`}
          name="name"
          defaultValue={resource?.name}
          required
          minLength={2}
          maxLength={100}
          className="rh-input"
        />
      </div>

      <div>
        <label htmlFor={`${prefix}-type`} className="mb-2 block text-sm">
          Type
        </label>
        <select
          id={`${prefix}-type`}
          name="type"
          defaultValue={resource?.type ?? "MEETING_ROOM"}
          className="rh-input"
        >
          <option value="MEETING_ROOM">Meeting room</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div>
        <label
          htmlFor={`${prefix}-location`}
          className="mb-2 block text-sm"
        >
          Location
        </label>
        <input
          id={`${prefix}-location`}
          name="location"
          defaultValue={resource?.location}
          required
          minLength={2}
          maxLength={150}
          className="rh-input"
        />
      </div>

      <div>
        <label
          htmlFor={`${prefix}-capacity`}
          className="mb-2 block text-sm"
        >
          Capacity — optional
        </label>
        <input
          id={`${prefix}-capacity`}
          name="capacity"
          type="number"
          defaultValue={resource?.capacity ?? ""}
          min={1}
          max={10000}
          step={1}
          className="rh-input"
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor={`${prefix}-description`}
          className="mb-2 block text-sm"
        >
          Description
        </label>
        <textarea
          id={`${prefix}-description`}
          name="description"
          defaultValue={resource?.description ?? ""}
          rows={3}
          maxLength={1000}
          className="rh-input"
        />
      </div>
    </div>
  );
}

type Props = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function AdminResourcesPage({ searchParams }: Props) {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const query = await searchParams;
  const resources = await prisma.resource.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="font-medium text-indigo-600">
          ← Dashboard
        </Link>

        <h1 className="mt-5 text-3xl font-bold">Manage resources</h1>

        {typeof query.notice === "string" && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-indigo-50 p-4 text-indigo-800"
          >
            {query.notice.slice(0, 200)}
          </p>
        )}

        <section className="rh-card mt-6">
          <h2 className="mb-5 text-xl font-semibold">Add resource</h2>
          <form action={saveResource} className="space-y-4">
            <ResourceFields />
            <SubmitButton>Create resource</SubmitButton>
          </form>
        </section>

        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Existing resources</h2>

          {resources.map((resource) => (
            <article key={resource.id} className="rh-card">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold">{resource.name}</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm">
                  {resource.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <form action={saveResource} className="space-y-4">
                <input type="hidden" name="id" value={resource.id} />
                <ResourceFields resource={resource} />
                <SubmitButton>Save changes</SubmitButton>
              </form>

              <form action={setResourceActive} className="mt-4">
                <input type="hidden" name="id" value={resource.id} />
                <input
                  type="hidden"
                  name="active"
                  value={String(!resource.isActive)}
                />
                <SubmitButton>
                  {resource.isActive
                    ? "Deactivate resource"
                    : "Activate resource"}
                </SubmitButton>
              </form>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
