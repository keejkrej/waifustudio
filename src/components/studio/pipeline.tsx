"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clapperboard, ImagePlus, Loader2, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { IMAGE_MODELS, VIDEO_MODELS } from "@/lib/studio/models";
import { RECIPES, STYLE_PRESETS, MOTION_PRESETS, BILI_CHECKLIST } from "@/lib/studio/presets";
import { expandDirectorNotes, generateMotion, generateStill } from "@/lib/studio/execute";
import { useStudio } from "@/lib/studio/store";
import { cn } from "@/lib/utils";
import { FormField, SelectField } from "./fields";

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
        <Card>
          <CardHeader>
            <CardTitle>No character cards yet</CardTitle>
            <CardDescription>Add a cast card, then come back to the pipeline.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setView("cast")}>Open cast</Button>
          </CardContent>
        </Card>
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
                "overflow-hidden rounded-md border text-left",
                c.id === character.id ? "border-primary" : "hover:bg-muted/40",
              )}
            >
              {/* User/sample refs include data URLs and public paths — next/image is not used. */}
              <img src={c.refs[0]} alt="" className="aspect-[2/3] w-full object-cover" />
              <span className="block border-t px-2.5 py-2">
                <span className="block font-medium">{c.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{c.game}</span>
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
              <Card
                key={r.id}
                className={cn(
                  "cursor-pointer",
                  r.id === recipe.id ? "border-primary" : "hover:bg-muted/40",
                )}
                onClick={() =>
                  patch({
                    recipeId: r.id,
                    aspect: r.aspect,
                    stillPrompt: r.still,
                    motionPrompt: r.motion,
                  })
                }
              >
                <CardHeader className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm">{r.name}</CardTitle>
                    <Badge variant="outline">{r.aspect}</Badge>
                  </div>
                  <CardDescription>{r.blurb}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <Suggestions>
            {STYLE_PRESETS.map((s) => (
              <Suggestion
                key={s.id}
                suggestion={s.text}
                onClick={() => patch({ stillPrompt: `${pipeline.stillPrompt}. ${s.text}` })}
              >
                {s.name}
              </Suggestion>
            ))}
          </Suggestions>
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
          <PromptInput
            onSubmit={() => {
              void onStill();
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea
                rows={6}
                value={pipeline.stillPrompt}
                placeholder="Still prompt"
                onChange={(e) => patch({ stillPrompt: e.target.value })}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton
                  disabled={busy !== null}
                  onClick={() => void onExpand("still")}
                >
                  {busy === "expand" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="size-3.5" />
                  )}
                  Expand
                </PromptInputButton>
                <SelectField
                  className="w-28"
                  value={pipeline.aspect}
                  onValueChange={(aspect) => patch({ aspect })}
                  items={["1:1", "2:3", "3:4", "9:16", "16:9", "4:3"].map((a) => ({
                    value: a,
                    label: a,
                  }))}
                />
                <SelectField
                  className="min-w-40"
                  value={settings.imageModel}
                  onValueChange={(imageModel) => patchSettings({ imageModel })}
                  items={IMAGE_MODELS.map((m) => ({ value: m.id, label: m.name }))}
                />
              </PromptInputTools>
              <PromptInputSubmit
                size="sm"
                className="hidden md:inline-flex"
                disabled={busy !== null}
                status={busy === "still" ? "submitted" : undefined}
              >
                {busy === "still" ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                Generate still
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
          <StillPreview src={pipeline.stillPreviewUrl ?? character.refs[0]} label="Reference / result" />
        </div>
      );
    }
    if (pipeline.step === 4) {
      return (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-3">
            <PromptInput
              onSubmit={() => {
                void onVideo();
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  rows={5}
                  value={pipeline.motionPrompt}
                  placeholder="Motion prompt"
                  onChange={(e) => patch({ motionPrompt: e.target.value })}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <PromptInputTools>
                  <SelectField
                    className="min-w-40"
                    value={settings.videoModel}
                    onValueChange={(videoModel) => patchSettings({ videoModel })}
                    items={VIDEO_MODELS.map((m) => ({ value: m.id, label: m.name }))}
                  />
                  <SelectField
                    className="w-24"
                    value={String(settings.defaultDuration)}
                    onValueChange={(v) => patchSettings({ defaultDuration: Number(v) })}
                    items={[4, 5, 6, 8, 10, 12, 15].map((d) => ({
                      value: String(d),
                      label: `${d}s`,
                    }))}
                  />
                </PromptInputTools>
                <PromptInputSubmit
                  size="sm"
                  className="hidden md:inline-flex"
                  disabled={busy !== null || !frame}
                  status={busy === "video" ? "submitted" : undefined}
                >
                  {busy === "video" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Clapperboard className="size-4" />
                  )}
                  Image-to-video
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>
            <Suggestions>
              {MOTION_PRESETS.map((m) => (
                <Suggestion
                  key={m.id}
                  suggestion={m.text}
                  onClick={() => patch({ motionPrompt: m.text })}
                >
                  {m.name}
                </Suggestion>
              ))}
            </Suggestions>
            <p className="text-xs text-muted-foreground">
              The current still is used as the first frame to lock the character. Generation is async
              and usually takes one to two minutes.
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
              className="w-full rounded-md border bg-background"
            />
          ) : (
            <StillPreview src={pipeline.stillPreviewUrl} label="Still" />
          )}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            {pipeline.stillPreviewUrl ? (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={pipeline.stillPreviewUrl}
                    download={`${character.name}-still.png`}
                  />
                }
              >
                Download still
              </Button>
            ) : null}
            {pipeline.videoPreviewUrl ? (
              <Button
                nativeButton={false}
                render={
                  <a
                    href={pipeline.videoPreviewUrl}
                    download={`${character.name}-clip.mp4`}
                  />
                }
              >
                Download video
              </Button>
            ) : null}
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Bilibili upload checklist</CardTitle>
            <CardDescription>{recipe.biliTip}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {BILI_CHECKLIST.map((c) => (
                <li key={c.id} className="flex gap-2 text-sm">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  {c.label}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }, [pipeline, character, recipe, characters, settings, busy, frame, patch, patchSettings, setView]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b px-4 py-3 md:px-8 md:py-4">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Pipeline
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight md:text-3xl">
              Fan-video pipeline
            </h1>
            <p className="mt-1 hidden max-w-xl text-sm text-muted-foreground md:block">
              Lock the cast → shot → still → image-to-video. Same jobs as Load Image / CLIP /
              KSampler / I2V in ComfyUI.
            </p>
          </div>
          <Tabs
            value={String(pipeline.step)}
            onValueChange={(v) => patch({ step: Number(v) as 1 | 2 | 3 | 4 | 5 })}
          >
            <TabsList className="w-full">
              {STEPS.map((s) => (
                <TabsTrigger key={s.n} value={String(s.n)} className="flex-1">
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <Progress className="mt-3 md:mt-4" value={pct} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
        {character ? (
          <p className="mb-4 text-sm text-muted-foreground">
            Cast <span className="text-foreground">{character.name}</span>
            <span> · {character.game}</span>
            {stillReady ? (
              <Badge className="ml-2" variant="secondary">
                Has still
              </Badge>
            ) : null}
            {videoReady ? (
              <Badge className="ml-2" variant="outline">
                Has video
              </Badge>
            ) : null}
          </p>
        ) : null}
        {stepPanel}
      </div>
      {pipeline.step >= 2 && pipeline.step <= 4 ? (
        <div className="shrink-0 border-t p-3 md:hidden">
          {pipeline.step === 2 ? (
            <Button className="w-full" onClick={() => patch({ step: 3 })}>
              Next
              <ArrowRight className="size-4" />
            </Button>
          ) : null}
          {pipeline.step === 3 ? (
            <Button className="w-full" onClick={() => void onStill()} disabled={busy !== null}>
              {busy === "still" ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
              Generate still
            </Button>
          ) : null}
          {pipeline.step === 4 ? (
            <Button
              className="w-full"
              onClick={() => void onVideo()}
              disabled={busy !== null || !frame}
            >
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
    <figure className="overflow-hidden rounded-md border bg-card">
      {src ? (
        <img
          src={src}
          alt=""
          className="aspect-[3/4] max-h-80 w-full object-cover md:aspect-[2/3] md:max-h-none"
        />
      ) : (
        <div className="grid aspect-[2/3] place-items-center text-sm text-muted-foreground">
          No preview
        </div>
      )}
      <figcaption className="border-t px-3 py-2 text-xs text-muted-foreground">{label}</figcaption>
    </figure>
  );
}
