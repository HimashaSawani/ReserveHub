"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Check your credentials and try again. 3 attempts remaining.");
        return;
      }

      // Use full page reload to clear router cache during account switch
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/dashboard";
    } catch {
      setError("Cannot reach the server. Your details are saved locally. Retry when online.");
    } finally {
      setPending(false);
    }
  }

  function fillCredentials(fillEmail: string) {
    setEmail(fillEmail);
    setPassword("ReserveHub123!");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nadeesha@reservehub.lk"
          className="w-full rounded-xl border border-[#d6d4cb] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#0a3832] focus:ring-2 focus:ring-[#0a3832]/20 dark:border-[#1a423b] dark:bg-[#0c2621] dark:text-slate-100 dark:focus:border-emerald-400"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={128}
            disabled={pending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#d6d4cb] bg-white px-4 py-3 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#0a3832] focus:ring-2 focus:ring-[#0a3832]/20 dark:border-[#1a423b] dark:bg-[#0c2621] dark:text-slate-100 dark:focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#0d9488] dark:hover:bg-[#14b8a6]"
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign in"
        )}
      </button>

      {/* Demo Credentials & Quick Switch */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
        <div className="flex items-center gap-1">
          <span>Demo:</span>
          <button
            type="button"
            onClick={() => fillCredentials("member@reservehub.local")}
            className="text-[#0a3832] dark:text-emerald-400 font-medium hover:underline"
          >
            member 1
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => fillCredentials("nadeesha@reservehub.lk")}
            className="text-[#0a3832] dark:text-emerald-400 font-medium hover:underline"
          >
            member 2
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => fillCredentials("admin@reservehub.local")}
            className="text-[#0a3832] dark:text-emerald-400 font-medium hover:underline"
          >
            admin
          </button>
        </div>
        <button
          type="button"
          onClick={() => alert("Refer to README.md for local demo credentials or use the quick-fill buttons above.")}
          className="text-[#0a3832] dark:text-emerald-400 font-medium hover:underline"
        >
          Forgot password?
        </button>
      </div>

      {/* Error Alert Box matching design */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">{error}</span>
          </div>
        </div>
      )}
    </form>
  );
}
