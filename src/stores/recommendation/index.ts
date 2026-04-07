import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LearningPreference, RecommendationResult } from "@/lib/recommender-engine";

export type SavedRecommendation = {
  result: RecommendationResult;
  preference: LearningPreference;
  savedAt: number; // unix ms
};

export type RecommendationState = {
  saved: SavedRecommendation | null;
};

export type RecommendationActions = {
  saveRecommendation: (
    result: RecommendationResult,
    preference: LearningPreference,
  ) => void;
  clearRecommendation: () => void;
};

export type RecommendationStore = RecommendationState & RecommendationActions;

export const createRecommendationStore = () =>
  create<RecommendationStore>()(
    persist(
      (set) => ({
        saved: null,
        saveRecommendation: (result, preference) =>
          set({ saved: { result, preference, savedAt: Date.now() } }),
        clearRecommendation: () => set({ saved: null }),
      }),
      {
        name: "recommendation",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
