"use client";

import { useState } from "react";
import Link from "next/link";

type Resource = {
  id: string;
  name: string;
  type: "MEETING_ROOM" | "EQUIPMENT" | "OTHER";
  location: string;
  capacity: number | null;
  description: string | null;
};

const typeLabels = {
  MEETING_ROOM: "Meeting room",
  EQUIPMENT: "Equipment",
  OTHER: "Other",
};

export default function ResourceList({
  resources,
}: {
  resources: Resource[];
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");

  const query = search.trim().toLowerCase();

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = [
      resource.name,
      resource.location,
      resource.description ?? "",
    ].some((value) => value.toLowerCase().includes(query));

    const matchesType = type === "ALL" || resource.type === type;

    return matchesSearch && matchesType;
  });

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Explore resources</h2>
          <p className="mt-1 text-slate-600">
            Find a room or shared equipment for your next activity.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          {filteredResources.length} resource
          {filteredResources.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_220px]">
        <div>
          <label
            htmlFor="resource-search"
            className="mb-2 block text-sm font-medium"
          >
            Search resources
          </label>
          <input
            id="resource-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, location, or description"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="resource-type"
            className="mb-2 block text-sm font-medium"
          >
            Resource type
          </label>
          <select
            id="resource-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">All types</option>
            <option value="MEETING_ROOM">Meeting rooms</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {filteredResources.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="font-semibold">No resources found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try another search or resource type.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setType("ALL");
            }}
            className="mt-4 font-medium text-indigo-600 hover:text-indigo-800"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <article
              key={resource.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                {typeLabels[resource.type]}
              </span>

              <h3 className="mt-4 text-xl font-bold">{resource.name}</h3>

              <p className="mt-2 text-sm font-medium text-slate-600">
                {resource.location}
              </p>

              {resource.capacity !== null && (
                <p className="mt-2 text-sm text-slate-600">
                  Capacity: {resource.capacity} people
                </p>
              )}

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {resource.description || "No description provided."}
              </p>

              <Link
                href={`/resources/${resource.id}`}
                className="rh-button mt-5"
              >
                View schedule & reserve
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
