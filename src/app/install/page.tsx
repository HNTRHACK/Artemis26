"use client";

import { Apple, Monitor, Smartphone, WifiOff } from "lucide-react";
import { InstallPrompt } from "@/components/InstallPrompt";
import { useT } from "@/lib/i18n";

export default function InstallPage() {
  const t = useT();
  const platforms = [
    { title: t.install.android, steps: t.install.androidSteps, icon: Smartphone },
    { title: t.install.ios, steps: t.install.iosSteps, icon: Apple },
    { title: t.install.desktop, steps: t.install.desktopSteps, icon: Monitor },
  ];
  return (
    <div className="mx-auto max-w-4xl">
      <header className="border-b-2 border-ink pb-8">
        <p className="kicker text-muted">PWA · {t.brand.name}</p>
        <h1 className="display mt-3 text-5xl sm:text-6xl">{t.install.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{t.install.intro}</p>
      </header>

      <InstallPrompt className="mt-8" />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {platforms.map(({ title, steps, icon: Icon }) => (
          <section key={title} className="flex flex-col gap-4 rounded-3xl border-2 border-ivory-3 bg-white/55 p-5">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Icon size={22} aria-hidden /> {title}
            </h2>
            <ol className="flex flex-col gap-3">
              {steps.map((s, i) => (
                <li key={i} className="grid grid-cols-[2rem_1fr] gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-ink text-sm font-semibold text-ivory">{i + 1}</span>
                  <span className="pt-1">{s}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-3xl bg-ivory-2 p-5 text-base">
        <p className="flex gap-2">
          <WifiOff size={20} className="mt-0.5 shrink-0" aria-hidden /> {t.install.offline}
        </p>
        <p className="text-sm text-muted">{t.install.https}</p>
      </div>
    </div>
  );
}
