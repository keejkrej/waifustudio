import {
  jsonError,
  parseJson,
  pollVideo,
  type PollVideoInput,
} from "@/lib/studio/openrouter";

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const data = await parseJson<PollVideoInput>(request);
    return Response.json(await pollVideo(data));
  } catch (err) {
    return jsonError(err);
  }
}
