"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

import type { RecommendationStore } from "@/stores/recommendation";
import { createRecommendationStore } from "@/stores/recommendation";

export type RecommendationStoreApi = ReturnType<typeof createRecommendationStore>;

const RecommendationStoreContext = createContext<RecommendationStoreApi | undefined>(
  undefined,
);

export const RecommendationStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const storeRef = useRef<RecommendationStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = createRecommendationStore();
  }

  return (
    <RecommendationStoreContext.Provider value={storeRef.current}>
      {children}
    </RecommendationStoreContext.Provider>
  );
};

export const useRecommendationStore = <T,>(
  selector: (store: RecommendationStore) => T,
): T => {
  const ctx = useContext(RecommendationStoreContext);
  if (!ctx) {
    throw new Error(
      `useRecommendationStore must be used within RecommendationStoreProvider`,
    );
  }
  return useStore(ctx, selector);
};
