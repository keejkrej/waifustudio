import type {
  ExpandPromptInput,
  GenerateImageInput,
  PollVideoInput,
  SubmitVideoInput,
} from "./openrouter";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

export const generateImageFn = (input: { data: GenerateImageInput }) =>
  post<{ b64: string; mime: string; cost: number | null }>("/api/studio/image", input.data);

export const submitVideoFn = (input: { data: SubmitVideoInput }) =>
  post<{ jobId: string; status: string }>("/api/studio/video", input.data);

export const pollVideoFn = (input: { data: PollVideoInput }) =>
  post<{
    jobId: string;
    status: string;
    error: string | null;
    cost: number | null;
  }>("/api/studio/video/poll", input.data);

export const fetchVideoContentFn = (input: { data: PollVideoInput }) =>
  post<{ b64: string; mime: string }>("/api/studio/video/content", input.data);

export const expandPromptFn = (input: { data: ExpandPromptInput }) =>
  post<{ text: string }>("/api/studio/expand", input.data);

export const pingKeyFn = (input: { data: { apiKey: string } }) =>
  post<{ ok: true; label: string; usage: number | null; limit: number | null }>(
    "/api/studio/ping",
    input.data,
  );

export type {
  ExpandPromptInput,
  GenerateImageInput,
  PollVideoInput,
  SubmitVideoInput,
} from "./openrouter";
