import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs font-medium tracking-wide text-muted", className)}
    {...props}
  />
));
Label.displayName = "Label";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-sm border border-border bg-bg px-3 text-base text-fg placeholder:text-subtle outline-none transition-colors duration-150 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 md:h-10 md:text-sm",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full resize-y rounded-sm border border-border bg-bg px-3 py-2 text-base text-fg placeholder:text-subtle outline-none transition-colors duration-150 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 md:text-sm",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function SelectNative({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-sm border border-border bg-bg px-3 text-base text-fg outline-none transition-colors duration-150 focus:border-accent/50 focus:ring-2 focus:ring-accent/20 md:h-10 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}
