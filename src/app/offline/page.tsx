"use client";

import Link from "next/link";
import { WifiOff } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { useT } from "@/lib/i18n";

/** Served by the service worker when a page is requested offline and isn't cached. */
export default function OfflinePage() {
  const t = useT();
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-6 bg-ink px-6 text-ivory">
      <Wordmark className="text-3xl" />
      <WifiOff size={40} className="text-marigold" aria-hidden />
      <h1 className="display text-5xl">{t.offline.title}</h1>
      <p className="max-w-md text-lg text-ivory/80">{t.offline.body}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-14 rounded-full bg-marigold px-6 text-lg font-semibold text-ink"
        >
          {t.offline.retry}
        </button>
        <Link href="/choose-role" className="inline-flex min-h-14 items-center rounded-full border border-ivory/40 px-6 font-semibold">
          {t.brand.name}
        </Link>
      </div>
    </main>
  );
}
