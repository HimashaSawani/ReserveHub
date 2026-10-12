import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] p-6 text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      <section className="rh-card max-w-md text-center shadow-md">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          The requested page or resource does not exist.
        </p>
        <Link href="/dashboard" className="rh-button mt-5">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
