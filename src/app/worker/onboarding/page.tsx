"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, ChoiceGrid, Field, TextInput, cx } from "@/components/ui";
import { VoiceGuide } from "@/components/VoiceGuide";
import { DICTS, LANGS, useT } from "@/lib/i18n";
import { useApp } from "@/lib/store";
import { AREAS, TRADES, type Area, type Lang, type Trade } from "@/lib/types";

const EXP_VALUES = [0, 1, 3, 5, 10] as const;
const TOTAL = 5;

export default function Onboarding() {
  const t = useT();
  const router = useRouter();
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  const existing = useApp((s) => s.myProfile);
  const saveMyProfile = useApp((s) => s.saveMyProfile);

  const [step, setStep] = useState(1);
  const [trade, setTrade] = useState<Trade | null>(existing?.trade ?? null);
  const [area, setArea] = useState<Area | null>(existing?.area ?? null);
  const [exp, setExp] = useState<number | null>(existing ? closestExp(existing.experience) : null);
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const canContinue =
    (step === 1) || (step === 2 && trade) || (step === 3 && area) || (step === 4 && exp !== null) || step === 5;

  function finish() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = t.profile.errName;
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) next.phone = t.profile.errPhone;
    setErrors(next);
    if (Object.keys(next).length) return;
    saveMyProfile({
      name: name.trim(),
      phone: digits,
      trade: trade!,
      area: area!,
      experience: exp!,
      otherTrades: existing?.otherTrades ?? [],
      expectedWage: existing?.expectedWage ?? 800,
      availability: existing?.availability ?? "now",
      languages: existing?.languages ?? [lang],
      about: existing?.about ?? "",
    });
    router.push("/worker/jobs");
  }

  const titles = [
    [t.onboarding.langTitle, t.onboarding.langHint],
    [t.onboarding.tradeTitle, t.onboarding.tradeHint],
    [t.onboarding.areaTitle, t.onboarding.areaHint],
    [t.onboarding.expTitle, t.onboarding.expHint],
    [t.onboarding.nameTitle, t.onboarding.nameHint],
  ];
  const [title, hint] = titles[step - 1];

  return (
    <div className="mx-auto max-w-2xl">
      {/* progress */}
      <div className="mb-8 flex items-center gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-ink/20 hover:border-ink"
            aria-label={t.common.back}
          >
            <ArrowLeft size={22} aria-hidden />
          </button>
        ) : (
          <span className="size-12 shrink-0" />
        )}
        <div className="flex-1">
          <p className="mb-2 text-sm font-semibold text-muted">{t.onboarding.step(step, TOTAL)}</p>
          <div
            className="flex gap-1.5"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-valuenow={step}
            aria-label={t.onboarding.step(step, TOTAL)}
          >
            {Array.from({ length: TOTAL }, (_, i) => (
              <span
                key={i}
                className={cx("h-1.5 flex-1 rounded-full transition-colors", i < step ? "bg-ink" : "bg-ivory-3")}
              />
            ))}
          </div>
        </div>
      </div>

      <h1 className="display text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-3 mb-4 text-lg text-muted">{hint}</p>
      {step === 1 && <VoiceGuide guide="onboarding" className="mb-8" />}
      {step > 1 && <div className="mb-8" />}

      <div key={step} className="fade-up">
        {step === 1 && (
          <ChoiceGrid<Lang>
            label={t.onboarding.langTitle}
            options={LANGS}
            value={lang}
            onChange={setLang}
            columns="grid-cols-1"
            render={(l) => (
              <span lang={l} className="text-2xl">
                {DICTS[l].langName}
              </span>
            )}
          />
        )}
        {step === 2 && (
          <ChoiceGrid<Trade>
            label={t.onboarding.tradeTitle}
            options={TRADES}
            value={trade}
            onChange={setTrade}
            columns="grid-cols-1 sm:grid-cols-2"
            render={(v) => t.trades[v]}
          />
        )}
        {step === 3 && (
          <ChoiceGrid<Area>
            label={t.onboarding.areaTitle}
            options={AREAS}
            value={area}
            onChange={setArea}
            columns="grid-cols-1 sm:grid-cols-2"
            render={(v) => t.areas[v]}
          />
        )}
        {step === 4 && (
          <ChoiceGrid<number>
            label={t.onboarding.expTitle}
            options={EXP_VALUES}
            value={exp}
            onChange={setExp}
            columns="grid-cols-1"
            render={(v) => t.onboarding.expOptions[v]}
          />
        )}
        {step === 5 && (
          <div className="flex flex-col gap-6">
            <Field label={t.onboarding.nameLabel} error={errors.name}>
              {(id, d) => (
                <TextInput
                  id={id}
                  aria-describedby={d}
                  value={name}
                  invalid={!!errors.name}
                  autoComplete="name"
                  onChange={(e) => setName(e.target.value)}
                />
              )}
            </Field>
            <Field label={t.onboarding.phoneLabel} hint={`${t.onboarding.phoneHint} ${t.phoneDemoHint}`} error={errors.phone}>
              {(id, d) => (
                <TextInput
                  id={id}
                  aria-describedby={d}
                  value={phone}
                  invalid={!!errors.phone}
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={14}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
            </Field>
          </div>
        )}
      </div>

      <div className="sticky bottom-4 mt-10 md:static">
        {step < TOTAL ? (
          <Button className="w-full text-lg" disabled={!canContinue} onClick={() => setStep(step + 1)}>
            {t.common.continue} →
          </Button>
        ) : (
          <Button className="w-full text-lg" variant="accent" onClick={finish}>
            {t.onboarding.done} →
          </Button>
        )}
      </div>
    </div>
  );
}

function closestExp(years: number) {
  return [...EXP_VALUES].reverse().find((v) => years >= v) ?? 0;
}
