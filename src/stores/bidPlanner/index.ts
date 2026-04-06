import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Term, Year } from "@/types/planner";
import type { ModuleCode, ModuleForPlanner } from "@/types/primitives/module";

export type BidEntry = {
  moduleCode: ModuleCode;
  year: Year;
  term: Term;
  plannedBid: number | null;
  module: ModuleForPlanner;
};

export type BidPlannerState = {
  entries: Record<ModuleCode, BidEntry>;
  budgets: Record<string, number>;
};

export type BidPlannerActions = {
  addEntry: (
    moduleCode: ModuleCode,
    year: Year,
    term: Term,
    module: ModuleForPlanner,
  ) => void;
  removeEntry: (moduleCode: ModuleCode) => void;
  setPlannedBid: (moduleCode: ModuleCode, bid: number | null) => void;
  setBudget: (year: Year, term: Term, budget: number) => void;
};

export type BidPlannerStore = BidPlannerState & BidPlannerActions;

export const createBidPlannerStore = () =>
  create<BidPlannerStore>()(
    persist(
      (set) => ({
        entries: {},
        budgets: {},
        addEntry: (moduleCode, year, term, module) =>
          set((state) => {
            if (state.entries[moduleCode]) return state;
            return {
              entries: {
                ...state.entries,
                [moduleCode]: {
                  moduleCode,
                  year,
                  term,
                  plannedBid: null,
                  module,
                },
              },
            };
          }),
        removeEntry: (moduleCode) =>
          set((state) => {
            const { [moduleCode]: _, ...rest } = state.entries;
            return { entries: rest as Record<ModuleCode, BidEntry> };
          }),
        setPlannedBid: (moduleCode, bid) =>
          set((state) => {
            const existing = state.entries[moduleCode];
            if (!existing) return state;
            return {
              entries: {
                ...state.entries,
                [moduleCode]: { ...existing, plannedBid: bid },
              },
            };
          }),
        setBudget: (year, term, budget) =>
          set((state) => ({
            budgets: {
              ...state.budgets,
              [`${year}|${term}`]: budget,
            },
          })),
      }),
      {
        name: "bidPlanner",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
