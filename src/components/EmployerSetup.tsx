"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { Button, Field, TextInput } from "./ui";

/** One-time employer identity, shown on every listing. */
export function EmployerSetup() {
  const t = useT();
  const setEmployer = useApp((s) => s.setEmployer);
  const [f, setF] = useState({ name: "", organisation: "", phone: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!f.name.trim()) next.name = t.profile.errName;
    if (f.phone.replace(/\D/g, "").length !== 10) next.phone = t.profile.errPhone;
    setErrors(next);
    if (Object.keys(next).length) return;
    setEmployer({ name: f.name.trim(), organisation: f.organisation.trim(), phone: f.phone.replace(/\D/g, "") });
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="display text-4xl sm:text-5xl">{t.employer.setupTitle}</h1>
      <p className="mt-3 mb-8 text-lg text-muted">{t.employer.setupHint}</p>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        <Field label={t.employer.name} error={errors.name}>
          {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.name} value={f.name} autoComplete="name" onChange={(e) => setF({ ...f, name: e.target.value })} />}
        </Field>
        <Field label={t.employer.organisation} optional={t.common.optional}>
          {(id) => <TextInput id={id} value={f.organisation} placeholder="Shree Ganesh Constructions" autoComplete="organization" onChange={(e) => setF({ ...f, organisation: e.target.value })} />}
        </Field>
        <Field label={t.employer.phone} error={errors.phone}>
          {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.phone} value={f.phone} inputMode="numeric" maxLength={14} autoComplete="tel-national" onChange={(e) => setF({ ...f, phone: e.target.value })} />}
        </Field>
        <Button type="submit" variant="accent" className="text-lg">
          {t.employer.startHiring} →
        </Button>
      </form>
    </div>
  );
}
