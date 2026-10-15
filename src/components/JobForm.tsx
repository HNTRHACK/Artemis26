"use client";

import { useState, type ReactNode } from "react";
import { tx, useLang, useT } from "@/lib/i18n";
import { dailyEstimate } from "@/lib/jobs";
import type { JobDraft } from "@/lib/store";
import {
  AREAS,
  BENEFITS,
  DURATIONS,
  PAYMENT_MODES,
  PAYMENT_TERMS,
  TRADES,
  WAGE_UNITS,
  type Area,
  type Duration,
  type Job,
  type PaymentMode,
  type PaymentTerm,
  type Trade,
  type WageUnit,
} from "@/lib/types";
import { Button, ChipGroup, Field, Select, TextArea, TextInput } from "./ui";

type Errors = Partial<Record<"title" | "description" | "wage" | "workersNeeded" | "address" | "startDate" | "experienceMin", string>>;

/** Indicative floor used only to warn employers; not an official minimum wage figure. */
const LOW_DAILY_WAGE = 500;

function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t-2 border-ink pt-6 md:grid-cols-[200px_1fr]">
      <h2 className="flex items-baseline gap-3 text-xl font-semibold">
        <span className="font-serif text-2xl text-muted">{n}</span>
        {title}
      </h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function JobForm({ initial, submitLabel, onSubmit }: { initial?: Job; submitLabel: string; onSubmit: (d: JobDraft) => void }) {
  const t = useT();
  const lang = useLang();
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [f, setF] = useState({
    trade: initial?.trade ?? ("mason" as Trade),
    title: initial ? tx(initial.title, lang) : "",
    description: initial ? tx(initial.description, lang) : "",
    area: initial?.area ?? ("andheri" as Area),
    address: initial ? tx(initial.address, lang) : "",
    wage: initial ? String(initial.wage) : "",
    wageUnit: initial?.wageUnit ?? ("day" as WageUnit),
    duration: initial?.duration ?? ("month" as Duration),
    paymentTerm: initial?.paymentTerm ?? ("weekly" as PaymentTerm),
    paymentMode: initial?.paymentMode ?? ("upi" as PaymentMode),
    workersNeeded: initial ? String(initial.workersNeeded) : "1",
    experienceMin: initial ? String(initial.experienceMin) : "0",
    hours: initial?.hours ?? "09:00 – 18:00",
    startDate: initial?.startDate ?? today,
    benefits: initial?.benefits ?? [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));
  const digits = (v: string) => v.replace(/[^\d]/g, "");

  const wageNum = Number(f.wage);
  const lowWage = wageNum > 0 && dailyEstimate({ wage: wageNum, wageUnit: f.wageUnit, duration: f.duration }) < LOW_DAILY_WAGE;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (f.title.trim().length < 3) next.title = t.jobForm.errTitle;
    if (f.description.trim().length < 20) next.description = t.jobForm.errDescription;
    if (!(wageNum > 0)) next.wage = t.jobForm.errWage;
    const w = Number(f.workersNeeded);
    if (!(w >= 1 && w <= 200)) next.workersNeeded = t.jobForm.errWorkers;
    const exp = Number(f.experienceMin);
    if (f.experienceMin === "" || exp > 40) next.experienceMin = t.jobForm.errExperience;
    if (f.address.trim().length < 3) next.address = t.jobForm.errAddress;
    if (!f.startDate) next.startDate = t.jobForm.errDate;
    setErrors(next);
    if (Object.keys(next).length) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    onSubmit({
      trade: f.trade,
      title: f.title.trim(),
      description: f.description.trim(),
      area: f.area,
      address: f.address.trim(),
      wage: Math.round(wageNum),
      wageUnit: f.wageUnit,
      duration: f.duration,
      paymentTerm: f.paymentTerm,
      paymentMode: f.paymentMode,
      workersNeeded: w,
      experienceMin: exp,
      hours: f.hours.trim() || "—",
      startDate: f.startDate,
      benefits: f.benefits,
    });
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-10">
      <Section n="01" title={t.jobForm.sectionWork}>
        <Field label={t.jobForm.trade}>
          {(id) => (
            <Select id={id} value={f.trade} onChange={(e) => set("trade", e.target.value as Trade)}>
              {TRADES.map((x) => <option key={x} value={x}>{t.trades[x]}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t.jobForm.title} error={errors.title}>
          {(id, d) => (
            <TextInput id={id} aria-describedby={d} invalid={!!errors.title} value={f.title} maxLength={90} placeholder={t.jobForm.titlePlaceholder} onChange={(e) => set("title", e.target.value)} />
          )}
        </Field>
        <Field label={t.jobForm.description} error={errors.description}>
          {(id, d) => (
            <TextArea id={id} aria-describedby={d} invalid={!!errors.description} value={f.description} maxLength={600} placeholder={t.jobForm.descriptionPlaceholder} onChange={(e) => set("description", e.target.value)} />
          )}
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.jobForm.workersNeeded} error={errors.workersNeeded}>
            {(id, d) => (
              <TextInput id={id} aria-describedby={d} invalid={!!errors.workersNeeded} inputMode="numeric" value={f.workersNeeded} onChange={(e) => set("workersNeeded", digits(e.target.value))} />
            )}
          </Field>
          <Field label={t.jobForm.experienceMin} error={errors.experienceMin}>
            {(id, d) => (
              <TextInput id={id} aria-describedby={d} invalid={!!errors.experienceMin} inputMode="numeric" value={f.experienceMin} onChange={(e) => set("experienceMin", digits(e.target.value))} />
            )}
          </Field>
        </div>
      </Section>

      <Section n="02" title={t.jobForm.sectionPay}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.jobForm.wage} error={errors.wage} hint={lowWage ? t.jobForm.minWageWarn : undefined}>
            {(id, d) => (
              <TextInput id={id} aria-describedby={d} invalid={!!errors.wage} inputMode="numeric" value={f.wage} placeholder="900" onChange={(e) => set("wage", digits(e.target.value))} />
            )}
          </Field>
          <Field label={t.jobForm.wageUnit}>
            {(id) => (
              <Select id={id} value={f.wageUnit} onChange={(e) => set("wageUnit", e.target.value as WageUnit)}>
                {WAGE_UNITS.map((x) => <option key={x} value={x}>{t.wageUnit[x]}</option>)}
              </Select>
            )}
          </Field>
          <Field label={t.jobForm.paymentTerm}>
            {(id) => (
              <Select id={id} value={f.paymentTerm} onChange={(e) => set("paymentTerm", e.target.value as PaymentTerm)}>
                {PAYMENT_TERMS.map((x) => <option key={x} value={x}>{t.paymentTerm[x]}</option>)}
              </Select>
            )}
          </Field>
          <Field label={t.jobForm.paymentMode}>
            {(id) => (
              <Select id={id} value={f.paymentMode} onChange={(e) => set("paymentMode", e.target.value as PaymentMode)}>
                {PAYMENT_MODES.map((x) => <option key={x} value={x}>{t.paymentMode[x]}</option>)}
              </Select>
            )}
          </Field>
        </div>
        <fieldset>
          <legend className="mb-3 text-base font-semibold">{t.jobForm.benefits}</legend>
          <ChipGroup label={t.jobForm.benefits} options={BENEFITS} value={f.benefits} onChange={(v) => set("benefits", v)} render={(b) => t.benefits[b]} />
        </fieldset>
      </Section>

      <Section n="03" title={t.jobForm.sectionPlace}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.jobForm.area}>
            {(id) => (
              <Select id={id} value={f.area} onChange={(e) => set("area", e.target.value as Area)}>
                {AREAS.map((x) => <option key={x} value={x}>{t.areas[x]}</option>)}
              </Select>
            )}
          </Field>
          <Field label={t.jobForm.duration}>
            {(id) => (
              <Select id={id} value={f.duration} onChange={(e) => set("duration", e.target.value as Duration)}>
                {DURATIONS.map((x) => <option key={x} value={x}>{t.duration[x]}</option>)}
              </Select>
            )}
          </Field>
        </div>
        <Field label={t.jobForm.address} error={errors.address}>
          {(id, d) => (
            <TextInput id={id} aria-describedby={d} invalid={!!errors.address} value={f.address} maxLength={120} onChange={(e) => set("address", e.target.value)} />
          )}
        </Field>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={t.jobForm.hours}>
            {(id) => <TextInput id={id} value={f.hours} maxLength={40} onChange={(e) => set("hours", e.target.value)} />}
          </Field>
          <Field label={t.jobForm.startDate} error={errors.startDate}>
            {(id, d) => (
              <TextInput id={id} aria-describedby={d} invalid={!!errors.startDate} type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} />
            )}
          </Field>
        </div>
      </Section>

      <div className="border-t-2 border-ink pt-6">
        <Button type="submit" variant="accent" className="w-full text-lg sm:w-auto sm:px-12">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
