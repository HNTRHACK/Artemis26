"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Bookmark, BookmarkCheck, CalendarDays, Clock, MapPin, ShieldAlert, Ticket as TicketIcon } from "lucide-react";
import { StatusBadge, useNow, Wage } from "@/components/cards";
import { Badge, Button, EmptyState, LinkButton } from "@/components/ui";
import { VoiceGuide } from "@/components/VoiceGuide";
import { formatDate, formatDateLong, tx, useLang, useT } from "@/lib/i18n";
import { distanceKm } from "@/lib/geo";
import { dailyEstimate } from "@/lib/jobs";
import { acceptBlockReason, HIRED, isFilled } from "@/lib/lifecycle";
import { useApp, type Result } from "@/lib/store";
import type { Application, Job } from "@/lib/types";

export function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const lang = useLang();
  const now = useNow();
  const job = useApp((s) => s.jobs.find((j) => j.id === id));
  const me = useApp((s) => s.myProfile);
  const applications = useApp((s) => s.applications);
  const saved = useApp((s) => s.savedJobIds.includes(id));
  const { expressInterest, withdrawInterest, toggleSaved } = useApp.getState();
  const [error, setError] = useState("");

  if (!job) {
    return <EmptyState title={t.common.notFound} action={<LinkButton href="/worker/jobs">{t.common.goBack}</LinkButton>} />;
  }

  const app = me ? applications.find((a) => a.jobId === id && a.workerId === me.id) : undefined;
  const km = me ? distanceKm(me.area, job.area) : undefined;
  const filled = isFilled(job, applications);
  const canReapply =
    !app ||
    (app.status === "cancelled" && app.cancelledBy === "worker") ||
    (app.status === "declined" && app.declinedBy === "worker");

  const facts: [string, string][] = [
    [t.job.duration, t.duration[job.duration]],
    [t.job.payment, t.paymentTerm[job.paymentTerm]],
    [t.job.paymentMode, t.paymentMode[job.paymentMode]],
    [t.job.openings, String(job.workersNeeded)],
    [t.job.experience, t.common.years(job.experienceMin)],
  ];

  // Structured summary of *this* job for device speech (recorded clips cannot cover every listing).
  const spoken = [
    tx(job.title, lang),
    `${t.job.pay}: ${t.common.inr(job.wage)} ${t.wageUnit[job.wageUnit]}`,
    `${t.job.payment}: ${t.paymentTerm[job.paymentTerm]}, ${t.paymentMode[job.paymentMode]}`,
    `${t.job.duration}: ${t.duration[job.duration]}`,
    `${t.job.location}: ${tx(job.address, lang)}, ${t.areas[job.area]}`,
    `${t.job.start}: ${formatDateLong(job.startDate, lang)}`,
    `${t.job.hours}: ${job.hours}`,
  ].join(". ");

  function apply() {
    const r = expressInterest(job!.id);
    setError(r.ok ? "" : t.offer.blocked[r.reason === "invalid" ? "invalid" : r.reason]);
  }

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/worker/jobs" className="mb-6 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
        <ArrowLeft size={20} aria-hidden /> {t.common.back}
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="dark">{t.trades[job.trade]}</Badge>
        {app && <StatusBadge status={app.status} />}
        {filled && <Badge tone="danger">{t.hire.full}</Badge>}
        <span className="text-sm text-muted">{t.common.postedAgo((now - job.postedAt) / 3_600_000)}</span>
      </div>
      <h1 className="display mt-4 text-4xl sm:text-6xl">{tx(job.title, lang)}</h1>
      <p className="mt-3 text-lg text-muted">
        {t.job.employer}: <span className="font-semibold text-ink">{job.employerName}</span>
      </p>
      {app && <p className="mt-2 font-medium">{t.statusHelp[app.status]}</p>}

      <VoiceGuide guide="job-details" className="mt-6" />

      {app?.status === "offered" && app.offer && <OfferPanel job={job} app={app} />}

      {/* Wage first — transparency is the point */}
      <section aria-label={t.job.pay} className="mt-8 rounded-3xl bg-ink p-6 text-ivory sm:p-8">
        <p className="kicker text-mist">{t.job.pay}</p>
        <div className="mt-2 [&_.text-muted]:text-mist">
          <Wage job={job} size="lg" />
        </div>
        {job.wageUnit !== "day" && <p className="mt-2 text-mist">{t.job.estimate(t.common.inr(dailyEstimate(job)))}</p>}
        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ivory/15 pt-6 sm:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-sm text-mist">{k}</dt>
              <dd className="text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <VoiceGuide guide="payment-terms" tone="dark" className="mt-6" />
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
        <VoiceGuide text={spoken} className="mt-4" />
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

      {/* Action bar — depends on where this worker is in the lifecycle */}
      <div className="sticky bottom-20 z-20 mt-8 rounded-3xl border-2 border-ivory-3 bg-ivory/95 p-4 shadow-lg backdrop-blur md:bottom-6">
        {app && HIRED.includes(app.status) && app.ticketId ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg font-semibold text-success">✓ {t.appStatus[app.status]}</p>
            <LinkButton href={`/tickets/${app.ticketId}`} variant="primary">
              <TicketIcon size={18} aria-hidden /> {t.offer.viewTicket}
            </LinkButton>
          </div>
        ) : app?.status === "offered" ? (
          <a href="#offer" className="block text-center text-lg font-semibold underline-offset-4 hover:underline">
            ↑ {t.workerHome.reviewOffer}
          </a>
        ) : app && (app.status === "interested" || app.status === "shortlisted") ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="status">
              <p className="text-lg font-semibold text-success">✓ {t.job.interestSent}</p>
              <p className="text-sm text-muted">{t.job.interestSentHint}</p>
            </div>
            <Button variant="ghost" className="underline" onClick={() => withdrawInterest(job.id)}>
              {t.job.withdraw}
            </Button>
          </div>
        ) : job.status !== "open" ? (
          <p className="text-center font-semibold text-danger">{job.status === "cancelled" ? t.hire.jobCancelled : t.job.closed}</p>
        ) : !me ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">{t.job.needProfile}</p>
            <LinkButton href="/worker/onboarding" variant="accent">
              {t.job.createProfile}
            </LinkButton>
          </div>
        ) : !canReapply ? (
          <p className="text-center font-semibold">{t.statusHelp[app!.status]}</p>
        ) : filled ? (
          <p className="text-center font-semibold text-danger">{t.offer.blocked.filled}</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Button variant="accent" className="flex-1 text-lg" onClick={apply}>
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
            {error && (
              <p role="alert" className="font-semibold text-danger">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Complete offer terms with consent, accept and decline. */
function OfferPanel({ job, app }: { job: Job; app: Application }) {
  const t = useT();
  const lang = useLang();
  const applications = useApp((s) => s.applications);
  const respondToOffer = useApp((s) => s.respondToOffer);
  const [consent, setConsent] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const offer = app.offer!;
  // Show block reasons (closed / filled) before the worker even tries.
  const blocked = acceptBlockReason(job, app, applications, true);

  const rows: [string, string][] = [
    [t.job.pay, `${t.common.inr(offer.wage)} ${t.wageUnit[offer.wageUnit]}`],
    [t.job.payment, t.paymentTerm[offer.paymentTerm]],
    [t.job.paymentMode, t.paymentMode[offer.paymentMode]],
    [t.job.start, formatDateLong(offer.startDate, lang)],
    [t.job.hours, offer.hours],
    [t.job.duration, t.duration[offer.duration]],
    [t.job.location, `${tx(job.address, lang)}, ${t.areas[job.area]}`],
    [t.offer.tools, offer.tools || t.offer.none],
    [t.offer.instructions, offer.instructions || t.offer.none],
  ];

  function accept() {
    setResult(respondToOffer(app.id, true, consent));
  }
  function decline() {
    if (window.confirm(t.offer.declineConfirm)) setResult(respondToOffer(app.id, false, false));
  }

  const failure = result && !result.ok ? t.offer.blocked[result.reason] : blocked ? t.offer.blocked[blocked] : "";

  return (
    <section id="offer" aria-labelledby="offer-title" className="mt-8 scroll-mt-28 rounded-3xl border-4 border-marigold bg-white p-5 sm:p-7">
      <p className="kicker text-muted">{t.offer.from(job.employerName)}</p>
      <h2 id="offer-title" className="display mt-2 text-4xl">
        {t.offer.title}
      </h2>
      <p className="mt-2 text-muted">{t.offer.intro}</p>
      <VoiceGuide guide="offer-accepted" className="mt-4" />
      <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="border-b border-ivory-3 pb-3">
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="text-lg font-semibold" data-offer-term={k}>
              {v}
            </dd>
          </div>
        ))}
      </dl>
      {!blocked && (
        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-ivory-2 p-4 text-base font-medium">
          <input type="checkbox" className="mt-1 size-6 shrink-0 accent-ink" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          {t.offer.consent}
        </label>
      )}
      {failure && (
        <p role="alert" className="mt-4 font-semibold text-danger">
          {failure}
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" className="flex-1 text-lg" disabled={!!blocked} onClick={accept}>
          ✓ {t.offer.accept}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={decline}>
          {t.offer.decline}
        </Button>
      </div>
    </section>
  );
}
