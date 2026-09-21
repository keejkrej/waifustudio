import { headers } from "next/headers";
import { getRequest } from "@/lib/request-context";
import { gateIdentityEnabled } from "./gate-identity.server";
import { auth, authConfigured } from "./server";

/**
 * Server-side session resolution (server-only).
 *
 * Because this app runs its OWN Better Auth at same-origin `/api/auth/*`, the
 * session cookie is sent with every request to this app. We resolve the user
 * via `auth.api.getSession`. Never trust a client-supplied user id.
 */

const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());

export { authConfigured };

if (databaseConfigured && !authConfigured) {
  console.error(
    "[auth] DATABASE_URL is set but auth is disabled " +
      "(NEXT_PUBLIC_AUTH_ENABLED=false / VITE_AUTH_ENABLED=false) " +
      "— requireUserId() will reject every request (fail closed) rather than " +
      "share one dev user on a real database.",
  );
}

export const DEV_USER_ID = "dev-user";

export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export type VerifiedUser = { id: string; email: string | null };

async function sessionHeaders(bearerToken?: string): Promise<Headers | null> {
  const req = getRequest();
  if (req) {
    const h = new Headers(req.headers);
    if (bearerToken) h.set("Authorization", `Bearer ${bearerToken}`);
    return h;
  }
  try {
    const h = new Headers(await headers());
    if (bearerToken) h.set("Authorization", `Bearer ${bearerToken}`);
    return h;
  } catch {
    return null;
  }
}

export async function getSessionUser(
  bearerToken?: string,
): Promise<VerifiedUser | null> {
  if (!authConfigured && !gateIdentityEnabled()) return null;
  const hdrs = await sessionHeaders(bearerToken);
  if (!hdrs) return null;
  const session = await auth.api.getSession({ headers: hdrs });
  if (!session?.user) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

export async function requireUserId(bearerToken?: string): Promise<string> {
  if (!authConfigured && !gateIdentityEnabled()) {
    if (databaseConfigured) {
      throw new Error(
        "Auth is disabled (NEXT_PUBLIC_AUTH_ENABLED=false) but DATABASE_URL is set — " +
          "refusing to fall back to the shared dev user against a real database.",
      );
    }
    return DEV_USER_ID;
  }
  const user = await getSessionUser(bearerToken);
  if (!user) throw new UnauthorizedError();
  return user.id;
}
