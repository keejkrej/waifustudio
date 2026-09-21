export type ViewId =
  | "pipeline"
  | "graph"
  | "cast"
  | "gallery"
  | "playbook"
  | "settings";

export type NodeKind = "character" | "prompt" | "image" | "video" | "output";

export type PortType = "image" | "text" | "video" | "media";

export type JobStatus =
  | "queued"
  | "running"
  | "polling"
  | "done"
  | "error"
  | "cancelled";

export type NodeRunStatus = "idle" | "running" | "done" | "error";

export interface PortDef {
  id: string;
  label: string;
  type: PortType;
}

export interface GraphNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  title: string;
  data: NodeData;
  status?: NodeRunStatus;
  error?: string;
}

export interface GraphEdge {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

export interface CharacterNodeData {
  characterId: string;
}

export interface PromptNodeData {
  text: string;
  negative: string;
  expand: boolean;
}

export interface ImageNodeData {
  model: string;
  prompt: string;
  negative: string;
  aspectRatio: string;
  resolution: string;
  seed: string;
  n: number;
  assetId?: string;
  previewUrl?: string;
}

export interface VideoNodeData {
  model: string;
  prompt: string;
  duration: number;
  resolution: string;
  aspectRatio: string;
  generateAudio: boolean;
  jobId?: string;
  assetId?: string;
  previewUrl?: string;
}

export interface OutputNodeData {
  label: string;
  assetId?: string;
  previewUrl?: string;
  kind?: "image" | "video";
}

export type NodeData =
  | CharacterNodeData
  | PromptNodeData
  | ImageNodeData
  | VideoNodeData
  | OutputNodeData;

export interface CharacterCard {
  id: string;
  name: string;
  game: string;
  role: string;
  look: string;
  outfit: string;
  props: string;
  lockPrompt: string;
  negative: string;
  refs: string[];
  createdAt: number;
  sample?: boolean;
}

export interface GalleryItem {
  id: string;
  kind: "image" | "video";
  title: string;
  prompt: string;
  model: string;
  characterId?: string;
  createdAt: number;
  cost?: number;
  assetId: string;
  thumbUrl?: string;
}

export interface StudioJob {
  id: string;
  kind: "image" | "video" | "prompt";
  title: string;
  status: JobStatus;
  model: string;
  prompt: string;
  createdAt: number;
  updatedAt: number;
  cost?: number;
  error?: string;
  assetId?: string;
  videoJobId?: string;
  nodeId?: string;
}

export interface StudioSettings {
  imageModel: string;
  videoModel: string;
  textModel: string;
  defaultAspect: string;
  defaultResolution: string;
  defaultDuration: number;
  videoResolution: string;
  videoAspect: string;
}

export interface PipelineState {
  characterId: string;
  recipeId: string;
  aspect: string;
  stillPrompt: string;
  motionPrompt: string;
  stillAssetId?: string;
  stillPreviewUrl?: string;
  videoAssetId?: string;
  videoPreviewUrl?: string;
  step: 1 | 2 | 3 | 4 | 5;
}
