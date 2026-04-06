"use client";

import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Brain,
  BrainCircuit,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  CloudUpload,
  FileText,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  LearningPreference,
  RecommendationResult,
  RecommendedModule,
} from "@/lib/recommender-engine";
import {
  extractTakenModulesFromTranscriptText,
  generateRecommendations,
} from "@/lib/recommender-engine";
import { useModuleBankStore } from "@/stores/moduleBank/provider";
import { useMultiplePlannerStore } from "@/stores/multiplePlanners/provider";
import type { Term, Year } from "@/types/planner";
import type { ModuleCode } from "@/types/primitives/module";

// ─── Processing steps ────────────────────────────────────────────────────────

const PROCESSING_STEPS = [
  { label: "Uploading and parsing transcript...", duration: 800 },
  { label: "Extracting academic records and grades...", duration: 1000 },
  { label: "Analysing interest and career profile...", duration: 900 },
  { label: "Matching against module catalogue...", duration: 700 },
  { label: "Identifying skill gaps for target role...", duration: 800 },
  { label: "Generating personalised learning path...", duration: 1000 },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: RecommendedModule["priority"] }) {
  if (priority === "essential")
    return (
      <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800">
        Essential
      </Badge>
    );
  return (
    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800">
      Recommended
    </Badge>
  );
}

function ModuleCard({ mod }: { mod: RecommendedModule }) {
  return (
    <div className="border rounded-lg p-4 space-y-2 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <span className="font-mono text-sm font-bold text-primary">
            {mod.moduleCode}
          </span>
          <p className="font-semibold text-sm leading-tight mt-0.5">{mod.name}</p>
        </div>
        <PriorityBadge priority={mod.priority} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{mod.reason}</p>
      <div className="flex flex-wrap gap-1 pt-1">
        {mod.skillsGained.map((skill) => (
          <span
            key={skill}
            className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

// Group recommended modules by year
function groupByYear(modules: RecommendedModule[]) {
  const groups: Record<string, RecommendedModule[]> = {};
  for (const mod of modules) {
    if (!groups[mod.year]) groups[mod.year] = [];
    groups[mod.year]!.push(mod);
  }
  return groups;
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { getDocument, GlobalWorkerOptions } = pdfjsLib;

  GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const document = await getDocument({ data }).promise;
  const chunks: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    chunks.push(pageText);
  }

  return chunks.join("\n");
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Step = "form" | "processing" | "results";

export default function RecommenderPage() {
  const router = useRouter();
  const { modules, refreshModuleBank } = useModuleBankStore((s) => s);
  const { planners, addPlanner, addModule } = useMultiplePlannerStore((s) => s);

  // ── Step state
  const [step, setStep] = useState<Step>("form");

  // ── Form state
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState("");
  const [interests, setInterests] = useState("");
  const [preference, setPreference] = useState<LearningPreference>("depth");
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Processing state
  const [processStep, setProcessStep] = useState(0);

  // ── Result state
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [isParsingTranscript, setIsParsingTranscript] = useState(false);

  // ── File drop/select
  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  // ── Form validation & submission
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!file) newErrors.file = "Please upload your academic transcript";
    if (!jobRole.trim()) newErrors.jobRole = "Please enter your target job role";
    if (!interests.trim()) newErrors.interests = "Please enter at least one interest";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const transcriptFile = file;
    if (!transcriptFile) return;

    setErrors({});
    setStep("processing");
    setProcessStep(0);

    // Run through processing animation steps
    for (let i = 0; i < PROCESSING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, PROCESSING_STEPS[i]!.duration));
      setProcessStep(i + 1);
    }

    // Ensure module bank is loaded
    if (Object.keys(modules).length === 0) {
      await refreshModuleBank();
    }

    // Grab the latest modules from the store after refresh
    const latestModules =
      Object.keys(modules).length > 0
        ? modules
        : await fetch("/data/modules.json").then((r) => r.json());

    let transcriptModulesTaken: ModuleCode[] = [];
    try {
      setIsParsingTranscript(true);
      const transcriptText = await extractTextFromPdf(transcriptFile);
      transcriptModulesTaken = extractTakenModulesFromTranscriptText(
        transcriptText,
        latestModules,
      );
    } catch (error) {
      console.error("Failed to parse transcript PDF", error);
      setErrors((prev) => ({
        ...prev,
        file: "We couldn't read your transcript. Please upload another PDF.",
      }));
    } finally {
      setIsParsingTranscript(false);
    }

    // Generate the result
    const rec = generateRecommendations(
      {
        jobRole,
        interests,
        preference,
        hasTranscript: true,
        transcriptModulesTaken,
      },
      latestModules,
    );

    // Short pause for dramatic effect
    await new Promise((r) => setTimeout(r, 400));
    setResult(rec);
    setStep("results");
  };

  // ── Plan My Bids
  const handlePlanMyBids = async () => {
    if (!result) return;
    setIsCreatingPlan(true);

    // Ensure modules are available
    let bank = modules;
    if (Object.keys(bank).length === 0) {
      await refreshModuleBank();
      bank = modules;
    }
    if (Object.keys(bank).length === 0) {
      bank = await fetch("/data/modules.json").then((r) => r.json());
    }

    const plannerCount = Object.keys(planners).length;
    const newPlannerId = `planner${plannerCount}`;

    addPlanner(`AI Recommended: ${result.jobRoleDetected}`);

    for (const mod of result.recommendedModules) {
      if (bank[mod.moduleCode]) {
        addModule(
          mod.moduleCode as ModuleCode,
          {
            id: mod.moduleCode,
            year: mod.year as Year,
            term: mod.term as Term,
          },
          bank,
          newPlannerId,
        );
      }
    }

    setIsCreatingPlan(false);
    router.push(`/planner/${newPlannerId}`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: FORM
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === "form") {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pb-12">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">AI Module Recommender</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Upload your academic transcript and tell us your goals. Our AI will
            analyse your profile and recommend the exact modules you need.
          </p>
        </div>

        {/* Transcript Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Academic Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer
                ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"}
                ${errors.file ? "border-destructive" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB — ready to analyse
                    </p>
                  </div>
                  <button
                    className="ml-2 rounded-full p-1 hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <CloudUpload className="mb-3 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm font-medium">
                    Drop your transcript here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PDF format only · Official BOSS transcript recommended
                  </p>
                </>
              )}
            </div>
            {errors.file && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.file}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Career Goal */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Career Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="jobRole">What job are you aiming for?</Label>
              <Input
                id="jobRole"
                placeholder="e.g. Software Engineer, Data Scientist, DevSecOps, Product Manager…"
                value={jobRole}
                onChange={(e) => {
                  setJobRole(e.target.value);
                  if (e.target.value.trim())
                    setErrors((prev) => ({ ...prev, jobRole: "" }));
                }}
                className={errors.jobRole ? "border-destructive" : ""}
              />
              {errors.jobRole && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.jobRole}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="interests">
                What are you interested in or already know?
              </Label>
              <Input
                id="interests"
                placeholder="e.g. Python, DevSecOps, React, Machine Learning, SQL, Cloud…"
                value={interests}
                onChange={(e) => {
                  setInterests(e.target.value);
                  if (e.target.value.trim())
                    setErrors((prev) => ({ ...prev, interests: "" }));
                }}
                className={errors.interests ? "border-destructive" : ""}
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple interests with commas
              </p>
              {errors.interests && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.interests}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Learning Preference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Learning Preference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  {
                    value: "depth",
                    label: "Depth",
                    desc: "Master a specialisation deeply — fewer, more focused modules that build expertise in your target domain.",
                    icon: Zap,
                  },
                  {
                    value: "breadth",
                    label: "Breadth",
                    desc: "Build a well-rounded profile — a wider selection of modules across technical and management domains.",
                    icon: Sparkles,
                  },
                ] as const
              ).map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setPreference(value)}
                  className={`rounded-lg border p-4 text-left transition-all
                    ${
                      preference === value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1.5">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          {isParsingTranscript ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Brain className="mr-2 h-4 w-4" />
          )}
          {isParsingTranscript
            ? "Parsing transcript..."
            : "Analyse & Recommend Modules"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: PROCESSING
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Animated icon */}
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
              <BrainCircuit className="h-10 w-10 text-primary animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold">AI is analysing your profile</h2>
            <p className="text-sm text-muted-foreground">
              Please wait while we generate your personalised recommendations…
            </p>
          </div>

          {/* Step list */}
          <div className="rounded-lg border bg-card p-4 text-left space-y-3">
            {PROCESSING_STEPS.map((s, i) => {
              const done = processStep > i;
              const active = processStep === i;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      done
                        ? "text-muted-foreground line-through"
                        : active
                          ? "font-medium text-foreground"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{
                width: `${(processStep / PROCESSING_STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: RESULTS
  // ─────────────────────────────────────────────────────────────────────────────
  if (!result) return null;

  const byYear = groupByYear(result.recommendedModules);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* ── Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Your AI Recommendations</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Personalised module plan for a{" "}
            <strong>{result.jobRoleDetected}</strong> career path ·{" "}
            {preference === "depth" ? "Depth" : "Breadth"} preference ·{" "}
            {result.recommendedModules.length} modules
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStep("form");
            setResult(null);
            setProcessStep(0);
          }}
        >
          Start Over
        </Button>
      </div>

      {/* ── Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-green-200 dark:border-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <BadgeCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm font-semibold">Current Skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.currentSkills.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="text-xs border-green-300 text-green-700 dark:text-green-400 dark:border-green-800"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900 sm:col-span-1">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-semibold">Skill Gaps to Close</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.skillGaps.length > 0 ? (
                result.skillGaps.map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-xs border-red-300 text-red-700 dark:text-red-400 dark:border-red-800"
                  >
                    {s}
                  </Badge>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Great &mdash; your existing skills already cover this role&apos;s core requirements!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold">Learning Path</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.learningPathSummary}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Extracted From Transcript
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.transcriptModulesTaken.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.transcriptModulesTaken.map((code) => (
                <Badge key={code} variant="outline" className="text-xs">
                  {code}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No modules were detected from the transcript text.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Module recommendations — Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="w-full">
          <TabsTrigger value="timeline" className="flex-1 gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" />
            Year-by-Year Timeline
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1 gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            All Modules
          </TabsTrigger>
        </TabsList>

        {/* Timeline tab */}
        <TabsContent value="timeline" className="mt-4 space-y-6">
          {Object.entries(byYear)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([year, mods]) => {
              const byTerm: Record<string, RecommendedModule[]> = {};
              for (const m of mods) {
                if (!byTerm[m.term]) byTerm[m.term] = [];
                byTerm[m.term]!.push(m);
              }
              return (
                <div key={year}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      Y{year}
                    </div>
                    <h3 className="font-semibold text-sm">Year {year}</h3>
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {mods.length} module{mods.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-4 pl-9">
                    {Object.entries(byTerm).map(([term, termMods]) => (
                      <div key={term}>
                        <div className="flex items-center gap-2 mb-2">
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {term}
                          </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {termMods.map((mod) => (
                            <ModuleCard key={mod.moduleCode} mod={mod} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </TabsContent>

        {/* All modules flat list */}
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {result.recommendedModules.map((mod) => (
              <ModuleCard key={mod.moduleCode} mod={mod} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Plan My Bids CTA */}
      <div className="sticky bottom-4">
        <Card className="border-primary/30 bg-card/95 backdrop-blur shadow-lg">
          <CardContent className="flex items-center justify-between gap-4 py-4 flex-wrap">
            <div>
              <p className="font-semibold text-sm">Ready to start planning?</p>
              <p className="text-xs text-muted-foreground">
                All {result.recommendedModules.length} recommended modules will be added
                to a new planner automatically.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handlePlanMyBids}
              disabled={isCreatingPlan}
              className="gap-2 min-w-[180px]"
            >
              {isCreatingPlan ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarCheck className="h-4 w-4" />
              )}
              {isCreatingPlan ? "Creating plan…" : "Plan My Bids Now"}
              {!isCreatingPlan && <ArrowRight className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
