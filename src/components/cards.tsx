"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { tx, useLang, useT } from "@/lib/i18n";
import type { Application, Job, WorkerProfile } from "@/lib/types";
import { Badge, cx } from "./ui";

/** Current time captured once per mount (keeps render pure). */
export function useNow() {
  const [now] = useState(() => Date.now());
  return now;
}

export function Wage({ job, size = "md" }: { job: Pick<Job, "wage" | "wageUnit">; size?: "md" | "lg" }) {
  const t = useT();
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className={cx("font-semibold tracking-tight tabular-nums", size === "lg" ? "text-5xl" : "text-2xl")}>
        {t.common.inr(job.wage)}
      </span>
      <span className={cx("text-muted", size === "lg" ? "text-lg" : "text-sm")}>{t.wageUnit[job.wageUnit]}</span>
    </span>
  );
}

export function statusTone(s: Application["status"]) {
  return s === "shortlisted" ? "success" : s === "declined" ? "danger" : s === "withdrawn" ? "neutral" : "accent";
}

export function JobCard({
  job,
  km,
  href,
  status,
  saved,
}: {
  job: Job;
  km?: number;
  href: string;
  status?: Application["status"];
  saved?: boolean;
}) {
  const t = useT();
  const lang = useLang();
  const now = useNow();
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 rounded-3xl border-2 border-ivory-3 bg-white/55 p-5 transition-colors hover:border-ink sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="dark">{t.trades[job.trade]}</Badge>
        {status && <Badge tone={statusTone(status)}>{t.appStatus[status]}</Badge>}
        {saved && !status && <Badge>{t.job.savedLabel}</Badge>}
        {job.status === "closed" && <Badge tone="danger">{t.employer.closed}</Badge>}
        <span className="ml-auto text-sm text-muted">{t.common.postedAgo((now - job.postedAt) / 3_600_000)}</span>
      </div>
      <div>
        <h2 className="text-xl leading-snug font-semibold sm:text-2xl">{tx(job.title, lang)}</h2>
        <p className="mt-1 text-muted">{job.employerName}</p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <Wage job={job} />
        <span className="flex items-center gap-1.5 text-base font-medium">
          <MapPin size={18} aria-hidden />
          {t.areas[job.area]}
          {km !== undefined && <span className="text-muted">· {t.common.kmAway(km)}</span>}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="rounded-full bg-ivory-2 px-3 py-1">{t.duration[job.duration]}</span>
        <span className="rounded-full bg-ivory-2 px-3 py-1">{t.paymentTerm[job.paymentTerm]}</span>
        <span className="rounded-full bg-ivory-2 px-3 py-1">{t.common.openings(job.workersNeeded)}</span>
      </div>
      <ArrowUpRight
        aria-hidden
        className="absolute top-5 right-5 hidden opacity-0 transition-opacity group-hover:opacity-100 sm:block"
        size={22}
      />
    </Link>
  );
}

/** The portable "skill identity" card — what employers see. */
export function SkillCard({ worker, phone, className }: { worker: WorkerProfile; phone?: boolean; className?: string }) {
  const t = useT();
  const initials = worker.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <article className={cx("relative overflow-hidden rounded-3xl bg-ink p-6 text-ivory", className)}>
      <div aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full border border-ivory/10" />
      <div aria-hidden className="absolute -top-8 -right-8 size-32 rounded-full border border-ivory/10" />
      <div className="relative flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-full bg-marigold text-lg font-bold text-ink">
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <p className="kicker text-mist">{t.profile.card}</p>
          <h3 className="truncate text-2xl font-semibold">{worker.name || "—"}</h3>
          <p className="serif-i text-2xl text-marigold">{t.trades[worker.trade]}</p>
        </div>
      </div>
      <dl className="relative mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-mist">{t.profile.experience}</dt>
          <dd className="text-base font-semibold">{t.common.years(worker.experience)}</dd>
        </div>
        <div>
          <dt className="text-mist">{t.profile.area}</dt>
          <dd className="text-base font-semibold">{t.areas[worker.area]}</dd>
        </div>
        <div>
          <dt className="text-mist">{t.profile.availability}</dt>
          <dd className="text-base font-semibold">{t.availability[worker.availability]}</dd>
        </div>
        <div>
          <dt className="text-mist">{t.profile.languages}</dt>
          <dd className="text-base font-semibold">
            {worker.languages.map((l) => ({ en: "English", hi: "हिन्दी", mr: "मराठी" })[l]).join(", ") || "—"}
          </dd>
        </div>
        {worker.otherTrades.length > 0 && (
          <div className="col-span-2">
            <dt className="text-mist">{t.profile.otherTrades}</dt>
            <dd className="text-base font-semibold">{worker.otherTrades.map((o) => t.trades[o]).join(", ")}</dd>
          </div>
        )}
        {phone && (
          <div className="col-span-2">
            <dt className="text-mist">{t.profile.phone}</dt>
            <dd className="text-base font-semibold tabular-nums">{worker.phone || "—"}</dd>
          </div>
        )}
      </dl>
      {worker.about && <p className="relative mt-5 border-t border-ivory/15 pt-4 text-ivory/85">{worker.about}</p>}
      <p className="relative mt-5 text-xs text-mist">{t.profile.selfDeclared}</p>
    </article>
  );
}
