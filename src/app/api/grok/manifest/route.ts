import { NextRequest, NextResponse } from "next/server";
import { renderWebManifest } from "../../../../../scripts/grok-pwa-shared.mjs";

export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  return new NextResponse(renderWebManifest(host), {
    headers: {
      "content-type": "application/manifest+json; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
