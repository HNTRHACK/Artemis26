"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeftRight, Briefcase, CirclePlus, ClipboardList, House, LayoutList, RotateCcw, UserRound, Users, WifiOff } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";
import { LangSwitcher } from "./LangSwitcher";
import { Wordmark } from "./Wordmark";
import { cx } from "./ui";

function useNav(role: Role) {
  const t = useT();
  return role === "worker"
    ? [
        { href: "/worker", label: t.workerNav.home, icon: House },
        { href: "/worker/jobs", label: t.workerNav.jobs, icon: Briefcase },
        { href: "/worker/applications", label: t.workerNav.applications, icon: ClipboardList },
        { href: "/worker/profile", label: t.workerNav.profile, icon: UserRound },
      ]
    : [
        { href: "/employer", label: t.employerNav.listings, icon: LayoutList },
        { href: "/employer/post", label: t.employerNav.post, icon: CirclePlus },
        { href: "/employer/workers", label: t.employerNav.workers, icon: Users },
      ];
}

function isActive(pathname: string, href: string) {
  if (href === "/employer") return pathname === "/employer" || pathname.startsWith("/employer/jobs");
  if (href === "/worker") return pathname === "/worker";
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory-3 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden print:hidden"
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
                <span className={cx("grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-ink text-ivory")}>
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

const subscribeOnline = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

function OfflineBanner() {
  const t = useT();
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <p role="status" className="flex items-center justify-center gap-2 bg-marigold px-4 py-2 text-center text-sm font-semibold text-ink">
      <WifiOff size={16} aria-hidden /> {t.ui.offline}
    </p>
  );
}

export function AppShell({ role, children }: { role?: Role; children: ReactNode }) {
  const t = useT();
  const hydrated = useApp((s) => s.hydrated);
  const storedRole = useApp((s) => s.role);
  const setRole = useApp((s) => s.setRole);
  const resetDemo = useApp((s) => s.resetDemo);

  // Entering a role's screens selects that demo role (persisted for the next visit).
  useEffect(() => {
    if (hydrated && role && storedRole !== role) setRole(role);
  }, [hydrated, role, storedRole, setRole]);

  const shownRole = role ?? storedRole;

  return (
    <div className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <p className="bg-ink px-4 py-2 text-center text-xs text-ivory/80 sm:text-sm print:hidden">{t.common.demoBanner}</p>
      <header className="sticky top-0 z-30 border-b border-ivory-3 bg-ivory/90 pt-[env(safe-area-inset-top)] backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link href="/" className="text-2xl leading-none" aria-label={`${t.brand.name} — ${t.common.home}`}>
              <Wordmark accent="text-[#b5721a]" />
            </Link>
            {shownRole && (
              <span className="hidden rounded-full border border-ink/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase sm:inline">
                {shownRole === "worker" ? t.common.worker : t.common.employer}
              </span>
            )}
          </div>
          {role && (
            <Suspense fallback={null}>
              <DesktopNav role={role} />
            </Suspense>
          )}
          <div className="flex items-center gap-2">
            <Link
              href="/choose-role"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-ink/20 px-3 text-sm font-semibold hover:bg-ivory-2"
              aria-label={t.access.switchRole}
              title={t.access.switchRole}
            >
              <ArrowLeftRight size={16} aria-hidden />
              <span className="hidden lg:inline">{t.access.switchRole}</span>
            </Link>
            <LangSwitcher />
          </div>
        </div>
      </header>

      <main className={cx("mx-auto w-full max-w-6xl flex-1 px-4 pt-8 sm:px-6 md:pb-16 print:p-0", role ? "pb-32" : "pb-16")}>
        {hydrated ? <div className="screen-in">{children}</div> : <PageLoading />}
      </main>

      <footer
        className={cx(
          "mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-ivory-3 px-4 py-6 text-sm text-muted sm:px-6 md:mb-0 print:hidden",
          role && "mb-24",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Link href="/choose-role" className="min-h-11 rounded-full border border-ink/20 px-4 py-2.5 font-semibold text-ink hover:bg-ivory-2">
              <ArrowLeftRight size={14} className="mr-1.5 inline" aria-hidden />
              {t.access.switchRole}
            </Link>
            <Link href="/faq" className="min-h-11 rounded-full px-4 py-2.5 font-semibold text-ink hover:bg-ivory-2">
              {t.workerHome.quick.faq}
            </Link>
            <Link href="/install" className="min-h-11 rounded-full px-4 py-2.5 font-semibold text-ink hover:bg-ivory-2">
              {t.workerHome.quick.install}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(t.common.resetConfirm)) resetDemo();
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2.5 hover:bg-ivory-2"
          >
            <RotateCcw size={16} aria-hidden /> {t.common.resetDemo}
          </button>
        </div>
        <p className="text-xs">{t.brand.disclaimer}</p>
      </footer>

      {role && (
        <Suspense fallback={null}>
          <BottomNav role={role} />
        </Suspense>
      )}
    </div>
  );
}
