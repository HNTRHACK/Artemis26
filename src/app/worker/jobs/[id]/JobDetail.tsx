"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Clock, MapPin, ShieldAlert } from "lucide-react";
import { useNow, Wage } from "@/components/cards";
import { Badge, Button, EmptyState, LinkButton } from "@/components/ui";
import { formatDate, tx, useLang, useT } from "@/lib/i18n";
import { distanceKm } from "@/lib/geo";
import { dailyEstimate } from "@/lib/jobs";
import { useApp } from "@/lib/store";

export function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const lang = useLang();
  const now = useNow();
  const job = useApp((s) => s.jobs.find((j) => j.id === id));
  const me = useApp((s) => s.myProfile);
  const app = useApp((s) => (me ? s.applications.find((a) => a.jobId === id && a.workerId === me.id) : undefined));
  const saved = useApp((s) => s.savedJobIds.includes(id));
  const { expressInterest, withdrawInterest, toggleSaved } = useApp.getState();

  if (!job) {
    return (
      <EmptyState
        title={t.common.notFound}
        action={<LinkButton href="/worker/jobs">{t.common.goBack}</LinkButton>}
      />
    );
  }

  const active = app && app.status !== "withdrawn";
  const km = me ? distanceKm(me.area, job.area) : undefined;

  const facts: [string, string][] = [
    [t.job.duration, t.duration[job.duration]],
    [t.job.payment, t.paymentTerm[job.paymentTerm]],
    [t.job.paymentMode, t.paymentMode[job.paymentMode]],
    [t.job.openings, String(job.workersNeeded)],
    [t.job.experience, t.common.years(job.experienceMin)],
  ];

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/worker/jobs" className="mb-6 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
        <ArrowLeft size={20} aria-hidden /> {t.common.back}
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="dark">{t.trades[job.trade]}</Badge>
        {app && <Badge tone={app.status === "shortlisted" ? "success" : app.status === "declined" ? "danger" : "accent"}>{t.appStatus[app.status]}</Badge>}
        <span className="text-sm text-muted">{t.common.postedAgo((now - job.postedAt) / 3_600_000)}</span>
      </div>
      <h1 className="display mt-4 text-4xl sm:text-6xl">{tx(job.title, lang)}</h1>
      <p className="mt-3 text-lg text-muted">
        {t.job.employer}: <span className="font-semibold text-ink">{job.employerName}</span>
      </p>

      {/* Wage first — transparency is the point */}
      <section aria-label={t.job.pay} className="mt-8 rounded-3xl bg-ink p-6 text-ivory sm:p-8">
        <p className="kicker text-mist">{t.job.pay}</p>
        <div className="mt-2 [&_.text-muted]:text-mist">
          <Wage job={job} size="lg" />
        </div>
        {job.wageUnit !== "day" && (
          <p className="mt-2 text-mist">{t.job.estimate(t.common.inr(dailyEstimate(job)))}</p>
        )}
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ivory/15 pt-6 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-mist">{k}</dt>
              <dd className="text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="flex gap-3 rounded-2xl bg-white/60 p-4">
          <MapPin className="mt-1 shrink-0" size={20} aria-hidden />
          <div>
            <p className="text-sm text-muted">{t.job.location}</p>
            <p className="font-semibold">{t.areas[job.area]}</p>
            <p className="text-sm">{tx(job.address, lang)}</p>
            {km !== undefined && <p className="text-sm text-muted">{t.common.kmAway(km)}</p>}
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl bg-white/60 p-4">
          <Clock className="mt-1 shrink-0" size={20} aria-hidden />
          <div>
            <p className="text-sm text-muted">{t.job.hours}</p>
            <p className="font-semibold tabular-nums">{job.hours}</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl bg-white/60 p-4">
          <CalendarDays className="mt-1 shrink-0" size={20} aria-hidden />
          <div>
            <p className="text-sm text-muted">{t.job.start}</p>
            <p className="font-semibold">{formatDate(job.startDate, lang)}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">{t.job.about}</h2>
        <p className="mt-3 text-lg leading-relaxed">{tx(job.description, lang)}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">{t.job.benefits}</h2>
        {job.benefits.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {job.benefits.map((b) => (
              <li key={b} className="rounded-full bg-marigold/30 px-4 py-2 font-medium">
                ✓ {t.benefits[b]}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-muted">{t.job.noBenefits}</p>
        )}
      </section>

      <p className="mt-10 flex gap-3 rounded-2xl border-2 border-danger/30 bg-danger/5 p-4 text-base">
        <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={22} aria-hidden />
        {t.job.safety}
      </p>

      {/* Action bar */}
      <div className="sticky bottom-20 z-20 mt-8 rounded-3xl border-2 border-ivory-3 bg-ivory/95 p-4 shadow-lg backdrop-blur md:bottom-6">
        {job.status === "closed" ? (
          <p className="text-center font-semibold text-danger">{t.job.closed}</p>
        ) : !me ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">{t.job.needProfile}</p>
            <LinkButton href="/worker/onboarding" variant="accent">
              {t.job.createProfile}
            </LinkButton>
          </div>
        ) : active ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="status">
              <p className="text-lg font-semibold text-success">✓ {t.job.interestSent}</p>
              <p className="text-sm text-muted">{t.job.interestSentHint}</p>
            </div>
            <Button variant="ghost" className="underline" onClick={() => withdrawInterest(job.id)}>
              {t.job.withdraw}
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button variant="accent" className="flex-1 text-lg" onClick={() => expressInterest(job.id)}>
              {t.job.interested}
            </Button>
            <Button
              variant="secondary"
              aria-pressed={saved}
              aria-label={saved ? t.job.savedLabel : t.job.save}
              title={saved ? t.job.savedLabel : t.job.save}
              className="px-5"
              onClick={() => toggleSaved(job.id)}
            >
              {saved ? <BookmarkCheck aria-hidden /> : <Bookmark aria-hidden />}
              <span className="hidden sm:inline">{saved ? t.job.savedLabel : t.job.save}</span>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
