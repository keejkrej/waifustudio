import { jsonError, parseJson, pingKey } from "@/lib/studio/openrouter";

export const maxDuration = 20;

export async function POST(request: Request) {
  try {
    const data = await parseJson<{ apiKey: string }>(request);
    return Response.json(await pingKey(data.apiKey));
  } catch (err) {
    return jsonError(err);
  }
}
