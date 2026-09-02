import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createJob, DEFAULT_BUSINESS, DEFAULT_RATES, demoJob, emptyDocs, nextDocNo } from "@/lib/tiling/defaults";
import type { Business, Job, Rates } from "@/lib/tiling/types";

type Store = {
  hasSeeded: boolean;
  jobs: Job[];
  rates: Rates;
  business: Business;
  addJob: (job?: Partial<Job>) => Job;
  updateJob: (id: string, patch: Partial<Job> | ((job: Job) => Job)) => void;
  removeJob: (id: string) => void;
  duplicateJob: (id: string) => Job | null;
  setRates: (patch: Partial<Rates>) => void;
  setBusiness: (patch: Partial<Business>) => void;
  assignQuoteNo: (id: string) => string;
  assignInvoiceNo: (id: string) => string;
  updateMeta: { lastCheckedAt: number | null; lastAppliedAt: number | null; sourceStatus: "fresh" | "stale" | "never" | "error"; latestNote: string };
  setUpdateMeta: (patch: Partial<Store["updateMeta"]>) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      hasSeeded: false,
      jobs: [],
      rates: DEFAULT_RATES,
      business: DEFAULT_BUSINESS,
      updateMeta: { lastCheckedAt: null, lastAppliedAt: null, sourceStatus: "never", latestNote: "No online update check has been run yet." },
      addJob: (partial) => {
        const job = createJob(partial);
        set((s) => ({ jobs: [job, ...s.jobs] }));
        return job;
      },
      updateJob: (id, patch) => {
        set((s) => ({
          jobs: s.jobs.map((j) => {
            if (j.id !== id) return j;
            const next = typeof patch === "function" ? patch(j) : { ...j, ...patch };
            return { ...next, updatedAt: Date.now() };
          }),
        }));
      },
      removeJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
      duplicateJob: (id) => {
        const src = get().jobs.find((j) => j.id === id);
        if (!src) return null;
        const copy = createJob({
          name: `${src.name} (copy)`,
          customer: { ...src.customer },
          siteAddress: src.siteAddress,
          jobType: src.jobType,
          surfaces: src.surfaces,
          tile: { ...src.tile },
          waterproofing: { ...src.waterproofing },
          extras: src.extras,
          photos: [],
          notes: src.notes,
        });
        copy.docs = emptyDocs();
        set((s) => ({ jobs: [copy, ...s.jobs] }));
        return copy;
      },
      setRates: (patch) => set((s) => ({ rates: { ...s.rates, ...patch } })),
      setBusiness: (patch) => set((s) => ({ business: { ...s.business, ...patch } })),
      setUpdateMeta: (patch) => set((s) => ({ updateMeta: { ...s.updateMeta, ...patch } })),
      assignQuoteNo: (id) => {
        const job = get().jobs.find((j) => j.id === id);
        if (job?.docs.quoteNo) return job.docs.quoteNo;
        const no = nextDocNo(
          "TQ",
          get().jobs.map((j) => j.docs.quoteNo).filter(Boolean),
        );
        get().updateJob(id, (j) => ({ ...j, docs: { ...j.docs, quoteNo: no } }));
        return no;
      },
      assignInvoiceNo: (id) => {
        const job = get().jobs.find((j) => j.id === id);
        if (job?.docs.invoiceNo) return job.docs.invoiceNo;
        const no = nextDocNo(
          "TI",
          get().jobs.map((j) => j.docs.invoiceNo).filter(Boolean),
        );
        get().updateJob(id, (j) => ({ ...j, docs: { ...j.docs, invoiceNo: no } }));
        return no;
      },
    }),
    {
      name: "tilemate-v2",
      version: 2,
      migrate: (persisted: unknown) => persisted,
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<Store>;
        return {
          ...currentState,
          ...persisted,
          business: { ...currentState.business, ...(persisted.business ?? {}) },
          rates: { ...currentState.rates, ...(persisted.rates ?? {}) },
          updateMeta: { ...currentState.updateMeta, ...(persisted.updateMeta ?? {}) },
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state && !state.hasSeeded) {
          state.jobs = [demoJob()];
          state.hasSeeded = true;
        }
      },
    },
  ),
);
