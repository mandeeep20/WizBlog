import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import {
  Flame,
  LogOut,
  LogIn,
  Newspaper,
  PenSquare,
  PanelsTopLeft,
  UserCircle2,
  UserPlus,
} from "lucide-react";

import { signOutAction } from "@/app/auth/actions";
import { getCurrentProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: ReactNode;
  activePath?: string;
};

type NavItem = {
  href: string;
  label: string;
  matchPrefix: string;
  icon: ComponentType<{ className?: string }>;
};

/* ------------------------- NAVIGATION CONFIG ------------------------- */

const baseNavItems: NavItem[] = [
  {
    href: "/feed",
    label: "Feed",
    matchPrefix: "/feed",
    icon: Newspaper,
  },
  {
    href: "/post/new",
    label: "Write",
    matchPrefix: "/post",
    icon: PenSquare,
  },
];

const guestNavItems: NavItem[] = [
  {
    href: "/login",
    label: "Login",
    matchPrefix: "/login",
    icon: LogIn,
  },
  {
    href: "/register",
    label: "Register",
    matchPrefix: "/register",
    icon: UserPlus,
  },
];

function buildNavItems(username: string | null): NavItem[] {
  if (!username) {
    return [...baseNavItems, ...guestNavItems];
  }

  return [
    ...baseNavItems,
    {
      href: "/studio",
      label: "Studio",
      matchPrefix: "/studio",
      icon: PanelsTopLeft,
    },
    {
      href: `/profile/${encodeURIComponent(username)}`,
      label: "Profile",
      matchPrefix: "/profile",
      icon: UserCircle2,
    },
  ];
}

function isActivePath(
  activePath: string | undefined,
  matchPrefix: string
): boolean {
  if (!activePath) return false;

  return (
    activePath === matchPrefix ||
    activePath.startsWith(`${matchPrefix}/`)
  );
}

/* ------------------------------ COMPONENT ------------------------------ */

export async function AppShell({
  children,
  activePath,
}: AppShellProps) {
  const currentProfile = await getCurrentProfile().catch(() => null);

  const username = currentProfile?.username ?? null;
  const navItems = buildNavItems(username);

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">

      {/* Background Layer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 10%, rgba(249,115,22,0.15), transparent 30%),
            radial-gradient(circle at 90% 5%, rgba(234,88,12,0.15), transparent 35%),
            linear-gradient(to bottom, rgba(255,247,237,0.95), rgba(254,243,199,0.9))
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-orange-200/60 bg-white/90 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">

          {/* 🔥 Logo */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md shadow-orange-500/30 transition group-hover:scale-105">
              <Flame className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-900 transition group-hover:text-orange-600">
              WizBlog
            </span>
          </Link>

          <div className="flex items-center gap-3">

            {/* Navigation */}
            <nav className="flex items-center gap-1 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const active = isActivePath(activePath, item.matchPrefix);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-medium transition",
                      active
                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                        : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logged-in Profile Section */}
            {currentProfile && (
              <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-2 py-1 shadow-sm">
                <Link
                  href={`/profile/${encodeURIComponent(
                    currentProfile.username
                  )}`}
                  className="max-w-28 truncate rounded-lg px-2 py-1 text-sm font-semibold text-slate-700 hover:bg-orange-50 sm:max-w-36"
                >
                  {currentProfile.fullName}
                </Link>

                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}