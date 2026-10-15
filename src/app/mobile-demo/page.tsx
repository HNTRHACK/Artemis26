"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, AudioLines, Handshake, IndianRupee, Languages, Maximize2, RotateCcw, Smartphone } from "lucide-react";
import { LangSwitcher } from "@/components/LangSwitcher";
import { Lines } from "@/components/marketing/motion";
import { Wordmark } from "@/components/Wordmark";
import { useLang, useT } from "@/lib/i18n";
import { STORAGE_KEY } from "@/lib/store";

const PHONE_W = 390;
const PHONE_H = 844;
const BEZEL = 14;
const START = "/choose-role";

/** Presentation page: editorial story on the left, the live app in a phone on the right. */
export default function MobileDemoPage() {
  const t = useT();
  const lang = useLang();
  const deva = lang !== "en";
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.8);

  // Fit the full 390×844 phone in the viewport height without shrinking its layout width.
  useEffect(() => {
    const fit = () => setScale(Math.min(1, Math.max(0.55, (window.innerHeight - 140) / (PHONE_H + BEZEL * 2))));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  function reset() {
    if (!window.confirm(t.mobileDemo.resetConfirm)) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    // The phone reseeds fresh demo data on load; this page picks it up via the storage event.
    if (frameRef.current?.contentWindow) frameRef.current.contentWindow.location.href = START;
  }

  function fullscreen() {
    const el = frameRef.current;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => window.open(START, "_blank"));
    else window.open(START, "_blank");
  }

  const features = [Languages, AudioLines, Handshake, IndianRupee, Smartphone];

  return (
    <div className="grain min-h-dvh overflow-x-clip bg-ink text-ivory">
      <header className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label={t.mobileDemo.home}>
          <Wordmark className="text-2xl" />
        </Link>
        <LangSwitcher tone="dark" />
      </header>

      <main className="grid items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-10">
        {/* ---------- story ---------- */}
        <section className="lg:col-span-6 xl:col-span-7">
          <p className="kicker text-mist">(06) — {t.mobileDemo.kicker}</p>
          <Lines
            as="h1"
            lines={t.mobileDemo.title}
            upper={!deva}
            className={`fade-up mt-6 ${deva ? "text-[clamp(2.6rem,6vw,6rem)]" : "text-[clamp(3rem,7.4vw,8.5rem)]"}`}
            lineClassName={(i) => (i === 1 ? "pl-[6vw]" : "")}
          />
          <p className="mt-8 max-w-md text-2xl text-ivory/85">{t.mobileDemo.sub}</p>

          <ol className="mt-10 max-w-lg border-t border-ivory/15">
            {t.mobileDemo.features.map((f, i) => {
              const Icon = features[i];
              return (
                <li key={f} className="flex items-center gap-4 border-b border-ivory/15 py-4">
                  <span className="font-mono text-sm text-mist tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <Icon size={22} className="text-marigold" aria-hidden />
                  <span className="text-xl font-medium">{f}</span>
                </li>
              );
            })}
          </ol>

          {/* phones and tablets: open the real app instead of a phone-in-a-phone */}
          <div className="mt-10 flex flex-col gap-3 lg:hidden">
            <p className="text-mist">{t.mobileDemo.mobileNote}</p>
            <Link
              href={START}
              className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-marigold px-8 text-lg font-semibold text-ink"
            >
              {t.mobileDemo.openApp} <ArrowUpRight aria-hidden />
            </Link>
            <Link href="/install" className="inline-flex min-h-12 items-center justify-center gap-2 font-semibold text-ivory/80 underline-offset-4 hover:underline">
              <Smartphone size={16} aria-hidden /> {t.access.install}
            </Link>
          </div>
        </section>

        {/* ---------- live phone (desktop) ---------- */}
        <section aria-label={t.mobileDemo.kicker} className="hidden flex-col items-center gap-5 lg:col-span-6 lg:flex xl:col-span-5">
          <div
            className="relative"
            style={{ width: (PHONE_W + BEZEL * 2) * scale, height: (PHONE_H + BEZEL * 2) * scale }}
          >
            <div
              className="absolute top-0 left-0 origin-top-left rounded-[3.4rem] border border-ivory/25 bg-ink-3 shadow-[0_60px_160px_-40px_rgba(224,163,58,0.45)]"
              style={{ width: PHONE_W + BEZEL * 2, height: PHONE_H + BEZEL * 2, padding: BEZEL, transform: `scale(${scale})` }}
            >
              <div aria-hidden className="absolute top-[26px] left-1/2 z-10 h-[30px] w-[110px] -translate-x-1/2 rounded-full bg-ink" />
              <iframe
                ref={frameRef}
                src={START}
                title={`${t.brand.name} — ${t.mobileDemo.kicker}`}
                width={PHONE_W}
                height={PHONE_H}
                allow="clipboard-write; web-share; fullscreen"
                allowFullScreen
                className="block rounded-[2.6rem] bg-ink"
                data-mobile-demo-frame
              />
            </div>
          </div>
          <p className="max-w-sm text-center text-sm text-mist">{t.mobileDemo.live}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ivory/30 px-5 font-semibold hover:border-ivory">
              <RotateCcw size={16} aria-hidden /> {t.mobileDemo.reset}
            </button>
            <button type="button" onClick={fullscreen} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ivory px-5 font-semibold text-ink hover:bg-marigold">
              <Maximize2 size={16} aria-hidden /> {t.mobileDemo.fullscreen}
            </button>
          </div>
        </section>
      </main>

      <footer className="px-4 pb-10 text-xs text-mist sm:px-6 lg:px-10">{t.brand.disclaimer}</footer>
    </div>
  );
}
