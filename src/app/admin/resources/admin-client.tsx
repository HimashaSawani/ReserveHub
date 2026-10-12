"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { Resource } from "@prisma/client";
import {
  Users,
  Video,
  Tent,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { saveResource, setResourceActive } from "./actions";

interface AdminClientProps {
  resources: Resource[];
  notice?: string;
}

function SaveButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0a3832] text-sm font-medium text-white shadow-sm transition hover:bg-[#0d463e] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#0e4840]"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving…</span>
        </>
      ) : isEditing ? (
        "Save changes"
      ) : (
        "Create resource"
      )}
    </button>
  );
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

  const isErrorNotice = notice?.toLowerCase().includes("unable") || notice?.toLowerCase().includes("check");

  return (
    <div>
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Manage resources
          </h1>
          <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-300">
            {activeCount} active · {inactiveCount} inactive · Deactivating hides a resource without deleting past bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedResource(null)}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0a3832] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#0d463e] dark:bg-[#0e4840]"
        >
          <Plus className="h-4 w-4" />
          <span>New resource</span>
        </button>
      </div>

      {/* Notice Banner: rendered only when notice is present */}
      {notice && (
        <div
          role="status"
          className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 text-sm font-medium ${
            isErrorNotice
              ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
              : "border-emerald-200 bg-[#edf7f0] text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
          }`}
        >
          {isErrorNotice ? (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{notice}</span>
        </div>
      )}

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
                className="w-full rounded-xl border border-[#d6d4cb] bg-white py-2 pl-10 pr-3 text-[14px] text-slate-900 outline-none transition focus:border-[#0a3832] focus:ring-2 focus:ring-[#0a3832]/20 dark:border-[#1a423b] dark:bg-[#0c2621] dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  statusFilter === "INACTIVE"
                    ? "bg-[#0a3832] text-white dark:bg-[#0e4840]"
                    : "bg-[#e8e6dc] text-slate-700 hover:bg-[#dedcd1] dark:bg-[#12332c] dark:text-slate-200"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* List of Resource Items OR Empty State */}
          {filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d6d4cb] bg-white p-10 text-center dark:border-[#183e37] dark:bg-[#0a2520]">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                No resources match your filter criteria.
              </p>
            </div>
          ) : (
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
                          <h3 className="text-[16px] font-semibold text-slate-900 dark:text-white">
                            {res.name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              res.isActive
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            • {res.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {isMeeting
                            ? "Meeting room"
                            : isEquipment
                              ? "Equipment"
                              : "Other"}{" "}
                          · {res.location}{" "}
                          {res.capacity !== null ? `· ${res.capacity} people` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedResource(res)}
                        className="rounded-xl border border-[#d6d4cb] bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-[#183e37] dark:bg-[#0c2621] dark:text-slate-200"
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
                          className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
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
          )}
        </div>

        {/* Right Column: Edit / Create Form */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e5e3da] bg-white p-6 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                {selectedResource ? "Edit resource" : "New resource"}
              </h2>

              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                • {selectedResource?.isActive ?? true ? "Active" : "Inactive"}
              </span>
            </div>

            <form action={saveResource} className="space-y-4">
              {selectedResource && (
                <input type="hidden" name="id" value={selectedResource.id} />
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name *
                </label>
                <input
                  key={`${selectedResource?.id}-name`}
                  name="name"
                  defaultValue={selectedResource?.name ?? ""}
                  required
                  placeholder="e.g. Iris Boardroom"
                  className="rh-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Type *
                  </label>
                  <select
                    key={`${selectedResource?.id}-type`}
                    name="type"
                    defaultValue={selectedResource?.type ?? "MEETING_ROOM"}
                    className="rh-input"
                  >
                    <option value="MEETING_ROOM">Meeting room</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Capacity (people, optional)
                  </label>
                  <input
                    key={`${selectedResource?.id}-capacity`}
                    name="capacity"
                    type="number"
                    min={1}
                    max={10000}
                    defaultValue={selectedResource?.capacity ?? ""}
                    placeholder="e.g. 12"
                    className="rh-input"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location *
                </label>
                <input
                  key={`${selectedResource?.id}-location`}
                  name="location"
                  defaultValue={selectedResource?.location ?? ""}
                  required
                  placeholder="e.g. Level 3 · Colombo HQ"
                  className="rh-input"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description (optional)
                </label>
                <textarea
                  key={`${selectedResource?.id}-desc`}
                  name="description"
                  defaultValue={selectedResource?.description ?? ""}
                  rows={4}
                  placeholder="Describe facilities, equipment included, or special access instructions..."
                  className="rh-input"
                />
              </div>

              {/* Single Save Button that shifts to Saving... */}
              <div className="pt-2">
                <SaveButton isEditing={!!selectedResource} />
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
