import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/utils";
import type {
  CharacterCard,
  GalleryItem,
  GraphEdge,
  GraphNode,
  ImageNodeData,
  PipelineState,
  PromptNodeData,
  StudioJob,
  StudioSettings,
  VideoNodeData,
  ViewId,
} from "./types";
import { SAMPLE_CAST, RECIPES } from "./presets";
import { IMAGE_MODELS, VIDEO_MODELS } from "./models";

const firstRecipe = RECIPES[0]!;

export const DEFAULT_SETTINGS: StudioSettings = {
  imageModel: IMAGE_MODELS[0]!.id,
  videoModel: VIDEO_MODELS[0]!.id,
  textModel: "google/gemini-2.5-flash",
  defaultAspect: "2:3",
  defaultResolution: "1K",
  defaultDuration: 5,
  videoResolution: "720p",
  videoAspect: "9:16",
};

export function defaultGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const character: GraphNode = {
    id: "n_char",
    kind: "character",
    x: 36,
    y: 48,
    title: "Cast card",
    data: { characterId: SAMPLE_CAST[0]!.id },
  };
  const prompt: GraphNode = {
    id: "n_prompt",
    kind: "prompt",
    x: 36,
    y: 280,
    title: "Prompt",
    data: {
      text: `${firstRecipe.still}. ${SAMPLE_CAST[0]!.lockPrompt}`,
      negative: SAMPLE_CAST[0]!.negative,
      expand: false,
    } satisfies PromptNodeData,
  };
  const image: GraphNode = {
    id: "n_image",
    kind: "image",
    x: 300,
    y: 88,
    title: "Still",
    data: {
      model: DEFAULT_SETTINGS.imageModel,
      prompt: "",
      negative: SAMPLE_CAST[0]!.negative,
      aspectRatio: firstRecipe.aspect,
      resolution: "1K",
      seed: "",
      n: 1,
    } satisfies ImageNodeData,
  };
  const video: GraphNode = {
    id: "n_video",
    kind: "video",
    x: 560,
    y: 88,
    title: "Image-to-video",
    data: {
      model: DEFAULT_SETTINGS.videoModel,
      prompt: firstRecipe.motion,
      duration: firstRecipe.duration,
      resolution: "720p",
      aspectRatio: firstRecipe.videoAspect,
      generateAudio: false,
    } satisfies VideoNodeData,
  };
  const output: GraphNode = {
    id: "n_out",
    kind: "output",
    x: 820,
    y: 88,
    title: "Output",
    data: { label: "Output" },
  };
  return {
    nodes: [character, prompt, image, video, output],
    edges: [
      { id: "e1", from: "n_char", fromPort: "image", to: "n_image", toPort: "refs" },
      { id: "e2", from: "n_prompt", fromPort: "text", to: "n_image", toPort: "prompt" },
      { id: "e3", from: "n_image", fromPort: "image", to: "n_video", toPort: "frame" },
      { id: "e4", from: "n_prompt", fromPort: "text", to: "n_video", toPort: "prompt" },
      { id: "e5", from: "n_video", fromPort: "video", to: "n_out", toPort: "media" },
    ],
  };
}

const g0 = defaultGraph();

interface StudioState {
  hydrated: boolean;
  view: ViewId;
  apiKey: string;
  settings: StudioSettings;
  characters: CharacterCard[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  jobs: StudioJob[];
  gallery: GalleryItem[];
  pipeline: PipelineState;
  welcomeSeen: boolean;
  queueRunning: boolean;
  cam: { x: number; y: number; k: number };

  setHydrated: (v: boolean) => void;
  setView: (v: ViewId) => void;
  setApiKey: (k: string) => void;
  patchSettings: (p: Partial<StudioSettings>) => void;
  setWelcomeSeen: () => void;
  setCam: (c: Partial<{ x: number; y: number; k: number }>) => void;

  upsertCharacter: (c: CharacterCard) => void;
  removeCharacter: (id: string) => void;

  addNode: (n: GraphNode) => void;
  updateNode: (id: string, patch: Partial<GraphNode>) => void;
  patchNodeData: (id: string, data: Record<string, unknown>) => void;
  removeNode: (id: string) => void;
  setSelected: (id: string | null) => void;
  addEdge: (e: GraphEdge) => void;
  removeEdge: (id: string) => void;
  loadGraph: (g: { nodes: GraphNode[]; edges: GraphEdge[] }) => void;
  resetGraph: () => void;

  addJob: (j: StudioJob) => void;
  patchJob: (id: string, patch: Partial<StudioJob>) => void;
  setQueueRunning: (v: boolean) => void;

  addGallery: (g: GalleryItem) => void;
  removeGallery: (id: string) => void;

  patchPipeline: (p: Partial<PipelineState>) => void;
}

export const useStudio = create<StudioState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      view: "pipeline",
      apiKey: "",
      settings: DEFAULT_SETTINGS,
      characters: SAMPLE_CAST,
      nodes: g0.nodes,
      edges: g0.edges,
      selectedId: "n_image",
      jobs: [],
      gallery: [
        {
          id: "gal_sample_rain",
          kind: "image",
          title: "Aoi · rain street still (sample)",
          prompt: "rain-wet stone street at dusk",
          model: "sample",
          characterId: "cast_aoi",
          createdAt: 0,
          assetId: "sample_rain",
          thumbUrl: "/cast/still-aoi-rain.jpg",
        },
      ],
      pipeline: {
        characterId: SAMPLE_CAST[0]!.id,
        recipeId: firstRecipe.id,
        aspect: firstRecipe.aspect,
        stillPrompt: firstRecipe.still,
        motionPrompt: firstRecipe.motion,
        step: 1,
      },
      welcomeSeen: false,
      queueRunning: false,
      cam: { x: 0, y: 0, k: 1 },

      setHydrated: (v) => set({ hydrated: v }),
      setView: (view) => set({ view }),
      setApiKey: (apiKey) => set({ apiKey }),
      patchSettings: (p) => set({ settings: { ...get().settings, ...p } }),
      setWelcomeSeen: () => set({ welcomeSeen: true }),
      setCam: (c) => set({ cam: { ...get().cam, ...c } }),

      upsertCharacter: (c) =>
        set({
          characters: (() => {
            const i = get().characters.findIndex((x) => x.id === c.id);
            if (i < 0) return [c, ...get().characters];
            const next = get().characters.slice();
            next[i] = c;
            return next;
          })(),
        }),
      removeCharacter: (id) =>
        set({ characters: get().characters.filter((c) => c.id !== id) }),

      addNode: (n) => set({ nodes: [...get().nodes, n], selectedId: n.id }),
      updateNode: (id, patch) =>
        set({
          nodes: get().nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        }),
      patchNodeData: (id, data) =>
        set({
          nodes: get().nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n,
          ),
        }),
      removeNode: (id) =>
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter((e) => e.from !== id && e.to !== id),
          selectedId: get().selectedId === id ? null : get().selectedId,
        }),
      setSelected: (selectedId) => set({ selectedId }),
      addEdge: (e) => {
        const edges = get().edges.filter(
          (x) => !(x.to === e.to && x.toPort === e.toPort),
        );
        set({ edges: [...edges, e] });
      },
      removeEdge: (id) => set({ edges: get().edges.filter((e) => e.id !== id) }),
      loadGraph: (g) => set({ nodes: g.nodes, edges: g.edges }),
      resetGraph: () => {
        const g = defaultGraph();
        set({ nodes: g.nodes, edges: g.edges, selectedId: "n_image" });
      },

      addJob: (j) => set({ jobs: [j, ...get().jobs].slice(0, 40) }),
      patchJob: (id, patch) =>
        set({
          jobs: get().jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)),
        }),
      setQueueRunning: (queueRunning) => set({ queueRunning }),

      addGallery: (g) => set({ gallery: [g, ...get().gallery] }),
      removeGallery: (id) =>
        set({ gallery: get().gallery.filter((x) => x.id !== id) }),

      patchPipeline: (p) => set({ pipeline: { ...get().pipeline, ...p } }),
    }),
    {
      name: "waifustudio-v3",
      skipHydration: true,
      partialize: (s) => ({
        view: s.view,
        apiKey: s.apiKey,
        settings: s.settings,
        characters: s.characters,
        nodes: s.nodes.map((n) => ({
          ...n,
          status: "idle" as const,
          error: undefined,
          data: { ...n.data, previewUrl: undefined },
        })),
        edges: s.edges,
        jobs: s.jobs
          .filter((j) => j.status === "done" || j.status === "error")
          .slice(0, 20),
        gallery: s.gallery,
        pipeline: { ...s.pipeline, stillPreviewUrl: undefined, videoPreviewUrl: undefined },
        welcomeSeen: s.welcomeSeen,
      }),
    },
  ),
);

export function newJob(
  partial: Omit<StudioJob, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: StudioJob["status"];
  },
): StudioJob {
  const now = Date.now();
  return {
    id: uid("job"),
    status: partial.status ?? "queued",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
