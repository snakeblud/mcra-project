"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Moon,
  Search,
  Sun,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config";

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NavBar = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <div className="mx-4 mt-4 flex w-full max-w-5xl items-center justify-between rounded-2xl border border-gray-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/60 dark:shadow-none">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500">
            <Target className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            BidBuddy
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:flex dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Link href="/bid-analytics">Analytics</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden text-gray-500 hover:bg-gray-100 hover:text-gray-900 md:flex dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Link href="/recommender">AI Advisor</Link>
          </Button>
          <Button
            size="sm"
            className="rounded-xl bg-violet-500 text-white hover:bg-violet-600"
            asChild
          >
            <Link href="/bid-planner">Bid Planner</Link>
          </Button>
          <button
            onClick={() =>
              setTheme(resolvedTheme === "light" ? "dark" : "light")
            }
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </button>
        </div>
      </div>
    </nav>
  );
};

// ─── Roadmap data ─────────────────────────────────────────────────────────────

const roadmap = [
  {
    stage: "completed",
    items: [
      "Module search and filtering",
      "Interactive timetable builder",
      "Prerequisite tracking",
      "Course degree planner",
      "Bid price analytics with charts",
      "AI-powered module recommender",
      "Bid Planner with eCredit budget tracker",
      "Help Me Bid AI strategy engine",
      "Historical bid data for all 54 modules",
    ],
  },
  {
    stage: "in-progress",
    items: [
      "Live bid price data integration",
      "More modules and bid history coverage",
    ],
  },
  {
    stage: "planned",
    items: [
      "Afterclass professor ratings integration",
      "Push alerts for bid window openings",
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0a0a0f] dark:text-white">
      <NavBar />

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center">
        {/* Background glow — dark only */}
        <div className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute left-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-[80px]" />
        </div>
        {/* Background glow — light only */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden dark:hidden">
          <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/60 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            <Zap className="h-3.5 w-3.5" />
            AI-powered bid strategy for SMU students
          </div>

          <h1 className="mb-6 text-6xl font-black leading-none tracking-tight md:text-8xl">
            <span className="block text-gray-900 dark:text-white">Win more</span>
            <span className="block bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400">
              bid smarter.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-gray-500 md:text-xl dark:text-white/50">
            BidBuddy turns raw bid history into a precise number — so you stop
            overpaying eCredits and start landing every module you want.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="gap-2 rounded-2xl bg-violet-500 px-8 text-base text-white hover:bg-violet-600"
            >
              <Link href="/bid-planner">
                Start planning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 rounded-2xl border-gray-200 bg-white px-8 text-base text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              <Link href="/bid-analytics">
                <BarChart3 className="h-4 w-4" />
                View bid history
              </Link>
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {[
              { value: "54", label: "modules" },
              { value: "690+", label: "bid records" },
              { value: "3", label: "AI strategies" },
              { value: "100%", label: "free" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-gray-900 md:text-4xl dark:text-white">
                  {value}
                </p>
                <p className="mt-0.5 text-sm text-gray-400 dark:text-white/40">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento feature grid ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black md:text-4xl">
              Everything to nail BOSS bidding
            </h2>
            <p className="mt-3 text-gray-400 dark:text-white/40">
              One platform. All the tools.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {/* Tall hero tile — Bid Planner */}
            <Link
              href="/bid-planner"
              className="group col-span-2 row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100/50 p-8 transition-all hover:shadow-lg dark:border-violet-500/20 dark:from-violet-950/80 dark:to-violet-900/40 dark:hover:border-violet-500/50 dark:hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Bid Planner
                </h3>
                <p className="mt-3 leading-relaxed text-gray-500 dark:text-white/50">
                  Add modules to a year/term calendar, set eCredit budgets per
                  term, and see your entire bid plan at a glance. Know exactly
                  how much you&apos;re committing before round opens.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                Open planner{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Help Me Bid */}
            <Link
              href="/bid-planner"
              className="group col-span-2 flex flex-col justify-between overflow-hidden rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100/50 p-6 transition-all hover:shadow-md dark:border-fuchsia-500/20 dark:from-fuchsia-950/60 dark:to-fuchsia-900/20 dark:hover:border-fuchsia-500/40"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 dark:bg-fuchsia-500/20">
                  <Bot className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    Help Me Bid
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                    Pick aggressive, average, or conservative — get a precise
                    eCredit number backed by historical data.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {["Aggressive 🔥", "Average ⚖️", "Conservative 💰"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-fuchsia-200 bg-white px-2.5 py-1 text-xs text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-white/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Link>

            {/* Bid Analytics */}
            <Link
              href="/bid-analytics"
              className="group rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 transition-all hover:shadow-md dark:border-blue-500/20 dark:from-blue-950/60 dark:to-blue-900/20 dark:hover:border-blue-500/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Bid Analytics
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                Charts, mean, median, SD — filtered by instructor, term, section.
              </p>
            </Link>

            {/* eCredit Tracker */}
            <Link
              href="/bid-planner"
              className="group rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 transition-all hover:shadow-md dark:border-emerald-500/20 dark:from-emerald-950/60 dark:to-emerald-900/20 dark:hover:border-emerald-500/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Budget Tracker
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                Live bar shows used vs remaining eCredits as you plan.
              </p>
            </Link>

            {/* AI Recommender */}
            <Link
              href="/recommender"
              className="group col-span-2 flex items-center gap-6 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 transition-all hover:shadow-md dark:border-orange-500/20 dark:from-orange-950/40 dark:to-orange-900/10 dark:hover:border-orange-500/40"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-500/20">
                <BrainCircuit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  AI Module Recommender
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                  Upload your transcript, enter your target job role — get a
                  personalised 4-year module roadmap tailored to your career.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-orange-500 dark:text-white/20 dark:group-hover:text-orange-400" />
            </Link>

            {/* Module search */}
            <Link
              href="/modules"
              className="group rounded-3xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10">
                <Search className="h-5 w-5 text-gray-500 dark:text-white/60" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Module Search
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                All SMU modules, prereqs, schedules.
              </p>
            </Link>

            {/* Timetable */}
            <Link
              href={`/timetable/${APP_CONFIG.currentTerm}`}
              className="group rounded-3xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-white/60" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white">
                Timetable Builder
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-white/50">
                Drag-and-drop schedule with clash detection.
              </p>
            </Link>

            {/* Degree Planner */}
            <Link
              href="/planner"
              className="group col-span-2 flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md dark:border-white/5 dark:bg-white/5 dark:hover:border-white/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/10">
                <BookOpen className="h-5 w-5 text-gray-500 dark:text-white/60" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Degree Planner
                </h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-white/50">
                  Map your full 4-year journey and track graduation requirements.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-black md:text-4xl">
              From zero to bid-ready in 3 steps
            </h2>
          </div>

          <div className="relative grid gap-6 md:grid-cols-3">
            {/* connector line */}
            <div className="absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] hidden h-px bg-gradient-to-r from-violet-500/0 via-violet-500/40 to-violet-500/0 md:block" />

            {[
              {
                n: "01",
                color: "from-violet-500 to-violet-600",
                icon: <Search className="h-5 w-5 text-white" />,
                title: "Find your modules",
                desc: "Search for the modules you want and drop them into your Bid Planner, assigned to the right year and term.",
              },
              {
                n: "02",
                color: "from-fuchsia-500 to-fuchsia-600",
                icon: <TrendingUp className="h-5 w-5 text-white" />,
                title: "Study the bid history",
                desc: "Pull up the analytics modal — filter by instructor, term, section — and see exactly what previous cohorts paid.",
              },
              {
                n: "03",
                color: "from-pink-500 to-pink-600",
                icon: <Bot className="h-5 w-5 text-white" />,
                title: "Get your number",
                desc: 'Hit "Help Me Bid", choose aggressive / average / conservative, set your budget, and get a data-backed bid in one click.',
              },
            ].map(({ n, color, icon, title, desc }) => (
              <div key={n} className="relative flex flex-col items-center text-center">
                <div
                  className={`relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg`}
                >
                  {icon}
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-50 text-[10px] font-black text-gray-400 ring-1 ring-gray-200 dark:bg-[#0a0a0f] dark:text-white/40 dark:ring-white/10">
                    {n}
                  </span>
                </div>
                <h3 className="mb-2 font-bold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-white/40">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black md:text-4xl">Roadmap</h2>
            <p className="mt-3 text-gray-400 dark:text-white/40">
              What&apos;s shipped, what&apos;s being built, what&apos;s next.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {roadmap.map((block) => {
              const styles = {
                completed: {
                  badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",
                  dot: "bg-emerald-500",
                  card: "border-emerald-100 bg-white dark:border-emerald-500/10 dark:bg-white/[0.02]",
                  text: "text-gray-400 line-through dark:text-white/30",
                },
                "in-progress": {
                  badge: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400",
                  dot: "bg-yellow-400",
                  card: "border-yellow-100 bg-white dark:border-yellow-500/10 dark:bg-white/[0.02]",
                  text: "text-gray-700 dark:text-white/70",
                },
                planned: {
                  badge: "border-gray-200 bg-gray-50 text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-white/40",
                  dot: "bg-gray-300 dark:bg-white/30",
                  card: "border-gray-100 bg-white dark:border-white/5 dark:bg-white/[0.02]",
                  text: "text-gray-700 dark:text-white/70",
                },
              };
              const s = styles[block.stage as keyof typeof styles]!;
              const Icon =
                block.stage === "completed"
                  ? CheckCircle
                  : block.stage === "in-progress"
                    ? Clock
                    : Circle;

              return (
                <div
                  key={block.stage}
                  className={`rounded-3xl border p-6 ${s.card}`}
                >
                  <div
                    className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${s.badge}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {block.stage === "in-progress"
                      ? "In Progress"
                      : block.stage.charAt(0).toUpperCase() +
                        block.stage.slice(1)}
                  </div>
                  <ul className="space-y-2.5">
                    {block.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <div className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.dot} ${block.stage === "completed" ? "opacity-40" : ""}`} />
                        <span className={s.text}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-32 pt-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-12 text-center dark:border-violet-500/20 dark:from-violet-950/80 dark:to-[#0a0a0f]">
          <div className="pointer-events-none absolute inset-0 hidden dark:block">
            <div className="absolute left-1/2 top-0 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[80px]" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-black text-gray-900 md:text-4xl dark:text-white">
              Ready to bid with confidence?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-gray-500 dark:text-white/50">
              Open the Bid Planner, add your modules, and let BidBuddy work out
              the numbers.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="gap-2 rounded-2xl bg-violet-500 px-8 text-base text-white hover:bg-violet-600"
              >
                <Link href="/bid-planner">
                  <Target className="h-4 w-4" />
                  Open Bid Planner
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-2 rounded-2xl border-gray-200 bg-white px-8 text-base text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                <Link href="/recommender">
                  <BrainCircuit className="h-4 w-4" />
                  Try AI Recommender
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 px-4 py-8 dark:border-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500">
              <Target className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-400 dark:text-white/60">
              BidBuddy
            </span>
          </Link>
          <p className="text-xs text-gray-300 dark:text-white/20">
            © {new Date().getFullYear()} BidBuddy
          </p>
        </div>
      </footer>
    </div>
  );
}
