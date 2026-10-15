"use client";

import { useState } from "react";
import { SkillCard } from "@/components/cards";
import { Button, ChipGroup, Field, PageTitle, Select, TextArea, TextInput, Toast, useToast } from "@/components/ui";
import { DICTS, LANGS, useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { AREAS, AVAILABILITY, TRADES, type Area, type Availability, type Lang, type Trade, type WorkerProfile } from "@/lib/types";

type Errors = Partial<Record<"name" | "phone" | "experience" | "expectedWage", string>>;

export default function ProfilePage() {
  const t = useT();
  const lang = useApp((s) => s.lang);
  const existing = useApp((s) => s.myProfile);
  const saveMyProfile = useApp((s) => s.saveMyProfile);
  const [toast, showToast] = useToast();

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    phone: existing?.phone ?? "",
    trade: existing?.trade ?? ("mason" as Trade),
    otherTrades: existing?.otherTrades ?? ([] as Trade[]),
    area: existing?.area ?? ("dadar" as Area),
    experience: String(existing?.experience ?? 0),
    expectedWage: String(existing?.expectedWage ?? 800),
    availability: existing?.availability ?? ("now" as Availability),
    languages: existing?.languages ?? ([lang] as Lang[]),
    about: existing?.about ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const preview: WorkerProfile = {
    ...form,
    id: "preview",
    owner: "local",
    experience: Number(form.experience) || 0,
    expectedWage: Number(form.expectedWage) || 0,
  };

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const next: Errors = {};
    if (!form.name.trim()) next.name = t.profile.errName;
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length !== 10) next.phone = t.profile.errPhone;
    const exp = Number(form.experience);
    if (form.experience === "" || !Number.isFinite(exp) || exp < 0 || exp > 50) next.experience = t.profile.errExperience;
    const wage = Number(form.expectedWage);
    if (!Number.isFinite(wage) || wage <= 0) next.expectedWage = t.profile.errWage;
    setErrors(next);
    if (Object.keys(next).length) return;
    saveMyProfile({
      ...form,
      name: form.name.trim(),
      phone: digits,
      experience: Math.round(exp),
      expectedWage: Math.round(wage),
      otherTrades: form.otherTrades.filter((o) => o !== form.trade),
      about: form.about.trim(),
    });
    showToast(t.profile.savedToast);
  }

  const hasErrors = submitted && Object.keys(errors).length > 0;

  return (
    <div>
      <PageTitle title={existing ? t.profile.title : t.profile.createTitle} sub={t.profile.intro} />
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={save} noValidate className="flex flex-col gap-6">
          {hasErrors && (
            <p role="alert" className="rounded-2xl bg-danger/10 p-4 font-semibold text-danger">
              {t.profile.fixErrors}
            </p>
          )}
          <Field label={t.profile.name} error={errors.name}>
            {(id, d) => (
              <TextInput id={id} aria-describedby={d} invalid={!!errors.name} value={form.name} autoComplete="name" onChange={(e) => set("name", e.target.value)} />
            )}
          </Field>
          <Field label={t.profile.phone} hint={t.onboarding.phoneHint} error={errors.phone}>
            {(id, d) => (
              <TextInput id={id} aria-describedby={d} invalid={!!errors.phone} value={form.phone} inputMode="numeric" autoComplete="tel-national" maxLength={14} onChange={(e) => set("phone", e.target.value)} />
            )}
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t.profile.trade}>
              {(id) => (
                <Select id={id} value={form.trade} onChange={(e) => set("trade", e.target.value as Trade)}>
                  {TRADES.map((x) => (
                    <option key={x} value={x}>{t.trades[x]}</option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label={t.profile.area}>
              {(id) => (
                <Select id={id} value={form.area} onChange={(e) => set("area", e.target.value as Area)}>
                  {AREAS.map((x) => (
                    <option key={x} value={x}>{t.areas[x]}</option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-base font-semibold">
              {t.profile.otherTrades} <span className="text-sm font-normal text-muted">({t.common.optional})</span>
            </legend>
            <ChipGroup
              label={t.profile.otherTrades}
              options={TRADES.filter((x) => x !== form.trade)}
              value={form.otherTrades}
              onChange={(v) => set("otherTrades", v)}
              render={(x) => t.trades[x]}
            />
          </fieldset>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t.profile.experience} error={errors.experience}>
              {(id, d) => (
                <TextInput id={id} aria-describedby={d} invalid={!!errors.experience} inputMode="numeric" value={form.experience} onChange={(e) => set("experience", e.target.value.replace(/[^\d]/g, ""))} />
              )}
            </Field>
            <Field label={t.profile.expectedWage} hint={t.profile.expectedWageMonthly} error={errors.expectedWage}>
              {(id, d) => (
                <TextInput id={id} aria-describedby={d} invalid={!!errors.expectedWage} inputMode="numeric" value={form.expectedWage} onChange={(e) => set("expectedWage", e.target.value.replace(/[^\d]/g, ""))} />
              )}
            </Field>
          </div>
          <Field label={t.profile.availability}>
            {(id) => (
              <Select id={id} value={form.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
                {AVAILABILITY.map((x) => (
                  <option key={x} value={x}>{t.availability[x]}</option>
                ))}
              </Select>
            )}
          </Field>
          <fieldset>
            <legend className="mb-3 text-base font-semibold">{t.profile.languages}</legend>
            <ChipGroup label={t.profile.languages} options={LANGS} value={form.languages} onChange={(v) => set("languages", v)} render={(l) => DICTS[l].langName} />
          </fieldset>
          <Field label={t.profile.about} optional={t.common.optional}>
            {(id) => (
              <TextArea id={id} value={form.about} maxLength={280} placeholder={t.profile.aboutPlaceholder} onChange={(e) => set("about", e.target.value)} />
            )}
          </Field>
          <Button type="submit" variant="accent" className="w-full text-lg sm:w-auto sm:self-start sm:px-10">
            {t.profile.save}
          </Button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-sm font-semibold text-muted">{t.profile.cardNote}</p>
          <SkillCard worker={preview} />
        </aside>
      </div>
      <Toast toast={toast} />
    </div>
  );
}
