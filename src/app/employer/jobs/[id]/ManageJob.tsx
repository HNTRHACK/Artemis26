"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowLeft, Lock, MapPin, Ticket as TicketIcon } from "lucide-react";
import { StatusBadge, StatusTimeline, useNow, Wage } from "@/components/cards";
import { Badge, Button, EmptyState, Field, LinkButton, Select, TextArea, TextInput, cx } from "@/components/ui";
import { normalizeIndianMobile } from "@/lib/contact";
import { formatDate, tx, useLang, useT } from "@/lib/i18n";
import { distanceKm } from "@/lib/geo";
import { matchScore } from "@/lib/jobs";
import { filledCount, HIRED, isFilled } from "@/lib/lifecycle";
import { findWorker, useApp } from "@/lib/store";
import { DURATIONS, PAYMENT_MODES, PAYMENT_TERMS, WAGE_UNITS, type Application, type Job, type WorkerProfile } from "@/lib/types";

export function ManageJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const lang = useLang();
  const now = useNow();
  const job = useApp((s) => s.jobs.find((j) => j.id === id && j.owner === "local"));
  const applications = useApp((s) => s.applications);
  const me = useApp((s) => s.myProfile);
  const { setJobStatus, cancelJob } = useApp.getState();

  if (!job) {
    return <EmptyState title={t.common.notFound} action={<LinkButton href="/employer">{t.common.goBack}</LinkButton>} />;
  }

  const ORDER: Application["status"][] = ["offered", "confirmed", "in_progress", "shortlisted", "interested", "completed", "declined", "cancelled"];
  const apps = applications
    .filter((a) => a.jobId === job.id)
    .map((a) => ({ app: a, worker: findWorker(a.workerId, me) }))
    .filter((x): x is { app: Application; worker: WorkerProfile } => !!x.worker)
    .sort((a, b) => ORDER.indexOf(a.app.status) - ORDER.indexOf(b.app.status) || matchScore(b.worker, job) - matchScore(a.worker, job));

  const filled = filledCount(applications, job.id);
  const activeCount = apps.filter((a) => a.app.status !== "cancelled" && a.app.status !== "declined").length;

  const facts: [string, string][] = [
    [t.job.duration, t.duration[job.duration]],
    [t.job.payment, t.paymentTerm[job.paymentTerm]],
    [t.job.paymentMode, t.paymentMode[job.paymentMode]],
    [t.job.openings, String(job.workersNeeded)],
    [t.job.start, formatDate(job.startDate, lang)],
    [t.job.hours, job.hours],
  ];

  return (
    <div>
      <Link href="/employer" className="mb-6 inline-flex min-h-11 items-center gap-2 font-semibold hover:underline">
        <ArrowLeft size={20} aria-hidden /> {t.employerNav.listings}
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={job.status === "open" ? "dark" : "danger"}>
              {job.status === "open" ? t.employer.open : job.status === "cancelled" ? t.appStatus.cancelled : t.employer.closed}
            </Badge>
            <Badge>{t.trades[job.trade]}</Badge>
            <span className="text-sm text-muted">{t.common.postedAgo((now - job.postedAt) / 3_600_000)}</span>
          </div>
          <h1 className="display mt-4 text-4xl sm:text-5xl">{tx(job.title, lang)}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <MapPin size={18} aria-hidden /> {t.areas[job.area]} · {tx(job.address, lang)}
          </p>

          {/* capacity */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between text-sm font-semibold">
              <span data-capacity>{t.hire.positions(filled, job.workersNeeded)}</span>
              {filled >= job.workersNeeded && <span className="text-success">{t.hire.full}</span>}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-ivory-3">
              <div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${Math.min(100, (filled / job.workersNeeded) * 100)}%` }} />
            </div>
          </div>

          <section className="mt-10" aria-labelledby="applicants">
            <h2 id="applicants" className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-3 text-2xl font-semibold">
              {t.manage.applicants}
              <span className="font-serif text-3xl tabular-nums">{String(activeCount).padStart(2, "0")}</span>
            </h2>
            {apps.length === 0 ? (
              <p className="py-6 text-lg text-muted">{t.manage.noApplicants}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {apps.map(({ app, worker }) => (
                  <ApplicantCard key={app.id} app={app} worker={worker} job={job} />
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl bg-ink p-6 text-ivory">
            <p className="kicker text-mist">{t.job.pay}</p>
            <div className="mt-2 [&_.text-muted]:text-mist">
              <Wage job={job} size="lg" />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ivory/15 pt-5">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-mist">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {job.status === "closed" && <p className="rounded-2xl bg-danger/10 p-4 font-semibold text-danger">{t.manage.listingClosed}</p>}
          {job.status === "cancelled" ? (
            <p className="rounded-2xl bg-danger/10 p-4 font-semibold text-danger">{t.hire.jobCancelled}</p>
          ) : (
            <>
              <LinkButton href={`/employer/jobs/${job.id}/edit`} variant="secondary">
                {t.manage.edit}
              </LinkButton>
              {job.status === "open" ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (window.confirm(t.manage.closeConfirm)) setJobStatus(job.id, "closed");
                  }}
                >
                  {t.manage.close}
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setJobStatus(job.id, "open")}>
                  {t.manage.reopen}
                </Button>
              )}
              <Button
                variant="ghost"
                className="text-danger underline"
                onClick={() => {
                  if (window.confirm(t.hire.confirmCancelJob)) cancelJob(job.id);
                }}
              >
                {t.hire.cancelJob}
              </Button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

function ApplicantCard({ app, worker: w, job }: { app: Application; worker: WorkerProfile; job: Job }) {
  const t = useT();
  const lang = useLang();
  const applications = useApp((s) => s.applications);
  const { employerMove, withdrawOffer, respondToOffer } = useApp.getState();
  const [offering, setOffering] = useState(false);
  const [error, setError] = useState("");
  const score = matchScore(w, job);
  const ended = app.status === "cancelled" || app.status === "declined";
  const hired = HIRED.includes(app.status);
  const isSample = w.owner === "seed";
  const canOffer = (app.status === "interested" || app.status === "shortlisted") && job.status === "open";

  function confirmMove(to: "in_progress" | "completed" | "cancelled", message: string) {
    if (window.confirm(message)) employerMove(app.id, to);
  }

  return (
    <li className={cx("rounded-3xl border-2 bg-white/55 p-5", app.status === "offered" ? "border-marigold" : "border-ivory-3", ended && "opacity-70")} data-applicant={w.name}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold">
            {w.name}
            {w.owner === "local" && <span className="ml-2 text-sm font-normal text-muted">{t.manage.demoYou}</span>}
          </p>
          <p className="text-muted">
            {t.trades[w.trade]} · {t.common.years(w.experience)} · {t.areas[w.area]} ({t.common.kmAway(distanceKm(w.area, job.area))})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {score >= 70 && !ended && <Badge tone="accent">{t.workersBrowse.match}</Badge>}
          <StatusBadge status={app.status} />
        </div>
      </div>
      {w.about && <p className="mt-3">{w.about}</p>}
      <p className="mt-2 text-sm text-muted">
        {t.workersBrowse.expects(t.common.inr(w.expectedWage))} · {t.availability[w.availability]} · {formatDate(app.createdAt, lang)}
      </p>

      {app.status === "offered" && app.offer && (
        <p className="mt-3 rounded-2xl bg-marigold/20 p-3 text-sm font-medium">
          {t.offer.title}: {t.common.inr(app.offer.wage)} {t.wageUnit[app.offer.wageUnit]} · {formatDate(app.offer.startDate, lang)}
        </p>
      )}

      {/* contact is locked until hire */}
      {!hired && !ended && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <Lock size={14} aria-hidden /> {t.hire.contactLocked}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {canOffer && !offering && (
          <Button variant="accent" className="min-h-12" onClick={() => setOffering(true)}>
            {t.hire.offer}
          </Button>
        )}
        {app.status === "interested" && (
          <Button variant="secondary" className="min-h-12" onClick={() => employerMove(app.id, "shortlisted")}>
            ✓ {t.manage.shortlist}
          </Button>
        )}
        {(app.status === "interested" || app.status === "shortlisted") && (
          <Button variant="ghost" className="min-h-12" onClick={() => employerMove(app.id, "declined")}>
            {t.manage.decline}
          </Button>
        )}
        {app.status === "shortlisted" && (
          <Button variant="ghost" className="min-h-12 underline" onClick={() => employerMove(app.id, "interested")}>
            {t.manage.restore}
          </Button>
        )}
        {app.status === "declined" && app.declinedBy === "employer" && (
          <Button variant="ghost" className="min-h-12 underline" onClick={() => employerMove(app.id, "interested")}>
            {t.manage.restore}
          </Button>
        )}
        {app.status === "offered" && (
          <Button variant="ghost" className="min-h-12 underline" onClick={() => withdrawOffer(app.id)}>
            {t.hire.withdrawOffer}
          </Button>
        )}
        {hired && app.ticketId && (
          <LinkButton href={`/tickets/${app.ticketId}`} className="min-h-12">
            <TicketIcon size={18} aria-hidden /> {t.hire.viewTicket}
          </LinkButton>
        )}
        {app.status === "confirmed" && (
          <Button variant="accent" className="min-h-12" onClick={() => confirmMove("in_progress", t.hire.confirmStart)}>
            {t.hire.start}
          </Button>
        )}
        {app.status === "in_progress" && (
          <Button variant="accent" className="min-h-12" onClick={() => confirmMove("completed", t.hire.confirmComplete)}>
            {t.hire.complete}
          </Button>
        )}
        {(app.status === "confirmed" || app.status === "in_progress") && (
          <Button variant="ghost" className="min-h-12 text-danger underline" onClick={() => confirmMove("cancelled", t.hire.confirmCancelHire)}>
            {t.hire.cancelHire}
          </Button>
        )}
      </div>

      {/* Sample workers can't respond themselves — clearly labelled demo controls */}
      {app.status === "offered" && isSample && (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-ink/25 p-4">
          <p className="text-sm text-muted">{t.hire.simulateNote}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-12"
              onClick={() => {
                const r = respondToOffer(app.id, true, true, "simulated");
                setError(r.ok ? "" : t.offer.blocked[r.reason]);
              }}
              disabled={isFilled(job, applications)}
            >
              {t.hire.simulateAccept}
            </Button>
            <Button variant="ghost" className="min-h-12" onClick={() => respondToOffer(app.id, false, false, "simulated")}>
              {t.hire.simulateDecline}
            </Button>
          </div>
        </div>
      )}

      {offering && <OfferForm app={app} job={job} worker={w} onDone={() => setOffering(false)} />}

      {error && (
        <p role="alert" className="mt-3 font-semibold text-danger">
          {error}
        </p>
      )}

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold">{t.hire.history}</summary>
        <div className="mt-3">
          <StatusTimeline history={app.history} />
        </div>
      </details>
    </li>
  );
}

/** Offer terms, prefilled from the listing. Snapshotted into the ticket when accepted. */
function OfferForm({ app, job, worker, onDone }: { app: Application; job: Job; worker: WorkerProfile; onDone: () => void }) {
  const t = useT();
  const employer = useApp((s) => s.employer);
  const sendOffer = useApp((s) => s.sendOffer);
  const [f, setF] = useState({
    wage: String(job.wage),
    wageUnit: job.wageUnit,
    startDate: job.startDate,
    hours: job.hours,
    duration: job.duration,
    paymentTerm: job.paymentTerm,
    paymentMode: job.paymentMode,
    tools: "",
    instructions: "",
    consent: false,
  });
  const [errors, setErrors] = useState<{ wage?: string; startDate?: string; consent?: string; phone?: string }>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!(Number(f.wage) > 0)) next.wage = t.offerForm.errWage;
    if (!f.startDate) next.startDate = t.offerForm.errDate;
    if (!f.consent) next.consent = t.offerForm.errConsent;
    if (!normalizeIndianMobile(employer?.phone)) next.phone = t.offerForm.needPhone;
    setErrors(next);
    if (Object.keys(next).length) return;
    const r = sendOffer(app.id, {
      wage: Math.round(Number(f.wage)),
      wageUnit: f.wageUnit,
      startDate: f.startDate,
      hours: f.hours.trim() || "—",
      duration: f.duration,
      paymentTerm: f.paymentTerm,
      paymentMode: f.paymentMode,
      tools: f.tools.trim(),
      instructions: f.instructions.trim(),
      employerConsent: true,
    });
    if (r.ok) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-5 rounded-3xl border-2 border-ink bg-ivory p-5" aria-label={t.offerForm.title}>
      <div>
        <h3 className="text-2xl font-semibold">{t.offerForm.title}</h3>
        <p className="text-muted">
          {t.offerForm.to(worker.name)} · {t.offerForm.intro}
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.jobForm.wage} error={errors.wage}>
          {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.wage} inputMode="numeric" value={f.wage} onChange={(e) => set("wage", e.target.value.replace(/[^\d]/g, ""))} />}
        </Field>
        <Field label={t.jobForm.wageUnit}>
          {(id) => (
            <Select id={id} value={f.wageUnit} onChange={(e) => set("wageUnit", e.target.value as typeof f.wageUnit)}>
              {WAGE_UNITS.map((x) => <option key={x} value={x}>{t.wageUnit[x]}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t.jobForm.paymentTerm}>
          {(id) => (
            <Select id={id} value={f.paymentTerm} onChange={(e) => set("paymentTerm", e.target.value as typeof f.paymentTerm)}>
              {PAYMENT_TERMS.map((x) => <option key={x} value={x}>{t.paymentTerm[x]}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t.jobForm.paymentMode}>
          {(id) => (
            <Select id={id} value={f.paymentMode} onChange={(e) => set("paymentMode", e.target.value as typeof f.paymentMode)}>
              {PAYMENT_MODES.map((x) => <option key={x} value={x}>{t.paymentMode[x]}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t.jobForm.startDate} error={errors.startDate}>
          {(id, d) => <TextInput id={id} aria-describedby={d} invalid={!!errors.startDate} type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} />}
        </Field>
        <Field label={t.jobForm.hours}>
          {(id) => <TextInput id={id} value={f.hours} maxLength={40} onChange={(e) => set("hours", e.target.value)} />}
        </Field>
        <Field label={t.jobForm.duration}>
          {(id) => (
            <Select id={id} value={f.duration} onChange={(e) => set("duration", e.target.value as typeof f.duration)}>
              {DURATIONS.map((x) => <option key={x} value={x}>{t.duration[x]}</option>)}
            </Select>
          )}
        </Field>
      </div>
      <Field label={t.offerForm.tools} optional={t.common.optional}>
        {(id) => <TextInput id={id} value={f.tools} maxLength={120} placeholder={t.offerForm.toolsPlaceholder} onChange={(e) => set("tools", e.target.value)} />}
      </Field>
      <Field label={t.offerForm.instructions} optional={t.common.optional}>
        {(id) => <TextArea id={id} value={f.instructions} maxLength={300} placeholder={t.offerForm.instructionsPlaceholder} onChange={(e) => set("instructions", e.target.value)} />}
      </Field>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white/70 p-4 font-medium">
        <input type="checkbox" className="mt-1 size-6 shrink-0 accent-ink" checked={f.consent} onChange={(e) => set("consent", e.target.checked)} />
        {t.offerForm.consent}
      </label>
      {(errors.consent || errors.phone) && (
        <div role="alert" className="flex flex-col gap-1 font-semibold text-danger">
          {errors.consent && <p>⚠ {errors.consent}</p>}
          {errors.phone && (
            <p>
              ⚠ {errors.phone}{" "}
              <Link href="/employer" className="underline">
                {t.common.edit}
              </Link>
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="accent">
          {t.offerForm.send}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t.common.cancel}
        </Button>
      </div>
    </form>
  );
}
