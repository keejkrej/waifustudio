import { useMemo, useState } from "react";
import { ArrowRight, Clapperboard, ImagePlus, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Textarea, SelectNative } from "@/components/ui/field";
import { Badge, ProgressBar, Segmented } from "@/components/ui/misc";
import { IMAGE_MODELS, VIDEO_MODELS } from "@/lib/studio/models";
import { RECIPES, STYLE_PRESETS, MOTION_PRESETS, BILI_CHECKLIST } from "@/lib/studio/presets";
import { expandDirectorNotes, generateMotion, generateStill } from "@/lib/studio/execute";
import { useStudio } from "@/lib/studio/store";
import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1 as const, label: "Cast" },
  { n: 2 as const, label: "Shot" },
  { n: 3 as const, label: "Still" },
  { n: 4 as const, label: "Motion" },
  { n: 5 as const, label: "Cut" },
];

export function PipelineView() {
  const pipeline = useStudio((s) => s.pipeline);
  const patch = useStudio((s) => s.patchPipeline);
  const characters = useStudio((s) => s.characters);
  const settings = useStudio((s) => s.settings);
  const patchSettings = useStudio((s) => s.patchSettings);
  const setView = useStudio((s) => s.setView);
  const [busy, setBusy] = useState<"still" | "video" | "expand" | null>(null);

  const character = characters.find((c) => c.id === pipeline.characterId) ?? characters[0];
  const recipe = RECIPES.find((r) => r.id === pipeline.recipeId) ?? RECIPES[0]!;

  const pct = ((pipeline.step - 1) / 4) * 100;

  const stillReady = Boolean(pipeline.stillPreviewUrl);
  const videoReady = Boolean(pipeline.videoPreviewUrl);

  const frame = pipeline.stillPreviewUrl ?? character?.refs[0];

  async function onStill() {
    if (!character) return;
    setBusy("still");
    try {
      const res = await generateStill({
        character,
        prompt: pipeline.stillPrompt,
        model: settings.imageModel,
        aspectRatio: pipeline.aspect,
        resolution: settings.defaultResolution,
      });
      patch({ stillAssetId: res.assetId, stillPreviewUrl: res.url, step: 4 });
    } catch {
      /* toasted */
    } finally {
      setBusy(null);
    }
  }

  async function onVideo() {
    if (!character || !frame) return;
    setBusy("video");
    try {
      const res = await generateMotion({
        character,
        prompt: pipeline.motionPrompt,
        model: settings.videoModel,
        duration: settings.defaultDuration,
        resolution: settings.videoResolution,
        aspectRatio: settings.videoAspect,
        firstFrameUrl: frame,
      });
      patch({ videoAssetId: res.assetId, videoPreviewUrl: res.url, step: 5 });
    } catch {
      /* toasted */
    } finally {
      setBusy(null);
    }
  }

  async function onExpand(kind: "still" | "motion") {
    if (!character) return;
    setBusy("expand");
    try {
      const text = await expandDirectorNotes({
        character,
        notes: kind === "still" ? pipeline.stillPrompt : pipeline.motionPrompt,
        kind,
      });
      patch(kind === "still" ? { stillPrompt: text } : { motionPrompt: text });
    } catch {
      /* toasted */
    } finally {
      setBusy(null);
    }
  }

  const stepPanel = useMemo(() => {
    if (!character) {
      return (
        <EmptyHint
          title="No character cards yet"
          action="Open cast"
          onClick={() => setView("cast")}
        />
      );
    }
    if (pipeline.step === 1) {
      return (
        <div className="grid grid-cols-2 gap-3">
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => patch({ characterId: c.id, step: 2 })}
              className={cn(
                "overflow-hidden rounded-lg border text-left transition-colors duration-150",
                c.id === character.id
                  ? "border-accent/40 bg-elevated"
                  : "border-border hover:bg-elevated/60",
              )}
            >
              <img
                src={c.refs[0]}
                alt=""
                className="aspect-[2/3] w-full object-cover"
              />
              <span className="block border-t border-hairline px-2.5 py-2">
                <span className="block font-medium">{c.name}</span>
                <span className="mt-0.5 block text-xs text-muted">{c.game}</span>
              </span>
            </button>
          ))}
        </div>
      );
    }
    if (pipeline.step === 2) {
      return (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {RECIPES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() =>
                  patch({
                    recipeId: r.id,
                    aspect: r.aspect,
                    stillPrompt: r.still,
                    motionPrompt: r.motion,
                  })
                }
                className={cn(
                  "min-h-16 rounded-lg border p-3 text-left transition-colors duration-150",
                  r.id === recipe.id
                    ? "border-accent/40 bg-elevated"
                    : "border-border hover:bg-elevated/60",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="font-medium">{r.name}</span>
                  <Badge tone="muted">{r.aspect}</Badge>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  {r.blurb}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {STYLE_PRESETS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="min-h-11 rounded-full border border-border px-3 py-2 text-xs text-muted hover:text-fg"
                onClick={() =>
                  patch({ stillPrompt: `${pipeline.stillPrompt}. ${s.text}` })
                }
              >
                {s.name}
              </button>
            ))}
          </div>
          <Button className="hidden md:inline-flex" onClick={() => patch({ step: 3 })}>
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      );
    }
    if (pipeline.step === 3) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <Field label="Still prompt">
              <Textarea
                rows={6}
                value={pipeline.stillPrompt}
                onChange={(e) => patch({ stillPrompt: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 md:min-h-9"
                disabled={busy !== null}
                onClick={() => onExpand("still")}
              >
                <Wand2 className="size-3.5" />
                Expand
              </Button>
              <Field label="Aspect" className="w-32">
                <SelectNative
                  value={pipeline.aspect}
                  onChange={(e) => patch({ aspect: e.target.value })}
                >
                  {["1:1", "2:3", "3:4", "9:16", "16:9", "4:3"].map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </SelectNative>
              </Field>
              <Field label="Image model" className="min-w-0 flex-1">
                <SelectNative
                  value={settings.imageModel}
                  onChange={(e) => patchSettings({ imageModel: e.target.value })}
                >
                  {IMAGE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </SelectNative>
              </Field>
            </div>
            <Button className="hidden md:inline-flex" onClick={onStill} disabled={busy !== null}>
              {busy === "still" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Generate still
            </Button>
          </div>
          <StillPreview src={pipeline.stillPreviewUrl ?? character.refs[0]} label="Reference / result" />
        </div>
      );
    }
    if (pipeline.step === 4) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <Field label="Motion prompt">
              <Textarea
                rows={5}
                value={pipeline.motionPrompt}
                onChange={(e) => patch({ motionPrompt: e.target.value })}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              {MOTION_PRESETS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="min-h-11 rounded-full border border-border px-3 py-2 text-xs text-muted hover:text-fg"
                  onClick={() => patch({ motionPrompt: m.text })}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Video model">
                <SelectNative
                  value={settings.videoModel}
                  onChange={(e) => patchSettings({ videoModel: e.target.value })}
                >
                  {VIDEO_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </SelectNative>
              </Field>
              <Field label="Duration">
                <SelectNative
                  value={String(settings.defaultDuration)}
                  onChange={(e) =>
                    patchSettings({ defaultDuration: Number(e.target.value) })
                  }
                >
                  {[4, 5, 6, 8, 10, 12, 15].map((d) => (
                    <option key={d} value={d}>
                      {d}s
                    </option>
                  ))}
                </SelectNative>
              </Field>
            </div>
            <Button className="hidden md:inline-flex" onClick={onVideo} disabled={busy !== null || !frame}>
              {busy === "video" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Clapperboard className="size-4" />
              )}
              Image-to-video
            </Button>
            <p className="text-xs text-subtle">
              The current still is used as the first frame to lock the character. Generation is async and usually takes one to two minutes.
            </p>
          </div>
          <StillPreview src={frame} label="First frame" />
        </div>
      );
    }
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          {pipeline.videoPreviewUrl ? (
            <video
              src={pipeline.videoPreviewUrl}
              controls
              className="w-full rounded-lg border border-border bg-bg"
            />
          ) : (
            <StillPreview src={pipeline.stillPreviewUrl} label="Still" />
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {pipeline.stillPreviewUrl ? (
              <a
                href={pipeline.stillPreviewUrl}
                download={`${character.name}-still.png`}
                className="inline-flex h-11 items-center justify-center rounded-sm border border-border px-4 text-sm"
              >
                Download still
              </a>
            ) : null}
            {pipeline.videoPreviewUrl ? (
              <a
                href={pipeline.videoPreviewUrl}
                download={`${character.name}-clip.mp4`}
                className="inline-flex h-11 items-center justify-center rounded-sm bg-accent px-4 text-sm text-accent-fg"
              >
                Download video
              </a>
            ) : null}
          </div>
        </div>
        <div>
          <h3 className="font-medium">Bilibili upload checklist</h3>
          <p className="mt-1 text-xs text-muted">{recipe.biliTip}</p>
          <ul className="mt-4 space-y-2">
            {BILI_CHECKLIST.map((c) => (
              <li key={c.id} className="flex gap-2 text-sm text-fg">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted" />
                {c.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }, [pipeline, character, recipe, characters, settings, busy, frame]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-hairline px-4 py-3 md:px-8 md:py-4">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              Pipeline
            </p>
            <h1 className="mt-1 font-display text-2xl tracking-tight md:text-3xl">Fan-video pipeline</h1>
            <p className="mt-1 hidden max-w-xl text-sm text-muted md:block">
              Lock the cast → shot → still → image-to-video. Same jobs as Load Image / CLIP / KSampler / I2V in ComfyUI.
            </p>
          </div>
          <Segmented
            value={String(pipeline.step)}
            onChange={(v) => patch({ step: Number(v) as 1 | 2 | 3 | 4 | 5 })}
            options={STEPS.map((s) => ({ id: String(s.n), label: s.label }))}
          />
        </div>
        <div className="mt-3 md:mt-4">
          <ProgressBar value={pct} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
        {character ? (
          <p className="mb-4 text-sm text-muted">
            Cast <span className="text-fg">{character.name}</span>
            <span className="text-subtle"> · {character.game}</span>
            {stillReady ? <Badge className="ml-2" tone="still">Has still</Badge> : null}
            {videoReady ? <Badge className="ml-2" tone="motion">Has video</Badge> : null}
          </p>
        ) : null}
        {stepPanel}
      </div>
      {pipeline.step >= 2 && pipeline.step <= 4 ? (
        <div className="shrink-0 border-t border-hairline p-3 md:hidden">
          {pipeline.step === 2 ? (
            <Button className="w-full" onClick={() => patch({ step: 3 })}>
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
          {pipeline.step === 3 ? (
            <Button className="w-full" onClick={() => void onStill()} disabled={busy !== null}>
              {busy === "still" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ImagePlus className="size-4" />
              )}
              Generate still
            </Button>
          ) : null}
          {pipeline.step === 4 ? (
            <Button className="w-full" onClick={() => void onVideo()} disabled={busy !== null || !frame}>
              {busy === "video" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Clapperboard className="size-4" />
              )}
              Image-to-video
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function StillPreview({ src, label }: { src?: string; label: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-border bg-elevated">
      {src ? (
        <img src={src} alt="" className="aspect-[3/4] max-h-80 w-full object-cover md:aspect-[2/3] md:max-h-none" />
      ) : (
        <div className="grid aspect-[2/3] place-items-center text-sm text-subtle">No preview</div>
      )}
      <figcaption className="border-t border-hairline px-3 py-2 text-xs text-muted">
        {label}
      </figcaption>
    </figure>
  );
}

function EmptyHint({
  title,
  action,
  onClick,
}: {
  title: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <p className="text-sm text-muted">{title}</p>
      <Button className="mt-4" onClick={onClick}>
        {action}
      </Button>
    </div>
  );
}
