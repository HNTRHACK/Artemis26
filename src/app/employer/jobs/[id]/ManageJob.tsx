"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { statusTone, useNow, Wage } from "@/components/cards";
import { Badge, Button, EmptyState, LinkButton, cx } from "@/components/ui";
import { formatDate, tx, useLang, useT } from "@/lib/i18n";
import { distanceKm } from "@/lib/geo";
import { matchScore } from "@/lib/jobs";
import { findWorker, useApp } from "@/lib/store";

export function ManageJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useT();
  const lang = useLang();
  const now = useNow();
  const job = useApp((s) => s.jobs.find((j) => j.id === id && j.owner === "local"));
  const applications = useApp((s) => s.applications);
  const me = useApp((s) => s.myProfile);
  const { setJobStatus, setApplicationStatus } = useApp.getState();

  if (!job) {
    return <EmptyState title={t.common.notFound} action={<LinkButton href="/employer">{t.common.goBack}</LinkButton>} />;
  }

  const apps = applications
    .filter((a) => a.jobId === job.id)
    .map((a) => ({ app: a, worker: findWorker(a.workerId, me) }))
    .filter((x) => x.worker)
    .sort((a, b) => matchScore(b.worker!, job) - matchScore(a.worker!, job));

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
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={job.status === "open" ? "dark" : "danger"}>{job.status === "open" ? t.employer.open : t.employer.closed}</Badge>
            <Badge>{t.trades[job.trade]}</Badge>
            <span className="text-sm text-muted">{t.common.postedAgo((now - job.postedAt) / 3_600_000)}</span>
          </div>
          <h1 className="display mt-4 text-4xl sm:text-5xl">{tx(job.title, lang)}</h1>
          <p className="mt-3 flex items-center gap-2 text-muted">
            <MapPin size={18} aria-hidden /> {t.areas[job.area]} · {tx(job.address, lang)}
          </p>

          <section className="mt-10" aria-labelledby="applicants">
            <h2 id="applicants" className="mb-4 flex items-baseline justify-between border-b-2 border-ink pb-3 text-2xl font-semibold">
              {t.manage.applicants}
              <span className="font-serif text-3xl tabular-nums">{String(apps.filter((a) => a.app.status !== "withdrawn").length).padStart(2, "0")}</span>
            </h2>
            {apps.length === 0 ? (
              <p className="py-6 text-lg text-muted">{t.manage.noApplicants}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {apps.map(({ app, worker }) => {
                  const w = worker!;
                  const score = matchScore(w, job);
                  const withdrawn = app.status === "withdrawn";
                  return (
                    <li key={app.id} className={cx("rounded-3xl border-2 border-ivory-3 bg-white/55 p-5", withdrawn && "opacity-60")}>
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
                          {score >= 70 && <Badge tone="accent">{t.workersBrowse.match}</Badge>}
                          <Badge tone={statusTone(app.status)}>{withdrawn ? t.manage.withdrawnNote : t.appStatus[app.status]}</Badge>
                        </div>
                      </div>
                      {w.about && <p className="mt-3">{w.about}</p>}
                      <p className="mt-2 text-sm text-muted">
                        {t.workersBrowse.expects(t.common.inr(w.expectedWage))} · {t.availability[w.availability]} · {formatDate(app.createdAt, lang)}
                      </p>
                      {!withdrawn && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <a
                            href={`tel:${w.phone}`}
                            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-ivory hover:bg-ink-3"
                          >
                            <Phone size={18} aria-hidden /> {t.manage.call} <span className="tabular-nums opacity-80">{w.phone}</span>
                          </a>
                          {app.status === "interested" && (
                            <>
                              <Button variant="accent" className="min-h-12" onClick={() => setApplicationStatus(app.id, "shortlisted")}>
                                ✓ {t.manage.shortlist}
                              </Button>
                              <Button variant="ghost" className="min-h-12" onClick={() => setApplicationStatus(app.id, "declined")}>
                                {t.manage.decline}
                              </Button>
                            </>
                          )}
                          {(app.status === "shortlisted" || app.status === "declined") && (
                            <Button variant="ghost" className="min-h-12 underline" onClick={() => setApplicationStatus(app.id, "interested")}>
                              {t.manage.restore}
                            </Button>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
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
        </aside>
      </div>
    </div>
  );
}
