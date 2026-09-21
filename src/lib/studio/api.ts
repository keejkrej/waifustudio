import { createServerFn } from "@tanstack/react-start";

const OR = "https://openrouter.ai/api/v1";

type OrError = { error?: { message?: string; code?: string } };

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://waifustudio.grok.app",
    "X-Title": "WaifuStudio",
  };
}

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const j = JSON.parse(text) as OrError;
    return j.error?.message || text.slice(0, 280) || `HTTP ${res.status}`;
  } catch {
    return text.slice(0, 280) || `HTTP ${res.status}`;
  }
}

async function orFetch(
  apiKey: string,
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 120_000, ...rest } = init;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(`${OR}${path}`, {
      ...rest,
      headers: { ...headers(apiKey), ...(rest.headers as Record<string, string>) },
      signal: ctrl.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out — retry or pick a faster model");
    }
    throw err;
  } finally {
    clearTimeout(t);
  }
}

export type GenerateImageInput = {
  apiKey: string;
  model: string;
  prompt: string;
  aspectRatio?: string;
  resolution?: string;
  seed?: number;
  n?: number;
  references?: string[];
};

export const generateImageFn = createServerFn({ method: "POST" })
  .validator((d: GenerateImageInput) => d)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) throw new Error("Add an OpenRouter API key first");
    const body: Record<string, unknown> = {
      model: data.model,
      prompt: data.prompt,
      n: data.n ?? 1,
      stream: false,
    };
    if (data.aspectRatio) body.aspect_ratio = data.aspectRatio;
    if (data.resolution) body.resolution = data.resolution;
    if (data.seed != null && Number.isFinite(data.seed)) body.seed = data.seed;
    if (data.references?.length) {
      body.input_references = data.references.map((url) => ({
        type: "image_url",
        image_url: { url },
      }));
    }
    const res = await orFetch(key, "/images", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 150_000,
    });
    if (!res.ok) throw new Error(await readError(res));
    const json = (await res.json()) as {
      data?: Array<{ b64_json?: string; url?: string; media_type?: string }>;
      usage?: { cost?: number };
    };
    const first = json.data?.[0];
    if (!first?.b64_json && !first?.url) throw new Error("The model did not return an image");
    let b64 = first.b64_json ?? "";
    let mime = first.media_type ?? "image/png";
    if (!b64 && first.url) {
      const img = await fetch(first.url);
      const buf = Buffer.from(await img.arrayBuffer());
      b64 = buf.toString("base64");
      mime = img.headers.get("content-type") || mime;
    }
    return { b64, mime, cost: json.usage?.cost ?? null };
  });

export type SubmitVideoInput = {
  apiKey: string;
  model: string;
  prompt: string;
  duration?: number;
  resolution?: string;
  aspectRatio?: string;
  generateAudio?: boolean;
  firstFrame?: string;
  lastFrame?: string;
  references?: string[];
};

export const submitVideoFn = createServerFn({ method: "POST" })
  .validator((d: SubmitVideoInput) => d)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) throw new Error("Add an OpenRouter API key first");
    const body: Record<string, unknown> = {
      model: data.model,
      prompt: data.prompt,
    };
    if (data.duration) body.duration = data.duration;
    if (data.resolution) body.resolution = data.resolution;
    if (data.aspectRatio) body.aspect_ratio = data.aspectRatio;
    if (data.generateAudio != null) body.generate_audio = data.generateAudio;
    const frames: unknown[] = [];
    if (data.firstFrame) {
      frames.push({
        type: "image_url",
        image_url: { url: data.firstFrame },
        frame_type: "first_frame",
      });
    }
    if (data.lastFrame) {
      frames.push({
        type: "image_url",
        image_url: { url: data.lastFrame },
        frame_type: "last_frame",
      });
    }
    if (frames.length) body.frame_images = frames;
    else if (data.references?.length) {
      body.input_references = data.references.map((url) => ({
        type: "image_url",
        image_url: { url },
      }));
    }
    const res = await orFetch(key, "/videos", {
      method: "POST",
      body: JSON.stringify(body),
      timeoutMs: 60_000,
    });
    if (!res.ok) throw new Error(await readError(res));
    const json = (await res.json()) as { id?: string; status?: string };
    if (!json.id) throw new Error("Video job did not return an id");
    return { jobId: json.id, status: json.status ?? "pending" };
  });

export type PollVideoInput = { apiKey: string; jobId: string };

export const pollVideoFn = createServerFn({ method: "POST" })
  .validator((d: PollVideoInput) => d)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) throw new Error("Add an OpenRouter API key first");
    const res = await orFetch(key, `/videos/${encodeURIComponent(data.jobId)}`, {
      method: "GET",
      timeoutMs: 30_000,
    });
    if (!res.ok) throw new Error(await readError(res));
    const json = (await res.json()) as {
      id?: string;
      status?: string;
      error?: { message?: string } | string;
      unsigned_urls?: string[];
      usage?: { cost?: number };
    };
    const err =
      typeof json.error === "string" ? json.error : json.error?.message;
    return {
      jobId: json.id ?? data.jobId,
      status: json.status ?? "pending",
      error: err ?? null,
      cost: json.usage?.cost ?? null,
    };
  });

export const fetchVideoContentFn = createServerFn({ method: "POST" })
  .validator((d: PollVideoInput) => d)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) throw new Error("Add an OpenRouter API key first");
    const res = await orFetch(
      key,
      `/videos/${encodeURIComponent(data.jobId)}/content?index=0`,
      { method: "GET", timeoutMs: 120_000 },
    );
    if (!res.ok) throw new Error(await readError(res));
    const mime = res.headers.get("content-type") || "video/mp4";
    const buf = Buffer.from(await res.arrayBuffer());
    return { b64: buf.toString("base64"), mime };
  });

export type ExpandPromptInput = {
  apiKey: string;
  model: string;
  characterLock: string;
  userPrompt: string;
  kind: "still" | "motion" | "storyboard";
};

export const expandPromptFn = createServerFn({ method: "POST" })
  .validator((d: ExpandPromptInput) => d)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) throw new Error("Add an OpenRouter API key first");
    const sys =
      data.kind === "motion"
        ? "You write concise English motion prompts for anime image-to-video. 1-3 sentences. Camera, body action, hair/cloth, constraints (no morph, keep identity). No quotes."
        : data.kind === "storyboard"
          ? "You write a 4-beat anime storyboard as numbered English shots. Each shot: framing + action + lighting. Keep one character identity. No quotes."
          : "You write a single English still-image prompt for anime mobile-game official art. Include subject, outfit, pose, framing, lighting, style. Keep it under 80 words. No quotes.";
    const user = `Character lock:\n${data.characterLock}\n\nDirector notes:\n${data.userPrompt}`;
    const res = await orFetch(key, "/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: data.model,
        temperature: 0.7,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
      }),
      timeoutMs: 60_000,
    });
    if (!res.ok) throw new Error(await readError(res));
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("Expand returned no text");
    return { text };
  });

export const pingKeyFn = createServerFn({ method: "POST" })
  .validator((d: { apiKey: string }) => d)
  .handler(async ({ data }) => {
    const key = data.apiKey.trim();
    if (!key) throw new Error("Add an OpenRouter API key first");
    const res = await orFetch(key, "/key", { method: "GET", timeoutMs: 20_000 });
    if (!res.ok) throw new Error(await readError(res));
    const json = (await res.json()) as {
      data?: { label?: string; usage?: number; limit?: number | null };
    };
    return {
      ok: true as const,
      label: json.data?.label ?? "key",
      usage: json.data?.usage ?? null,
      limit: json.data?.limit ?? null,
    };
  });
