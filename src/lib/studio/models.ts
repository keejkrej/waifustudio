export interface ImageModelOpt {
  id: string;
  name: string;
  note: string;
  aspects: string[];
  resolutions: string[];
}

export interface VideoModelOpt {
  id: string;
  name: string;
  note: string;
  durations: number[];
  resolutions: string[];
  aspects: string[];
  frames: Array<"first_frame" | "last_frame">;
}

export interface TextModelOpt {
  id: string;
  name: string;
  note: string;
}

export const IMAGE_MODELS: ImageModelOpt[] = [
  {
    id: "google/gemini-3.1-flash-image",
    name: "Nano Banana 2",
    note: "Anime-friendly, strong reference consistency",
    aspects: ["1:1", "3:4", "2:3", "4:5", "9:16", "16:9", "4:3"],
    resolutions: ["1K", "2K"],
  },
  {
    id: "google/gemini-3.1-flash-lite-image",
    name: "Nano Banana 2 Lite",
    note: "Faster, cheaper portrait drafts",
    aspects: ["1:1", "3:4", "2:3", "9:16", "16:9"],
    resolutions: ["1K", "2K"],
  },
  {
    id: "bytedance-seed/seedream-5-0-lite",
    name: "Seedream 5.0 Lite",
    note: "Strong identity lock and edits",
    aspects: ["1:1", "3:4", "2:3", "9:16", "16:9", "4:3"],
    resolutions: ["1K", "2K", "4K"],
  },
  {
    id: "bytedance-seed/seedream-5-0-pro",
    name: "Seedream 5.0 Pro",
    note: "High-quality portraits / keyframes",
    aspects: ["1:1", "3:4", "2:3", "9:16", "16:9", "4:3", "21:9"],
    resolutions: ["1K", "2K", "4K"],
  },
  {
    id: "black-forest-labs/flux.2-pro",
    name: "FLUX.2 Pro",
    note: "Composition and detail",
    aspects: ["1:1", "3:4", "2:3", "9:16", "16:9"],
    resolutions: ["1K", "2K"],
  },
  {
    id: "x-ai/grok-imagine-image-2.0",
    name: "Grok Imagine 2.0",
    note: "Reference-image edits",
    aspects: ["1:1", "3:4", "2:3", "9:16", "16:9", "4:3"],
    resolutions: ["1K", "2K"],
  },
  {
    id: "openai/gpt-image-2",
    name: "GPT Image 2",
    note: "Instruction following",
    aspects: ["1:1", "3:4", "2:3", "9:16", "16:9"],
    resolutions: ["1K", "2K"],
  },
];

export const VIDEO_MODELS: VideoModelOpt[] = [
  {
    id: "bytedance/seedance-2.0-mini",
    name: "Seedance 2.0 Mini",
    note: "Value I2V with first/last frame",
    durations: [4, 5, 6, 8, 10, 12, 15],
    resolutions: ["480p", "720p"],
    aspects: ["16:9", "9:16", "1:1", "3:4", "4:3"],
    frames: ["first_frame", "last_frame"],
  },
  {
    id: "bytedance/seedance-2.5",
    name: "Seedance 2.5",
    note: "Longer shots, steadier motion",
    durations: [4, 5, 6, 8, 10, 15, 20],
    resolutions: ["480p", "720p"],
    aspects: ["16:9", "9:16", "1:1", "3:4", "4:3"],
    frames: ["first_frame", "last_frame"],
  },
  {
    id: "alibaba/wan-3.0",
    name: "Wan 3.0",
    note: "Up to 30s, first-frame lock",
    durations: [4, 5, 6, 8, 10, 15, 20, 25, 30],
    resolutions: ["480p", "720p", "1080p"],
    aspects: ["16:9", "9:16", "1:1", "3:4", "4:3"],
    frames: ["first_frame"],
  },
  {
    id: "google/veo-3.1-lite",
    name: "Veo 3.1 Lite",
    note: "Native audio, 720/1080p",
    durations: [4, 6, 8],
    resolutions: ["720p", "1080p"],
    aspects: ["16:9", "9:16", "1:1"],
    frames: ["first_frame", "last_frame"],
  },
  {
    id: "minimax/hailuo-3",
    name: "Hailuo 3",
    note: "2K shorts, strong action",
    durations: [5, 6, 8, 10],
    resolutions: ["2K"],
    aspects: ["16:9", "9:16", "1:1", "3:4"],
    frames: ["first_frame", "last_frame"],
  },
  {
    id: "x-ai/grok-imagine-video",
    name: "Grok Imagine Video",
    note: "1–15s, first-frame driven",
    durations: [4, 5, 6, 8, 10, 12, 15],
    resolutions: ["480p", "720p"],
    aspects: ["16:9", "9:16", "1:1", "3:4", "4:3"],
    frames: ["first_frame"],
  },
  {
    id: "black-forest-labs/flux-3-video",
    name: "FLUX.3 Video",
    note: "720/1080p, first/last frame",
    durations: [5, 6, 8, 10, 12, 15],
    resolutions: ["720p", "1080p"],
    aspects: ["16:9", "9:16", "1:1", "3:4"],
    frames: ["first_frame", "last_frame"],
  },
];

export const TEXT_MODELS: TextModelOpt[] = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", note: "Default shot expand" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", note: "Cheap and stable" },
  { id: "x-ai/grok-4-fast", name: "Grok 4 Fast", note: "Prompt craft" },
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", note: "Fuller storyboards" },
];

export function imageModelById(id: string) {
  return IMAGE_MODELS.find((m) => m.id === id) ?? IMAGE_MODELS[0]!;
}

export function videoModelById(id: string) {
  return VIDEO_MODELS.find((m) => m.id === id) ?? VIDEO_MODELS[0]!;
}
