"use client";

import {
  BookOpen,
  Clapperboard,
  GalleryVerticalEnd,
  KeyRound,
  Layers,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStudio } from "@/lib/studio/store";
import type { ViewId } from "@/lib/studio/types";
import { Welcome } from "./welcome";
import { PipelineView } from "./pipeline";
import { GraphView } from "./graph-view";
import { CastView } from "./cast-view";
import { GalleryView } from "./gallery-view";
import { PlaybookView } from "./playbook";
import { SettingsView } from "./settings-view";
import { QueueBar } from "./queue-bar";

const NAV: { id: ViewId; label: string; icon: typeof Workflow }[] = [
  { id: "pipeline", label: "Flow", icon: Layers },
  { id: "graph", label: "Graph", icon: Workflow },
  { id: "cast", label: "Cast", icon: Users },
  { id: "gallery", label: "Gallery", icon: GalleryVerticalEnd },
  { id: "playbook", label: "Guide", icon: BookOpen },
  { id: "settings", label: "Settings", icon: KeyRound },
];

const MOBILE_NAV = NAV.filter((n) => n.id !== "playbook");

export function StudioShell() {
  const view = useStudio((s) => s.view);
  const setView = useStudio((s) => s.setView);
  const key = useStudio((s) => s.apiKey);
  const running = useStudio((s) => s.queueRunning);

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-x-hidden bg-background text-foreground">
      <div className="shrink-0 border-b pt-safe">
        <header className="flex h-12 items-center gap-3 px-3 md:h-14 md:px-4">
          <Button
            type="button"
            variant="ghost"
            className="h-11 gap-2.5 px-1"
            onClick={() => setView("pipeline")}
          >
            <span className="grid size-8 place-items-center border bg-card">
              <Clapperboard className="size-4" />
            </span>
            <span className="leading-none text-left">
              <span className="block text-sm font-medium tracking-tight">Waifu</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Studio
              </span>
            </span>
          </Button>
          <div className="hidden items-center gap-1 md:flex lg:hidden">
            {NAV.map((n) => (
              <Button
                key={n.id}
                type="button"
                variant={view === n.id ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView(n.id)}
              >
                <n.icon className="size-3.5" />
                {n.label}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {running ? (
              <Badge variant="outline" className="gap-1.5">
                <Sparkles className="size-3.5 animate-pulse" />
                <span className="hidden sm:inline">Queue</span>
              </Badge>
            ) : null}
            <Button
              type="button"
              variant={key ? "secondary" : "outline"}
              size="sm"
              className="h-11 min-h-11 md:h-8 md:min-h-8"
              onClick={() => setView("settings")}
            >
              <span className="sm:hidden">{key ? "Key" : "No key"}</span>
              <span className="hidden sm:inline">
                {key ? "OpenRouter connected" : "Add API key"}
              </span>
            </Button>
          </div>
        </header>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-1 border-r py-3 lg:flex">
          {NAV.map((n) => (
            <Button
              key={n.id}
              type="button"
              title={n.label}
              variant={view === n.id ? "secondary" : "ghost"}
              className="size-11 flex-col gap-0.5 text-[10px]"
              onClick={() => setView(n.id)}
            >
              <n.icon className="size-4" />
              {n.label}
            </Button>
          ))}
        </aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          {view === "pipeline" && <PipelineView />}
          {view === "graph" && <GraphView />}
          {view === "cast" && <CastView />}
          {view === "gallery" && <GalleryView />}
          {view === "playbook" && <PlaybookView />}
          {view === "settings" && <SettingsView />}
        </main>
      </div>

      <QueueBar />

      <nav className="z-20 grid h-tabbar grid-cols-5 border-t bg-card select-none md:hidden">
        {MOBILE_NAV.map((n) => {
          const active = view === n.id || (n.id === "settings" && view === "playbook");
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setView(n.id)}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {active ? (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-primary" />
              ) : null}
              <n.icon className="size-5" />
              {n.label}
            </button>
          );
        })}
      </nav>
      <Welcome />
      <Separator className="sr-only" />
    </div>
  );
}
