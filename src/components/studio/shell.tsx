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
import { Toaster } from "sonner";
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
    <div className="flex h-dvh min-h-0 flex-col overflow-x-hidden bg-bg text-fg">
      <div className="shrink-0 border-b border-hairline pt-safe">
        <header className="flex h-12 items-center gap-3 px-3 md:h-14 md:px-4">
          <button
            type="button"
            className="flex min-h-11 items-center gap-2.5"
            onClick={() => setView("pipeline")}
          >
            <span className="grid size-8 place-items-center rounded-sm border border-border bg-elevated">
              <Clapperboard className="size-4 text-accent" />
            </span>
            <span className="leading-none">
              <span className="block font-display text-lg italic tracking-tight">Waifu</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
                Studio
              </span>
            </span>
          </button>
          <div className="hidden items-center gap-1 md:flex lg:hidden">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setView(n.id)}
                className={cn(
                  "inline-flex h-11 items-center gap-2 rounded-sm px-3 text-sm transition-colors duration-150",
                  view === n.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                )}
              >
                <n.icon className="size-3.5" />
                {n.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {running ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-motion">
                <Sparkles className="size-3.5 animate-pulse" />
                <span className="hidden sm:inline">Queue</span>
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setView("settings")}
              className={cn(
                "inline-flex h-11 min-h-11 items-center rounded-full border px-3 text-[11px] font-medium md:h-8 md:min-h-8 md:px-3",
                key ? "border-ok/40 text-ok" : "border-warn/40 text-warn",
              )}
            >
              <span className="sm:hidden">{key ? "Key" : "No key"}</span>
              <span className="hidden sm:inline">{key ? "OpenRouter connected" : "Add API key"}</span>
            </button>
          </div>
        </header>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[72px] shrink-0 flex-col items-center gap-1 border-r border-hairline py-3 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              title={n.label}
              onClick={() => setView(n.id)}
              className={cn(
                "flex size-11 flex-col items-center justify-center gap-0.5 rounded-sm text-[10px] transition-colors duration-150",
                view === n.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
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

      <nav className="z-20 grid h-tabbar grid-cols-5 border-t border-hairline bg-surface select-none md:hidden">
        {MOBILE_NAV.map((n) => {
          const active = view === n.id || (n.id === "settings" && view === "playbook");
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => setView(n.id)}
              className={cn(
                "relative flex min-h-11 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                active ? "text-fg" : "text-muted",
              )}
            >
              {active ? (
                <span className="absolute top-0 h-0.5 w-6 rounded-full bg-accent" />
              ) : null}
              <n.icon className="size-5" />
              {n.label}
            </button>
          );
        })}
      </nav>
      <Welcome />
      <Toaster
        theme="dark"
        position="top-center"
        offset="calc(env(safe-area-inset-top, 0px) + 12px)"
        richColors={false}
      />
    </div>
  );
}
