import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio/store";

export function Welcome() {
  const seen = useStudio((s) => s.welcomeSeen);
  const setSeen = useStudio((s) => s.setWelcomeSeen);
  const setView = useStudio((s) => s.setView);

  return (
    <Dialog open={!seen} onOpenChange={(o) => !o && setSeen()}>
      <DialogContent>
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
          WaifuStudio
        </p>
        <DialogTitle className="mt-2 text-xl sm:text-2xl">From portrait to motion, one pipeline.</DialogTitle>
        <DialogDescription>
          The usual anime-game fan-video path: lock a character card, generate a still, then image-to-video. Use your own
          OpenRouter key.
        </DialogDescription>
        <ol className="mt-4 space-y-2 text-sm text-fg">
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted tabular-nums">01</span>
            Pick a character card, or upload a portrait
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted tabular-nums">02</span>
            Choose a recipe: idle breath / battle / vertical daily / OP
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted tabular-nums">03</span>
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
        <button
          type="button"
          className="mt-3 w-full text-center text-xs text-subtle hover:text-muted"
          onClick={setSeen}
        >
          Add API key later
        </button>
      </DialogContent>
    </Dialog>
  );
}
