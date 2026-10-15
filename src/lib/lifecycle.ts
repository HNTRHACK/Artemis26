import type { Actor, Application, ApplicationStatus, Job, StatusEvent } from "./types";

/** Statuses that occupy one of the job's positions. */
export const FILLING: ApplicationStatus[] = ["confirmed", "in_progress", "completed"];
/** Statuses that end an application. */
export const TERMINAL: ApplicationStatus[] = ["completed", "cancelled", "declined"];
/** Hired: contact details may be exchanged. */
export const HIRED: ApplicationStatus[] = ["confirmed", "in_progress", "completed"];

/** Allowed transitions and who may trigger them. */
const TRANSITIONS: Record<ApplicationStatus, Partial<Record<ApplicationStatus, Actor[]>>> = {
  interested: { shortlisted: ["employer"], offered: ["employer"], declined: ["employer"], cancelled: ["worker", "system"] },
  shortlisted: { offered: ["employer"], declined: ["employer"], interested: ["employer"], cancelled: ["worker", "system"] },
  offered: { accepted: ["worker"], declined: ["worker"], shortlisted: ["employer"], cancelled: ["employer", "system"] },
  accepted: { confirmed: ["system"], cancelled: ["system"] },
  confirmed: { in_progress: ["employer"], cancelled: ["employer", "system"] },
  in_progress: { completed: ["employer"], cancelled: ["employer", "system"] },
  completed: {},
  // A worker may re-apply after withdrawing or declining; an employer may restore an applicant they declined.
  // (Which side declined is checked by the store before re-opening.)
  cancelled: { interested: ["worker"] },
  declined: { interested: ["employer", "worker"] },
};

export function canTransition(from: ApplicationStatus, to: ApplicationStatus, by: Actor) {
  return TRANSITIONS[from][to]?.includes(by) ?? false;
}

export function transition(app: Application, to: ApplicationStatus, by: Actor, at: number, note?: string): Application {
  const event: StatusEvent = note ? { status: to, at, by, note } : { status: to, at, by };
  return {
    ...app,
    status: to,
    updatedAt: at,
    history: [...app.history, event],
    declinedBy: to === "declined" ? by : to === "interested" ? undefined : app.declinedBy,
    cancelledBy: to === "cancelled" ? by : to === "interested" ? undefined : app.cancelledBy,
  };
}

export function filledCount(applications: Application[], jobId: string) {
  return applications.filter((a) => a.jobId === jobId && FILLING.includes(a.status)).length;
}

export function isFilled(job: Job, applications: Application[]) {
  return filledCount(applications, job.id) >= job.workersNeeded;
}

export type BlockReason = "closed" | "cancelled" | "filled" | "notOffered" | "noConsent";

/** Why a worker cannot accept an offer right now (null = they can). */
export function acceptBlockReason(job: Job | undefined, app: Application, applications: Application[], consent: boolean): BlockReason | null {
  if (!job || job.status === "cancelled") return "cancelled";
  if (job.status === "closed") return "closed";
  if (app.status !== "offered" || !app.offer) return "notOffered";
  if (isFilled(job, applications)) return "filled";
  if (!consent) return "noConsent";
  return null;
}

/** Why a worker cannot apply right now (null = they can). */
export function applyBlockReason(job: Job, applications: Application[]): "closed" | "cancelled" | "filled" | null {
  if (job.status === "cancelled") return "cancelled";
  if (job.status === "closed") return "closed";
  if (isFilled(job, applications)) return "filled";
  return null;
}

/** UMG-2026-000127 — sequential within this device's data. */
export function ticketCode(seq: number, createdAt: number) {
  return `UMG-${new Date(createdAt).getFullYear()}-${String(seq).padStart(6, "0")}`;
}

export function newEvent(status: ApplicationStatus, by: Actor, at: number): StatusEvent {
  return { status, by, at };
}
