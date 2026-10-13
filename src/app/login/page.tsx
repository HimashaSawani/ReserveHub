import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ThemeToggle from "@/components/theme-toggle";
import LoginForm from "./login-form";
import { Clock } from "lucide-react";

type Props = {
  searchParams?: Promise<{ preview?: string }>;
};

import BrandLogo from "@/components/brand-logo";

export default async function LoginPage({ searchParams }: Props) {
  const query = searchParams ? await searchParams : {};
  const session = await auth();

  if (session?.user?.id && query.preview !== "1") {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row bg-[#f8f7f2] text-slate-900 transition-colors dark:bg-[#061916] dark:text-slate-100">
      {/* Left Column: Forest Green Hero Banner */}
      <section className="relative flex flex-col justify-between bg-[#0a3832] p-8 lg:w-5/12 lg:min-h-screen lg:p-14 text-white overflow-hidden shadow-2xl">
        {/* Subtle decorative background gradient */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Top: Logo & Sri Lanka Time pill */}
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 w-10 shrink-0 shadow-sm" />
            <span className="text-xl font-bold tracking-tight text-white">
              ReserveHub
            </span>
          </div>

          <div className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-emerald-700/50 bg-[#072c27] px-3.5 py-1 text-xs font-medium text-emerald-200">
            <Clock className="h-3.5 w-3.5" />
            <span>Sri Lanka time — Asia/Colombo</span>
          </div>
        </div>

        {/* Middle: Headline, Subtitle, Metric Chips */}
        <div className="my-12">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
            Book rooms &amp; gear without the double-booking chaos.
          </h1>
          <p className="mt-5 max-w-md text-sm sm:text-base leading-relaxed text-emerald-100/80">
            Live daily schedules, overlap protection, back-to-back friendly slots, and a full audit trail for every reservation.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-3.5 py-2 text-xs font-medium text-emerald-100">
              2,400+ bookings / mo
            </div>
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-3.5 py-2 text-xs font-medium text-emerald-100">
              Zero double-books
            </div>
            <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-3.5 py-2 text-xs font-medium text-emerald-100">
              Colombo · Kandy · Galle
            </div>
          </div>
        </div>

        {/* Bottom: Note */}
        <div className="text-xs text-emerald-200/60">
          Member + Administrator access · Records survive restarts
        </div>
      </section>

      {/* Right Column: Warm Cream Background with Login Form Card */}
      <section className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="absolute right-6 top-6">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Sign in to open your resource dashboard.
            </p>
          </div>

          <div className="rounded-3xl border border-[#e5e3da] bg-white p-7 sm:p-9 shadow-sm transition dark:border-[#183e37] dark:bg-[#0a2520]">
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Protected by server-side role checks · Keyboard: Tab to move, Enter to sign in
          </p>
        </div>
      </section>
    </main>
  );
}
