import { useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { buildLockPrompt, NEGATIVE_DEFAULT } from "@/lib/studio/presets";
import { useStudio } from "@/lib/studio/store";
import type { CharacterCard } from "@/lib/studio/types";
import { blobToDataUrl, cn, uid } from "@/lib/utils";

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
      name: "新角色",
      game: "未命名作品",
      role: "待定",
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
    <p className="text-sm text-muted">选择或新建一张角色卡。</p>
  );

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Cast</p>
            <h1 className="mt-1 font-display text-2xl tracking-tight md:text-3xl">角色库</h1>
            <p className="mt-1 hidden max-w-lg text-sm text-muted md:block">
              上传立绘或截图作为参考图。锁定提示词会在每次生图/生视频时前置，相当于 IP-Adapter 的文本侧。
            </p>
          </div>
          <Button onClick={createBlank}>
            <Plus className="size-4" />
            新建
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
                "overflow-hidden rounded-lg border text-left transition-colors duration-150",
                editing === c.id ? "border-accent/50" : "border-border hover:border-border/80",
              )}
            >
              <div className="aspect-[2/3] bg-elevated">
                {c.refs[0] ? (
                  <img src={c.refs[0]} alt="" className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-xs text-subtle">
                    无参考图
                  </div>
                )}
              </div>
              <div className="border-t border-hairline px-3 py-2">
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted">{c.game}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
      <aside className="hidden w-[360px] shrink-0 overflow-y-auto border-l border-hairline p-4 lg:block">
        {editor}
      </aside>
      {sheet && current ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-bg lg:hidden">
          <div className="shrink-0 border-b border-hairline pt-safe">
            <div className="flex h-12 items-center gap-1 px-1">
              <Button variant="ghost" size="icon" onClick={() => setSheet(false)}>
                <ChevronLeft className="size-5" />
                <span className="sr-only">返回</span>
              </Button>
              <p className="font-medium">{current.name}</p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pb-safe">{editor}</div>
        </div>
      ) : null}
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
        <h2 className="hidden font-medium lg:block">角色卡</h2>
        <div className="flex w-full gap-2 lg:w-auto">
          <Button size="sm" variant="outline" className="h-11 flex-1 lg:h-9 lg:flex-none" onClick={onUse}>
            {pipelineId === current.id ? "流程中" : "用于流程"}
          </Button>
          {!current.sample ? (
            <Button size="icon" variant="ghost" className="lg:size-9" onClick={onRemove}>
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>
      <Field label="名字">
        <Input value={current.name} onChange={(e) => onUpsert({ ...current, name: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="作品">
          <Input value={current.game} onChange={(e) => onUpsert({ ...current, game: e.target.value })} />
        </Field>
        <Field label="定位">
          <Input value={current.role} onChange={(e) => onUpsert({ ...current, role: e.target.value })} />
        </Field>
      </div>
      <Field label="外形">
        <Textarea rows={2} value={current.look} onChange={(e) => onUpsert({ ...current, look: e.target.value })} />
      </Field>
      <Field label="服装">
        <Textarea
          rows={2}
          value={current.outfit}
          onChange={(e) => onUpsert({ ...current, outfit: e.target.value })}
        />
      </Field>
      <Field label="道具">
        <Input value={current.props} onChange={(e) => onUpsert({ ...current, props: e.target.value })} />
      </Field>
      <div className="flex justify-end">
        <Button size="sm" variant="ghost" className="min-h-11 md:min-h-9" onClick={() => onUpsert({ ...current, lockPrompt: buildLockPrompt(current) })}>
          生成锁定词
        </Button>
      </div>
      <Field label="锁定提示词">
        <Textarea
          rows={4}
          value={current.lockPrompt}
          onChange={(e) => onUpsert({ ...current, lockPrompt: e.target.value })}
        />
      </Field>
      <Field label="参考图">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-sm file:border file:border-border file:bg-elevated file:px-3 file:text-sm file:text-fg"
          onChange={(e) => onFiles(e.target.files)}
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        {current.refs.map((src, i) => (
          <img key={i} src={src} alt="" className="aspect-[2/3] rounded-sm object-cover" />
        ))}
      </div>
    </div>
  );
}
