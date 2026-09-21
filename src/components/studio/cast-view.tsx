"use client";

import { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { buildLockPrompt, NEGATIVE_DEFAULT } from "@/lib/studio/presets";
import { useStudio } from "@/lib/studio/store";
import type { CharacterCard } from "@/lib/studio/types";
import { blobToDataUrl, cn, uid } from "@/lib/utils";
import { FormField } from "./fields";

export function CastView() {
  const characters = useStudio((s) => s.characters);
  const upsert = useStudio((s) => s.upsertCharacter);
  const remove = useStudio((s) => s.removeCharacter);
  const pipeline = useStudio((s) => s.pipeline);
  const patchPipeline = useStudio((s) => s.patchPipeline);
  const [editing, setEditing] = useState<string | null>(characters[0]?.id ?? null);
  const [sheet, setSheet] = useState(false);
  const current = characters.find((c) => c.id === editing);

  function createBlank() {
    const c: CharacterCard = {
      id: uid("cast"),
      name: "New character",
      game: "Untitled work",
      role: "TBD",
      look: "",
      outfit: "",
      props: "",
      lockPrompt: "",
      negative: NEGATIVE_DEFAULT,
      refs: [],
      createdAt: Date.now(),
    };
    upsert(c);
    setEditing(c.id);
    setSheet(true);
  }

  async function onFiles(files: FileList | null) {
    if (!current || !files?.length) return;
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 4)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 8 * 1024 * 1024) continue;
      urls.push(await blobToDataUrl(f));
    }
    upsert({ ...current, refs: [...urls, ...current.refs].slice(0, 6) });
  }

  const editor = current ? (
    <CastEditor
      current={current}
      pipelineId={pipeline.characterId}
      onUpsert={upsert}
      onRemove={() => {
        remove(current.id);
        setEditing(characters.find((c) => c.id !== current.id)?.id ?? null);
        setSheet(false);
      }}
      onUse={() => {
        patchPipeline({ characterId: current.id });
        setSheet(false);
      }}
      onFiles={onFiles}
    />
  ) : (
    <p className="text-sm text-muted-foreground">Select or create a character card.</p>
  );

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Cast
            </p>
            <h1 className="mt-1 text-2xl font-medium tracking-tight md:text-3xl">Cast</h1>
            <p className="mt-1 hidden max-w-lg text-sm text-muted-foreground md:block">
              Upload a portrait or screenshot as a reference. The lock prompt is prepended on every
              still and clip — text-side IP-Adapter.
            </p>
          </div>
          <Button onClick={createBlank}>
            <Plus className="size-4" />
            New
          </Button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setEditing(c.id);
                setSheet(true);
              }}
              className={cn(
                "overflow-hidden rounded-md border text-left",
                editing === c.id ? "border-primary" : "hover:bg-muted/40",
              )}
            >
              <div className="aspect-[2/3] bg-muted">
                {c.refs[0] ? (
                  <img src={c.refs[0]} alt="" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-muted-foreground">
                    No reference
                  </div>
                )}
              </div>
              <div className="border-t px-3 py-2">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.game}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l p-4 lg:block">
        {editor}
      </aside>
      <Sheet open={sheet && Boolean(current)} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="h-[92dvh] overflow-y-auto lg:hidden">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setSheet(false)}>
                <ChevronLeft className="size-5" />
              </Button>
              {current?.name}
            </SheetTitle>
          </SheetHeader>
          <div className="p-4 pb-safe">{editor}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CastEditor({
  current,
  pipelineId,
  onUpsert,
  onRemove,
  onUse,
  onFiles,
}: {
  current: CharacterCard;
  pipelineId: string;
  onUpsert: (c: CharacterCard) => void;
  onRemove: () => void;
  onUse: () => void;
  onFiles: (files: FileList | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="hidden font-medium lg:block">Character card</h2>
        <div className="flex w-full gap-2 lg:w-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-11 flex-1 lg:h-9 lg:flex-none"
            onClick={onUse}
          >
            {pipelineId === current.id ? "In pipeline" : "Use in pipeline"}
          </Button>
          {!current.sample ? (
            <Button size="icon" variant="ghost" className="lg:size-9" onClick={onRemove}>
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <FormField label="Name">
        <Input value={current.name} onChange={(e) => onUpsert({ ...current, name: e.target.value })} />
      </FormField>
      <div className="grid grid-cols-2 gap-2">
        <FormField label="Title">
          <Input value={current.game} onChange={(e) => onUpsert({ ...current, game: e.target.value })} />
        </FormField>
        <FormField label="Role">
          <Input value={current.role} onChange={(e) => onUpsert({ ...current, role: e.target.value })} />
        </FormField>
      </div>
      <FormField label="Look">
        <Textarea
          rows={2}
          value={current.look}
          onChange={(e) => onUpsert({ ...current, look: e.target.value })}
        />
      </FormField>
      <FormField label="Outfit">
        <Textarea
          rows={2}
          value={current.outfit}
          onChange={(e) => onUpsert({ ...current, outfit: e.target.value })}
        />
      </FormField>
      <FormField label="Props">
        <Input value={current.props} onChange={(e) => onUpsert({ ...current, props: e.target.value })} />
      </FormField>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="ghost"
          className="min-h-11 md:min-h-9"
          onClick={() => onUpsert({ ...current, lockPrompt: buildLockPrompt(current) })}
        >
          Build lock prompt
        </Button>
      </div>
      <FormField label="Lock prompt">
        <Textarea
          rows={4}
          value={current.lockPrompt}
          onChange={(e) => onUpsert({ ...current, lockPrompt: e.target.value })}
        />
      </FormField>
      <FormField label="References">
        <Input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={(e) => onFiles(e.target.files)}
        />
      </FormField>
      <div className="grid grid-cols-3 gap-2">
        {current.refs.map((src, i) => (
          <img key={i} src={src} alt="" className="aspect-[2/3] rounded-sm object-cover" />
        ))}
      </div>
    </div>
  );
}
