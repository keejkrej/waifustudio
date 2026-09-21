import { useCallback, useRef, useState } from "react";
import { Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, SelectNative, Textarea } from "@/components/ui/field";
import { bezierPath, NODE_META, NODE_PORTS, canConnect } from "@/lib/studio/graph";
import { IMAGE_MODELS, VIDEO_MODELS } from "@/lib/studio/models";
import { queueGraph } from "@/lib/studio/execute";
import { useStudio } from "@/lib/studio/store";
import type {
  CharacterNodeData,
  GraphEdge,
  GraphNode,
  ImageNodeData,
  NodeKind,
  OutputNodeData,
  PromptNodeData,
  VideoNodeData,
} from "@/lib/studio/types";
import { cn, uid } from "@/lib/utils";

interface DragWire {
  from: string;
  fromPort: string;
  x: number;
  y: number;
  mx: number;
  my: number;
}

export function GraphView() {
  const nodes = useStudio((s) => s.nodes);
  const edges = useStudio((s) => s.edges);
  const selectedId = useStudio((s) => s.selectedId);
  const cam = useStudio((s) => s.cam);
  const characters = useStudio((s) => s.characters);
  const queueRunning = useStudio((s) => s.queueRunning);

  const setSelected = useStudio((s) => s.setSelected);
  const updateNode = useStudio((s) => s.updateNode);
  const addNode = useStudio((s) => s.addNode);
  const addEdge = useStudio((s) => s.addEdge);
  const removeEdge = useStudio((s) => s.removeEdge);
  const removeNode = useStudio((s) => s.removeNode);
  const resetGraph = useStudio((s) => s.resetGraph);
  const setCam = useStudio((s) => s.setCam);
  const patchNodeData = useStudio((s) => s.patchNodeData);

  const surface = useRef<HTMLDivElement>(null);
  const [wire, setWire] = useState<DragWire | null>(null);
  const pan = useRef<{ ox: number; oy: number; cx: number; cy: number } | null>(null);
  const drag = useRef<{ id: string; ox: number; oy: number; nx: number; ny: number } | null>(null);

  const toGraph = useCallback(
    (clientX: number, clientY: number) => {
      const el = surface.current;
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: (clientX - r.left - cam.x) / cam.k,
        y: (clientY - r.top - cam.y) / cam.k,
      };
    },
    [cam],
  );

  function portPos(node: GraphNode, portId: string, side: "in" | "out") {
    const meta = NODE_META[node.kind];
    const ports = side === "in" ? NODE_PORTS[node.kind].inputs : NODE_PORTS[node.kind].outputs;
    const i = Math.max(0, ports.findIndex((p) => p.id === portId));
    const y = node.y + 54 + i * 22;
    const x = side === "out" ? node.x + meta.w : node.x;
    return { x, y };
  }

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const el = surface.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const k = Math.min(1.8, Math.max(0.4, cam.k * factor));
    const x = mx - ((mx - cam.x) / cam.k) * k;
    const y = my - ((my - cam.y) / cam.k) * k;
    setCam({ k, x, y });
  }

  function onPointerDown(e: React.PointerEvent) {
    if (e.button === 1 || e.button === 2 || (e.button === 0 && e.altKey)) {
      pan.current = { ox: e.clientX, oy: e.clientY, cx: cam.x, cy: cam.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } else if (e.target === e.currentTarget) {
      setSelected(null);
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (pan.current) {
      setCam({
        x: pan.current.cx + (e.clientX - pan.current.ox),
        y: pan.current.cy + (e.clientY - pan.current.oy),
      });
    }
    if (drag.current) {
      const g = toGraph(e.clientX, e.clientY);
      updateNode(drag.current.id, {
        x: g.x - drag.current.ox,
        y: g.y - drag.current.oy,
      });
    }
    if (wire) {
      const g = toGraph(e.clientX, e.clientY);
      setWire({ ...wire, mx: g.x, my: g.y });
    }
  }

  function onPointerUp() {
    pan.current = null;
    drag.current = null;
    setWire(null);
  }

  function startNodeDrag(e: React.PointerEvent, node: GraphNode) {
    if (e.button !== 0) return;
    e.stopPropagation();
    const g = toGraph(e.clientX, e.clientY);
    drag.current = { id: node.id, ox: g.x - node.x, oy: g.y - node.y, nx: node.x, ny: node.y };
    setSelected(node.id);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function startWire(e: React.PointerEvent, node: GraphNode, portId: string) {
    e.stopPropagation();
    const p = portPos(node, portId, "out");
    setWire({ from: node.id, fromPort: portId, x: p.x, y: p.y, mx: p.x, my: p.y });
  }

  function dropWire(to: GraphNode, toPort: string) {
    if (!wire || wire.from === to.id) return;
    const fromNode = nodes.find((n) => n.id === wire.from);
    if (!fromNode) return;
    const fromDef = NODE_PORTS[fromNode.kind].outputs.find((p) => p.id === wire.fromPort);
    const toDef = NODE_PORTS[to.kind].inputs.find((p) => p.id === toPort);
    if (!fromDef || !toDef) return;
    if (!canConnect(fromDef.type, toDef.type)) return;
    addEdge({
      id: uid("e"),
      from: wire.from,
      fromPort: wire.fromPort,
      to: to.id,
      toPort,
    });
    setWire(null);
  }

  function spawn(kind: NodeKind) {
    addNode({
      id: uid("n"),
      kind,
      x: 40 + (nodes.length % 4) * 24,
      y: 48 + nodes.length * 28,
      title: NODE_META[kind].label,
      data: defaultData(kind),
    });
  }

  const selected = nodes.find((n) => n.id === selectedId);

  return (
    <div className="h-full min-h-0">
      <MobileGraphStack
        nodes={nodes}
        edges={edges}
        characters={characters}
        queueRunning={queueRunning}
        onSpawn={spawn}
        onReset={resetGraph}
        onRemove={removeNode}
        onPatch={(id, data) => patchNodeData(id, data)}
      />
      <div className="hidden h-full min-h-0 lg:flex">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-hairline px-3">
            <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-subtle sm:block">
              Graph
            </span>
            <div className="flex flex-wrap gap-1">
              {(["character", "prompt", "image", "video", "output"] as NodeKind[]).map((k) => (
                <Button key={k} size="sm" variant="ghost" onClick={() => spawn(k)}>
                  <Plus className="size-3.5" />
                  {NODE_META[k].label}
                </Button>
              ))}
            </div>
            <div className="ml-auto flex gap-1">
              <Button size="sm" variant="outline" onClick={resetGraph}>
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
              <Button size="sm" disabled={queueRunning} onClick={() => void queueGraph()}>
                <Play className="size-3.5" />
                Queue Prompt
              </Button>
            </div>
          </div>
          <div
            ref={surface}
            className="graph-grid relative min-h-0 flex-1 cursor-grab overflow-hidden touch-none active:cursor-grabbing"
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div
              className="absolute left-0 top-0 origin-top-left will-change-transform"
              style={{
                width: 2800,
                height: 1800,
                transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`,
              }}
            >
              <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1">
                {edges.map((e) => {
                  const a = nodes.find((n) => n.id === e.from);
                  const b = nodes.find((n) => n.id === e.to);
                  if (!a || !b) return null;
                  const p1 = portPos(a, e.fromPort, "out");
                  const p2 = portPos(b, e.toPort, "in");
                  return (
                    <path
                      key={e.id}
                      d={bezierPath(p1.x, p1.y, p2.x, p2.y)}
                      fill="none"
                      stroke="color-mix(in oklab, var(--color-still) 70%, transparent)"
                      strokeWidth="2"
                      className="pointer-events-auto cursor-pointer"
                      onPointerDown={(ev) => {
                        ev.stopPropagation();
                        removeEdge(e.id);
                      }}
                    />
                  );
                })}
                {wire ? (
                  <path
                    d={bezierPath(wire.x, wire.y, wire.mx, wire.my)}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                ) : null}
              </svg>
              {nodes.map((node) => (
                <GraphNodeCard
                  key={node.id}
                  node={node}
                  selected={node.id === selectedId}
                  characters={characters}
                  onDrag={startNodeDrag}
                  onStartWire={startWire}
                  onDropWire={dropWire}
                  onPatch={(data) => patchNodeData(node.id, data)}
                />
              ))}
            </div>
          </div>
        </div>
        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-hairline p-4 lg:block">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-subtle">Inspector</p>
          {selected ? (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{NODE_META[selected.kind].label}</h2>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => removeNode(selected.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {selected.status === "error" && selected.error ? (
                <p className="text-xs text-danger">{selected.error}</p>
              ) : null}
              <p className="font-mono text-[11px] text-subtle">{selected.id}</p>
              <p className="text-xs leading-relaxed text-muted">
                Drag from an output port to an input to wire. Click a wire to delete. Scroll to zoom, Alt-drag the canvas.
                Queue Prompt runs in topological order, same as ComfyUI.
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">Select a node to inspect it.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

function MobileGraphStack({
  nodes,
  edges,
  characters,
  queueRunning,
  onSpawn,
  onReset,
  onRemove,
  onPatch,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  characters: { id: string; name: string; refs: string[] }[];
  queueRunning: boolean;
  onSpawn: (kind: NodeKind) => void;
  onReset: () => void;
  onRemove: (id: string) => void;
  onPatch: (id: string, data: Record<string, unknown>) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col lg:hidden">
      <div className="shrink-0 space-y-2 border-b border-hairline p-3">
        <div className="flex gap-2">
          <Button className="flex-1" disabled={queueRunning} onClick={() => void queueGraph()}>
            <Play className="size-4" />
            Run workflow
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {(["character", "prompt", "image", "video", "output"] as NodeKind[]).map((k) => (
            <Button key={k} size="sm" variant="ghost" className="h-11 shrink-0" onClick={() => onSpawn(k)}>
              <Plus className="size-3.5" />
              {NODE_META[k].label}
            </Button>
          ))}
        </div>
        <p className="text-xs text-subtle">Runs in card order. On a large screen you can open the canvas and wire nodes.</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        <ol className="space-y-3">
          {nodes.map((node, i) => {
            const meta = NODE_META[node.kind];
            const tint =
              meta.tint === "cast"
                ? "bg-cast"
                : meta.tint === "prompt"
                  ? "bg-prompt"
                  : meta.tint === "still"
                    ? "bg-still"
                    : meta.tint === "motion"
                      ? "bg-motion"
                      : "bg-muted";
            const incoming = edges.filter((e) => e.to === node.id);
            return (
              <li key={node.id} className="overflow-hidden rounded-lg border border-border bg-panel">
                <div className={cn("flex h-11 items-center justify-between px-2 pl-3", tint)}>
                  <span className="text-xs font-medium text-bg">
                    {String(i + 1).padStart(2, "0")} · {meta.label}
                  </span>
                  <div className="flex items-center">
                    {node.status && node.status !== "idle" ? (
                      <span className="mr-1 text-[10px] text-bg/80">{node.status}</span>
                    ) : null}
                    <button
                      type="button"
                      className="grid size-11 place-items-center text-bg/80"
                      onClick={() => onRemove(node.id)}
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Delete node</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-2 p-3">
                  {incoming.length ? (
                    <p className="text-[11px] text-subtle">
                      In: 
                      {incoming
                        .map((e) => nodes.find((n) => n.id === e.from))
                        .filter(Boolean)
                        .map((n) => NODE_META[n!.kind].label)
                        .join(" · ")}
                    </p>
                  ) : null}
                  <NodeBody node={node} characters={characters} onPatch={(d) => onPatch(node.id, d)} />
                  {node.error ? <p className="text-xs text-danger">{node.error}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function defaultData(kind: NodeKind): GraphNode["data"] {
  const s = useStudio.getState().settings;
  if (kind === "character") return { characterId: useStudio.getState().characters[0]?.id ?? "" };
  if (kind === "prompt") return { text: "", negative: "", expand: false };
  if (kind === "image")
    return {
      model: s.imageModel,
      prompt: "",
      negative: "",
      aspectRatio: s.defaultAspect,
      resolution: s.defaultResolution,
      seed: "",
      n: 1,
    };
  if (kind === "video")
    return {
      model: s.videoModel,
      prompt: "",
      duration: s.defaultDuration,
      resolution: s.videoResolution,
      aspectRatio: s.videoAspect,
      generateAudio: false,
    };
  return { label: "Output" };
}

function GraphNodeCard({
  node,
  selected,
  characters,
  onDrag,
  onStartWire,
  onDropWire,
  onPatch,
}: {
  node: GraphNode;
  selected: boolean;
  characters: { id: string; name: string; refs: string[] }[];
  onDrag: (e: React.PointerEvent, n: GraphNode) => void;
  onStartWire: (e: React.PointerEvent, n: GraphNode, port: string) => void;
  onDropWire: (n: GraphNode, port: string) => void;
  onPatch: (d: Record<string, unknown>) => void;
}) {
  const meta = NODE_META[node.kind];
  const tint =
    meta.tint === "cast"
      ? "bg-cast"
      : meta.tint === "prompt"
        ? "bg-prompt"
        : meta.tint === "still"
          ? "bg-still"
          : meta.tint === "motion"
            ? "bg-motion"
            : "bg-muted";
  const ins = NODE_PORTS[node.kind].inputs;
  const outs = NODE_PORTS[node.kind].outputs;

  return (
    <div
      className={cn(
        "absolute rounded-md border bg-panel shadow-panel",
        selected ? "border-accent/50" : "border-border",
        node.status === "running" && "ring-1 ring-motion/50",
        node.status === "error" && "ring-1 ring-danger/50",
        node.status === "done" && "ring-1 ring-ok/40",
      )}
      style={{ left: node.x, top: node.y, width: meta.w }}
      onPointerDown={(e) => onDrag(e, node)}
    >
      <div className={cn("flex h-8 items-center gap-2 rounded-t-[5px] px-2", tint)}>
        <span className="text-[11px] font-medium text-bg">{meta.label}</span>
        {node.status && node.status !== "idle" ? (
          <span className="ml-auto text-[10px] text-bg/80">{node.status}</span>
        ) : null}
      </div>
      <div className="relative px-3 py-2">
        {ins.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.label}
            className="absolute -left-1.5 size-3 rounded-full border border-border bg-elevated"
            style={{ top: 8 + ins.indexOf(p) * 22 }}
            onPointerUp={(e) => {
              e.stopPropagation();
              onDropWire(node, p.id);
            }}
          />
        ))}
        {outs.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.label}
            className="absolute -right-1.5 size-3 rounded-full border border-accent bg-still"
            style={{ top: 8 + outs.indexOf(p) * 22 }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onStartWire(e, node, p.id);
            }}
          />
        ))}
        <NodeBody node={node} characters={characters} onPatch={onPatch} />
      </div>
    </div>
  );
}

function NodeBody({
  node,
  characters,
  onPatch,
}: {
  node: GraphNode;
  characters: { id: string; name: string; refs: string[] }[];
  onPatch: (d: Record<string, unknown>) => void;
}) {
  if (node.kind === "character") {
    const d = node.data as CharacterNodeData;
    const c = characters.find((x) => x.id === d.characterId);
    return (
      <div className="space-y-2">
        <SelectNative
          value={d.characterId}
          onChange={(e) => onPatch({ characterId: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {characters.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </SelectNative>
        {c?.refs[0] ? (
          <img src={c.refs[0]} alt="" className="h-20 w-full rounded-sm object-cover" />
        ) : null}
      </div>
    );
  }
  if (node.kind === "prompt") {
    const d = node.data as PromptNodeData;
    return (
      <Textarea
        rows={4}
        value={d.text}
        onChange={(e) => onPatch({ text: e.target.value })}
        onPointerDown={(e) => e.stopPropagation()}
        className="min-h-20 text-xs"
      />
    );
  }
  if (node.kind === "image") {
    const d = node.data as ImageNodeData;
    return (
      <div className="space-y-2" onPointerDown={(e) => e.stopPropagation()}>
        <SelectNative value={d.model} onChange={(e) => onPatch({ model: e.target.value })}>
          {IMAGE_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectNative>
        <div className="grid grid-cols-2 gap-1">
          <SelectNative
            value={d.aspectRatio}
            onChange={(e) => onPatch({ aspectRatio: e.target.value })}
          >
            {["1:1", "2:3", "3:4", "9:16", "16:9"].map((a) => (
              <option key={a}>{a}</option>
            ))}
          </SelectNative>
          <Input
            placeholder="seed"
            value={d.seed}
            onChange={(e) => onPatch({ seed: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        {d.previewUrl ? (
          <img src={d.previewUrl} alt="" className="h-24 w-full rounded-sm object-cover" />
        ) : (
          <p className="text-[11px] text-subtle">Waiting on queue</p>
        )}
      </div>
    );
  }
  if (node.kind === "video") {
    const d = node.data as VideoNodeData;
    return (
      <div className="space-y-2" onPointerDown={(e) => e.stopPropagation()}>
        <SelectNative value={d.model} onChange={(e) => onPatch({ model: e.target.value })}>
          {VIDEO_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </SelectNative>
        <Textarea
          rows={2}
          className="min-h-14 text-xs"
          value={d.prompt}
          onChange={(e) => onPatch({ prompt: e.target.value })}
        />
        {d.previewUrl ? (
          <video src={d.previewUrl} className="h-24 w-full rounded-sm object-cover" muted />
        ) : (
          <p className="text-[11px] text-subtle">{d.duration}s · {d.resolution}</p>
        )}
      </div>
    );
  }
  const d = node.data as OutputNodeData;
  return d.previewUrl ? (
    d.kind === "video" ? (
      <video src={d.previewUrl} className="h-28 w-full rounded-sm object-cover" controls />
    ) : (
      <img src={d.previewUrl} alt="" className="h-28 w-full rounded-sm object-cover" />
    )
  ) : (
    <p className="text-[11px] text-subtle">Wire an image or video</p>
  );
}
