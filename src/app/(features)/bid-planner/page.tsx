"use client";

import { useState, useCallback } from "react";
import {
  BarChart2,
  Bot,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import { BidAnalyticChart, type ChartData } from "@/components/BidAnalytics/Chart";
import { SearchModule } from "@/components/SearchModule";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PADDING } from "@/config";
import { useBidPlannerStore } from "@/stores/bidPlanner/provider";
import { api } from "@/trpc/react";
import { years, terms } from "@/types/planner";
import type { Term, Year } from "@/types/planner";
import type { Module, ModuleCode, ModuleForPlanner } from "@/types/primitives/module";

// ─── Helper: compute recommended bid ────────────────────────────────────────

function computeRecommendedBid(
  chartData: ChartData[],
  strategy: "aggressive" | "average" | "conservative",
  minBudget: number,
  maxBudget: number,
): number {
  const medBids = chartData.map((d) => d.medBid).filter((b) => b > 0);
  const minBids = chartData.map((d) => d.minBid).filter((b) => b > 0);

  const allBids = medBids.length > 0 ? medBids : minBids;
  if (allBids.length === 0)
    return Math.round((minBudget + maxBudget) / 2);

  const maxVal = Math.max(...allBids);
  const avgVal = Math.round(allBids.reduce((a, b) => a + b, 0) / allBids.length);
  const minVal = Math.min(...allBids);

  let base: number;
  switch (strategy) {
    case "aggressive":
      base = Math.round(maxVal * 1.1);
      break;
    case "average":
      base = Math.round(avgVal * 1.05);
      break;
    case "conservative":
      base = Math.round(minVal * 0.95 + 1);
      break;
  }

  return Math.min(maxBudget, Math.max(minBudget, base));
}

// ─── Helper: compute stats ───────────────────────────────────────────────────

function computeStats(chartData: ChartData[]) {
  const bids = [
    ...chartData.map((d) => d.minBid),
    ...chartData.map((d) => d.medBid),
  ].filter((b) => b > 0);

  if (bids.length === 0)
    return { mean: 0, median: 0, sd: 0, min: 0, max: 0 };

  const sorted = [...bids].sort((a, b) => a - b);
  const mean = Math.round(bids.reduce((a, b) => a + b, 0) / bids.length);
  const median =
    sorted.length % 2 === 0
      ? Math.round((sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2)
      : sorted[Math.floor(sorted.length / 2)]!;
  const sd = Math.round(
    Math.sqrt(bids.reduce((acc, b) => acc + (b - mean) ** 2, 0) / bids.length),
  );
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;

  return { mean, median, sd, min, max };
}

// ─── Analytics Modal ─────────────────────────────────────────────────────────

function AnalyticsModal({
  moduleCode,
  moduleName,
  open,
  onClose,
  onBidSelected,
}: {
  moduleCode: string;
  moduleName: string;
  open: boolean;
  onClose: () => void;
  onBidSelected: (bid: number) => void;
}) {
  const [selectedInstructorIdx, setSelectedInstructorIdx] = useState(0);
  const [selectedTermIdx, setSelectedTermIdx] = useState(0);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState(0);

  const [strategy, setStrategy] = useState<"aggressive" | "average" | "conservative">("average");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(1000);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendedBid, setRecommendedBid] = useState<number | null>(null);

  const { data: instructors, isLoading } = api.bidAnalytics.getInstructors.useQuery(
    { moduleCode },
    { enabled: open },
  );

  const { data: termOptions, refetch: refetchTerms } =
    api.bidAnalytics.getTermsAvailable.useQuery(
      {
        moduleCode,
        instructor: instructors?.at(selectedInstructorIdx) ?? "",
      },
      { enabled: open && !!instructors?.at(selectedInstructorIdx) },
    );

  const { data: sectionOptions, refetch: refetchSections } =
    api.bidAnalytics.getSections.useQuery(
      {
        moduleCode,
        instructor: instructors?.at(selectedInstructorIdx) ?? "",
        term: termOptions?.at(selectedTermIdx) ?? "",
      },
      {
        enabled:
          open &&
          !!instructors?.at(selectedInstructorIdx) &&
          !!termOptions?.at(selectedTermIdx),
      },
    );

  const { data: chartData, refetch: refetchChart } =
    api.bidAnalytics.getChartData.useQuery(
      {
        moduleCode,
        instructor: instructors?.at(selectedInstructorIdx) ?? "",
        term: termOptions?.at(selectedTermIdx) ?? "",
        section: sectionOptions?.at(selectedSectionIdx) ?? "",
      },
      {
        enabled:
          open &&
          !!instructors?.at(selectedInstructorIdx) &&
          !!termOptions?.at(selectedTermIdx) &&
          !!sectionOptions?.at(selectedSectionIdx),
      },
    );

  const stats = computeStats(chartData ?? []);

  const handleAnalyse = () => {
    const bid = computeRecommendedBid(
      chartData ?? [],
      strategy,
      minBudget,
      maxBudget,
    );
    setRecommendedBid(bid);
    setShowRecommendation(true);
  };

  const strategyLabels = {
    aggressive: { label: "Aggressive", desc: "Bid above the historical median — maximises chance of getting the slot." },
    average: { label: "Average", desc: "Bid near the historical median — balanced cost vs. success rate." },
    conservative: { label: "Conservative", desc: "Bid just above the historical minimum — save eCredits but higher risk." },
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            {moduleName} — Bid Analytics
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={selectedInstructorIdx.toString()}
                onValueChange={async (v) => {
                  setSelectedInstructorIdx(parseInt(v));
                  setSelectedTermIdx(0);
                  setSelectedSectionIdx(0);
                  await refetchTerms();
                  await refetchSections();
                  await refetchChart();
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Instructor</SelectLabel>
                    {instructors?.filter((e) => e.length > 0).map((ins, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {ins}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={selectedTermIdx.toString()}
                onValueChange={async (v) => {
                  setSelectedTermIdx(parseInt(v));
                  setSelectedSectionIdx(0);
                  await refetchSections();
                  await refetchChart();
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Term</SelectLabel>
                    {termOptions?.filter((e) => e.length > 0).map((t, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                value={selectedSectionIdx.toString()}
                onValueChange={async (v) => {
                  setSelectedSectionIdx(parseInt(v));
                  await refetchChart();
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Section</SelectLabel>
                    {sectionOptions?.filter((e) => e.length > 0).map((s, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Chart */}
            {chartData && chartData.length > 0 ? (
              <BidAnalyticChart chartData={chartData} />
            ) : (
              <div className="bg-muted rounded-lg py-10 text-center text-sm">
                No bid data available for this selection
              </div>
            )}

            {/* Stats */}
            {chartData && chartData.length > 0 && (
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                {[
                  { label: "Mean", value: stats.mean },
                  { label: "Median", value: stats.median },
                  { label: "Std Dev", value: stats.sd },
                  { label: "Min", value: stats.min },
                  { label: "Max", value: stats.max },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className="text-foreground text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Help Me Bid */}
            <div className="border-border rounded-xl border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-violet-500" />
                <h3 className="font-semibold">Help Me Bid</h3>
                <Badge variant="secondary" className="text-xs">AI-powered</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                Tell our AI how aggressive you want to bid and your eCredit budget, and it will recommend the optimal bid price.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {(["aggressive", "average", "conservative"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStrategy(s); setShowRecommendation(false); }}
                    className={`rounded-lg border-2 p-3 text-left transition-colors ${
                      strategy === s
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="text-sm font-semibold capitalize">{strategyLabels[s].label}</p>
                    <p className="text-muted-foreground mt-1 text-xs leading-tight">
                      {strategyLabels[s].desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Min budget (eCredits)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={minBudget}
                    onChange={(e) => setMinBudget(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Max budget (eCredits)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAnalyse}
                    className="bg-violet-600 hover:bg-violet-700 text-white h-8 gap-1.5"
                    size="sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Analyse
                  </Button>
                </div>
              </div>

              {showRecommendation && recommendedBid !== null && (
                <div className="border-violet-500/40 bg-violet-500/10 flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Recommended bid ({strategy})
                    </p>
                    <p className="text-foreground text-3xl font-bold">
                      {recommendedBid}{" "}
                      <span className="text-muted-foreground text-base font-normal">
                        eCredits
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      onBidSelected(recommendedBid);
                      onClose();
                    }}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Target className="h-3.5 w-3.5" />
                    Use this bid
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Module Popover ───────────────────────────────────────────────────────

function AddModulePanel({
  pendingModule,
  onConfirm,
  onCancel,
}: {
  pendingModule: Module;
  onConfirm: (year: Year, term: Term) => void;
  onCancel: () => void;
}) {
  const [year, setYear] = useState<Year>("1");
  const [term, setTerm] = useState<Term>("Term 1");

  return (
    <div className="bg-card border-border flex flex-wrap items-end gap-3 rounded-lg border p-4 shadow-md">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">
          Add{" "}
          <span className="text-primary font-mono">
            {pendingModule.moduleCode}
          </span>{" "}
          to your plan
        </p>
        <p className="text-muted-foreground text-xs">{pendingModule.name}</p>
      </div>
      <div className="flex items-end gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Year</Label>
          <Select value={year} onValueChange={(v) => setYear(v as Year)}>
            <SelectTrigger className="h-8 w-20 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  Year {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Term</Label>
          <Select value={term} onValueChange={(v) => setTerm(v as Term)}>
            <SelectTrigger className="h-8 w-28 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {terms.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1"
          onClick={() => onConfirm(year, term)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Budget Bar ───────────────────────────────────────────────────────────────

function BudgetBar({
  year,
  term,
  allocated,
}: {
  year: Year;
  term: Term;
  allocated: number;
}) {
  const budgetKey = `${year}|${term}`;
  const budget = useBidPlannerStore((s) => s.budgets[budgetKey] ?? 0);
  const setBudget = useBidPlannerStore((s) => s.setBudget);

  const pct = budget > 0 ? Math.min(100, Math.round((allocated / budget) * 100)) : 0;
  const remaining = Math.max(0, budget - allocated);
  const over = allocated > budget && budget > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-xs shrink-0">eCredit Budget</Label>
        <Input
          type="number"
          min={0}
          value={budget || ""}
          placeholder="0"
          onChange={(e) => setBudget(year, term, Number(e.target.value))}
          className="h-6 w-24 text-xs px-2"
        />
        <span className="text-muted-foreground text-xs">
          {allocated} used
          {budget > 0 && (
            <>
              {" · "}
              <span className={over ? "text-destructive font-medium" : ""}>
                {over ? `${allocated - budget} over` : `${remaining} left`}
              </span>
            </>
          )}
        </span>
      </div>
      {budget > 0 && (
        <div className="bg-muted h-1.5 w-full rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Module Card ─────────────────────────────────────────────────────────────

function ModuleCard({ entry }: { entry: import("@/stores/bidPlanner").BidEntry }) {
  const setPlannedBid = useBidPlannerStore((s) => s.setPlannedBid);
  const removeEntry = useBidPlannerStore((s) => s.removeEntry);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  return (
    <>
      <div className="bg-card border-border group flex flex-col gap-2 rounded-lg border p-3 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <code className="text-primary text-xs font-semibold">
              {entry.moduleCode}
            </code>
            <p className="text-foreground mt-0.5 line-clamp-2 text-xs font-medium leading-tight">
              {entry.module.name}
            </p>
          </div>
          <button
            onClick={() => removeEntry(entry.moduleCode)}
            className="text-muted-foreground hover:text-destructive mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove module"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="text-muted-foreground text-xs">
          {entry.module.credit} MCs
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs shrink-0">Bid:</span>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={entry.plannedBid ?? ""}
            onChange={(e) =>
              setPlannedBid(
                entry.moduleCode,
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="h-6 flex-1 text-xs px-2"
          />
          <span className="text-muted-foreground text-xs shrink-0">eC</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-6 gap-1 text-xs"
          onClick={() => setAnalyticsOpen(true)}
        >
          <BarChart2 className="h-3 w-3" />
          Analytics
        </Button>
      </div>

      <AnalyticsModal
        moduleCode={entry.moduleCode}
        moduleName={entry.module.name}
        open={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        onBidSelected={(bid) => {
          setPlannedBid(entry.moduleCode, bid);
          setAnalyticsOpen(false);
        }}
      />
    </>
  );
}

// ─── Term Section ─────────────────────────────────────────────────────────────

function TermSection({
  year,
  term,
  entries,
}: {
  year: Year;
  term: Term;
  entries: import("@/stores/bidPlanner").BidEntry[];
}) {
  const allocated = entries.reduce((sum, e) => sum + (e.plannedBid ?? 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{term}</h3>
        <Badge variant="outline" className="text-xs">
          {entries.length} module{entries.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <BudgetBar year={year} term={term} allocated={allocated} />

      {entries.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed py-6 text-center text-xs">
          No modules added yet
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map((entry) => (
            <ModuleCard key={entry.moduleCode} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BidPlannerPage() {
  const entries = useBidPlannerStore((s) => s.entries);
  const addEntry = useBidPlannerStore((s) => s.addEntry);
  const totalECredits = useBidPlannerStore((s) => s.totalECredits);
  const setTotalECredits = useBidPlannerStore((s) => s.setTotalECredits);

  const [pendingModule, setPendingModule] = useState<Module | null>(null);

  const handleModSelect = useCallback((mod: Module) => {
    setPendingModule(mod);
  }, []);

  const handleConfirmAdd = useCallback(
    (year: Year, term: Term) => {
      if (!pendingModule) return;
      const { sections: _s, exam: _e, ...moduleForPlanner } = pendingModule as Module & { sections?: unknown; exam?: unknown };
      addEntry(
        pendingModule.moduleCode,
        year,
        term,
        moduleForPlanner as ModuleForPlanner,
      );
      setPendingModule(null);
    },
    [pendingModule, addEntry],
  );

  const totalPlanned = Object.values(entries).reduce(
    (sum, e) => sum + (e.plannedBid ?? 0),
    0,
  );
  const remaining = totalECredits - totalPlanned;
  const isOver = totalECredits > 0 && remaining < 0;
  const pct = totalECredits > 0
    ? Math.min(100, Math.round((totalPlanned / totalECredits) * 100))
    : 0;

  const takenModules = Object.keys(entries) as ModuleCode[];

  return (
    <div style={{ padding: PADDING }} className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Bid Planner</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Plan your module bids, set eCredit budgets, and get AI-powered bid
          price recommendations.
        </p>
      </div>

      {/* eCredits Wallet */}
      <div className="border-border bg-card rounded-xl border p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary h-4 w-4" />
          <span className="text-sm font-semibold">My eCredits</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Current balance</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="e.g. 600"
                value={totalECredits || ""}
                onChange={(e) => setTotalECredits(Number(e.target.value))}
                className="w-36 h-9 text-base font-semibold"
              />
              <span className="text-muted-foreground text-sm">eCredits</span>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Planned</p>
              <p className="text-foreground text-lg font-bold">{totalPlanned}</p>
            </div>
            {totalECredits > 0 && (
              <>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Remaining</p>
                  <p className={`text-lg font-bold ${isOver ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                    {isOver ? `−${Math.abs(remaining)}` : remaining}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-xs">Used</p>
                  <p className="text-foreground text-lg font-bold">{pct}%</p>
                </div>
              </>
            )}
          </div>
        </div>

        {totalECredits > 0 && (
          <div className="space-y-1">
            <div className="bg-muted h-2 w-full rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isOver ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {isOver && (
              <p className="text-destructive text-xs font-medium">
                ⚠ You&apos;ve planned {Math.abs(remaining)} more eCredits than your balance. Consider reducing some bids.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="space-y-3">
        <SearchModule
          handleModSelect={handleModSelect}
          takenModule={takenModules}
          placeholder="Search for a module to add to your bid plan..."
          maxResults={6}
        />
        {pendingModule && (
          <AddModulePanel
            pendingModule={pendingModule}
            onConfirm={handleConfirmAdd}
            onCancel={() => setPendingModule(null)}
          />
        )}
      </div>

      {/* Year Tabs */}
      <Tabs defaultValue="1">
        <TabsList className="grid w-full grid-cols-4">
          {years.map((y) => {
            const count = Object.values(entries).filter(
              (e) => e.year === y,
            ).length;
            return (
              <TabsTrigger key={y} value={y} className="gap-1.5">
                Year {y}
                {count > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-4 min-w-4 px-1 text-[10px]"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {years.map((y) => {
          const yearEntries = Object.values(entries).filter(
            (e) => e.year === y,
          );

          return (
            <TabsContent key={y} value={y} className="mt-4">
              {yearEntries.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center py-10 text-center">
                    <p className="text-muted-foreground text-sm">
                      No modules planned for Year {y}.
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Search for a module above and assign it to Year {y}.
                    </p>
                  </CardContent>
                </Card>
              )}

              {yearEntries.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2">
                  {terms.map((t) => {
                    const termEntries = yearEntries.filter(
                      (e) => e.term === t,
                    );
                    const hasModules = termEntries.length > 0;

                    if (!hasModules) {
                      return (
                        <Card key={t} className="border-dashed opacity-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{t}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground text-xs">
                              No modules
                            </p>
                          </CardContent>
                        </Card>
                      );
                    }

                    return (
                      <Card key={t}>
                        <CardContent className="pt-4">
                          <TermSection
                            year={y}
                            term={t}
                            entries={termEntries}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
