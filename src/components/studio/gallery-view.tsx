import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/misc";
import { getAsset } from "@/lib/studio/idb";
import { useStudio } from "@/lib/studio/store";
import { downloadBlob, formatCost, formatTime } from "@/lib/utils";

export function GalleryView() {
  const gallery = useStudio((s) => s.gallery);
  const remove = useStudio((s) => s.removeGallery);
  const characters = useStudio((s) => s.characters);

  async function save(item: (typeof gallery)[number]) {
    if (item.thumbUrl?.startsWith("/") || item.thumbUrl?.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = item.thumbUrl;
      a.download = item.kind === "video" ? `${item.title}.mp4` : `${item.title}.png`;
      a.click();
      return;
    }
    const asset = await getAsset(item.assetId);
    if (!asset) return;
    downloadBlob(asset.blob, item.kind === "video" ? `${item.title}.mp4` : `${item.title}.png`);
  }

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Gallery</p>
      <h1 className="mt-1 font-display text-2xl tracking-tight md:text-3xl">Gallery</h1>
      <p className="mt-1 hidden max-w-lg text-sm text-muted md:block">
        Results stay on this device. The sample still is ready to preview; API clips land in the local gallery.
      </p>
      {gallery.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No cuts yet.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {gallery.map((g) => {
            const c = characters.find((x) => x.id === g.characterId);
            return (
              <figure
                key={g.id}
                className="overflow-hidden rounded-lg border border-border bg-surface"
              >
                <div className="relative aspect-[16/10] bg-elevated">
                  {g.kind === "video" && g.thumbUrl && !g.thumbUrl.startsWith("/") ? (
                    <video src={g.thumbUrl} className="size-full object-cover" muted />
                  ) : g.thumbUrl ? (
                    <img src={g.thumbUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center text-xs text-subtle">
                      No preview
                    </div>
                  )}
                  <Badge
                    tone={g.kind === "video" ? "motion" : "still"}
                    className="absolute left-2 top-2 bg-bg/80"
                  >
                    {g.kind === "video" ? "Video" : "Still"}
                  </Badge>
                </div>
                <figcaption className="space-y-1 p-3">
                  <p className="truncate text-sm font-medium">{g.title}</p>
                  <p className="truncate text-[11px] text-muted">
                    {c?.name ?? "—"} · {g.model}
                  </p>
                  <p className="flex items-center justify-between text-[11px] text-subtle">
                    <span>{g.createdAt > 0 ? formatTime(g.createdAt) : "Sample"}</span>
                    <span>{formatCost(g.cost)}</span>
                  </p>
                  <div className="flex gap-1 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-11 flex-1 md:h-9"
                      onClick={() => void save(g)}
                    >
                      <Download className="size-3.5" />
                      Download
                    </Button>
                    {g.createdAt ? (
                      <Button size="icon" variant="ghost" className="md:size-9" onClick={() => remove(g.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
