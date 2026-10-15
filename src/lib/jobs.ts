import { distanceKm } from "./geo";
import type { Area, Duration, Job, WorkerProfile } from "./types";

const DURATION_DAYS: Record<Duration, number> = { oneDay: 1, week: 6, month: 26, threeMonths: 52, ongoing: 26 };

/** Rough per-day equivalent so jobs with different pay units can be compared and filtered. */
export function dailyEstimate(job: Pick<Job, "wage" | "wageUnit" | "duration">): number {
  if (job.wageUnit === "day") return job.wage;
  if (job.wageUnit === "month") return Math.round(job.wage / 26);
  return Math.round(job.wage / DURATION_DAYS[job.duration]);
}

export type JobSort = "near" | "pay" | "new";

export interface JobFilters {
  trade: Job["trade"] | "all";
  area: Area | "all";
  minPay: number;
  sort: JobSort;
}

export function filterJobs(jobs: Job[], f: JobFilters, home: Area) {
  return jobs
    .filter((j) => j.status === "open")
    .filter((j) => f.trade === "all" || j.trade === f.trade)
    .filter((j) => f.area === "all" || j.area === f.area)
    .filter((j) => dailyEstimate(j) >= f.minPay)
    .map((j) => ({ job: j, km: distanceKm(home, j.area) }))
    .sort((a, b) => {
      if (f.sort === "pay") return dailyEstimate(b.job) - dailyEstimate(a.job);
      if (f.sort === "new") return b.job.postedAt - a.job.postedAt;
      return a.km - b.km;
    });
}

/** Simple, explainable match score between a worker and a job (0–100). */
export function matchScore(w: WorkerProfile, j: Job): number {
  let score = 0;
  if (w.trade === j.trade) score += 50;
  else if (w.otherTrades.includes(j.trade)) score += 30;
  const km = distanceKm(w.area, j.area);
  score += km < 5 ? 25 : km < 12 ? 15 : km < 25 ? 8 : 0;
  if (w.experience >= j.experienceMin) score += 15;
  if (w.availability === "now") score += 10;
  return score;
}

export const PAY_STEPS = [0, 700, 850, 1000, 1200];
