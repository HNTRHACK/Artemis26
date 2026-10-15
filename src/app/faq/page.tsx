"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cx } from "@/components/ui";
import { VoiceGuide } from "@/components/VoiceGuide";
import { useLang, useT } from "@/lib/i18n";
import { FAQ_ITEMS, FAQ_TEXT, type FaqCat } from "@/lib/i18n/faq";

const CATS: FaqCat[] = ["start", "work", "safety", "employers", "mobile"];

/** Case- and accent-insensitive match that also works for Devanagari. */
const norm = (s: string) => s.toLocaleLowerCase().normalize("NFC");

export default function FaqPage() {
  const t = useT();
  const lang = useLang();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<FaqCat | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();

  const items = useMemo(() => {
    const q = norm(query.trim());
    return FAQ_ITEMS.filter((it) => cat === "all" || it.cat === cat).filter((it) => {
      if (!q) return true;
      const { q: question, a } = FAQ_TEXT[lang][it.id];
      return norm(question).includes(q) || norm(a).includes(q);
    });
  }, [query, cat, lang]);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="grid gap-6 border-b-2 border-ink pb-8 lg:grid-cols-12">
        <p className="kicker text-muted lg:col-span-3">(?) — {t.brand.name}</p>
        <div className="lg:col-span-9">
          <h1 className="display text-5xl sm:text-7xl">{t.faqUi.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-muted">{t.faqUi.intro}</p>
        </div>
      </header>

      <VoiceGuide guide="faq-help" className="mt-6" />

      <div className="mt-8 flex flex-col gap-4">
        <label className="relative block">
          <span className="sr-only">{t.faqUi.search}</span>
          <Search size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.faqUi.search}
            className="min-h-14 w-full rounded-full border-2 border-ivory-3 bg-white/70 pr-5 pl-12 text-lg focus:border-ink focus:outline-none"
          />
        </label>
        <div role="radiogroup" aria-label={t.faqUi.title} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {(["all", ...CATS] as const).map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={cat === c}
              onClick={() => setCat(c)}
              className={cx(
                "min-h-12 shrink-0 rounded-full border-2 px-5 font-semibold whitespace-nowrap transition-colors",
                cat === c ? "border-ink bg-ink text-ivory" : "border-ivory-3 bg-white/60 hover:border-ink",
              )}
            >
              {c === "all" ? t.faqUi.all : t.faqUi.categories[c]}
            </button>
          ))}
        </div>
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          {t.faqUi.results(items.length)}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 font-serif text-3xl">{t.faqUi.noResults}</p>
      ) : (
        <div className="mt-4 flex flex-col">
          {CATS.filter((c) => items.some((it) => it.cat === c)).map((c) => (
            <section key={c} aria-labelledby={`${baseId}-${c}`} className="mt-8">
              <h2 id={`${baseId}-${c}`} className="kicker mb-2 text-muted">
                {t.faqUi.categories[c]}
              </h2>
              <ul className="border-t-2 border-ink">
                {items
                  .filter((it) => it.cat === c)
                  .map((it) => {
                    const text = FAQ_TEXT[lang][it.id];
                    const isOpen = open === it.id;
                    const panelId = `${baseId}-p-${it.id}`;
                    const btnId = `${baseId}-b-${it.id}`;
                    return (
                      <li key={it.id} className="border-b border-ink/20" data-faq={it.id}>
                        <h3>
                          <button
                            id={btnId}
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            onClick={() => setOpen(isOpen ? null : it.id)}
                            className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-left text-xl font-semibold sm:text-2xl"
                          >
                            {text.q}
                            <ChevronDown size={24} aria-hidden className={cx("shrink-0 transition-transform duration-300", isOpen && "rotate-180")} />
                          </button>
                        </h3>
                        <div id={panelId} role="region" aria-labelledby={btnId} hidden={!isOpen} className="pb-6">
                          <p className="max-w-2xl text-lg leading-relaxed">{text.a}</p>
                          <VoiceGuide guide={"audio" in it ? it.audio : undefined} text={text.a} className="mt-4" />
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-12 rounded-2xl bg-ivory-2 p-4 text-sm text-muted">{t.brand.disclaimer}</p>
    </div>
  );
}
