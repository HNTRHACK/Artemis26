"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { TicketCard, useNow, Wage } from "@/components/cards";
import { EmployerSetup } from "@/components/EmployerSetup";
import { Badge, EmptyState, LinkButton, PageTitle, cx } from "@/components/ui";
import { tx, useLang, useT } from "@/lib/i18n";
import { filledCount } from "@/lib/lifecycle";
import { useApp } from "@/lib/store";

export default function EmployerDashboard() {
  const t = useT();
  const lang = useLang();
  const now = useNow();
  const employer = useApp((s) => s.employer);
  const allJobs = useApp((s) => s.jobs);
  const applications = useApp((s) => s.applications);
  const tickets = useApp((s) => s.tickets);
  const [editing, setEditing] = useState(false);

  if (!employer) return <EmployerSetup />;
  if (editing) return <EmployerSetup initial={employer} onDone={() => setEditing(false)} />;

  const jobs = allJobs.filter((j) => j.owner === "local").sort((a, b) => b.postedAt - a.postedAt);
  const appsFor = (id: string) => applications.filter((a) => a.jobId === id && a.status !== "cancelled" && !(a.status === "declined" && a.declinedBy === "worker"));
  const open = jobs.filter((j) => j.status === "open");
  const interested = jobs.reduce((n, j) => n + appsFor(j.id).length, 0);
  const localJobIds = new Set(jobs.map((j) => j.id));
  const myTickets = tickets
    .filter((x) => localJobIds.has(x.jobId))
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((ticket) => ({ ticket, app: applications.find((a) => a.id === ticket.applicationId) }));
  const shortlisted = jobs.reduce((n, j) => n + appsFor(j.id).filter((a) => a.status === "shortlisted").length, 0);

  return (
    <div>
      <PageTitle title={t.employer.title} sub={employer.organisation || employer.name}>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditing(true)} className="min-h-14 rounded-full px-5 font-semibold underline-offset-4 hover:underline">
            {t.common.edit}
          </button>
          <LinkButton href="/employer/post" variant="accent">
            + {t.employerNav.post}
          </LinkButton>
        </div>
      </PageTitle>

      <dl className="mb-10 grid grid-cols-3 border-y-2 border-ink">
        {[
          [t.employer.stats.open, open.length],
          [t.employer.stats.interested, interested],
          [t.employer.stats.shortlisted, shortlisted],
        ].map(([label, n], i) => (
          <div key={String(label)} className={cx("py-5", i > 0 && "border-l-2 border-ink pl-4 sm:pl-6")}>
            <dt className="text-sm text-muted sm:text-base">{label}</dt>
            <dd className="display mt-1 text-4xl tabular-nums sm:text-6xl">{String(n).padStart(2, "0")}</dd>
          </div>
        ))}
      </dl>

      {jobs.length === 0 ? (
        <EmptyState
          title={t.employer.noListings}
          action={<LinkButton href="/employer/post">{t.employer.postFirst}</LinkButton>}
        />
      ) : (
        <ol className="flex flex-col">
          {jobs.map((job, i) => {
            const apps = appsFor(job.id);
            const fresh = apps.filter((a) => now - a.createdAt < 24 * 3_600_000 && a.status === "interested").length;
            return (
              <li key={job.id} className="border-b-2 border-ivory-3 first:border-t-2">
                <Link
                  href={`/employer/jobs/${job.id}`}
                  className="group grid gap-3 py-6 transition-colors hover:bg-ivory-2/60 sm:grid-cols-[3.5rem_1fr_auto] sm:items-center sm:px-3"
                >
                  <span className="font-serif text-2xl text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge tone={job.status === "open" ? "dark" : "danger"}>
                        {job.status === "open" ? t.employer.open : job.status === "cancelled" ? t.appStatus.cancelled : t.employer.closed}
                      </Badge>
                      <Badge>{t.trades[job.trade]}</Badge>
                      {fresh > 0 && <Badge tone="accent">{t.employer.newApplicants(fresh)}</Badge>}
                      <span className="text-sm text-muted">{t.hire.positions(filledCount(applications, job.id), job.workersNeeded)}</span>
                    </div>
                    <h2 className="text-xl font-semibold sm:text-2xl">{tx(job.title, lang)}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={16} aria-hidden /> {t.areas[job.area]}
                      </span>
                      <Wage job={job} />
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <span className="text-lg font-semibold">{t.employer.applicants(apps.length)}</span>
                    <span className="grid size-11 place-items-center rounded-full border-2 border-ink transition-colors group-hover:bg-ink group-hover:text-ivory">
                      <ArrowUpRight size={20} aria-hidden />
                      <span className="sr-only">{t.employer.view}</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      <section aria-labelledby="ticket-history" className="mt-14">
        <h2 id="ticket-history" className="mb-4 border-b-2 border-ink pb-3 text-2xl font-semibold">
          {t.ticket.historyTitle}
        </h2>
        {myTickets.length === 0 ? (
          <EmptyState title={t.ticket.noTicketsEmployer} />
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {myTickets.map(({ ticket, app }) => (
              <li key={ticket.id}>
                <TicketCard ticket={ticket} status={app?.status ?? "confirmed"} href={`/tickets/${ticket.id}`} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
