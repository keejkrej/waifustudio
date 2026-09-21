import { runWithRequest } from "@/lib/request-context";

export async function POST(request: Request) {
  return runWithRequest(request, async () => {
    const { isConnectorTokenReady } = await import("@/lib/app-data/client.server");
    return Response.json({ ready: isConnectorTokenReady() });
  });
}
