"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Line } from "@/lib/i18n/line";
import { cx } from "../ui";

/** True when the visitor uses a mouse and hasn't asked for reduced motion. */
export function canDoFancyPointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Display headline split into masked lines; GSAP reveals `.mask-line > span`. */
export function Lines({
  lines,
  className,
  lineClassName,
  upper,
  as: Tag = "h2",
}: {
  lines: Line[];
  className?: string;
  lineClassName?: (i: number) => string;
  upper?: boolean;
  as?: "h1" | "h2" | "p";
}) {
  return (
    <Tag className={cx("display", className)} data-lines>
      {lines.map((l, i) => (
        <span key={i} className={cx("mask-line", lineClassName?.(i))}>
          <span className={cx("inline-block will-change-transform", l.i ? "serif-i pr-[0.08em] text-marigold" : upper && "uppercase")}>
            {l.t}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/** Pulls its child gently toward the pointer. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !canDoFancyPointer()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);
  return (
    <div ref={ref} className={cx("inline-block", className)}>
      {children}
    </div>
  );
}

/** Dot + ring cursor. Grows over interactive elements; shows `data-cursor-label` text. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!canDoFancyPointer()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability is only knowable on the client
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });
    let hovering = false;

    const move = (e: PointerEvent) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, [data-cursor], [data-cursor-label]");
      const nextLabel = target?.dataset.cursorLabel ?? "";
      const isHover = !!target;
      if (isHover !== hovering) {
        hovering = isHover;
        gsap.to(ring.current, { scale: isHover ? (nextLabel ? 2.6 : 1.7) : 1, duration: 0.4, ease: "power3.out" });
        gsap.to(dot.current, { scale: isHover ? 0 : 1, duration: 0.3 });
      }
      setLabel((prev) => (prev === nextLabel ? prev : nextLabel));
    };
    const leaveWindow = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    const enterWindow = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leaveWindow);
    document.addEventListener("pointerenter", enterWindow);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leaveWindow);
      document.removeEventListener("pointerenter", enterWindow);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-5 -ml-5 grid size-10 place-items-center rounded-full border border-ivory mix-blend-difference"
      >
        <span className="text-[5px] font-semibold tracking-widest text-ivory uppercase">{label}</span>
      </div>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] -mt-1 -ml-1 size-2 rounded-full bg-ivory mix-blend-difference"
      />
    </>
  );
}

/** Fixed "02 / 05 — The problem" indicator driven by which section is mid-screen. */
export function SectionIndicator({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.section));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  const total = labels.length;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed bottom-5 left-4 z-40 flex items-center gap-3 text-ivory mix-blend-difference sm:left-6 lg:top-1/2 lg:bottom-auto lg:left-4 lg:origin-top-left lg:translate-y-24 lg:-rotate-90"
    >
      <span className="relative block h-5 w-6 overflow-hidden font-mono text-sm tabular-nums">
        {labels.map((_, i) => (
          <span
            key={i}
            className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-expo)]"
            style={{ transform: `translateY(${(i - active) * 100}%)` }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
        ))}
      </span>
      <span className="relative h-px w-10 bg-ivory/30">
        <span
          className="absolute inset-y-0 left-0 bg-ivory transition-[width] duration-700 ease-[var(--ease-expo)]"
          style={{ width: `${((active + 1) / total) * 100}%` }}
        />
      </span>
      <span className="font-mono text-sm tabular-nums opacity-70">{String(total).padStart(2, "0")}</span>
      <span className="hidden text-sm sm:inline">— {labels[active]}</span>
    </div>
  );
}
