"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { Briefcase, CirclePlus, ClipboardList, LayoutList, RotateCcw, Scale, UserRound, Users } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { LangSwitcher } from "./LangSwitcher";
import { cx } from "./ui";

type Role = "worker" | "employer";

function useNav(role: Role) {
  const t = useT();
  return role === "worker"
    ? [
        { href: "/worker/jobs", label: t.workerNav.jobs, icon: Briefcase },
        { href: "/worker/applications", label: t.workerNav.applications, icon: ClipboardList },
        { href: "/worker/profile", label: t.workerNav.profile, icon: UserRound },
        { href: "/worker/rights", label: t.workerNav.rights, icon: Scale },
      ]
    : [
        { href: "/employer", label: t.employerNav.listings, icon: LayoutList },
        { href: "/employer/post", label: t.employerNav.post, icon: CirclePlus },
        { href: "/employer/workers", label: t.employerNav.workers, icon: Users },
      ];
}

function isActive(pathname: string, href: string) {
  if (href === "/employer") return pathname === "/employer" || pathname.startsWith("/employer/jobs");
  return pathname === href || pathname.startsWith(href + "/");
}

function DesktopNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const nav = useNav(role);
  if (pathname.startsWith("/worker/onboarding")) return null;
  return (
    <nav aria-label={role} className="hidden items-center gap-1 md:flex">
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(pathname, href) ? "page" : undefined}
          className={cx(
            "rounded-full px-4 py-2 text-base font-medium transition-colors",
            isActive(pathname, href) ? "bg-ink text-ivory" : "hover:bg-ivory-2",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const nav = useNav(role);
  if (pathname.startsWith("/worker/onboarding")) return null;
  return (
    <nav
      aria-label={role}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory-3 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-semibold leading-tight",
                  active ? "text-ink" : "text-muted",
                )}
              >
                <span className={cx("grid h-8 w-14 place-items-center rounded-full", active && "bg-ink text-ivory")}>
                  <Icon size={20} aria-hidden />
                </span>
                <span className="max-w-full truncate text-center">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PageLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" aria-busy="true">
      <div className="size-10 animate-spin rounded-full border-4 border-ivory-3 border-t-ink" />
    </div>
  );
}

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const t = useT();
  const hydrated = useApp((s) => s.hydrated);
  const resetDemo = useApp((s) => s.resetDemo);

  return (
    <div className="flex min-h-dvh flex-col">
      <p className="bg-ink px-4 py-2 text-center text-xs text-ivory/80 sm:text-sm">{t.common.demoBanner}</p>
      <header className="sticky top-0 z-30 border-b border-ivory-3 bg-ivory/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-serif text-2xl leading-none tracking-tight" aria-label={t.common.home}>
              {t.common.appName}
            </Link>
            <span className="hidden rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase sm:inline">
              {role === "worker" ? t.common.worker : t.common.employer}
            </span>
          </div>
          <Suspense fallback={null}>
            <DesktopNav role={role} />
          </Suspense>
          <div className="flex items-center gap-2">
            <LangSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-8 pb-32 sm:px-6 md:pb-16">
        {hydrated ? <div className="fade-up">{children}</div> : <PageLoading />}
      </main>

      <footer className="mx-auto mb-24 flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-ivory-3 px-4 py-6 text-sm text-muted sm:px-6 md:mb-0">
        <Link
          href={role === "worker" ? "/employer" : "/worker"}
          className="min-h-11 rounded-full border border-ink/20 px-4 py-2.5 font-semibold text-ink hover:bg-ivory-2"
        >
          {role === "worker" ? t.common.switchToEmployer : t.common.switchToWorker} →
        </Link>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(t.common.resetConfirm)) resetDemo();
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 hover:bg-ivory-2"
        >
          <RotateCcw size={16} aria-hidden /> {t.common.resetDemo}
        </button>
      </footer>

      <Suspense fallback={null}>
        <BottomNav role={role} />
      </Suspense>
    </div>
  );
}
