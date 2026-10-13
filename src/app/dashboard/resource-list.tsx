"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  Video,
  Tent,
  MapPin,
  ArrowRight,
} from "lucide-react";

type Resource = {
  id: string;
  name: string;
  type: "MEETING_ROOM" | "EQUIPMENT" | "OTHER";
  location: string;
  capacity: number | null;
  description: string | null;
};

export default function ResourceList({
  resources,
}: {
  resources: Resource[];
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");

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
    <section className="mt-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input with search icon */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="resource-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, location, or description..."
            className="w-full rounded-xl border border-[#d6d4cb] bg-white py-2 pl-10 pr-4 text-[15px] text-slate-900 outline-none transition focus:border-[#0a3832] focus:ring-2 focus:ring-[#0a3832]/20 dark:border-[#1a423b] dark:bg-[#0c2621] dark:text-slate-100 dark:focus:border-emerald-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setType("ALL")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              type === "ALL"
                ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
                : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200 dark:hover:bg-[#183e36]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setType("MEETING_ROOM")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              type === "MEETING_ROOM"
                ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
                : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200 dark:hover:bg-[#183e36]"
            }`}
          >
            Meeting rooms
          </button>
          <button
            type="button"
            onClick={() => setType("EQUIPMENT")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              type === "EQUIPMENT"
                ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
                : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200 dark:hover:bg-[#183e36]"
            }`}
          >
            Equipment
          </button>
          <button
            type="button"
            onClick={() => setType("OTHER")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              type === "OTHER"
                ? "bg-[#0a3832] text-white shadow-sm dark:bg-[#0e4840]"
                : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200 dark:hover:bg-[#183e36]"
            }`}
          >
            Other
          </button>
        </div>
      </div>

      {/* Grid of Resource Cards OR Empty State (Strictly separate states) */}
      {filteredResources.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#d6d4cb] bg-white p-12 text-center dark:border-[#1a423b] dark:bg-[#0a2520]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f3ec] text-slate-600 dark:bg-[#12332c] dark:text-slate-300">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            No resources match your search
          </h3>
          <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
            Try adjusting your search terms or filter selection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setType("ALL");
            }}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#115e59] dark:bg-[#0d9488] dark:hover:bg-[#14b8a6]"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => {
            const isMeeting = resource.type === "MEETING_ROOM";
            const isEquipment = resource.type === "EQUIPMENT";

            // Singular badge name on individual cards: "Meeting room", "Equipment", "Other"
            const singularLabel = isMeeting
              ? "Meeting room"
              : isEquipment
                ? "Equipment"
                : "Other";

            return (
              <article
                key={resource.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e5e3da] bg-white shadow-sm transition hover:shadow-md dark:border-[#183e37] dark:bg-[#0a2520]"
              >
                {/* Two-Tone Signature Accent Bar: 72% Forest Green + 28% Amber Gold */}
                <div className="flex h-1.5 w-full">
                  <div className="w-[72%] bg-[#0a3832] dark:bg-[#0e4840]" />
                  <div className="w-[28%] bg-amber-500" />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Category Badge + Icon Square */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-md px-2.5 py-1 text-[13px] font-medium tracking-wide ${
                          isMeeting
                            ? "bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
                            : isEquipment
                              ? "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {singularLabel}
                      </span>

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f3ec] text-[#0a3832] dark:bg-[#12332c] dark:text-emerald-300">
                        {isMeeting ? (
                          <Users className="h-4 w-4" />
                        ) : isEquipment ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <Tent className="h-4 w-4" />
                        )}
                      </div>
                    </div>

                    {/* Title (18px / 600) */}
                    <h3 className="mt-3 text-[18px] font-semibold text-slate-900 group-hover:text-[#0a3832] transition dark:text-white dark:group-hover:text-emerald-300">
                      {resource.name}
                    </h3>

                    {/* Metadata: Location & Capacity */}
                    <div className="mt-2.5 space-y-1.5 text-[14px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span>{resource.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <span>
                          {resource.capacity !== null
                            ? resource.capacity === 1
                              ? "1 person"
                              : `${resource.capacity} people`
                            : isEquipment
                              ? "Exclusive gear reservation"
                              : "General resource"}
                        </span>
                      </div>
                    </div>

                    {/* Description snippet (15px / 400, darkened readable text) */}
                    {resource.description && (
                      <p className="mt-3 text-[14px] leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-300">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Action Link Button (14-15px / 500, height 40px) */}
                  <div className="mt-5 pt-3">
                    <Link
                      href={`/resources/${resource.id}`}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] text-sm font-medium text-white transition hover:bg-[#115e59] dark:bg-[#0d9488] dark:hover:bg-[#14b8a6]"
                    >
                      <span>View schedule &amp; reserve</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
