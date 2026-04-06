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
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Background } from "@/components/Background";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { APP_CONFIG } from "@/config";

// ─── Roadmap ─────────────────────────────────────────────────────────────────

const roadmapItems = [
  {
    stage: "completed",
    items: [
      "Module search and filtering",
      "Interactive timetable builder",
      "Module information display",
      "Prerequisite tracking",
      "Course degree planner",
      "Bid price analytics with charts",
      "AI-powered module recommender",
      "Bid Planner with eCredit budget tracker",
      "Help Me Bid AI strategy engine",
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
      "Degree progress tracker",
      "Push alerts for bid window openings",
    ],
  },
];

const StageIcon = ({ stage }: { stage: string }) => {
  switch (stage) {
    case "completed":
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case "in-progress":
      return <Clock className="h-6 w-6 text-yellow-500" />;
    case "planned":
      return <Circle className="h-6 w-6 text-gray-400" />;
    default:
      return <Circle className="h-6 w-6 text-gray-400" />;
  }
};

const RoadmapComponent = () => {
  const inProgressItem = roadmapItems.find((item) => item.stage === "in-progress");
  const plannedItem = roadmapItems.find((item) => item.stage === "planned");
  const completedItem = roadmapItems.find((item) => item.stage === "completed");

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Development Roadmap</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Track our progress as we continuously improve BidBuddy to better
            serve the SMU community
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid gap-8 md:grid-cols-2">
            {[inProgressItem, plannedItem].map(
              (item, index) =>
                item && (
                  <Card key={index}>
                    <CardHeader>
                      <div className="mb-2 flex items-center gap-3">
                        <StageIcon stage={item.stage} />
                        <Badge
                          variant={
                            item.stage === "in-progress" ? "secondary" : "outline"
                          }
                        >
                          {item.stage.replace("-", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {item.items.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <div className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ),
            )}
          </div>

          {completedItem && (
            <Card>
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <StageIcon stage={completedItem.stage} />
                  <Badge variant="default">COMPLETED</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="columns-2 gap-6 space-y-2 md:columns-3">
                  {completedItem.items.map((feature, i) => (
                    <li
                      key={i}
                      className="flex break-inside-avoid items-start gap-2 text-sm"
                    >
                      <div className="bg-primary mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                      <span className="text-muted-foreground line-through">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NavBar = () => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 flex w-screen justify-center border-y px-4 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md">
            <Target className="h-4 w-4 text-white" />
          </div>
          <span className="text-foreground text-lg font-bold tracking-tight">
            BidBuddy
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href={`/timetable/${APP_CONFIG.currentTerm}`}>
              <Calendar className="mr-2 h-4 w-4" />
              Timetable
            </Link>
          </Button>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/bid-planner">
              <Target className="mr-2 h-4 w-4" />
              Bid Planner
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setTheme(resolvedTheme === "light" ? "dark" : "light")
            }
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

// ─── Feature cards ────────────────────────────────────────────────────────────

const features = [
  {
    icon: Target,
    title: "Bid Planner",
    description:
      "Add modules to a year/term calendar, set eCredit budgets per term, and track your planned bids at a glance.",
    href: "/bid-planner",
    cta: "Open Bid Planner",
    highlight: true,
  },
  {
    icon: Bot,
    title: "Help Me Bid AI",
    description:
      "Choose aggressive, average, or conservative strategy — our AI analyses historical bid data and recommends the exact eCredit amount to bid.",
    href: "/bid-planner",
    cta: "Try it",
    highlight: true,
  },
  {
    icon: BrainCircuit,
    title: "AI Module Recommender",
    description:
      "Upload your transcript, enter your target job role and interests — get a personalised module roadmap built for your career.",
    href: "/recommender",
    cta: "Get Recommendations",
  },
  {
    icon: BarChart3,
    title: "Bid Price Analytics",
    description:
      "Explore bid history charts with instructor, term, and section filters. See mean, median, SD, min and max for every module.",
    href: "/bid-analytics",
    cta: "View Analytics",
  },
  {
    icon: Wallet,
    title: "eCredit Budget Tracker",
    description:
      "Enter your eCredit balance and watch the live progress bar update as you fill in planned bids — never overspend again.",
    href: "/bid-planner",
    cta: "Track Budget",
  },
  {
    icon: Search,
    title: "Module Search",
    description:
      "Find any SMU module instantly by code or name. View credits, terms offered, class schedule and prerequisites.",
    href: "/modules",
    cta: "Search Modules",
  },
  {
    icon: Calendar,
    title: "Timetable Builder",
    description:
      "Drag, drop and visualise your class schedule. Clash detection built in so you never double-book yourself.",
    href: `/timetable/${APP_CONFIG.currentTerm}`,
    cta: "Build Timetable",
  },
  {
    icon: BookOpen,
    title: "Degree Planner",
    description:
      "Map out your entire 4-year academic journey. Track prerequisites and make sure you hit all graduation requirements.",
    href: "/planner",
    cta: "Plan Degree",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="min-h-screen">
      <Background />
      <NavBar />

      {/* Hero */}
      <section className="px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            Built for SMU students, by SMU students
          </Badge>

          <h1 className="from-primary to-foreground mb-6 bg-gradient-to-br bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
            BidBuddy
          </h1>

          <p className="text-muted-foreground mx-auto mb-4 max-w-2xl text-xl md:text-2xl">
            Stop guessing how much to bid.
          </p>
          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg">
            BidBuddy combines historical bid data, AI strategy recommendations,
            and an eCredit budget tracker so you always walk into BOSS with
            confidence.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8 text-lg">
              <Link href="/bid-planner">
                <Target className="h-5 w-5" />
                Start Bid Planning
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="gap-2 px-8 text-lg" asChild>
              <Link href="/bid-analytics">
                <BarChart3 className="h-5 w-5" />
                View Bid Analytics
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "54", label: "Modules covered" },
              { value: "690+", label: "Bid records" },
              { value: "3", label: "Bid strategies" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-primary text-3xl font-bold md:text-4xl">{value}</p>
                <p className="text-muted-foreground mt-1 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything in one place</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              From bid strategy to timetable planning — BidBuddy covers the full
              SMU student experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card
                key={f.title}
                className={`flex flex-col transition-shadow hover:shadow-md ${f.highlight ? "border-primary/40 bg-primary/5" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${f.highlight ? "bg-primary text-white" : "bg-primary/10"}`}
                  >
                    <f.icon className={`h-5 w-5 ${f.highlight ? "text-white" : "text-primary"}`} />
                  </div>
                  <CardTitle className="text-base">{f.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {f.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-0">
                  <Button variant="ghost" size="sm" asChild className="h-7 px-0 text-xs">
                    <Link href={f.href}>
                      {f.cta} <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">How BidBuddy works</h2>
            <p className="text-muted-foreground">Three steps to a stress-free bid round</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Search & add modules",
                desc: "Find the modules you want and drop them into your bid plan, assigned to the right year and term.",
              },
              {
                step: "02",
                title: "Check the analytics",
                desc: "Drill into bid history charts for your module — filter by instructor, term, and section to see exactly what others paid.",
              },
              {
                step: "03",
                title: "Get your bid price",
                desc: 'Hit "Help Me Bid", pick your strategy, set your budget range, and get a data-backed recommended bid in one click.',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold">
                  {step}
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <RoadmapComponent />

      {/* CTA */}
      <section className="bg-primary/5 px-4 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to bid smarter?</h2>
          <p className="text-muted-foreground mb-8">
            Join SMU students who use BidBuddy to stop over-spending eCredits
            and start winning module slots with confidence.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8 text-lg">
              <Link href="/bid-planner">
                <Target className="h-5 w-5" />
                Open Bid Planner
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="gap-2 px-8 text-lg">
              <Link href="/recommender">
                <BrainCircuit className="h-5 w-5" />
                Try AI Recommender
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-5 w-5 items-center justify-center rounded">
              <Target className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold">BidBuddy</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Made with ❤️ for the SMU community
          </p>
          <p className="text-muted-foreground text-xs">
            <Link
              href="https://github.com/snakeblud/mcra-project"
              className="hover:text-foreground underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
