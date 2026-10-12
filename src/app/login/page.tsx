import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-wide text-indigo-600">
            RESERVEHUB
          </p>
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-slate-600">
            Sign in to find resources and manage your reservations.
          </p>
        </div>

        <LoginForm />
      </section>
    </main>
  );
}
