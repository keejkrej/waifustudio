"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlowProvider,
  Handle,
  Position,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnNodesChange,
} from "@xyflow/react";
import { Play, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Canvas } from "@/components/ai-elements/canvas";
import { Controls } from "@/components/ai-elements/controls";
import {
  Node as FlowNode,
  NodeAction,
  NodeContent,
  NodeHeader,
  NodeTitle,
} from "@/components/ai-elements/node";
import { Panel } from "@/components/ai-elements/panel";
import { NODE_META, NODE_PORTS, canConnect } from "@/lib/studio/graph";
import { IMAGE_MODELS, VIDEO_MODELS } from "@/lib/studio/models";
import { queueGraph } from "@/lib/studio/execute";
import { useStudio } from "@/lib/studio/store";
import type {
  CharacterNodeData,
  GraphNode,
  ImageNodeData,
  NodeKind,
  OutputNodeData,
  PromptNodeData,
  VideoNodeData,
} from "@/lib/studio/types";
import { uid } from "@/lib/utils";
import { SelectField } from "./fields";

type StudioFlowNode = Node<{ studio: GraphNode }, NodeKind>;

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

function PortHandles({ kind }: { kind: NodeKind }) {
  const ins = NODE_PORTS[kind].inputs;
  const outs = NODE_PORTS[kind].outputs;
  return (
    <>
      {ins.map((p, i) => (
        <Handle
          key={`in-${p.id}`}
          type="target"
          id={p.id}
          position={Position.Left}
          title={p.label}
          style={{ top: 54 + i * 22 }}
        />
      ))}
      {outs.map((p, i) => (
        <Handle
          key={`out-${p.id}`}
          type="source"
          id={p.id}
          position={Position.Right}
          title={p.label}
          style={{ top: 54 + i * 22 }}
        />
      ))}
    </>
  );
}

function StudioNode({ data }: NodeProps<StudioFlowNode>) {
  const node = data.studio;
  const characters = useStudio((s) => s.characters);
  const patchNodeData = useStudio((s) => s.patchNodeData);
  const removeNode = useStudio((s) => s.removeNode);
  const meta = NODE_META[node.kind];

  return (
    <FlowNode handles={{ target: false, source: false }} className="w-[268px]!">
      <PortHandles kind={node.kind} />
      <NodeHeader>
        <NodeTitle className="text-xs">{meta.label}</NodeTitle>
        <NodeAction>
          {node.status && node.status !== "idle" ? (
            <span className="mr-1 text-[10px] text-muted-foreground">{node.status}</span>
          ) : null}
          <Button size="icon-xs" variant="ghost" onClick={() => removeNode(node.id)}>
            <Trash2 className="size-3.5" />
          </Button>
        </NodeAction>
      </NodeHeader>
      <NodeContent>
        <NodeBody node={node} characters={characters} onPatch={(d) => patchNodeData(node.id, d)} />
        {node.error ? <p className="mt-2 text-xs text-destructive">{node.error}</p> : null}
      </NodeContent>
    </FlowNode>
  );
}

const nodeTypes: NodeTypes = {
  character: StudioNode,
  prompt: StudioNode,
  image: StudioNode,
  video: StudioNode,
  output: StudioNode,
};

export function GraphView() {
  return (
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  );
}

function GraphCanvas() {
  const nodes = useStudio((s) => s.nodes);
  const edges = useStudio((s) => s.edges);
  const selectedId = useStudio((s) => s.selectedId);
  const characters = useStudio((s) => s.characters);
  const queueRunning = useStudio((s) => s.queueRunning);
  const setSelected = useStudio((s) => s.setSelected);
  const updateNode = useStudio((s) => s.updateNode);
  const addNode = useStudio((s) => s.addNode);
  const addEdge = useStudio((s) => s.addEdge);
  const removeEdge = useStudio((s) => s.removeEdge);
  const removeNode = useStudio((s) => s.removeNode);
  const resetGraph = useStudio((s) => s.resetGraph);
  const patchNodeData = useStudio((s) => s.patchNodeData);

  const flowNodes: StudioFlowNode[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: n.kind,
        position: { x: n.x, y: n.y },
        data: { studio: n },
        selected: n.id === selectedId,
        width: NODE_META[n.kind].w,
      })),
    [nodes, selectedId],
  );

  const flowEdges: Edge[] = useMemo(
    () =>
      edges.map((e) => ({
        id: e.id,
        source: e.from,
        sourceHandle: e.fromPort,
        target: e.to,
        targetHandle: e.toPort,
      })),
    [edges],
  );

  const onNodesChange: OnNodesChange<StudioFlowNode> = useCallback(
    (changes) => {
      for (const change of changes) {
        if (change.type === "position" && change.position) {
          updateNode(change.id, { x: change.position.x, y: change.position.y });
        }
        if (change.type === "select") {
          setSelected(change.selected ? change.id : null);
        }
        if (change.type === "remove") {
          removeNode(change.id);
        }
      }
    },
    [updateNode, setSelected, removeNode],
  );

  const onConnect = useCallback(
    (c: Connection) => {
      if (!c.source || !c.target) return;
      const fromNode = nodes.find((n) => n.id === c.source);
      const toNode = nodes.find((n) => n.id === c.target);
      if (!fromNode || !toNode) return;
      const fromDef = NODE_PORTS[fromNode.kind].outputs.find((p) => p.id === c.sourceHandle);
      const toDef = NODE_PORTS[toNode.kind].inputs.find((p) => p.id === c.targetHandle);
      if (!fromDef || !toDef) return;
      if (!canConnect(fromDef.type, toDef.type)) return;
      addEdge({
        id: uid("e"),
        from: c.source,
        fromPort: c.sourceHandle ?? fromDef.id,
        to: c.target,
        toPort: c.targetHandle ?? toDef.id,
      });
    },
    [nodes, addEdge],
  );

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

  const toolbar = (
    <div className="flex flex-wrap gap-1">
      {(["character", "prompt", "image", "video", "output"] as NodeKind[]).map((k) => (
        <Button key={k} size="sm" variant="ghost" onClick={() => spawn(k)}>
          <Plus className="size-3.5" />
          {NODE_META[k].label}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="h-full min-h-0">
      <div className="flex h-full min-h-0 flex-col lg:hidden">
        <div className="shrink-0 space-y-2 border-b p-3">
          <div className="flex gap-2">
            <Button className="flex-1" disabled={queueRunning} onClick={() => void queueGraph()}>
              <Play className="size-4" />
              Run workflow
            </Button>
            <Button variant="outline" onClick={resetGraph}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">{toolbar}</div>
          <p className="text-xs text-muted-foreground">
            Runs in card order. On a large screen you can open the canvas and wire nodes.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <ol className="space-y-3">
            {nodes.map((node, i) => {
              const incoming = edges.filter((e) => e.to === node.id);
              return (
                <Card key={node.id}>
                  <CardHeader className="flex-row items-center justify-between space-y-0 p-3">
                    <CardTitle className="text-xs">
                      {String(i + 1).padStart(2, "0")} · {NODE_META[node.kind].label}
                    </CardTitle>
                    <Button size="icon-sm" variant="ghost" onClick={() => removeNode(node.id)}>
                      <Trash2 className="size-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    {incoming.length ? (
                      <p className="text-[11px] text-muted-foreground">
                        In:{" "}
                        {incoming
                          .map((e) => nodes.find((n) => n.id === e.from))
                          .filter(Boolean)
                          .map((n) => NODE_META[n!.kind].label)
                          .join(" · ")}
                      </p>
                    ) : null}
                    <NodeBody
                      node={node}
                      characters={characters}
                      onPatch={(d) => patchNodeData(node.id, d)}
                    />
                    {node.error ? <p className="text-xs text-destructive">{node.error}</p> : null}
                  </CardContent>
                </Card>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="hidden h-full min-h-0 lg:block">
        <Canvas
          className="h-full"
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange as unknown as OnNodesChange}
          onConnect={onConnect}
          onEdgesChange={(changes) => {
            for (const change of changes) {
              if (change.type === "remove") removeEdge(change.id);
            }
          }}
          fitView={false}
          panOnDrag
          panOnScroll={false}
          selectionOnDrag={false}
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls />
          <Panel position="top-left" className="flex items-center gap-2">
            {toolbar}
            <Button size="sm" variant="outline" onClick={resetGraph}>
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button size="sm" disabled={queueRunning} onClick={() => void queueGraph()}>
              <Play className="size-3.5" />
              Queue Prompt
            </Button>
          </Panel>
          <Panel position="top-right" className="w-[280px] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Inspector
            </p>
            {selected ? (
              <div className="mt-3 space-y-2">
                <h2 className="text-sm font-medium">{NODE_META[selected.kind].label}</h2>
                <p className="font-mono text-[11px] text-muted-foreground">{selected.id}</p>
                <p className="text-xs text-muted-foreground">
                  Drag from an output handle to an input to wire. Click a wire, then Delete.
                  Queue Prompt runs in topological order.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Select a node to inspect it.</p>
            )}
          </Panel>
        </Canvas>
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
      <div className="space-y-2 nodrag nopan">
        <SelectField
          value={d.characterId}
          onValueChange={(characterId) => onPatch({ characterId })}
          items={characters.map((x) => ({ value: x.id, label: x.name }))}
        />
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
        className="min-h-20 text-xs nodrag nopan nowheel"
      />
    );
  }
  if (node.kind === "image") {
    const d = node.data as ImageNodeData;
    return (
      <div className="space-y-2 nodrag nopan">
        <SelectField
          value={d.model}
          onValueChange={(model) => onPatch({ model })}
          items={IMAGE_MODELS.map((m) => ({ value: m.id, label: m.name }))}
        />
        <div className="grid grid-cols-2 gap-1">
          <SelectField
            value={d.aspectRatio}
            onValueChange={(aspectRatio) => onPatch({ aspectRatio })}
            items={["1:1", "2:3", "3:4", "9:16", "16:9"].map((a) => ({
              value: a,
              label: a,
            }))}
          />
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
          <p className="text-[11px] text-muted-foreground">Waiting on queue</p>
        )}
      </div>
    );
  }
  if (node.kind === "video") {
    const d = node.data as VideoNodeData;
    return (
      <div className="space-y-2 nodrag nopan">
        <SelectField
          value={d.model}
          onValueChange={(model) => onPatch({ model })}
          items={VIDEO_MODELS.map((m) => ({ value: m.id, label: m.name }))}
        />
        <Textarea
          rows={2}
          className="min-h-14 text-xs nowheel"
          value={d.prompt}
          onChange={(e) => onPatch({ prompt: e.target.value })}
        />
        {d.previewUrl ? (
          <video src={d.previewUrl} className="h-24 w-full rounded-sm object-cover" muted />
        ) : (
          <p className="text-[11px] text-muted-foreground">
            {d.duration}s · {d.resolution}
          </p>
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
    <p className="text-[11px] text-muted-foreground">Wire an image or video</p>
  );
}
