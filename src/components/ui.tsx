"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState, type ComponentProps, type ReactNode } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export { cx };

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-ink-3",
  secondary: "border-2 border-ink text-ink hover:bg-ink hover:text-ivory",
  ghost: "text-ink hover:bg-ivory-2",
  accent: "bg-marigold text-ink hover:brightness-95",
  danger: "border-2 border-danger text-danger hover:bg-danger hover:text-ivory",
};

const BASE =
  "inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button type="button" className={cx(BASE, VARIANTS[variant], className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cx(BASE, VARIANTS[variant], className)} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: string;
  children: (id: string, describedBy: string | undefined) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold">
        {label}
        {optional && <span className="ml-2 text-sm font-normal text-muted">({optional})</span>}
      </label>
      {children(id, describedBy)}
      {hint && !error && (
        <p id={hintId} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="flex items-start gap-2 text-sm font-semibold text-danger">
          <span aria-hidden>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT =
  "min-h-14 w-full rounded-2xl border-2 bg-white/70 px-4 text-lg text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none";

export function TextInput({ invalid, className, ...props }: ComponentProps<"input"> & { invalid?: boolean }) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(INPUT, invalid ? "border-danger" : "border-ivory-3", className)}
      {...props}
    />
  );
}

export function TextArea({ invalid, className, ...props }: ComponentProps<"textarea"> & { invalid?: boolean }) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cx(INPUT, "min-h-32 py-3 leading-relaxed", invalid ? "border-danger" : "border-ivory-3", className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select className={cx(INPUT, "appearance-none border-ivory-3 pr-12", className)} {...props}>
        {children}
      </select>
      <span aria-hidden className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-sm">
        ▼
      </span>
    </div>
  );
}

/** Large single-choice tiles — used in onboarding and forms for low-literacy friendliness. */
export function ChoiceGrid<T extends string | number>({
  options,
  value,
  onChange,
  label,
  columns = "grid-cols-2",
  render,
}: {
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
  label: string;
  columns?: string;
  render: (v: T) => ReactNode;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("grid gap-3", columns)}>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o)}
            className={cx(
              "flex min-h-16 items-center justify-between gap-3 rounded-2xl border-2 px-5 py-3 text-left text-lg font-semibold transition-colors",
              active ? "border-ink bg-ink text-ivory" : "border-ivory-3 bg-white/60 hover:border-ink",
            )}
          >
            <span>{render(o)}</span>
            <span
              aria-hidden
              className={cx(
                "grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs",
                active ? "border-marigold bg-marigold text-ink" : "border-ivory-3",
              )}
            >
              {active ? "✓" : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select chips. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  label,
  render,
}: {
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  label: string;
  render: (v: T) => ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== o) : [...value, o])}
            className={cx(
              "min-h-12 rounded-full border-2 px-4 text-base font-medium transition-colors",
              active ? "border-ink bg-ink text-ivory" : "border-ivory-3 bg-white/60 hover:border-ink",
            )}
          >
            {active && <span aria-hidden>✓ </span>}
            {render(o)}
          </button>
        );
      })}
    </div>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "accent" | "success" | "danger" | "dark"; children: ReactNode }) {
  const tones = {
    neutral: "bg-ivory-2 text-ink",
    accent: "bg-marigold text-ink",
    success: "bg-success text-ivory",
    danger: "bg-danger/10 text-danger",
    dark: "bg-ink text-ivory",
  };
  return (
    <span className={cx("inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-3xl border-2 border-dashed border-ivory-3 p-8">
      <p className="font-serif text-3xl leading-tight">{title}</p>
      {hint && <p className="text-muted">{hint}</p>}
      {action}
    </div>
  );
}

export function PageTitle({ title, sub, children }: { title: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-4xl sm:text-5xl">{title}</h1>
        {sub && <p className="mt-3 text-lg text-muted">{sub}</p>}
      </div>
      {children}
    </header>
  );
}

type ToastState = { msg: string; id: number } | null;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((msg: string) => setToast((prev) => ({ msg, id: (prev?.id ?? 0) + 1 })), []);
  return [toast, show] as const;
}

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      key={toast.id}
      className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-sm rounded-2xl bg-ink px-5 py-4 text-center font-semibold text-ivory shadow-2xl md:bottom-8"
      style={{ animation: "toast 2.6s var(--ease-expo) both" }}
    >
      {toast.msg}
    </div>
  );
}
