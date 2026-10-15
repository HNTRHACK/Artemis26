"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { JobCard } from "@/components/cards";
import { Button, EmptyState, Field, LinkButton, PageTitle, Select, cx } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { filterJobs, PAY_STEPS, type JobFilters, type JobSort } from "@/lib/jobs";
import { useApp } from "@/lib/store";
import { AREAS, TRADES, type Area, type Trade } from "@/lib/types";

export default function JobsPage() {
  const t = useT();
  const jobs = useApp((s) => s.jobs);
  const me = useApp((s) => s.myProfile);
  const applications = useApp((s) => s.applications);
  const savedJobIds = useApp((s) => s.savedJobIds);
  const home: Area = me?.area ?? "dadar";

  const [filters, setFilters] = useState<JobFilters>({ trade: "all", area: "all", minPay: 0, sort: "near" });
  const [panelOpen, setPanelOpen] = useState(false);
  const set = (patch: Partial<JobFilters>) => setFilters((f) => ({ ...f, ...patch }));

  const results = useMemo(() => filterJobs(jobs, filters, home), [jobs, filters, home]);
  const myStatus = (jobId: string) =>
    me ? applications.find((a) => a.jobId === jobId && a.workerId === me.id)?.status : undefined;

  const activeCount = (filters.area !== "all" ? 1 : 0) + (filters.minPay > 0 ? 1 : 0) + (filters.sort !== "near" ? 1 : 0);

  const tradeChips: (Trade | "all")[] = me ? ["all", me.trade, ...TRADES.filter((x) => x !== me.trade)] : ["all", ...TRADES];

  return (
    <div>
      <PageTitle title={t.jobs.title} sub={t.jobs.subtitle(t.areas[home])} />

      {!me && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-marigold/25 p-5">
          <p className="max-w-md font-medium">{t.job.needProfile}</p>
          <LinkButton href="/worker/onboarding" variant="primary">
            {t.job.createProfile}
          </LinkButton>
        </div>
      )}

      {/* Trade chips: one tap to narrow by work type */}
      <div
        role="radiogroup"
        aria-label={t.jobs.trade}
        className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
      >
        {tradeChips.map((tr) => {
          const active = filters.trade === tr;
          const label = tr === "all" ? t.common.all : me && tr === me.trade ? `★ ${t.trades[tr]}` : t.trades[tr];
          return (
            <button
              key={tr}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => set({ trade: tr })}
              className={cx(
                "min-h-12 shrink-0 rounded-full border-2 px-5 text-base font-semibold whitespace-nowrap transition-colors",
                active ? "border-ink bg-ink text-ivory" : "border-ivory-3 bg-white/60 hover:border-ink",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-semibold" aria-live="polite">
          {t.jobs.results(results.length)}
        </p>
        <Button
          variant="secondary"
          className="min-h-12"
          aria-expanded={panelOpen}
          aria-controls="job-filters"
          onClick={() => setPanelOpen((o) => !o)}
        >
          <SlidersHorizontal size={18} aria-hidden />
          {t.jobs.filters}
          {activeCount > 0 && (
            <span className="grid size-6 place-items-center rounded-full bg-marigold text-sm text-ink">{activeCount}</span>
          )}
        </Button>
      </div>

      {panelOpen && (
        <div id="job-filters" className="fade-up mb-8 grid gap-5 rounded-3xl border-2 border-ivory-3 bg-white/50 p-5 sm:grid-cols-3">
          <Field label={t.jobs.area}>
            {(id) => (
              <Select id={id} value={filters.area} onChange={(e) => set({ area: e.target.value as Area | "all" })}>
                <option value="all">{t.common.all}</option>
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {t.areas[a]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.jobs.minPay} hint={t.jobs.payNoteMonthly}>
            {(id, d) => (
              <Select
                id={id}
                aria-describedby={d}
                value={filters.minPay}
                onChange={(e) => set({ minPay: Number(e.target.value) })}
              >
                {PAY_STEPS.map((p) => (
                  <option key={p} value={p}>
                    {p === 0 ? t.jobs.anyPay : `${t.common.inr(p)}+ ${t.wageUnitShort.day}`}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label={t.jobs.sort}>
            {(id) => (
              <Select id={id} value={filters.sort} onChange={(e) => set({ sort: e.target.value as JobSort })}>
                <option value="near">{t.jobs.sortNear}</option>
                <option value="pay">{t.jobs.sortPay}</option>
                <option value="new">{t.jobs.sortNew}</option>
              </Select>
            )}
          </Field>
          <div className="sm:col-span-3">
            <Button
              variant="ghost"
              className="min-h-12 underline"
              onClick={() => setFilters({ trade: "all", area: "all", minPay: 0, sort: "near" })}
            >
              {t.jobs.clearFilters}
            </Button>
          </div>
        </div>
      )}

      {results.length === 0 ? (
        <EmptyState
          title={t.jobs.empty}
          hint={t.jobs.emptyHint}
          action={
            <Button variant="secondary" onClick={() => setFilters({ trade: "all", area: "all", minPay: 0, sort: "near" })}>
              {t.jobs.clearFilters}
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {results.map(({ job, km }) => (
            <li key={job.id}>
              <JobCard
                job={job}
                km={km}
                href={`/worker/jobs/${job.id}`}
                status={myStatus(job.id)}
                saved={savedJobIds.includes(job.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
