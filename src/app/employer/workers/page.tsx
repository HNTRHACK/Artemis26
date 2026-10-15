"use client";

import { useMemo, useState } from "react";
import { Phone } from "lucide-react";
import { Badge, Button, EmptyState, Field, PageTitle, Select } from "@/components/ui";
import { tx, useLang, useT } from "@/lib/i18n";
import { distanceKm } from "@/lib/geo";
import { matchScore } from "@/lib/jobs";
import { allWorkers, useApp } from "@/lib/store";
import { AREAS, TRADES, type Area, type Trade } from "@/lib/types";

export default function WorkersPage() {
  const t = useT();
  const lang = useLang();
  const me = useApp((s) => s.myProfile);
  const jobs = useApp((s) => s.jobs);
  const myJobs = jobs.filter((j) => j.owner === "local" && j.status === "open");

  const [trade, setTrade] = useState<Trade | "all">("all");
  const [area, setArea] = useState<Area | "all">("all");
  const [jobId, setJobId] = useState<string>("");
  const [revealed, setRevealed] = useState<string[]>([]);
  const job = myJobs.find((j) => j.id === jobId);

  const list = useMemo(() => {
    return allWorkers(me)
      .filter((w) => trade === "all" || w.trade === trade || w.otherTrades.includes(trade))
      .filter((w) => area === "all" || w.area === area)
      .map((w) => ({ w, score: job ? matchScore(w, job) : 0 }))
      .sort((a, b) => b.score - a.score || b.w.experience - a.w.experience);
  }, [me, trade, area, job]);

  return (
    <div>
      <PageTitle title={t.workersBrowse.title} sub={t.workersBrowse.subtitle} />

      <div className="mb-8 grid gap-5 rounded-3xl border-2 border-ivory-3 bg-white/50 p-5 sm:grid-cols-3">
        <Field label={t.workersBrowse.forJob}>
          {(id) => (
            <Select
              id={id}
              value={jobId}
              onChange={(e) => {
                const next = myJobs.find((j) => j.id === e.target.value);
                setJobId(e.target.value);
                if (next) {
                  setTrade(next.trade);
                  setArea("all");
                }
              }}
            >
              <option value="">{t.workersBrowse.anyJob}</option>
              {myJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {tx(j.title, lang)}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={t.jobs.trade}>
          {(id) => (
            <Select id={id} value={trade} onChange={(e) => setTrade(e.target.value as Trade | "all")}>
              <option value="all">{t.common.all}</option>
              {TRADES.map((x) => <option key={x} value={x}>{t.trades[x]}</option>)}
            </Select>
          )}
        </Field>
        <Field label={t.jobs.area}>
          {(id) => (
            <Select id={id} value={area} onChange={(e) => setArea(e.target.value as Area | "all")}>
              <option value="all">{t.common.all}</option>
              {AREAS.map((x) => <option key={x} value={x}>{t.areas[x]}</option>)}
            </Select>
          )}
        </Field>
      </div>

      <p className="mb-4 text-lg font-semibold" aria-live="polite">
        {t.workersBrowse.results(list.length)}
      </p>

      {list.length === 0 ? (
        <EmptyState title={t.workersBrowse.empty} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map(({ w, score }) => (
            <li key={w.id} className="flex flex-col gap-3 rounded-3xl border-2 border-ivory-3 bg-white/55 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink font-bold text-ivory">
                    {w.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="text-lg leading-tight font-semibold">{w.name}</p>
                    <p className="serif-i text-xl text-muted">{t.trades[w.trade]}</p>
                  </div>
                </div>
                {job && score >= 70 && <Badge tone="accent">{t.workersBrowse.match}</Badge>}
              </div>
              <p className="text-muted">
                {t.common.years(w.experience)} · {t.areas[w.area]}
                {job && <> · {t.common.kmAway(distanceKm(w.area, job.area))}</>}
              </p>
              <p className="flex-1">{w.about}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-ivory-2 px-3 py-1">{t.availability[w.availability]}</span>
                <span className="rounded-full bg-ivory-2 px-3 py-1">{t.workersBrowse.expects(t.common.inr(w.expectedWage))}</span>
                {w.otherTrades.map((o) => (
                  <span key={o} className="rounded-full bg-ivory-2 px-3 py-1">+ {t.trades[o]}</span>
                ))}
              </div>
              {revealed.includes(w.id) ? (
                <a href={`tel:${w.phone}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 font-semibold text-ivory">
                  <Phone size={18} aria-hidden /> <span className="tabular-nums">{w.phone}</span>
                </a>
              ) : (
                <Button variant="secondary" className="min-h-12" onClick={() => setRevealed((r) => [...r, w.id])}>
                  {t.workersBrowse.showPhone}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
