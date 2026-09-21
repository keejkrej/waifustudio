import {
  expandPrompt,
  jsonError,
  parseJson,
  type ExpandPromptInput,
} from "@/lib/studio/openrouter";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const data = await parseJson<ExpandPromptInput>(request);
    return Response.json(await expandPrompt(data));
  } catch (err) {
    return jsonError(err);
  }
}
