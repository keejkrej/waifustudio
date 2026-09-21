import { Loader2 } from "lucide-react";
import { useStudio } from "@/lib/studio/store";
import { cn, formatTime } from "@/lib/utils";

export function QueueBar() {
  const jobs = useStudio((s) => s.jobs);
  const latest = jobs.slice(0, 6);
  if (!latest.length) {
    return (
      <div className="hidden h-9 shrink-0 items-center border-t border-hairline px-4 text-xs text-subtle md:flex">
        Queue idle · jobs will show up here
      </div>
    );
  }
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 overflow-x-auto border-t border-hairline px-3 md:h-9 md:px-4">
      <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">
        Queue
      </span>
      {latest.map((j) => (
        <span
          key={j.id}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] md:h-auto md:py-0.5",
            j.status === "done" && "border-ok/30 text-ok",
            j.status === "error" && "border-danger/30 text-danger",
            (j.status === "running" || j.status === "polling") &&
              "border-motion/30 text-motion",
            j.status === "queued" && "border-border text-muted",
          )}
          title={j.error ?? j.prompt}
        >
          {(j.status === "running" || j.status === "polling") && (
            <Loader2 className="size-3 animate-spin" />
          )}
          {j.title}
          <span className="text-subtle">{formatTime(j.createdAt)}</span>
        </span>
      ))}
    </div>
  );
}
