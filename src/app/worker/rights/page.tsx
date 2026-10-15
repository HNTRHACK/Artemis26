"use client";

import { Phone } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { useT } from "@/lib/i18n";

export default function RightsPage() {
  const t = useT();
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title={t.rights.title} sub={t.rights.intro} />

      <section aria-labelledby="helplines" className="mb-10 rounded-3xl bg-ink p-6 text-ivory">
        <h2 id="helplines" className="kicker text-mist">
          {t.rights.helplines}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {t.rights.helplineList.map((h) => (
            <li key={h.n}>
              <a
                href={`tel:${h.n}`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-ivory/20 p-4 hover:bg-ivory hover:text-ink"
              >
                <Phone size={20} aria-hidden />
                <span>
                  <span className="block text-2xl font-semibold tabular-nums">{h.n}</span>
                  <span className="block text-sm opacity-80">{h.l}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <ol className="flex flex-col divide-y-2 divide-ivory-3 border-y-2 border-ivory-3">
        {t.rights.sections.map((s, i) => (
          <li key={s.t} className="grid gap-2 py-6 sm:grid-cols-[4rem_1fr]">
            <span className="font-serif text-3xl text-muted tabular-nums" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2 className="text-2xl font-semibold">{s.t}</h2>
              <p className="mt-2 text-lg leading-relaxed">{s.b}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-8 rounded-2xl bg-ivory-2 p-4 text-sm text-muted">{t.rights.disclaimer}</p>
    </div>
  );
}
