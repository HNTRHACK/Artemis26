"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, HardHat, Smartphone } from "lucide-react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { VoiceGuide } from "@/components/VoiceGuide";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import type { Role } from "@/lib/types";

/** One-tap demo entry. This chooses a demo role — it is not a login. */
export default function ChooseRole() {
  const t = useT();
  const router = useRouter();
  const hydrated = useApp((s) => s.hydrated);
  const me = useApp((s) => s.myProfile);
  const employer = useApp((s) => s.employer);
  const setRole = useApp((s) => s.setRole);

  function enter(role: Role) {
    setRole(role);
    if (role === "worker") router.push(me ? "/worker" : "/worker/onboarding");
    else router.push("/employer");
  }

  const options = [
    {
      role: "worker" as const,
      label: t.access.work,
      hint: hydrated && me ? t.access.continueAs(me.name) : t.access.workHint,
      icon: HardHat,
      className: "bg-marigold text-ink hover:brightness-105",
    },
    {
      role: "employer" as const,
      label: t.access.hire,
      hint: hydrated && employer ? t.access.continueAs(employer.organisation || employer.name) : t.access.hireHint,
      icon: Briefcase,
      className: "bg-ivory text-ink hover:bg-white",
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-ink px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ivory sm:px-8">
      <header className="flex items-center justify-between gap-3 py-2">
        <Link href="/" className="font-serif text-2xl tracking-tight">
          {t.brand.name}
        </Link>
        <LangSwitcher tone="dark" />
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-8">
        <p className="kicker text-mist">{t.brand.tagline}</p>
        <h1 className="display mt-3 text-[clamp(2.75rem,12vw,5rem)]">
          {/* Brand position differs by language ("Welcome to UMANG" / "UMANG में आपका स्वागत है") */}
          {t.access.welcome.split(t.brand.name)[0]}
          <span className="serif-i text-marigold">{t.brand.name}</span>
          {t.access.welcome.split(t.brand.name)[1]}
        </h1>
        <p className="mt-4 text-lg text-ivory/80">{t.access.sub}</p>

        <div className="mt-8 flex flex-col gap-4">
          {options.map(({ role, label, hint, icon: Icon, className }) => (
            <button
              key={role}
              type="button"
              onClick={() => enter(role)}
              data-role={role}
              className={`group flex min-h-24 items-center gap-4 rounded-3xl px-6 py-5 text-left transition-[filter,background-color,transform] active:scale-[0.99] ${className}`}
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-ink text-ivory">
                <Icon size={28} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-2xl leading-tight font-semibold uppercase sm:text-3xl">{label}</span>
                <span className="mt-1 block text-base text-ink/75">{hint}</span>
              </span>
              <ArrowRight className="shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
            </button>
          ))}
        </div>

        <VoiceGuide guide="welcome" tone="dark" className="mt-6" />

        <p className="mt-6 rounded-2xl border border-ivory/15 p-4 text-sm text-ivory/75">{t.access.demoNote}</p>
      </main>

      <footer className="mx-auto flex w-full max-w-xl flex-col gap-3 text-sm text-mist">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/" className="underline-offset-4 hover:text-ivory hover:underline">
            {t.access.story}
          </Link>
          <Link href="/install" className="inline-flex items-center gap-1 underline-offset-4 hover:text-ivory hover:underline">
            <Smartphone size={14} aria-hidden /> {t.access.install}
          </Link>
          <Link href="/faq" className="underline-offset-4 hover:text-ivory hover:underline">
            {t.workerHome.quick.faq}
          </Link>
        </div>
        <p className="text-xs">{t.brand.disclaimer}</p>
      </footer>
    </div>
  );
}
