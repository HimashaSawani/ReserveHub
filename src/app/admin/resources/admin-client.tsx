"use client";

import { useState } from "react";
import type { Resource } from "@prisma/client";
import {
  Users,
  Video,
  Tent,
  Search,
  Plus,
  Info,
  CheckCircle2,
} from "lucide-react";
import { saveResource, setResourceActive } from "./actions";

interface AdminClientProps {
  resources: Resource[];
  notice?: string;
}

export default function AdminClient({ resources, notice }: AdminClientProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    resources[0] ?? null,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const filteredResources = resources.filter((res) => {
    const matchesSearch = [res.name, res.location, res.description ?? ""].some(
      (val) => val.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
          ? res.isActive
          : !res.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeCount = resources.filter((r) => r.isActive).length;
  const inactiveCount = resources.length - activeCount;

  return (
    <div>
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Manage resources
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {activeCount} active · {inactiveCount} inactive · Deactivating never deletes existing reservations
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedResource(null)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0a3832] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0d463e] dark:bg-[#0e4840]"
        >
          <Plus className="h-4 w-4" />
          <span>New resource</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Left Column: Search, Filters & Resource List */}
        <div className="space-y-4">
          {/* Search bar & filter pills */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-xl border border-[#d6d4cb] bg-white py-2 pl-10 pr-3 text-xs text-slate-900 outline-none transition focus:border-[#0a3832] focus:ring-2 focus:ring-[#0a3832]/20 dark:border-[#1a423b] dark:bg-[#0c2621] dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === "ALL"
                    ? "bg-[#0a3832] text-white dark:bg-[#0e4840]"
                    : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === "ACTIVE"
                    ? "bg-[#0a3832] text-white dark:bg-[#0e4840]"
                    : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  statusFilter === "INACTIVE"
                    ? "bg-[#0a3832] text-white dark:bg-[#0e4840]"
                    : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* List of Resource Items */}
          <div className="space-y-3">
            {filteredResources.map((res) => {
              const isMeeting = res.type === "MEETING_ROOM";
              const isEquipment = res.type === "EQUIPMENT";

              return (
                <article
                  key={res.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm transition ${
                    selectedResource?.id === res.id
                      ? "border-[#0a3832] bg-emerald-50/20 dark:border-emerald-500/50 dark:bg-[#0c2823]"
                      : "border-[#e5e3da] bg-white hover:border-slate-300 dark:border-[#183e37] dark:bg-[#0a2520]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a3832] text-white dark:bg-[#0e4840]">
                      {isMeeting ? (
                        <Users className="h-5 w-5" />
                      ) : isEquipment ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <Tent className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {res.name}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            res.isActive
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          • {res.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isMeeting
                          ? "Meeting rooms"
                          : isEquipment
                            ? "Equipment"
                            : "Other"}{" "}
                        · {res.location}{" "}
                        {res.capacity !== null ? `· ${res.capacity} seats` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedResource(res)}
                      className="rounded-lg border border-[#d6d4cb] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
                    >
                      Edit
                    </button>

                    <form action={setResourceActive}>
                      <input type="hidden" name="id" value={res.id} />
                      <input
                        type="hidden"
                        name="active"
                        value={res.isActive ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                          res.isActive
                            ? "border-amber-300 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-[#0c2621] dark:text-amber-400"
                            : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-[#0c2621] dark:text-emerald-400"
                        }`}
                      >
                        {res.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Bottom Info Banner matching design */}
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-[#eef7fa] p-3.5 text-xs text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400" />
            <p>
              Deactivating hides a resource from new bookings but preserves all existing reservations in history. Server enforces admin-only writes.
            </p>
          </div>
        </div>

        {/* Right Column: Edit / Create Form & Callouts */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e5e3da] bg-white p-6 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {selectedResource ? "Edit resource" : "New resource"}
              </h2>

              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                • {selectedResource?.isActive ?? true ? "Active" : "Inactive"}
              </span>
            </div>

            <form action={saveResource} className="space-y-4">
              {selectedResource && (
                <input type="hidden" name="id" value={selectedResource.id} />
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Name *
                </label>
                <input
                  key={`${selectedResource?.id}-name`}
                  name="name"
                  defaultValue={selectedResource?.name ?? ""}
                  required
                  placeholder="e.g. Iris Boardroom"
                  className="rh-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Type *
                  </label>
                  <select
                    key={`${selectedResource?.id}-type`}
                    name="type"
                    defaultValue={selectedResource?.type ?? "MEETING_ROOM"}
                    className="rh-input text-xs"
                  >
                    <option value="MEETING_ROOM">Meeting rooms</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Capacity (optional)
                  </label>
                  <input
                    key={`${selectedResource?.id}-capacity`}
                    name="capacity"
                    type="number"
                    defaultValue={selectedResource?.capacity ?? ""}
                    placeholder="e.g. 12 seats"
                    className="rh-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Location *
                </label>
                <input
                  key={`${selectedResource?.id}-location`}
                  name="location"
                  defaultValue={selectedResource?.location ?? ""}
                  required
                  placeholder="e.g. Level 3 · Colombo HQ"
                  className="rh-input text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description (optional)
                </label>
                <textarea
                  key={`${selectedResource?.id}-desc`}
                  name="description"
                  defaultValue={selectedResource?.description ?? ""}
                  rows={3}
                  placeholder="Glass-walled boardroom with video conferencing..."
                  className="rh-input text-xs"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Name is required · Location is required
              </p>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#0a3832] py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0d463e] dark:bg-[#0e4840]"
              >
                {selectedResource ? "Save changes" : "Create resource"}
              </button>
            </form>
          </section>

          {/* Feedback Notices */}
          {notice && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-[#edf7f0] p-4 text-xs font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{notice}</span>
            </div>
          )}

          {/* Keyboard & Mobile Notes matching design */}
          <div className="rounded-2xl bg-[#0a3832] p-5 text-white dark:bg-[#07241f] shadow-sm">
            <h3 className="text-xs font-bold text-white">Keyboard &amp; mobile notes</h3>
            <p className="mt-1 text-xs leading-relaxed text-emerald-100/80">
              Every field has a visible label. Focus ring = 2px amber outline. On mobile the list stacks above the form; Activate/Deactivate becomes a full-width button.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
