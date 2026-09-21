import { toast } from "sonner";
import { uid, urlToDataUrl } from "@/lib/utils";
import {
  expandPromptFn,
  fetchVideoContentFn,
  generateImageFn,
  pollVideoFn,
  submitVideoFn,
} from "./api";
import { incomingEdges, topoSort } from "./graph";
import { putB64, assetObjectUrl } from "./idb";
import { newJob, useStudio } from "./store";
import type {
  CharacterCard,
  GraphNode,
  ImageNodeData,
  PromptNodeData,
  VideoNodeData,
} from "./types";

function keyOrThrow(): string {
  const k = useStudio.getState().apiKey.trim();
  if (!k) {
    useStudio.getState().setView("settings");
    throw new Error("Add an OpenRouter API key in Settings first");
  }
  return k;
}

async function refsToDataUrls(refs: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const r of refs.slice(0, 4)) {
    out.push(await urlToDataUrl(r));
  }
  return out;
}

export async function generateStill(opts: {
  character: CharacterCard;
  prompt: string;
  model: string;
  aspectRatio: string;
  resolution: string;
  seed?: string;
  nodeId?: string;
}): Promise<{ assetId: string; url: string; cost?: number }> {
  const apiKey = keyOrThrow();
  const lock = opts.character.lockPrompt;
  const prompt = [lock, opts.prompt].filter(Boolean).join(". ");
  const job = newJob({
    kind: "image",
    title: `${opts.character.name} · still`,
    model: opts.model,
    prompt,
    nodeId: opts.nodeId,
    status: "running",
  });
  const st = useStudio.getState();
  st.addJob(job);
  if (opts.nodeId) st.updateNode(opts.nodeId, { status: "running", error: undefined });
  try {
    const refs = await refsToDataUrls(opts.character.refs);
    const seedNum = opts.seed ? Number(opts.seed) : undefined;
    const res = await generateImageFn({
      data: {
        apiKey,
        model: opts.model,
        prompt,
        aspectRatio: opts.aspectRatio,
        resolution: opts.resolution,
        seed: Number.isFinite(seedNum) ? seedNum : undefined,
        n: 1,
        references: refs,
      },
    });
    const assetId = uid("img");
    const asset = await putB64(assetId, res.b64, res.mime, "image");
    const url = assetObjectUrl(asset);
    st.patchJob(job.id, {
      status: "done",
      assetId,
      cost: res.cost ?? undefined,
      updatedAt: Date.now(),
    });
    st.addGallery({
      id: uid("gal"),
      kind: "image",
      title: `${opts.character.name} · still`,
      prompt,
      model: opts.model,
      characterId: opts.character.id,
      createdAt: Date.now(),
      cost: res.cost ?? undefined,
      assetId,
      thumbUrl: url,
    });
    if (opts.nodeId) {
      st.patchNodeData(opts.nodeId, { assetId, previewUrl: url });
      st.updateNode(opts.nodeId, { status: "done" });
    }
    toast.success("Still generated");
    return { assetId, url, cost: res.cost ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    st.patchJob(job.id, { status: "error", error: message, updatedAt: Date.now() });
    if (opts.nodeId) st.updateNode(opts.nodeId, { status: "error", error: message });
    toast.error(message);
    throw err;
  }
}

export async function generateMotion(opts: {
  character: CharacterCard;
  prompt: string;
  model: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  firstFrameUrl: string;
  nodeId?: string;
  generateAudio?: boolean;
}): Promise<{ assetId: string; url: string; cost?: number }> {
  const apiKey = keyOrThrow();
  const prompt = [opts.character.lockPrompt, opts.prompt].filter(Boolean).join(". ");
  const job = newJob({
    kind: "video",
    title: `${opts.character.name} · motion`,
    model: opts.model,
    prompt,
    nodeId: opts.nodeId,
    status: "running",
  });
  const st = useStudio.getState();
  st.addJob(job);
  if (opts.nodeId) st.updateNode(opts.nodeId, { status: "running", error: undefined });
  try {
    const firstFrame = await urlToDataUrl(opts.firstFrameUrl);
    const submitted = await submitVideoFn({
      data: {
        apiKey,
        model: opts.model,
        prompt,
        duration: opts.duration,
        resolution: opts.resolution,
        aspectRatio: opts.aspectRatio,
        generateAudio: opts.generateAudio ?? false,
        firstFrame,
      },
    });
    st.patchJob(job.id, {
      status: "polling",
      videoJobId: submitted.jobId,
      updatedAt: Date.now(),
    });
    let status = submitted.status;
    let cost: number | undefined;
    for (let i = 0; i < 90; i++) {
      await sleep(3000);
      const poll = await pollVideoFn({
        data: { apiKey, jobId: submitted.jobId },
      });
      status = poll.status;
      cost = poll.cost ?? cost;
      if (status === "completed") break;
      if (status === "failed" || status === "cancelled" || status === "expired") {
        throw new Error(poll.error || `Video job ${status}`);
      }
    }
    if (status !== "completed") throw new Error("Video timed out — check the queue or retry");
    const content = await fetchVideoContentFn({
      data: { apiKey, jobId: submitted.jobId },
    });
    const assetId = uid("vid");
    const asset = await putB64(assetId, content.b64, content.mime, "video");
    const url = assetObjectUrl(asset);
    st.patchJob(job.id, {
      status: "done",
      assetId,
      cost,
      updatedAt: Date.now(),
    });
    st.addGallery({
      id: uid("gal"),
      kind: "video",
      title: `${opts.character.name} · motion`,
      prompt,
      model: opts.model,
      characterId: opts.character.id,
      createdAt: Date.now(),
      cost,
      assetId,
      thumbUrl: opts.firstFrameUrl,
    });
    if (opts.nodeId) {
      st.patchNodeData(opts.nodeId, { assetId, previewUrl: url, jobId: submitted.jobId });
      st.updateNode(opts.nodeId, { status: "done" });
    }
    toast.success("Video generated");
    return { assetId, url, cost };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    st.patchJob(job.id, { status: "error", error: message, updatedAt: Date.now() });
    if (opts.nodeId) st.updateNode(opts.nodeId, { status: "error", error: message });
    toast.error(message);
    throw err;
  }
}

export async function expandDirectorNotes(opts: {
  character: CharacterCard;
  notes: string;
  kind: "still" | "motion" | "storyboard";
}): Promise<string> {
  const apiKey = keyOrThrow();
  const model = useStudio.getState().settings.textModel;
  const res = await expandPromptFn({
    data: {
      apiKey,
      model,
      characterLock: opts.character.lockPrompt,
      userPrompt: opts.notes,
      kind: opts.kind,
    },
  });
  return res.text;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function queueGraph() {
  const st = useStudio.getState();
  if (st.queueRunning) return;
  if (!st.apiKey.trim()) {
    st.setView("settings");
    toast.error("Add an OpenRouter API key in Settings first");
    return;
  }
  st.setQueueRunning(true);
  try {
    const order = topoSort(st.nodes, st.edges);
    const outputs = new Map<string, { text?: string; imageUrl?: string; videoUrl?: string }>();
    for (const node of order) {
      useStudio.getState().updateNode(node.id, { status: "running", error: undefined });
      try {
        const result = await runNode(node, outputs);
        outputs.set(node.id, result);
        useStudio.getState().updateNode(node.id, { status: "done" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Node failed";
        useStudio.getState().updateNode(node.id, { status: "error", error: message });
        throw err;
      }
    }
    toast.success("Workflow finished");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Workflow failed";
    toast.error(message);
  } finally {
    useStudio.getState().setQueueRunning(false);
  }
}

async function runNode(
  node: GraphNode,
  outputs: Map<string, { text?: string; imageUrl?: string; videoUrl?: string }>,
): Promise<{ text?: string; imageUrl?: string; videoUrl?: string }> {
  const st = useStudio.getState();
  const ins = incomingEdges(node.id, st.edges);
  const gathered = {
    text: "" as string,
    imageUrl: "" as string,
    videoUrl: "" as string,
  };
  for (const e of ins) {
    const src = outputs.get(e.from);
    if (!src) continue;
    if (e.toPort === "prompt" && src.text) gathered.text = src.text;
    if ((e.toPort === "refs" || e.toPort === "frame") && src.imageUrl)
      gathered.imageUrl = src.imageUrl;
    if (e.toPort === "media") {
      gathered.imageUrl = src.imageUrl ?? gathered.imageUrl;
      gathered.videoUrl = src.videoUrl ?? gathered.videoUrl;
    }
  }

  if (node.kind === "character") {
    const id = (node.data as { characterId: string }).characterId;
    const c = st.characters.find((x) => x.id === id);
    if (!c) throw new Error("No character card selected");
    return { imageUrl: c.refs[0] };
  }
  if (node.kind === "prompt") {
    const d = node.data as PromptNodeData;
    let text = d.text;
    if (d.expand && text) {
      const charEdge = ins[0];
      const charNode = charEdge
        ? st.nodes.find((n) => n.id === charEdge.from)
        : st.nodes.find((n) => n.kind === "character");
      const cid = (charNode?.data as { characterId?: string } | undefined)?.characterId;
      const c = st.characters.find((x) => x.id === cid) ?? st.characters[0];
      if (c) {
        text = await expandDirectorNotes({ character: c, notes: d.text, kind: "still" });
        st.patchNodeData(node.id, { text });
      }
    }
    return { text };
  }
  if (node.kind === "image") {
    const d = node.data as ImageNodeData;
    const charNode = st.nodes.find((n) => n.kind === "character");
    const cid = (charNode?.data as { characterId?: string } | undefined)?.characterId;
    const c = st.characters.find((x) => x.id === cid) ?? st.characters[0];
    if (!c) throw new Error("A character card is required");
    const prompt = gathered.text || d.prompt;
    const res = await generateStill({
      character: c,
      prompt,
      model: d.model,
      aspectRatio: d.aspectRatio,
      resolution: d.resolution,
      seed: d.seed,
      nodeId: node.id,
    });
    return { imageUrl: res.url, text: prompt };
  }
  if (node.kind === "video") {
    const d = node.data as VideoNodeData;
    const charNode = st.nodes.find((n) => n.kind === "character");
    const cid = (charNode?.data as { characterId?: string } | undefined)?.characterId;
    const c = st.characters.find((x) => x.id === cid) ?? st.characters[0];
    if (!c) throw new Error("A character card is required");
    const frame = gathered.imageUrl || c.refs[0];
    if (!frame) throw new Error("Image-to-video needs a first frame");
    const res = await generateMotion({
      character: c,
      prompt: d.prompt || gathered.text,
      model: d.model,
      duration: d.duration,
      resolution: d.resolution,
      aspectRatio: d.aspectRatio,
      firstFrameUrl: frame,
      nodeId: node.id,
      generateAudio: d.generateAudio,
    });
    return { videoUrl: res.url, imageUrl: frame };
  }
  if (node.kind === "output") {
    const url = gathered.videoUrl || gathered.imageUrl;
    st.patchNodeData(node.id, {
      previewUrl: url,
      kind: gathered.videoUrl ? "video" : "image",
    });
    return { videoUrl: gathered.videoUrl, imageUrl: gathered.imageUrl };
  }
  return {};
}
