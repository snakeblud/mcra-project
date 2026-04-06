"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";

import type { Basket } from "@/types/primitives/basket";
import type { Track } from "@/types/primitives/major";
import type { ModuleBank } from "@/types/banks/moduleBank";
import type { ModuleCode } from "@/types/primitives/module";
import type { ChartData } from "@/components/BidAnalytics/Chart";
import { baskets } from "@/server/data/basket";

import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  return (clientQueryClientSingleton ??= createQueryClient());
};

// ─── Static data fetchers ─────────────────────────────────────────────────────

type BidRecord = {
  instructor: string;
  term: string;
  section: string;
  window: number;
  befVac: number;
  aftVac: number;
  minBid: number;
  medBid: number;
};

type BidAnalyticsData = Record<
  string,
  { instructors: string[]; records: BidRecord[] }
>;

let cachedBidData: BidAnalyticsData | null = null;
async function getBidData(): Promise<BidAnalyticsData> {
  if (cachedBidData) return cachedBidData;
  const res = await fetch("/data/bid-analytics.json");
  cachedBidData = (await res.json()) as BidAnalyticsData;
  return cachedBidData;
}

let cachedModules: ModuleBank | null = null;
export async function getAllModules(): Promise<ModuleBank> {
  if (cachedModules) return cachedModules;
  const res = await fetch("/data/modules.json");
  cachedModules = (await res.json()) as ModuleBank;
  return cachedModules;
}

export async function getModuleByCode(moduleCode: string) {
  const modules = await getAllModules();
  return modules[moduleCode as ModuleCode] ?? null;
}

export async function getAllBaskets(): Promise<Basket<Track>[]> {
  return baskets;
}

// ─── asyncApi (used by Zustand stores) ────────────────────────────────────────

export const asyncApi = {
  module: {
    getModule: {
      mutate: async ({ moduleCode }: { moduleCode: string }) =>
        getModuleByCode(moduleCode),
    },
    getAllModules: {
      query: async () => getAllModules(),
    },
  },
  basket: {
    getAllBaskets: {
      query: async () => getAllBaskets(),
    },
  },
  iSync: {
    getToken: {
      mutate: async ({ content }: { content: string }) => {
        const token = btoa(unescape(encodeURIComponent(content)));
        return { token };
      },
    },
    getContent: {
      mutate: async ({ token }: { token: string }) => {
        const content = decodeURIComponent(escape(atob(token)));
        return { token, content };
      },
    },
  },
};

// ─── api (React Query hooks used by components) ───────────────────────────────

export const api = {
  bidAnalytics: {
    getInstructors: {
      useQuery: (
        input: { moduleCode: string },
        options?: { enabled?: boolean },
      ) =>
        useQuery({
          queryKey: ["bidAnalytics", "instructors", input.moduleCode],
          queryFn: async () => {
            const data = await getBidData();
            return data[input.moduleCode]?.instructors ?? [];
          },
          enabled: options?.enabled ?? true,
        }),
    },
    getTermsAvailable: {
      useQuery: (
        input: { moduleCode: string; instructor: string },
        options?: { enabled?: boolean },
      ) =>
        useQuery({
          queryKey: [
            "bidAnalytics",
            "terms",
            input.moduleCode,
            input.instructor,
          ],
          queryFn: async () => {
            const data = await getBidData();
            const records = data[input.moduleCode]?.records ?? [];
            const terms = [
              ...new Set(
                records
                  .filter(
                    (r) => r.instructor === input.instructor,
                  )
                  .map((r) => r.term),
              ),
            ]
              .sort()
              .reverse();
            return terms;
          },
          enabled: options?.enabled ?? true,
        }),
    },
    getSections: {
      useQuery: (
        input: { moduleCode: string; instructor: string; term: string },
        options?: { enabled?: boolean },
      ) =>
        useQuery({
          queryKey: [
            "bidAnalytics",
            "sections",
            input.moduleCode,
            input.instructor,
            input.term,
          ],
          queryFn: async () => {
            const data = await getBidData();
            const records = data[input.moduleCode]?.records ?? [];
            const sections = [
              ...new Set(
                records
                  .filter(
                    (r) =>
                      r.instructor === input.instructor &&
                      r.term === input.term,
                  )
                  .map((r) => r.section),
              ),
            ].sort();
            return sections;
          },
          enabled: options?.enabled ?? true,
        }),
    },
    getChartData: {
      useQuery: (
        input: {
          moduleCode: string;
          instructor: string;
          term: string;
          section: string;
        },
        options?: { enabled?: boolean },
      ) =>
        useQuery({
          queryKey: [
            "bidAnalytics",
            "chart",
            input.moduleCode,
            input.instructor,
            input.term,
            input.section,
          ],
          queryFn: async (): Promise<ChartData[]> => {
            const data = await getBidData();
            const records = data[input.moduleCode]?.records ?? [];
            return records
              .filter(
                (r) =>
                  r.instructor === input.instructor &&
                  r.term === input.term &&
                  r.section === input.section,
              )
              .map((r) => ({
                window: String(r.window),
                befVac: r.befVac,
                aftVac: r.aftVac,
                minBid: r.minBid,
                medBid: r.medBid,
              }));
          },
          enabled: options?.enabled ?? true,
        }),
    },
  },
  iSync: {
    getToken: {
      useMutation: () =>
        useMutation({
          mutationFn: async ({ content }: { content: string }) => {
            const token = btoa(unescape(encodeURIComponent(content)));
            return { token };
          },
        }),
    },
    getContent: {
      useMutation: () =>
        useMutation({
          mutationFn: async ({ token }: { token: string }) => {
            const content = decodeURIComponent(escape(atob(token)));
            return { token, content };
          },
        }),
    },
  },
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  );
}
