"use client";

import { LANG_SHORT, LANGS, DICTS, useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { cx } from "./ui";

/** Segmented EN / हिं / मरा control. `tone` picks the colours for dark or light surfaces. */
export function LangSwitcher({ tone = "light", full = false }: { tone?: "light" | "dark"; full?: boolean }) {
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  const t = useT();
  return (
    <div
      role="radiogroup"
      aria-label={t.common.language}
      className={cx(
        "inline-flex items-center rounded-full border p-1",
        tone === "dark" ? "border-ivory/25" : "border-ink/20 bg-white/50",
      )}
    >
      {LANGS.map((l) => {
        const active = l === lang;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            lang={l}
            aria-label={DICTS[l].langName}
            onClick={() => setLang(l)}
            data-cursor="hover"
            className={cx(
              "min-h-10 min-w-11 rounded-full px-3 text-sm font-semibold transition-colors duration-300",
              active
                ? tone === "dark"
                  ? "bg-ivory text-ink"
                  : "bg-ink text-ivory"
                : tone === "dark"
                  ? "text-ivory/75 hover:text-ivory"
                  : "text-ink/70 hover:text-ink",
            )}
          >
            {full ? DICTS[l].langName : LANG_SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
