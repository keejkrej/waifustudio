import { assertSameSiteRequest } from "./isolation.server";
import { requireUserId } from "./verify.server";

/**
 * Resolve the caller's verified user id for a Next.js route handler.
 * Live preview forwards a bearer token (partitioned cookies); deployed apps
 * rely on the session cookie.
 */
export async function getAuthedUserId(request?: Request): Promise<string> {
  assertSameSiteRequest(request);
  const headerToken = request?.headers.get("authorization");
  const bearer = headerToken?.startsWith("Bearer ")
    ? headerToken.slice("Bearer ".length)
    : undefined;
  return requireUserId(bearer);
}
