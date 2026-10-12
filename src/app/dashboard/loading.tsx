export default function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading dashboard"
      className="min-h-screen bg-slate-100 px-4 py-6 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-8 h-8 w-56 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-5 h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-56 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    </main>
  );
}
