"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  BookA,
  BookOpen,
  BrainCircuit,
  Calendar,
  ChevronRight,
  Github,
  LifeBuoy,
  Moon,
  Settings,
  Sun,
  Target,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config";
import { useTutorial } from "@/hooks/use-tutorial";
import { useBidPlannerStore } from "@/stores/bidPlanner/provider";
import { useRecommendationStore } from "@/stores/recommendation/provider";

const data = {
  navMain: [
    {
      title: "Timetable",
      url: `/timetable/${APP_CONFIG.currentTerm}`,
      icon: Calendar,
      isCollapsible: false,
    },
    {
      title: "AI Module Recommender",
      url: "/recommender",
      icon: BrainCircuit,
      isCollapsible: false,
    },
    {
      title: "Planner",
      url: "/bid-planner",
      icon: Target,
      isCollapsible: false,
    },
    {
      title: "Modules",
      url: "/modules",
      icon: BookA,
      isCollapsible: false,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      isCollapsible: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { resolvedTheme, setTheme } = useTheme();
  const { openTutorial } = useTutorial();
  const pathname = usePathname();

  const savedRec = useRecommendationStore((s) => s.saved);
  const entries = useBidPlannerStore((s) => s.entries);
  const entryCount = Object.keys(entries).length;
  const hasSession = savedRec !== null || entryCount > 0;

  return (
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      pathname.startsWith(item.url) && item.url !== "/"
                        ? "bg-accent text-accent-foreground"
                        : ""
                    }
                  >
                    <a href={item.url}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* ── Current Session ─────────────────────────────────────────── */}
        {hasSession && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground px-2 pb-1">
              Current Session
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-1.5 px-1">

                {/* AI Recommendation card */}
                {savedRec && (
                  <a
                    href="/recommender"
                    className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <BrainCircuit className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          {savedRec.result.jobRoleDetected}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {savedRec.result.recommendedModules.length} modules · AI Recommendation
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                  </a>
                )}

                {/* Bid Planner card */}
                {entryCount > 0 && (
                  <a
                    href="/bid-planner"
                    className="flex items-center justify-between gap-2 rounded-lg border border-orange-300/40 bg-orange-50/60 dark:border-orange-500/20 dark:bg-orange-950/30 px-3 py-2 hover:bg-orange-100/60 dark:hover:bg-orange-950/50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Target className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate leading-tight">
                          Bid Plan
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {entryCount} module{entryCount !== 1 ? "s" : ""} planned
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 group-hover:text-orange-500 transition-colors" />
                  </a>
                )}

              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={openTutorial}>
              <BookOpen className="mr-2 size-4" />
              <div className="flex-grow text-left">Tutorial</div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a
                href="https://github.com/snakeblud/mcra-project"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 size-4" />
                GitHub
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() =>
                setTheme(resolvedTheme === "light" ? "dark" : "light")
              }
            >
              <Sun className="mr-2 block size-4 dark:hidden" />
              <Moon className="mr-2 hidden size-4 dark:block" />
              <div className="flex-grow text-left">Change Mode</div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="mailto:knyanlin@johnnyknl.com">
                <LifeBuoy className="mr-2 size-4" />
                Contact Us
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
