"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { buildSeedApplications, buildSeedJobs, SEED_WORKERS } from "./seed";
import type { Application, ApplicationStatus, EmployerProfile, Job, JobStatus, Lang, WorkerProfile } from "./types";

export type JobDraft = Omit<Job, "id" | "owner" | "postedAt" | "status" | "employerName">;

interface AppState {
  lang: Lang;
  /** True once localStorage has been read on the client. Not persisted. */
  hydrated: boolean;
  seeded: boolean;
  jobs: Job[];
  myProfile: WorkerProfile | null;
  applications: Application[];
  savedJobIds: string[];
  employer: EmployerProfile | null;

  setLang: (lang: Lang) => void;
  finishHydration: () => void;
  saveMyProfile: (p: Omit<WorkerProfile, "id" | "owner">) => void;
  expressInterest: (jobId: string) => void;
  withdrawInterest: (jobId: string) => void;
  toggleSaved: (jobId: string) => void;
  setEmployer: (e: EmployerProfile) => void;
  createJob: (draft: JobDraft) => string;
  updateJob: (id: string, draft: JobDraft) => void;
  setJobStatus: (id: string, status: JobStatus) => void;
  setApplicationStatus: (id: string, status: ApplicationStatus) => void;
  resetDemo: () => void;
}

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

const seedData = () => {
  const now = Date.now();
  return { jobs: buildSeedJobs(now), applications: buildSeedApplications(now), seeded: true };
};

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      lang: "en",
      hydrated: false,
      seeded: false,
      jobs: [],
      myProfile: null,
      applications: [],
      savedJobIds: [],
      employer: null,

      setLang: (lang) => set({ lang }),

      finishHydration: () => {
        if (!get().seeded) set(seedData());
        set({ hydrated: true });
      },

      saveMyProfile: (p) => {
        const existing = get().myProfile;
        set({ myProfile: { ...p, id: existing?.id ?? uid("me"), owner: "local" } });
      },

      expressInterest: (jobId) => {
        const me = get().myProfile;
        if (!me) return;
        const apps = get().applications;
        const existing = apps.find((a) => a.jobId === jobId && a.workerId === me.id);
        if (existing) {
          set({
            applications: apps.map((a) =>
              a.id === existing.id ? { ...a, status: "interested", createdAt: Date.now() } : a,
            ),
          });
          return;
        }
        set({
          applications: [
            ...apps,
            { id: uid("app"), jobId, workerId: me.id, status: "interested", createdAt: Date.now() },
          ],
        });
      },

      withdrawInterest: (jobId) => {
        const me = get().myProfile;
        if (!me) return;
        set({
          applications: get().applications.map((a) =>
            a.jobId === jobId && a.workerId === me.id ? { ...a, status: "withdrawn" } : a,
          ),
        });
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

      updateJob: (id, draft) =>
        set({ jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...draft } : j)) }),

      setJobStatus: (id, status) =>
        set({ jobs: get().jobs.map((j) => (j.id === id ? { ...j, status } : j)) }),

      setApplicationStatus: (id, status) =>
        set({ applications: get().applications.map((a) => (a.id === id ? { ...a, status } : a)) }),

      resetDemo: () =>
        set({ ...seedData(), myProfile: null, savedJobIds: [], employer: null }),
    }),
    {
      name: "kaamsetu-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) => {
        void _h;
        return Object.fromEntries(
          Object.entries(rest).filter(([, v]) => typeof v !== "function"),
        ) as Partial<AppState>;
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
