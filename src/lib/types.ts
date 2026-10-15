export type Lang = "en" | "hi" | "mr";

/** Text that is either the same in every language or translated per language. */
export type Localized = string | Record<Lang, string>;

export const TRADES = [
  "mason",
  "carpenter",
  "electrician",
  "plumber",
  "painter",
  "tiler",
  "welder",
  "helper",
  "driver",
  "housekeeping",
  "cook",
  "security",
] as const;
export type Trade = (typeof TRADES)[number];

export const AREAS = [
  "andheri",
  "bandra",
  "dadar",
  "kurla",
  "ghatkopar",
  "chembur",
  "powai",
  "lowerParel",
  "colaba",
  "goregaon",
  "malad",
  "borivali",
  "thane",
  "mulund",
  "vashi",
  "panvel",
] as const;
export type Area = (typeof AREAS)[number];

export const WAGE_UNITS = ["day", "month", "task"] as const;
export type WageUnit = (typeof WAGE_UNITS)[number];

export const DURATIONS = ["oneDay", "week", "month", "threeMonths", "ongoing"] as const;
export type Duration = (typeof DURATIONS)[number];

export const PAYMENT_TERMS = ["daily", "weekly", "onCompletion", "monthly"] as const;
export type PaymentTerm = (typeof PAYMENT_TERMS)[number];

export const PAYMENT_MODES = ["cash", "upi", "bank"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const BENEFITS = ["meals", "transport", "accommodation", "safetyGear", "overtime"] as const;
export type Benefit = (typeof BENEFITS)[number];

export const AVAILABILITY = ["now", "week", "month"] as const;
export type Availability = (typeof AVAILABILITY)[number];

/** Publication state of a listing — separate from each worker's application state. */
export type JobStatus = "open" | "closed" | "cancelled";

export interface Job {
  id: string;
  trade: Trade;
  title: Localized;
  description: Localized;
  employerName: string;
  /** "local" = created/owned by the employer using this browser. */
  owner: "local" | "seed";
  area: Area;
  address: Localized;
  wage: number;
  wageUnit: WageUnit;
  duration: Duration;
  paymentTerm: PaymentTerm;
  paymentMode: PaymentMode;
  workersNeeded: number;
  experienceMin: number;
  hours: string;
  startDate: string; // yyyy-mm-dd
  benefits: Benefit[];
  postedAt: number;
  status: JobStatus;
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  trade: Trade;
  otherTrades: Trade[];
  area: Area;
  experience: number;
  expectedWage: number;
  availability: Availability;
  languages: Lang[];
  about: string;
  /** "local" = the worker using this browser. */
  owner: "local" | "seed";
}

/**
 * Hiring lifecycle of one worker on one job. "available" (no application yet) is derived, never stored.
 * interested → shortlisted → offered → accepted → confirmed → in_progress → completed
 * with exits to declined (by either side) and cancelled.
 */
export const APPLICATION_STATUSES = [
  "interested",
  "shortlisted",
  "offered",
  "accepted",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "declined",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type LifecycleStatus = "available" | ApplicationStatus;

export type Actor = "worker" | "employer" | "system";

export interface StatusEvent {
  status: ApplicationStatus;
  at: number;
  by: Actor;
  /** Machine-readable reason, e.g. "simulated" or "job-cancelled". */
  note?: string;
}

/** Terms the employer offers; snapshotted into the ticket on acceptance. */
export interface Offer {
  wage: number;
  wageUnit: WageUnit;
  startDate: string;
  hours: string;
  duration: Duration;
  paymentTerm: PaymentTerm;
  paymentMode: PaymentMode;
  tools: string;
  instructions: string;
  employerConsent: boolean;
  sentAt: number;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  createdAt: number;
  updatedAt: number;
  history: StatusEvent[];
  offer?: Offer;
  /** Worker agreed to share their number with this employer when accepting. */
  workerConsent?: boolean;
  declinedBy?: Actor;
  cancelledBy?: Actor;
  ticketId?: string;
}

/** Job confirmation ticket: an immutable snapshot of agreed terms. Not an invoice or contract. */
export interface Ticket {
  id: string;
  code: string;
  applicationId: string;
  jobId: string;
  workerId: string;
  createdAt: number;
  workerName: string;
  workerPhone: string;
  employerName: string;
  employerContact: string;
  employerPhone: string;
  trade: Trade;
  title: Localized;
  description: Localized;
  area: Area;
  address: Localized;
  startDate: string;
  duration: Duration;
  hours: string;
  wage: number;
  wageUnit: WageUnit;
  paymentTerm: PaymentTerm;
  paymentMode: PaymentMode;
  tools: string;
  instructions: string;
}

export type Role = "worker" | "employer";

export interface EmployerProfile {
  name: string;
  organisation: string;
  phone: string;
}
