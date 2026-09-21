import {
  generateImage,
  jsonError,
  parseJson,
  type GenerateImageInput,
} from "@/lib/studio/openrouter";

export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const data = await parseJson<GenerateImageInput>(request);
    return Response.json(await generateImage(data));
  } catch (err) {
    return jsonError(err);
  }
}
