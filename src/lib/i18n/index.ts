"use client";

import { useApp } from "../store";
import type { Lang, Localized } from "../types";
import { en } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";
import { en2 } from "./umang/en";
import { hi2 } from "./umang/hi";
import { mr2 } from "./umang/mr";

export const DICTS = {
  en: { ...en, ...en2 },
  hi: { ...hi, ...hi2 },
  mr: { ...mr, ...mr2 },
} as const;
export type FullDict = (typeof DICTS)["en"];
export const LANGS: Lang[] = ["en", "hi", "mr"];
/** Short labels for compact language switchers. */
export const LANG_SHORT: Record<Lang, string> = { en: "EN", hi: "हिं", mr: "मरा" };
/** BCP-47 tags for speech synthesis. */
export const SPEECH_LANG: Record<Lang, string> = { en: "en-IN", hi: "hi-IN", mr: "mr-IN" };

export function useT(): FullDict {
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

export function formatDateLong(value: string | number, lang: Lang) {
  const d = typeof value === "number" ? new Date(value) : new Date(`${value}T00:00:00`);
  return d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateTime(ms: number, lang: Lang) {
  return new Date(ms).toLocaleString(LOCALE[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
