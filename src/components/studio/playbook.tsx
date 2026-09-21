import { ChevronLeft } from "lucide-react";
import { useStudio } from "@/lib/studio/store";

export function PlaybookView() {
  const setView = useStudio((s) => s.setView);

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          className="mb-4 inline-flex h-11 items-center gap-1 text-sm text-muted md:hidden"
          onClick={() => setView("settings")}
        >
          <ChevronLeft className="size-4" />
          Settings
        </button>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Playbook</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight md:text-4xl">Fan-video pipeline</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Anime mobile-game character videos are not “drop a portrait into a model and copy it.” Use a reference plus a
          lock prompt to keep the look, write the action as shots, then image-to-video to move the still. Below is the
          common path, mapped to WaifuStudio.
        </p>

        <Section n="01" title="Gather references">
          Official portraits, Live2D captures, battle result screens, character sheets. Reference only — do not ship
          them as the finished clip. Upload to Cast. One front-facing bust plus one full-body is usually enough.
        </Section>
        <Section n="02" title="Lock the character">
          Local ComfyUI often uses IP-Adapter / InstantID / PuLID / a character LoRA and a fixed seed. The cloud path is
          reference images (input_references) plus a lock prompt. Too strong pastes the photo; too weak swaps the face.
          Start with one clean portrait.
        </Section>
        <Section n="03" title="Storyboard">
          3–8 shots: establish → action → climax → resolve. Write framing, action, and light for each. Recipes like
          Idle breath / Look back / Battle / OP are the high-frequency setups.
        </Section>
        <Section n="04" title="Still">
          Same job as Checkpoint + CLIP + KSampler in ComfyUI. Here it is OpenRouter image models (Nano Banana,
          Seedream, FLUX, Grok Imagine). Pick aspect for the cut: vertical 9:16 / 2:3, widescreen 16:9.
        </Section>
        <Section n="05" title="Image-to-video">
          Use the still as first_frame. Motion prompts describe the camera, not the outfit again. Seedance / Wan / Veo /
          Hailuo / Grok Imagine Video are in Settings. Start at 5–8s, confirm the face holds, then go longer.
        </Section>
        <Section n="06" title="Finish and upload">
          Frame interpolation, upscale, BGM, and captions live in an editor. For Bilibili: 16:9 cover, hook in the
          first 3 seconds, title with character or game, description marks fan work and the model.
        </Section>

        <h2 className="mt-10 font-display text-2xl tracking-tight">ComfyUI mapping</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">ComfyUI</th>
                <th className="px-3 py-2 font-medium">WaifuStudio</th>
              </tr>
            </thead>
            <tbody className="text-fg">
              {[
                ["Load Image", "Cast node / Cast library refs"],
                ["CLIP Text Encode", "Prompt node + lock prompt"],
                ["KSampler / image model", "Still node (OpenRouter Images)"],
                ["AnimateDiff / I2V", "Video node (OpenRouter Videos)"],
                ["Preview / Save", "Output node + Gallery"],
                ["Queue Prompt", "Queue Prompt in the toolbar"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-hairline">
                  <td className="px-3 py-2 font-mono text-xs text-muted">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-subtle">
          Sample characters are original and do not map to existing game IP. When you use your own portraits and
          prompts, follow the title’s and the platform’s rules.
        </p>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: string }) {
  return (
    <section className="mt-8 grid grid-cols-[48px_1fr] gap-4">
      <span className="font-mono text-xs text-subtle">{n}</span>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </section>
  );
}
