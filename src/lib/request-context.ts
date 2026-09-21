import { AsyncLocalStorage } from "node:async_hooks";

type Store = { request: Request };

const als = new AsyncLocalStorage<Store>();

export function runWithRequest<T>(request: Request, fn: () => T): T {
  return als.run({ request }, fn);
}

/** Current incoming Request when a route handler wrapped `runWithRequest`. */
export function getRequest(): Request | null {
  return als.getStore()?.request ?? null;
}
