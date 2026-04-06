"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

import type { BidPlannerStore } from "@/stores/bidPlanner";
import { createBidPlannerStore } from "@/stores/bidPlanner";

export type BidPlannerStoreApi = ReturnType<typeof createBidPlannerStore>;

const BidPlannerStoreContext = createContext<BidPlannerStoreApi | undefined>(
  undefined,
);

export const BidPlannerStoreProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const storeRef = useRef<BidPlannerStoreApi>(null);
  if (!storeRef.current) {
    storeRef.current = createBidPlannerStore();
  }

  return (
    <BidPlannerStoreContext.Provider value={storeRef.current}>
      {children}
    </BidPlannerStoreContext.Provider>
  );
};

export const useBidPlannerStore = <T,>(
  selector: (store: BidPlannerStore) => T,
): T => {
  const ctx = useContext(BidPlannerStoreContext);
  if (!ctx) {
    throw new Error(
      `useBidPlannerStore must be used within BidPlannerStoreProvider`,
    );
  }
  return useStore(ctx, selector);
};
