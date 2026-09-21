"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio/store";

export function Welcome() {
  const seen = useStudio((s) => s.welcomeSeen);
  const setSeen = useStudio((s) => s.setWelcomeSeen);
  const setView = useStudio((s) => s.setView);

  return (
    <Dialog open={!seen} onOpenChange={(o) => !o && setSeen()}>
      <DialogContent>
        <DialogHeader>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            WaifuStudio
          </p>
          <DialogTitle className="mt-2 text-xl sm:text-2xl">
            From portrait to motion, one pipeline.
          </DialogTitle>
          <DialogDescription>
            The usual anime-game fan-video path: lock a character card, generate a still, then
            image-to-video. Use your own OpenRouter key.
          </DialogDescription>
        </DialogHeader>
        <ol className="mt-4 space-y-2 text-sm">
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">01</span>
            Pick a character card, or upload a portrait
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">02</span>
            Choose a recipe: idle breath / battle / vertical daily / OP
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted-foreground tabular-nums">03</span>
            Make a still, then send the first frame into image-to-video
          </li>
        </ol>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => {
              setSeen();
              setView("pipeline");
            }}
          >
            Start creating
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSeen();
              setView("graph");
            }}
          >
            Node graph
          </Button>
        </div>
        <Button type="button" variant="ghost" className="w-full text-xs" onClick={setSeen}>
          Add API key later
        </Button>
      </DialogContent>
    </Dialog>
  );
}
