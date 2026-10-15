"use client";

import { useApp } from "../store";
import type { Lang, Localized } from "../types";
import { en } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";

export const DICTS = { en, hi, mr } as const;
export const LANGS: Lang[] = ["en", "hi", "mr"];
/** Short labels for compact language switchers. */
export const LANG_SHORT: Record<Lang, string> = { en: "EN", hi: "हिं", mr: "मरा" };

export function useT() {
  return DICTS[useApp((s) => s.lang)];
}

export function useLang() {
  return useApp((s) => s.lang);
}

export function tx(value: Localized, lang: Lang): string {
  return typeof value === "string" ? value : value[lang] || value.en;
}

const LOCALE: Record<Lang, string> = { en: "en-IN", hi: "hi-IN-u-nu-latn", mr: "mr-IN-u-nu-latn" };

export function formatDate(value: string | number, lang: Lang) {
  const d = typeof value === "number" ? new Date(value) : new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short" });
}
