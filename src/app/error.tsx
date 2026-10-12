"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <section className="rh-card max-w-md text-center">
        <h1 className="text-2xl font-bold">Unable to load this page</h1>
        <p className="mt-3 text-slate-600">
          Please try again. If this continues, check that the database is running.
        </p>
        <button onClick={reset} className="rh-button mt-5">
          Try again
        </button>
      </section>
    </main>
  );
}
