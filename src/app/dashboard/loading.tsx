import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      {/* Header skeleton */}
      <div className="h-14 bg-[#0a3832] dark:bg-[#07241f] border-b border-[#0d463e]" />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-9 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-96 rounded-lg bg-slate-200 dark:bg-slate-800" />

          {/* Search bar skeleton */}
          <div className="h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />

          {/* Loading Resources card matching Image 4 */}
          <div className="rounded-2xl border border-[#e5e3da] bg-white p-6 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Loading resources...</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="h-16 rounded-xl bg-[#e8e6dc] dark:bg-[#12332c]" />
              <div className="h-16 rounded-xl bg-[#e8e6dc] dark:bg-[#12332c]" />
            </div>
          </div>

          {/* Cards Grid skeleton */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-64 rounded-2xl border border-[#e5e3da] bg-white shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
