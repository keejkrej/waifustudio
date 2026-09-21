import { NextRequest, NextResponse } from "next/server";
import {
  renderWebManifest,
  resolveOgTitle,
  snapshotOgIdentity,
} from "../../../../../scripts/grok-pwa-shared.mjs";

export const runtime = "nodejs";

export function GET(req: NextRequest) {
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const { site } = snapshotOgIdentity();
  const name = resolveOgTitle(site, "WaifuStudio", host);
  return new NextResponse(renderWebManifest(host, name), {
    headers: {
      "content-type": "application/manifest+json; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
