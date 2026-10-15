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

export type JobStatus = "open" | "closed";

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

export type ApplicationStatus = "interested" | "shortlisted" | "declined" | "withdrawn";

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: ApplicationStatus;
  createdAt: number;
}

export interface EmployerProfile {
  name: string;
  organisation: string;
  phone: string;
}
