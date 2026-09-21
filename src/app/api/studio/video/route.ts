import {
  jsonError,
  parseJson,
  submitVideo,
  type SubmitVideoInput,
} from "@/lib/studio/openrouter";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const data = await parseJson<SubmitVideoInput>(request);
    return Response.json(await submitVideo(data));
  } catch (err) {
    return jsonError(err);
  }
}
