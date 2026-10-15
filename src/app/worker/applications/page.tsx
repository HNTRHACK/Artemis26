"use client";

import { useState } from "react";
import { JobCard } from "@/components/cards";
import { EmptyState, LinkButton, PageTitle, cx } from "@/components/ui";
import { formatDate, useLang, useT } from "@/lib/i18n";
import { distanceKm } from "@/lib/geo";
import { useApp } from "@/lib/store";

export default function ApplicationsPage() {
  const t = useT();
  const lang = useLang();
  const [tab, setTab] = useState<"applied" | "saved">("applied");
  const jobs = useApp((s) => s.jobs);
  const me = useApp((s) => s.myProfile);
  const applications = useApp((s) => s.applications);
  const savedJobIds = useApp((s) => s.savedJobIds);

  const mine = me
    ? applications
        .filter((a) => a.workerId === me.id)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((a) => ({ app: a, job: jobs.find((j) => j.id === a.jobId) }))
        .filter((x) => x.job)
    : [];
  const saved = savedJobIds.map((id) => jobs.find((j) => j.id === id)).filter((j) => j !== undefined);

  const tabs = [
    { id: "applied" as const, label: t.applications.applied, count: mine.length },
    { id: "saved" as const, label: t.applications.saved, count: saved.length },
  ];

  return (
    <div>
      <PageTitle title={t.applications.title} />
      <div role="tablist" aria-label={t.applications.title} className="mb-8 inline-flex rounded-full bg-ivory-2 p-1">
        {tabs.map((x) => (
          <button
            key={x.id}
            role="tab"
            type="button"
            id={`tab-${x.id}`}
            aria-selected={tab === x.id}
            aria-controls={`panel-${x.id}`}
            onClick={() => setTab(x.id)}
            className={cx(
              "min-h-12 rounded-full px-6 text-base font-semibold transition-colors",
              tab === x.id ? "bg-ink text-ivory" : "text-ink",
            )}
          >
            {x.label} <span className="opacity-70">({x.count})</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "applied" &&
          (mine.length === 0 ? (
            <EmptyState
              title={t.applications.emptyApplied}
              action={<LinkButton href="/worker/jobs">{t.applications.findJobs}</LinkButton>}
            />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {mine.map(({ app, job }) => (
                <li key={app.id} className="flex flex-col gap-2">
                  <JobCard
                    job={job!}
                    km={me ? distanceKm(me.area, job!.area) : undefined}
                    href={`/worker/jobs/${job!.id}`}
                    status={app.status}
                  />
                  <p className="px-2 text-sm text-muted">{t.applications.sentOn(formatDate(app.createdAt, lang))}</p>
                </li>
              ))}
            </ul>
          ))}
        {tab === "saved" &&
          (saved.length === 0 ? (
            <EmptyState
              title={t.applications.emptySaved}
              action={<LinkButton href="/worker/jobs">{t.applications.findJobs}</LinkButton>}
            />
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {saved.map((job) => (
                <li key={job.id}>
                  <JobCard job={job} km={me ? distanceKm(me.area, job.area) : undefined} href={`/worker/jobs/${job.id}`} saved />
                </li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}
