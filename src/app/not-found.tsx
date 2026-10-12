import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <section className="rh-card text-center">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="mt-3 text-slate-600">
          The requested page or resource does not exist.
        </p>
        <Link href="/dashboard" className="rh-button mt-5">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}
