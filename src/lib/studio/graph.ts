import type { GraphEdge, GraphNode, NodeKind, PortDef, PortType } from "./types";

export const NODE_PORTS: Record<
  NodeKind,
  { inputs: PortDef[]; outputs: PortDef[] }
> = {
  character: {
    inputs: [],
    outputs: [{ id: "image", label: "立绘", type: "image" }],
  },
  prompt: {
    inputs: [],
    outputs: [{ id: "text", label: "提示词", type: "text" }],
  },
  image: {
    inputs: [
      { id: "prompt", label: "提示词", type: "text" },
      { id: "refs", label: "参考", type: "image" },
    ],
    outputs: [{ id: "image", label: "图像", type: "image" }],
  },
  video: {
    inputs: [
      { id: "prompt", label: "动作", type: "text" },
      { id: "frame", label: "首帧", type: "image" },
    ],
    outputs: [{ id: "video", label: "视频", type: "video" }],
  },
  output: {
    inputs: [{ id: "media", label: "成片", type: "media" }],
    outputs: [],
  },
};

export const NODE_META: Record<
  NodeKind,
  { label: string; tint: "cast" | "prompt" | "still" | "motion" | "muted"; w: number; h: number }
> = {
  character: { label: "角色卡", tint: "cast", w: 240, h: 188 },
  prompt: { label: "提示词", tint: "prompt", w: 260, h: 196 },
  image: { label: "静帧 / KSampler", tint: "still", w: 268, h: 248 },
  video: { label: "图生视频", tint: "motion", w: 268, h: 248 },
  output: { label: "输出预览", tint: "muted", w: 240, h: 200 },
};

export function canConnect(fromType: PortType, toType: PortType): boolean {
  if (toType === "media") return fromType === "image" || fromType === "video";
  return fromType === toType;
}

export function topoSort(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const ids = new Set(nodes.map((n) => n.id));
  const incoming = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const n of nodes) {
    incoming.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const e of edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) continue;
    adj.get(e.from)!.push(e.to);
    incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1);
  }
  const q = nodes.filter((n) => (incoming.get(n.id) ?? 0) === 0).map((n) => n.id);
  const out: string[] = [];
  while (q.length) {
    const id = q.shift()!;
    out.push(id);
    for (const nxt of adj.get(id) ?? []) {
      const v = (incoming.get(nxt) ?? 0) - 1;
      incoming.set(nxt, v);
      if (v === 0) q.push(nxt);
    }
  }
  if (out.length !== nodes.length) {
    throw new Error("工作流存在环，请检查连线");
  }
  const map = new Map(nodes.map((n) => [n.id, n]));
  return out.map((id) => map.get(id)!);
}

export function incomingEdges(nodeId: string, edges: GraphEdge[]) {
  return edges.filter((e) => e.to === nodeId);
}

export function bezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const dx = Math.max(48, Math.abs(x2 - x1) * 0.45);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}
