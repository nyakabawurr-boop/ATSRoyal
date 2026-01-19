import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Job, Resume, TailoredOutput } from "@/lib/types";
import { DEFAULT_SECTION_ORDER } from "@/lib/constants";

type ResumeState = {
  resume: Resume | null;
  job: Job | null;
  tailored: TailoredOutput | null;
  sectionOrder: string[];
  includeSections: string[];
  setResume: (resume: Resume | null) => void;
  setJob: (job: Job | null) => void;
  setTailored: (tailored: TailoredOutput | null) => void;
  setSectionOrder: (order: string[]) => void;
  setIncludeSections: (sections: string[]) => void;
  clearAll: () => void;
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      resume: null,
      job: null,
      tailored: null,
      sectionOrder: DEFAULT_SECTION_ORDER,
      includeSections: [...DEFAULT_SECTION_ORDER],
      setResume: (resume) => set({ resume }),
      setJob: (job) => set({ job }),
      setTailored: (tailored) => set({ tailored }),
      setSectionOrder: (sectionOrder) => set({ sectionOrder }),
      setIncludeSections: (includeSections) => set({ includeSections }),
      clearAll: () =>
        set({
          resume: null,
          job: null,
          tailored: null,
          sectionOrder: DEFAULT_SECTION_ORDER,
          includeSections: [...DEFAULT_SECTION_ORDER],
        }),
    }),
    {
      name: "ats-resume-store",
      partialize: (state) => ({
        resume: state.resume,
        job: state.job,
        tailored: state.tailored,
        sectionOrder: state.sectionOrder,
        includeSections: state.includeSections,
      }),
    }
  )
);
