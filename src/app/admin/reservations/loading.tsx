export default function AdminReservationsLoading() {
  return (
    <div className="min-h-screen bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <div className="h-16 bg-[#0a3832] dark:bg-[#07241f] border-b border-[#0d463e]" />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-9 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-96 rounded-lg bg-slate-200 dark:bg-slate-800" />

          {/* Filters skeleton */}
          <div className="h-20 rounded-2xl border border-[#e5e3da] bg-white p-4 dark:border-[#183e37] dark:bg-[#0a2520]" />

          {/* Cards skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl border border-[#e5e3da] bg-white p-5 shadow-sm dark:border-[#183e37] dark:bg-[#0a2520]"
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
