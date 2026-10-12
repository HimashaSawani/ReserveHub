"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      id="sign-out-btn"
      type="button"
      onClick={async () => {
        await signOut({ callbackUrl: "/login" });
      }}
      className="rounded-lg border border-emerald-700/70 bg-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-100 transition hover:bg-emerald-900/40 hover:text-white cursor-pointer"
    >
      Sign out
    </button>
  );
}
