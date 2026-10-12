import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import SignOutButton from "@/components/sign-out-button";

interface NavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    role: "ADMIN" | "MEMBER";
  };
  currentPath: "dashboard" | "reservations" | "admin" | "resources";
}

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Navbar({ user, currentPath }: NavbarProps) {
  const initials = getInitials(user.name);
  const roleLabel = user.role === "ADMIN" ? "Administrator" : "Member";

  return (
    <header className="sticky top-0 z-40 bg-[#0a3832] text-white shadow-md transition-colors dark:bg-[#07241f] border-b border-[#0d463e] dark:border-[#0f342e]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand Logo & Title */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 font-black text-slate-950 text-xl shadow-sm transition group-hover:scale-105">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white leading-tight">
              ReserveHub
            </span>
            <span className="text-[11px] font-normal text-emerald-200/70 leading-none mt-0.5">
              Sri Lanka time — Asia/Colombo
            </span>
          </div>
        </Link>

        {/* Center: Navigation Tabs */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className={
              currentPath === "dashboard" || currentPath === "resources"
                ? "rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#0a3832] shadow-sm transition"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-emerald-100/80 transition hover:bg-emerald-900/50 hover:text-white"
            }
          >
            Resources
          </Link>
          <Link
            href="/reservations"
            className={
              currentPath === "reservations"
                ? "rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#0a3832] shadow-sm transition"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-emerald-100/80 transition hover:bg-emerald-900/50 hover:text-white"
            }
          >
            My reservations
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin/resources"
              className={
                currentPath === "admin"
                  ? "rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#0a3832] shadow-sm transition"
                  : "rounded-full px-4 py-1.5 text-sm font-medium text-emerald-100/80 transition hover:bg-emerald-900/50 hover:text-white"
              }
            >
              Manage resources
            </Link>
          )}
        </nav>

        {/* Right: User Profile, Theme Toggle & Sign Out */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-sm font-semibold text-white">
              {user.name || "Nadeesha Perera"}
            </span>
            <span className="text-[11px] text-emerald-200/70">
              {roleLabel}
            </span>
          </div>

          <div
            title={user.name || "User"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fae8b2] text-[#854d0e] font-bold text-xs border border-amber-300 shadow-inner"
          >
            {initials}
          </div>

          <ThemeToggle />

          <SignOutButton />
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="flex md:hidden border-t border-emerald-900/40 px-4 py-2 gap-2 overflow-x-auto">
        <Link
          href="/dashboard"
          className={
            currentPath === "dashboard" || currentPath === "resources"
              ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a3832]"
              : "rounded-full px-3 py-1 text-xs text-emerald-100/80 hover:text-white"
          }
        >
          Resources
        </Link>
        <Link
          href="/reservations"
          className={
            currentPath === "reservations"
              ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a3832]"
              : "rounded-full px-3 py-1 text-xs text-emerald-100/80 hover:text-white"
          }
        >
          My reservations
        </Link>
        {user.role === "ADMIN" && (
          <Link
            href="/admin/resources"
            className={
              currentPath === "admin"
                ? "rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0a3832]"
                : "rounded-full px-3 py-1 text-xs text-emerald-100/80 hover:text-white"
            }
          >
            Manage resources
          </Link>
        )}
      </div>
    </header>
  );
}
