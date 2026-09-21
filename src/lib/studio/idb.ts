const DB_NAME = "waifustudio";
const STORE = "assets";
const VERSION = 1;

export interface StoredAsset {
  id: string;
  kind: "image" | "video";
  mime: string;
  blob: Blob;
  createdAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putAsset(asset: StoredAsset): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(asset);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function getAsset(id: string): Promise<StoredAsset | undefined> {
  const db = await openDb();
  const row = await new Promise<StoredAsset | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredAsset | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return row;
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function putDataUrl(
  id: string,
  dataUrl: string,
  kind: "image" | "video",
): Promise<StoredAsset> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const asset: StoredAsset = {
    id,
    kind,
    mime: blob.type || (kind === "video" ? "video/mp4" : "image/png"),
    blob,
    createdAt: Date.now(),
  };
  await putAsset(asset);
  return asset;
}

export async function putB64(
  id: string,
  b64: string,
  mime: string,
  kind: "image" | "video",
): Promise<StoredAsset> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const asset: StoredAsset = { id, kind, mime, blob, createdAt: Date.now() };
  await putAsset(asset);
  return asset;
}

export function assetObjectUrl(asset: StoredAsset): string {
  return URL.createObjectURL(asset.blob);
}
