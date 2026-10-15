"use client";

import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { ArrowDownRight, ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DICTS, useLang, useT } from "@/lib/i18n";
import { TRADES } from "@/lib/types";
import { LangSwitcher } from "../LangSwitcher";
import { cx } from "../ui";
import { Wordmark } from "../Wordmark";
import { Cursor, Lines, Magnetic, SectionIndicator } from "./motion";
import { PhoneScreens } from "./PhoneScreens";

gsap.registerPlugin(ScrollTrigger);

const BAR_COUNT = 60;
/** Deterministic pseudo-random heights so server and client render identical bars. */
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  h: 38 + ((i * 37) % 29) + ((i * 13) % 11),
  picked: i % 5 === 2,
}));

export function Home() {
  const t = useT();
  const lang = useLang();
  const deva = lang !== "en";
  const m = t.marketing;

  const root = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [step, setStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [clock, setClock] = useState("");

  // Mumbai local time in the hero meta row.
  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Kolkata" });
    const tick = () => setClock(fmt());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 30_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  // Smooth scrolling (marketing page only), synced with ScrollTrigger.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.085 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" },
        (c) => {
          const { motion, desktop } = c.conditions as { motion: boolean; desktop: boolean };
          if (!motion) {
            gsap.set(".ks-loader", { display: "none" });
            return;
          }

          /* ---------- 01 · loader + hero intro ---------- */
          let seen = false;
          try {
            seen = sessionStorage.getItem("ks-intro") === "1";
            sessionStorage.setItem("ks-intro", "1");
          } catch {}
          const countEl = document.querySelector(".ks-count");
          const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
          if (!seen) {
            const counter = { v: 0 };
            intro
              .from(".ks-loader-word > span", { yPercent: 110, duration: 0.9, stagger: 0.04 })
              .to(counter, {
                v: 100,
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => {
                  if (countEl) countEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
                },
              }, 0.1)
              .to(".ks-loader-word > span", { yPercent: -110, duration: 0.6, ease: "power3.in", stagger: 0.02 });
          }
          intro
            .to(".ks-loader", { yPercent: -100, duration: seen ? 0.7 : 1.1, ease: "expo.inOut" })
            .set(".ks-loader", { display: "none" })
            .from(".hero-lines .mask-line > span", { yPercent: 115, rotate: 2, duration: 1.4, stagger: 0.1 }, "-=0.55")
            .from("[data-hero-fade]", { opacity: 0, y: 24, duration: 1.1, stagger: 0.07, ease: "power3.out" }, "-=1.1");

          // Hero drifts up and dims as you leave it.
          gsap.to(".hero-lines", {
            yPercent: -18,
            opacity: 0.25,
            ease: "none",
            scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
          });

          /* ---------- generic reveals ---------- */
          gsap.utils.toArray<HTMLElement>("[data-lines]:not(.hero-lines)").forEach((el) => {
            gsap.from(el.querySelectorAll(".mask-line > span"), {
              yPercent: 115,
              duration: 1.25,
              ease: "expo.out",
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: "top 85%" },
            });
          });
          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
            gsap.from(el, {
              opacity: 0,
              y: 40,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%" },
            });
          });

          /* ---------- 02 · the waiting line (scrubbed story) ---------- */
          const items = gsap.utils.toArray<HTMLElement>(".story-item");
          const times = gsap.utils.toArray<HTMLElement>(".story-time");
          gsap.set([...items.slice(1), ...times.slice(1)], { opacity: 0, y: 40 });
          gsap.set(".problem-coda", { opacity: 0, y: 30 });
          const ptl = gsap.timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: { trigger: ".problem-track", start: "top top", end: "bottom bottom", scrub: 0.7 },
          });
          ptl.from(".q-bar", { scaleY: 0, duration: 0.6, stagger: { each: 0.008, from: "random" } });
          for (let i = 1; i < items.length; i++) {
            ptl
              .to([items[i - 1], times[i - 1]], { opacity: 0, y: -40, duration: 0.35 }, "+=0.35")
              .to([items[i], times[i]], { opacity: 1, y: 0, duration: 0.35 }, "<0.1");
            if (i === 2) ptl.to(".q-bar.picked", { backgroundColor: "#e0a33a", yPercent: -12, duration: 0.4 }, "<");
            if (i === 3)
              ptl
                .to(".q-bar.picked", { yPercent: -140, opacity: 0, duration: 0.5, stagger: 0.01 }, "<")
                .to(".q-bar:not(.picked)", { opacity: 0.16, duration: 0.5 }, "<");
          }
          ptl.to(".problem-coda", { opacity: 1, y: 0, duration: 0.4 }, "+=0.2").to({}, { duration: 0.3 });

          /* ---------- 03 · walkthrough driven by scroll on desktop ---------- */
          if (desktop) {
            ScrollTrigger.create({
              trigger: ".solution-track",
              start: "top top",
              end: "bottom bottom",
              onUpdate: (self) => setStep(Math.min(3, Math.floor(self.progress * 4))),
            });
          }

          /* ---------- 04 · feature visuals parallax ---------- */
          gsap.utils.toArray<HTMLElement>(".feature-visual").forEach((el) => {
            gsap.fromTo(
              el,
              { yPercent: 12 },
              { yPercent: -12, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
            );
          });

          /* ---------- 05 · giant footer wordmark ---------- */
          gsap.from(".footer-word > span", {
            yPercent: 100,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.03,
            scrollTrigger: { trigger: ".footer-word", start: "top 95%" },
          });
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  // Text lengths change between languages: re-measure trigger positions.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [lang]);

  function scrollToId(id: string) {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    if (lenisRef.current) lenisRef.current.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView();
  }

  /** Steps are scroll-driven on desktop; elsewhere (mobile, reduced motion) a tap switches directly. */
  function goStep(i: number) {
    const track = document.querySelector<HTMLElement>(".solution-track");
    const scrollDriven = track && track.offsetHeight > window.innerHeight * 1.5;
    if (!scrollDriven || !track) {
      setStep(i);
      return;
    }
    const top = track.getBoundingClientRect().top + window.scrollY;
    const y = top + ((i + 0.5) / 4) * (track.offsetHeight - window.innerHeight);
    if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y });
  }

  const sectionTitle = deva ? "text-[clamp(2.4rem,7vw,6.5rem)]" : "text-[clamp(3rem,9vw,9.5rem)]";
  const navLinks = [
    { label: m.navWorkers, href: "/worker" },
    { label: m.navEmployers, href: "/employer" },
    { label: t.nav.demo, href: "/mobile-demo" },
    { label: t.nav.faq, href: "/faq" },
  ];
  const marquee = TRADES.flatMap((tr) => [DICTS.en.trades[tr], DICTS.hi.trades[tr], DICTS.mr.trades[tr]]);

  return (
    <div ref={root} className="grain overflow-x-clip bg-ink text-ivory">
      <Cursor />
      <SectionIndicator labels={m.sections} />

      {/* ---------- loader ---------- */}
      <div className="ks-loader fixed inset-0 z-[90] flex flex-col justify-between bg-ink p-6 text-ivory motion-reduce:hidden sm:p-10">
        <div className="flex justify-between text-sm text-mist">
          <span>{m.edition}</span>
          <span>{m.loader}</span>
        </div>
        <div className="flex items-end justify-between gap-6">
          <p className="ks-loader-word mask-line display text-[clamp(3rem,12vw,11rem)]">
            <span className="inline-block">UM</span>
            <span className="serif-i inline-block text-marigold">ANG</span>
          </p>
          <p className="ks-count font-mono text-xl tabular-nums sm:text-3xl">000</p>
        </div>
      </div>

      {/* ---------- nav ---------- */}
      <header className="fixed inset-x-0 top-0 z-50 text-ivory mix-blend-difference">
        <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <Link href="/" className="text-2xl" data-cursor aria-label={t.brand.name}>
            <Wordmark accent="" />
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="group relative py-2 text-sm font-medium">
                {l.label}
                <span className="absolute inset-x-0 bottom-1 h-px origin-right scale-x-0 bg-current transition-transform duration-500 ease-[var(--ease-expo)] group-hover:origin-left group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/choose-role" className="hidden min-h-11 items-center rounded-full bg-ivory px-4 text-sm font-semibold text-ink md:inline-flex" data-cursor>
              {t.nav.openApp}
            </Link>
            <div className="hidden sm:block">
              <LangSwitcher tone="dark" />
            </div>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-ivory/30 lg:hidden"
              aria-label={m.menu}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- mobile menu ---------- */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={m.menu}
        className={cx(
          "fixed inset-0 z-[70] flex flex-col bg-ivory p-4 text-ink transition-[clip-path] duration-700 ease-[var(--ease-expo)] sm:p-6 lg:hidden",
          menuOpen ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
      >
        <div className="flex items-center justify-between">
          <Wordmark className="text-2xl" accent="text-[#b5721a]" />
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-ink/30"
            aria-label={m.closeMenu}
            onClick={() => setMenuOpen(false)}
            tabIndex={menuOpen ? 0 : -1}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        <nav className="mt-12 flex flex-col">
          {navLinks.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="flex items-baseline gap-4 border-b border-ink/15 py-5"
            >
              <span className="font-mono text-sm text-muted">0{i + 1}</span>
              <span className="display text-5xl">{l.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <p className="mb-3 text-sm text-muted">{t.common.language}</p>
          <LangSwitcher full />
        </div>
      </div>

      <main>
        {/* ================= 01 HERO ================= */}
        <section data-section="0" id="top" className="hero relative flex min-h-svh flex-col justify-between px-4 pt-24 pb-24 sm:px-6 lg:px-10 lg:pb-10">
          <div data-hero-fade className="grid grid-cols-2 gap-4 border-t border-ivory/15 pt-4 text-xs text-mist sm:grid-cols-4 sm:text-sm">
            <span>(KS—01)</span>
            <span>{m.edition}</span>
            <span className="hidden sm:block">19.0760° N, 72.8777° E</span>
            <span className="hidden text-right tabular-nums sm:block">IST {clock}</span>
          </div>

          <Lines
            as="h1"
            lines={m.heroLines}
            upper={!deva}
            className={cx("hero-lines my-8 lg:my-6", deva ? "text-[clamp(2.9rem,min(10.5vw,17vh),10.5rem)]" : "text-[clamp(3.4rem,min(13.6vw,21vh),15.5rem)]")}
            lineClassName={(i) => (i === 1 ? "pl-[8vw]" : i === 2 ? "text-right" : "")}
          />

          <div className="grid items-end gap-8 lg:grid-cols-12">
            <div data-hero-fade className="lg:col-span-5">
              <p className={cx("max-w-md text-ivory/85", deva ? "text-xl" : "text-xl sm:text-2xl")}>{m.heroSub}</p>
              <div className="mt-6">
                <p className="mb-2 text-xs text-mist">{t.common.language}</p>
                <LangSwitcher tone="dark" full />
              </div>
            </div>
            <div data-hero-fade className="flex flex-wrap gap-3 lg:col-span-7 lg:justify-end">
              <Magnetic>
                <Link
                  href="/worker"
                  data-cursor-label="Go"
                  className="group relative inline-flex min-h-16 items-center gap-3 overflow-hidden rounded-full bg-ivory px-8 text-lg font-semibold text-ink"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-marigold transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" />
                  <span className="relative uppercase">{m.findWork}</span>
                  <ArrowUpRight className="relative transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/employer"
                  data-cursor-label="Go"
                  className="group relative inline-flex min-h-16 items-center gap-3 overflow-hidden rounded-full border border-ivory/40 px-8 text-lg font-semibold"
                >
                  <span className="absolute inset-0 translate-y-full rounded-full bg-ivory transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0" />
                  <span className="relative uppercase transition-colors duration-500 group-hover:text-ink">{m.hireWorkers}</span>
                  <ArrowUpRight className="relative transition-all duration-500 group-hover:rotate-45 group-hover:text-ink" aria-hidden />
                </Link>
              </Magnetic>
            </div>
          </div>

          <button
            type="button"
            data-hero-fade
            onClick={() => scrollToId("problem")}
            className="absolute right-4 bottom-6 hidden items-center gap-2 text-sm text-mist sm:right-6 lg:flex lg:right-auto lg:left-1/2 lg:-translate-x-1/2"
          >
            {m.scroll} <ArrowDownRight size={16} aria-hidden />
          </button>
        </section>

        {/* trade marquee in three scripts */}
        <div aria-hidden className="overflow-hidden border-y border-ivory/15 py-5">
          <div className="marquee flex w-max gap-10 font-serif text-3xl whitespace-nowrap text-ivory/70 sm:text-4xl">
            {[...marquee, ...marquee].map((w, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className={i % 3 === 0 ? "italic" : ""}>{w}</span>
                <span className="text-marigold">✶</span>
              </span>
            ))}
          </div>
        </div>

        {/* ================= 02 PROBLEM ================= */}
        <section data-section="1" id="problem" className="problem-track relative motion-safe:h-[420vh]">
          <div className="flex min-h-svh flex-col justify-between gap-10 overflow-hidden px-4 py-24 motion-safe:sticky motion-safe:top-0 motion-safe:h-svh sm:px-6 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-12">
              <p className="kicker text-mist lg:col-span-3">(02) — {m.problemKicker}</p>
              <Lines lines={m.problemTitle} className={cx("lg:col-span-9", deva ? "text-[clamp(2.2rem,6vw,5.5rem)]" : "text-[clamp(2.6rem,7vw,7rem)]")} />
            </div>

            <div className="grid items-end gap-10 lg:grid-cols-12">
              {/* story */}
              <div className="lg:col-span-5">
                <div className="relative h-16 sm:h-20">
                  {m.problemStory.map((s) => (
                    <p
                      key={s.time}
                      className="story-time absolute inset-0 font-mono text-5xl text-marigold tabular-nums motion-reduce:hidden sm:text-7xl"
                    >
                      {s.time}
                    </p>
                  ))}
                </div>
                <ol className="mt-4 motion-safe:relative motion-safe:h-36 sm:motion-safe:h-32">
                  {m.problemStory.map((s) => (
                    <li key={s.time} className="story-item text-2xl leading-snug motion-safe:absolute motion-safe:inset-0 motion-reduce:mb-4 sm:text-3xl">
                      <span className="mr-3 font-mono text-base text-marigold motion-safe:hidden">{s.time}</span>
                      {s.text}
                    </li>
                  ))}
                </ol>
                <p className="problem-coda serif-i mt-6 text-2xl text-ivory/80 sm:text-3xl">{m.problemCoda}</p>
              </div>

              {/* the queue */}
              <div aria-hidden className="flex h-[32vh] items-end gap-[3px] sm:gap-1 lg:col-span-7">
                {BARS.map((b, i) => (
                  <span
                    key={i}
                    className={cx("q-bar block flex-1 origin-bottom rounded-t-full bg-ivory/80", b.picked && "picked")}
                    style={{ height: `${b.h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 03 SOLUTION ================= */}
        <section data-section="2" id="solution" className="solution-track relative bg-ivory text-ink lg:motion-safe:h-[400vh]">
          <div className="flex min-h-svh flex-col justify-center px-4 py-24 sm:px-6 lg:px-10 lg:motion-safe:sticky lg:motion-safe:top-0 lg:motion-safe:h-svh lg:motion-safe:py-16">
            <div className="grid items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="kicker mb-6 text-muted">(03) — {m.solutionKicker}</p>
                <Lines lines={m.solutionTitle} className={cx("[&_.text-marigold]:text-[#b5721a]", deva ? "text-[clamp(2.2rem,6vw,5.5rem)]" : "text-[clamp(2.6rem,7vw,7.5rem)]")} />
                <ol className="mt-10 flex flex-col border-t border-ink/15" role="tablist" aria-label={m.solutionKicker}>
                  {m.solutionSteps.map((s, i) => {
                    const active = i === step;
                    return (
                      <li key={s.t} className="border-b border-ink/15">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => goStep(i)}
                          className="grid w-full grid-cols-[3rem_1fr] items-start gap-2 py-4 text-left sm:grid-cols-[4rem_1fr]"
                        >
                          <span className={cx("font-mono text-sm tabular-nums transition-colors", active ? "text-ink" : "text-muted")}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>
                            <span className={cx("block text-2xl font-semibold transition-opacity duration-500 sm:text-3xl", active ? "opacity-100" : "opacity-35")}>
                              {s.t}
                            </span>
                            <span
                              className={cx(
                                "grid transition-all duration-700 ease-[var(--ease-expo)]",
                                active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                              )}
                            >
                              <span className="overflow-hidden">
                                <span className="block pt-2 text-lg text-muted">{s.b}</span>
                              </span>
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <div className="lg:col-span-5">
                <PhoneScreens active={step} />
              </div>
            </div>
          </div>
        </section>

        {/* ================= 04 EXPERIENCE ================= */}
        <section data-section="3" id="experience" className="bg-ivory px-4 pt-16 pb-24 text-ink sm:px-6 lg:px-10 lg:pt-32">
          <div className="grid gap-6 border-t border-ink pt-6 lg:grid-cols-12">
            <p className="kicker text-muted lg:col-span-3">(04) — {m.experienceKicker}</p>
            <Lines lines={m.experienceTitle} className={cx("lg:col-span-9 [&_.text-marigold]:text-[#b5721a]", sectionTitle)} />
          </div>

          {/* index of features — portfolio-style "selected works" */}
          <ol className="mt-20 border-t border-ink">
            {m.features.map((f, i) => (
              <li key={f.t} className="border-b border-ink">
                <a
                  href={`#feature-${i}`}
                  data-cursor-label="View"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(`feature-${i}`);
                  }}
                  className="group grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-5 transition-[padding] duration-500 ease-[var(--ease-expo)] hover:px-3 sm:grid-cols-[5rem_1fr_auto] sm:py-7"
                >
                  <span className="font-mono text-sm tabular-nums">({String(i + 1).padStart(2, "0")})</span>
                  <span className={cx("display transition-transform duration-500 group-hover:translate-x-2", deva ? "text-3xl sm:text-5xl" : "text-4xl sm:text-6xl lg:text-7xl")}>
                    {f.t}
                  </span>
                  <span className="grid size-11 place-items-center rounded-full border border-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-ivory sm:size-14">
                    <ArrowDownRight size={20} aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ol>

          {/* showcases */}
          <div className="mt-24 flex flex-col gap-28 lg:gap-40">
            {m.features.map((f, i) => (
              <article
                key={f.t}
                id={`feature-${i}`}
                className={cx("grid scroll-mt-24 items-center gap-10 lg:grid-cols-12", i % 2 === 1 && "lg:[&>*:first-child]:order-2")}
              >
                <div data-reveal className={cx("lg:col-span-5", i % 2 === 1 ? "lg:col-start-8" : "")}>
                  <p className="font-serif text-[clamp(5rem,14vw,12rem)] leading-none text-ink/10 italic">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className={cx("display -mt-6 sm:-mt-10", deva ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl")}>{f.t}</h3>
                  <p className="mt-5 max-w-md text-xl text-muted">{f.b}</p>
                </div>
                <div className={cx("lg:col-span-6", i % 2 === 1 ? "lg:col-start-1" : "lg:col-start-7")}>
                  <div className="feature-visual">
                    <FeatureVisual index={i} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ================= 05 ACTION ================= */}
        <section data-section="4" id="action" className="relative flex min-h-svh flex-col justify-between px-4 pt-24 pb-10 sm:px-6 lg:px-10">
          <div>
            <p className="kicker mb-6 text-mist">(05) — {m.actionKicker}</p>
            <Lines
              lines={m.actionTitle}
              upper={!deva}
              className={deva ? "text-[clamp(2.8rem,9vw,9rem)]" : "text-[clamp(3.2rem,12vw,13rem)]"}
              lineClassName={(i) => (i === 1 ? "pl-[12vw]" : i === 2 ? "text-right" : "")}
            />
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-ivory/20 bg-ivory/20 md:grid-cols-2">
            {[
              { href: "/worker", label: m.actionWorker, hint: m.actionWorkerHint, tag: "A" },
              { href: "/employer", label: m.actionEmployer, hint: m.actionEmployerHint, tag: "B" },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                data-cursor-label="Go"
                className="group relative flex min-h-64 flex-col justify-between gap-10 overflow-hidden bg-ink p-6 sm:p-10"
              >
                <span className="absolute inset-0 translate-y-full bg-marigold transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0" />
                <span className="relative flex items-start justify-between">
                  <span className="font-mono text-sm text-mist transition-colors group-hover:text-ink">({p.tag})</span>
                  <Magnetic strength={0.5}>
                    <span className="grid size-16 place-items-center rounded-full border border-ivory/40 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink">
                      <ArrowUpRight className="transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                    </span>
                  </Magnetic>
                </span>
                <span className="relative">
                  <span className={cx("display block transition-colors duration-500 group-hover:text-ink", deva ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl")}>
                    {p.label}
                  </span>
                  <span className="mt-3 block text-lg text-mist transition-colors duration-500 group-hover:text-ink/80">{p.hint}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="overflow-hidden px-4 pt-10 pb-24 sm:px-6 lg:px-10 lg:pb-10">
        <div className="flex flex-col gap-6 border-t border-ivory/15 pt-6 text-sm text-mist md:flex-row md:items-start md:justify-between">
          <p className="max-w-md">{m.footerNote}</p>
          <div className="flex flex-wrap gap-6">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-ivory">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <p aria-hidden className="footer-word mask-line display mt-10 text-center text-[22vw] leading-[0.8] tracking-tighter">
          {"UM".split("").map((c, i) => (
            <span key={i} className="inline-block">{c}</span>
          ))}
          {"ANG".split("").map((c, i) => (
            <span key={`s${i}`} className="serif-i inline-block text-marigold">{c}</span>
          ))}
        </p>
      </footer>
    </div>
  );
}

/** Editorial mock visuals for the four features. Content comes from the live dictionaries. */
function FeatureVisual({ index }: { index: number }) {
  const t = useT();
  if (index === 0) {
    const rows = [
      { trade: "electrician", area: "lowerParel", km: 3.1, wage: 1200 },
      { trade: "mason", area: "goregaon", km: 4.4, wage: 950 },
      { trade: "plumber", area: "bandra", km: 6.0, wage: 6500, task: true },
    ] as const;
    return (
      <div className="relative rounded-[2rem] bg-ink p-5 text-ivory sm:p-8">
        <div className="mb-5 flex flex-wrap gap-2">
          {[t.common.all, t.trades.mason, t.trades.electrician, t.trades.plumber].map((c, i) => (
            <span key={c} className={cx("rounded-full px-4 py-2 text-sm font-semibold", i === 0 ? "bg-ivory text-ink" : "border border-ivory/25")}>
              {c}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-4 rounded-2xl border border-ivory/15 p-4" style={{ marginLeft: `${i * 6}%` }}>
              <div>
                <p className="serif-i text-2xl text-marigold">{t.trades[r.trade]}</p>
                <p className="text-sm text-mist">
                  {t.areas[r.area]} · {t.common.kmAway(r.km)}
                </p>
              </div>
              <p className="text-right text-2xl font-semibold tabular-nums">
                {t.common.inr(r.wage)}
                <span className="block text-xs font-normal text-mist">{"task" in r ? t.wageUnit.task : t.wageUnit.day}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="relative mx-auto max-w-md pr-3 pb-3 sm:pr-6 sm:pb-6">
        <div className="absolute inset-0 top-3 left-3 rounded-[2rem] border border-ink sm:top-6 sm:left-6" />
        <div className="relative rounded-[2rem] bg-ink p-8 text-ivory">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-full bg-marigold text-xl font-bold text-ink">SK</span>
            <div>
              <p className="kicker text-mist">{t.profile.card}</p>
              <p className="text-2xl font-semibold">Sunita Kamble</p>
              <p className="serif-i text-3xl leading-none text-marigold">{t.trades.housekeeping}</p>
            </div>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-ivory/15 pt-6">
            <div>
              <dt className="text-sm text-mist">{t.profile.experience}</dt>
              <dd className="text-xl font-semibold">{t.common.years(5)}</dd>
            </div>
            <div>
              <dt className="text-sm text-mist">{t.profile.area}</dt>
              <dd className="text-xl font-semibold">{t.areas.andheri}</dd>
            </div>
            <div>
              <dt className="text-sm text-mist">{t.profile.availability}</dt>
              <dd className="text-xl font-semibold">{t.availability.week}</dd>
            </div>
            <div>
              <dt className="text-sm text-mist">{t.profile.languages}</dt>
              <dd className="text-xl font-semibold">मराठी, हिन्दी</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs text-mist">{t.profile.selfDeclared}</p>
        </div>
      </div>
    );
  }
  if (index === 2) {
    const rows: [string, string][] = [
      [t.job.payment, t.paymentTerm.weekly],
      [t.job.paymentMode, t.paymentMode.upi],
      [t.job.duration, t.duration.threeMonths],
      [t.job.benefits, `${t.benefits.safetyGear}, ${t.benefits.meals}`],
    ];
    return (
      <div className="rounded-[2rem] border border-ink p-6 sm:p-10">
        <p className="kicker text-muted">{t.job.pay}</p>
        <p className="mt-3 flex items-baseline gap-3">
          <span className="display text-[clamp(4rem,10vw,8rem)] tabular-nums">₹950</span>
          <span className="text-xl text-muted">{t.wageUnit.day}</span>
        </p>
        <dl className="mt-8 border-t border-ink">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-4 border-b border-ink/20 py-4">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-[2rem] bg-ink p-6 text-ivory sm:p-10">
      {(["en", "hi", "mr"] as const).map((l, i) => (
        <p
          key={l}
          lang={l}
          className={cx("display flex items-baseline justify-between gap-4 border-b border-ivory/15 pb-3 text-[clamp(2.5rem,6vw,4.5rem)]", i === 1 && "serif-i text-marigold")}
        >
          {DICTS[l].trades.mason}
          <span className="font-sans text-sm font-normal tracking-normal text-mist not-italic">{DICTS[l].langName}</span>
        </p>
      ))}
      <p className="pt-2 text-mist">
        {DICTS.en.trades.electrician} · {DICTS.hi.trades.electrician} · {DICTS.mr.trades.carpenter}
      </p>
    </div>
  );
}
