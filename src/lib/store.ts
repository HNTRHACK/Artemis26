"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { acceptBlockReason, applyBlockReason, canTransition, TERMINAL, ticketCode, transition, type BlockReason } from "./lifecycle";
import { buildSeedApplications, buildSeedJobs, SEED_WORKERS } from "./seed";
import type {
  Actor,
  Application,
  ApplicationStatus,
  EmployerProfile,
  Job,
  JobStatus,
  Lang,
  Offer,
  Role,
  Ticket,
  WorkerProfile,
} from "./types";

export type JobDraft = Omit<Job, "id" | "owner" | "postedAt" | "status" | "employerName">;
export type OfferDraft = Omit<Offer, "sentAt">;
export type Result = { ok: true; ticketId?: string } | { ok: false; reason: BlockReason | "invalid" };

/**
 * Storage key kept from the KaamSetu prototype so existing demo data survives the UMANG rebrand.
 * It is never shown to users. Schema changes are handled by `migrate` below.
 */
export const STORAGE_KEY = "kaamsetu-v1";
const FIRST_TICKET_SEQ = 127;

interface AppState {
  lang: Lang;
  /** True once localStorage has been read on the client. Not persisted. */
  hydrated: boolean;
  seeded: boolean;
  /** Demo role chosen with one tap. This is NOT authentication. */
  role: Role | null;
  jobs: Job[];
  myProfile: WorkerProfile | null;
  applications: Application[];
  tickets: Ticket[];
  ticketSeq: number;
  savedJobIds: string[];
  employer: EmployerProfile | null;

  setLang: (lang: Lang) => void;
  setRole: (role: Role | null) => void;
  finishHydration: () => void;
  saveMyProfile: (p: Omit<WorkerProfile, "id" | "owner">) => void;
  toggleSaved: (jobId: string) => void;
  setEmployer: (e: EmployerProfile) => void;

  // jobs (publication state)
  createJob: (draft: JobDraft) => string;
  updateJob: (id: string, draft: JobDraft) => void;
  setJobStatus: (id: string, status: Exclude<JobStatus, "cancelled">) => void;
  cancelJob: (id: string) => void;

  // hiring lifecycle
  expressInterest: (jobId: string) => Result;
  withdrawInterest: (jobId: string) => void;
  employerMove: (appId: string, to: "shortlisted" | "declined" | "interested" | "in_progress" | "completed" | "cancelled") => Result;
  sendOffer: (appId: string, offer: OfferDraft) => Result;
  withdrawOffer: (appId: string) => Result;
  respondToOffer: (appId: string, accept: boolean, consent: boolean, note?: string) => Result;

  // demo-only shortcuts, clearly labelled in the UI
  demoOfferToMe: () => Result;
  resetDemo: () => void;
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const seedData = () => {
  const now = Date.now();
  return { jobs: buildSeedJobs(now), applications: buildSeedApplications(now), tickets: [] as Ticket[], ticketSeq: FIRST_TICKET_SEQ, seeded: true };
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      /** Replace one application after a validated transition. */
      const move = (appId: string, to: ApplicationStatus, by: Actor, note?: string): Result => {
        const app = get().applications.find((a) => a.id === appId);
        if (!app || !canTransition(app.status, to, by)) return { ok: false, reason: "invalid" };
        const next = transition(app, to, by, Date.now(), note);
        set({ applications: get().applications.map((a) => (a.id === appId ? next : a)) });
        return { ok: true };
      };

      return {
        lang: "en",
        hydrated: false,
        seeded: false,
        role: null,
        jobs: [],
        myProfile: null,
        applications: [],
        tickets: [],
        ticketSeq: FIRST_TICKET_SEQ,
        savedJobIds: [],
        employer: null,

        setLang: (lang) => set({ lang }),
        setRole: (role) => set({ role }),

        finishHydration: () => {
          if (!get().seeded) set(seedData());
          set({ hydrated: true });
        },

        saveMyProfile: (p) => {
          const existing = get().myProfile;
          set({ myProfile: { ...p, id: existing?.id ?? uid("me"), owner: "local" } });
        },

        toggleSaved: (jobId) => {
          const ids = get().savedJobIds;
          set({ savedJobIds: ids.includes(jobId) ? ids.filter((i) => i !== jobId) : [...ids, jobId] });
        },

        setEmployer: (employer) => set({ employer }),

        createJob: (draft) => {
          const id = uid("job");
          const employerName = get().employer?.organisation || get().employer?.name || "—";
          const job: Job = { ...draft, id, owner: "local", employerName, postedAt: Date.now(), status: "open" };
          set({ jobs: [job, ...get().jobs] });
          return id;
        },

        updateJob: (id, draft) => set({ jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...draft } : j)) }),

        setJobStatus: (id, status) =>
          set({ jobs: get().jobs.map((j) => (j.id === id && j.status !== "cancelled" ? { ...j, status } : j)) }),

        cancelJob: (id) => {
          const now = Date.now();
          set({
            jobs: get().jobs.map((j) => (j.id === id ? { ...j, status: "cancelled" } : j)),
            applications: get().applications.map((a) =>
              a.jobId === id && !TERMINAL.includes(a.status) && canTransition(a.status, "cancelled", "system")
                ? transition(a, "cancelled", "system", now, "job-cancelled")
                : a,
            ),
          });
        },

        expressInterest: (jobId) => {
          const me = get().myProfile;
          const job = get().jobs.find((j) => j.id === jobId);
          if (!me || !job) return { ok: false, reason: "invalid" };
          const blocked = applyBlockReason(job, get().applications);
          if (blocked) return { ok: false, reason: blocked };
          const existing = get().applications.find((a) => a.jobId === jobId && a.workerId === me.id);
          if (existing) {
            if (existing.status === "interested") return { ok: true };
            // Re-applying is allowed only after the worker's own withdrawal or decline.
            const reopenable =
              (existing.status === "cancelled" && existing.cancelledBy === "worker") ||
              (existing.status === "declined" && existing.declinedBy === "worker");
            return reopenable ? move(existing.id, "interested", "worker") : { ok: false, reason: "invalid" };
          }
          const now = Date.now();
          const app: Application = {
            id: uid("app"),
            jobId,
            workerId: me.id,
            status: "interested",
            createdAt: now,
            updatedAt: now,
            history: [{ status: "interested", at: now, by: "worker" }],
          };
          set({ applications: [...get().applications, app] });
          return { ok: true };
        },

        withdrawInterest: (jobId) => {
          const me = get().myProfile;
          const app = me && get().applications.find((a) => a.jobId === jobId && a.workerId === me.id);
          if (app) move(app.id, "cancelled", "worker");
        },

        employerMove: (appId, to) => {
          const app = get().applications.find((a) => a.id === appId);
          // An employer can only restore applicants *they* declined, not workers who said no.
          if (app?.status === "declined" && to === "interested" && app.declinedBy !== "employer") return { ok: false, reason: "invalid" };
          return move(appId, to, "employer");
        },

        sendOffer: (appId, offer) => {
          const app = get().applications.find((a) => a.id === appId);
          const job = app && get().jobs.find((j) => j.id === app.jobId);
          if (!app || !job || job.status !== "open" || !offer.employerConsent || !canTransition(app.status, "offered", "employer"))
            return { ok: false, reason: "invalid" };
          const next = { ...transition(app, "offered", "employer", Date.now()), offer: { ...offer, sentAt: Date.now() } };
          set({ applications: get().applications.map((a) => (a.id === appId ? next : a)) });
          return { ok: true };
        },

        withdrawOffer: (appId) => move(appId, "shortlisted", "employer", "offer-withdrawn"),

        respondToOffer: (appId, accept, consent, note) => {
          const state = get();
          const app = state.applications.find((a) => a.id === appId);
          if (!app) return { ok: false, reason: "invalid" };
          // Idempotent: a confirmed hire already has exactly one ticket.
          if (app.ticketId) return { ok: true, ticketId: app.ticketId };
          if (!accept) return move(appId, "declined", "worker", note);

          const job = state.jobs.find((j) => j.id === app.jobId);
          const blocked = acceptBlockReason(job, app, state.applications, consent);
          if (blocked) return { ok: false, reason: blocked };
          const worker = findWorker(app.workerId, state.myProfile);
          if (!job || !worker || !app.offer) return { ok: false, reason: "invalid" };

          const now = Date.now();
          const seq = state.ticketSeq;
          const ticket: Ticket = {
            id: uid("tkt"),
            code: ticketCode(seq, now),
            applicationId: app.id,
            jobId: job.id,
            workerId: worker.id,
            createdAt: now,
            workerName: worker.name,
            workerPhone: worker.phone,
            employerName: job.employerName,
            employerContact: state.employer?.name ?? "",
            employerPhone: app.offer.employerConsent ? (state.employer?.phone ?? "") : "",
            trade: job.trade,
            title: job.title,
            description: job.description,
            area: job.area,
            address: job.address,
            startDate: app.offer.startDate,
            duration: app.offer.duration,
            hours: app.offer.hours,
            wage: app.offer.wage,
            wageUnit: app.offer.wageUnit,
            paymentTerm: app.offer.paymentTerm,
            paymentMode: app.offer.paymentMode,
            tools: app.offer.tools,
            instructions: app.offer.instructions,
          };
          let next = transition(app, "accepted", "worker", now, note);
          next = { ...transition(next, "confirmed", "system", now), workerConsent: true, ticketId: ticket.id };
          set({
            applications: state.applications.map((a) => (a.id === appId ? next : a)),
            tickets: [...state.tickets, ticket],
            ticketSeq: seq + 1,
          });
          return { ok: true, ticketId: ticket.id };
        },

        demoOfferToMe: () => {
          const s = get();
          const me = s.myProfile;
          if (!me) return { ok: false, reason: "invalid" };
          // Prefer an open local job in the worker's trade, else any open local job with space.
          const candidates = s.jobs.filter((j) => j.owner === "local" && applyBlockReason(j, s.applications) === null);
          const job = candidates.find((j) => j.trade === me.trade) ?? candidates[0];
          if (!job) return { ok: false, reason: "filled" };
          if (!s.employer) set({ employer: { name: "Demo Employer", organisation: job.employerName, phone: "" } });
          const applied = get().expressInterest(job.id);
          if (!applied.ok) return applied;
          const app = get().applications.find((a) => a.jobId === job.id && a.workerId === me.id)!;
          if (app.status === "offered") return { ok: true };
          return get().sendOffer(app.id, {
            wage: job.wage,
            wageUnit: job.wageUnit,
            startDate: job.startDate,
            hours: job.hours,
            duration: job.duration,
            paymentTerm: job.paymentTerm,
            paymentMode: job.paymentMode,
            tools: "",
            instructions: "",
            employerConsent: true,
          });
        },

        resetDemo: () =>
          set({ ...seedData(), myProfile: null, savedJobIds: [], employer: null, role: null }),
      };
    },
    {
      name: STORAGE_KEY,
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) => {
        void _h;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== "function")) as Partial<AppState>;
      },
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          // v1 (KaamSetu): applications had no history; "withdrawn" became "cancelled by worker".
          type V1App = { id: string; jobId: string; workerId: string; status: string; createdAt: number };
          const apps = (state.applications as V1App[] | undefined) ?? [];
          state.applications = apps.map((a): Application => {
            const status: ApplicationStatus = a.status === "withdrawn" ? "cancelled" : (a.status as ApplicationStatus);
            const by: Actor = status === "interested" || status === "cancelled" ? "worker" : "employer";
            return {
              id: a.id,
              jobId: a.jobId,
              workerId: a.workerId,
              status,
              createdAt: a.createdAt,
              updatedAt: a.createdAt,
              history: [{ status, at: a.createdAt, by, note: "migrated" }],
              cancelledBy: status === "cancelled" ? "worker" : undefined,
              declinedBy: status === "declined" ? "employer" : undefined,
            };
          });
          state.tickets = [];
          state.ticketSeq = FIRST_TICKET_SEQ;
          state.role = null;
        }
        return state as unknown as AppState;
      },
    },
  ),
);

/** Every worker profile the employer side can see: the seed pool plus this browser's worker. */
export function allWorkers(me: WorkerProfile | null): WorkerProfile[] {
  return me ? [me, ...SEED_WORKERS] : SEED_WORKERS;
}

export function findWorker(id: string, me: WorkerProfile | null) {
  return allWorkers(me).find((w) => w.id === id);
}
