"use client";

import { Check, MapPin, Phone } from "lucide-react";
import { DICTS, LANGS, useLang, useT } from "@/lib/i18n";
import { cx } from "../ui";

/** Four mock screens for the "From waiting to working" walkthrough. */
export function PhoneScreens({ active }: { active: number }) {
  const t = useT();
  const lang = useLang();
  const screens = [
    // 01 language
    <div key="lang" className="flex h-full flex-col gap-3 p-5">
      <p className="text-[11px] text-ink/60">{t.onboarding.step(1, 5)}</p>
      <p className="text-xl leading-tight font-semibold">{t.onboarding.langTitle}</p>
      <div className="mt-2 flex flex-col gap-2">
        {LANGS.map((l) => (
          <div
            key={l}
            lang={l}
            className={cx(
              "flex items-center justify-between rounded-xl border-2 px-4 py-3 text-lg font-semibold",
              l === lang ? "border-ink bg-ink text-ivory" : "border-ink/15",
            )}
          >
            {DICTS[l].langName}
            {l === lang && <Check size={18} className="text-marigold" />}
          </div>
        ))}
      </div>
    </div>,
    // 02 skill card
    <div key="skill" className="flex h-full flex-col gap-3 p-5">
      <p className="text-xl leading-tight font-semibold">{t.profile.card}</p>
      <div className="rounded-2xl bg-ink p-4 text-ivory">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-marigold text-sm font-bold text-ink">RJ</span>
          <div>
            <p className="font-semibold">Ramesh Jadhav</p>
            <p className="serif-i text-lg leading-none text-marigold">{t.trades.mason}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <p className="text-mist">{t.profile.experience}</p>
            <p className="text-sm font-semibold">{t.common.years(9)}</p>
          </div>
          <div>
            <p className="text-mist">{t.profile.area}</p>
            <p className="text-sm font-semibold">{t.areas.dadar}</p>
          </div>
          <div className="col-span-2">
            <p className="text-mist">{t.profile.otherTrades}</p>
            <p className="text-sm font-semibold">{t.trades.tiler}</p>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-ink/60">{t.profile.selfDeclared}</p>
    </div>,
    // 03 nearby jobs
    <div key="jobs" className="flex h-full flex-col gap-2 p-5">
      <p className="text-xl leading-tight font-semibold">{t.jobs.title}</p>
      {[
        { trade: "mason", area: "dadar", km: 1.5, wage: 950 },
        { trade: "helper", area: "lowerParel", km: 2.6, wage: 700 },
        { trade: "mason", area: "ghatkopar", km: 8.2, wage: 900 },
      ].map((j, i) => (
        <div key={i} className={cx("rounded-xl border-2 p-3", i === 0 ? "border-ink" : "border-ink/15")}>
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-ivory">
              {t.trades[j.trade as "mason"]}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-ink/60">
              <MapPin size={11} /> {t.common.kmAway(j.km)}
            </span>
          </div>
          <p className="mt-1.5 text-lg font-semibold">
            {t.common.inr(j.wage)} <span className="text-[11px] font-normal text-ink/60">{t.wageUnit.day}</span>
          </p>
          <p className="text-[11px] text-ink/60">
            {t.areas[j.area as "dadar"]} · {t.paymentTerm.weekly}
          </p>
        </div>
      ))}
    </div>,
    // 04 connected
    <div key="done" className="flex h-full flex-col gap-3 p-5">
      <div className="grid size-12 place-items-center rounded-full bg-success text-ivory">
        <Check size={24} />
      </div>
      <p className="text-xl leading-tight font-semibold">{t.job.interestSent}</p>
      <p className="text-xs text-ink/70">{t.job.interestSentHint}</p>
      <div className="mt-auto rounded-2xl bg-ink p-4 text-ivory">
        <p className="text-[11px] text-mist">Shree Ganesh Constructions</p>
        <p className="mt-1 inline-block rounded-full bg-marigold px-2 py-0.5 text-xs font-semibold text-ink">
          {t.appStatus.shortlisted}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2 rounded-full bg-ivory py-2 text-sm font-semibold text-ink">
          <Phone size={14} /> {t.manage.call}
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="relative mx-auto aspect-[9/18.5] w-[min(76vw,300px)] rounded-[2.6rem] border border-ivory/20 bg-ink-3 p-2.5 shadow-[0_40px_120px_-30px_rgba(224,163,58,0.35)]">
      <div className="relative h-full overflow-hidden rounded-[2.1rem] bg-ivory text-ink">
        <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold">
          <span>9:41</span>
          <span className="h-5 w-20 rounded-full bg-ink" />
          <span>5G</span>
        </div>
        <div className="flex items-center justify-between px-5 pt-3 pb-1">
          <span className="font-serif text-lg">{t.common.appName}</span>
          <span className="rounded-full border border-ink/20 px-2 py-0.5 text-[10px] font-semibold">{t.common.worker}</span>
        </div>
        <div className="relative h-[calc(100%-4.5rem)]">
          {screens.map((s, i) => (
            <div
              key={i}
              aria-hidden={i !== active}
              className="absolute inset-0 transition-all duration-700 ease-[var(--ease-expo)]"
              style={{
                opacity: i === active ? 1 : 0,
                transform: `translateY(${i === active ? 0 : i < active ? -24 : 24}px)`,
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
