import {
  fetchVideoContent,
  jsonError,
  parseJson,
  type PollVideoInput,
} from "@/lib/studio/openrouter";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const data = await parseJson<PollVideoInput>(request);
    return Response.json(await fetchVideoContent(data));
  } catch (err) {
    return jsonError(err);
  }
}
