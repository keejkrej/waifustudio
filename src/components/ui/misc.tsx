import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "muted",
  children,
}: {
  className?: string;
  tone?: "muted" | "cast" | "still" | "motion" | "ok" | "danger" | "warn";
  children: React.ReactNode;
}) {
  const tones: Record<string, string> = {
    muted: "text-muted border-border",
    cast: "text-cast border-cast/30",
    still: "text-still border-still/30",
    motion: "text-motion border-motion/30",
    ok: "text-ok border-ok/30",
    danger: "text-danger border-danger/30",
    warn: "text-warn border-warn/30",
  };
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-elevated">
      <div
        className="h-full bg-accent transition-[width] duration-300 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div
      className="grid w-full rounded-sm border border-border bg-bg p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "h-11 rounded-[6px] px-1 text-xs font-medium transition-colors duration-150 md:h-8 md:px-3",
            value === o.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-sm text-fg"
    >
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors duration-150",
          checked ? "bg-accent" : "bg-elevated",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-fg transition-transform duration-150",
            checked ? "translate-x-4" : "translate-x-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
