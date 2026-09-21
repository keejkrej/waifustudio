import { useState } from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, SelectNative } from "@/components/ui/field";
import { pingKeyFn } from "@/lib/studio/api";
import { IMAGE_MODELS, TEXT_MODELS, VIDEO_MODELS } from "@/lib/studio/models";
import { useStudio } from "@/lib/studio/store";

export function SettingsView() {
  const apiKey = useStudio((s) => s.apiKey);
  const setApiKey = useStudio((s) => s.setApiKey);
  const settings = useStudio((s) => s.settings);
  const patch = useStudio((s) => s.patchSettings);
  const setView = useStudio((s) => s.setView);
  const [draft, setDraft] = useState(apiKey);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  async function test() {
    setBusy(true);
    try {
      const res = await pingKeyFn({ data: { apiKey: draft } });
      setApiKey(draft.trim());
      setInfo(`已连接${res.label ? ` · ${res.label}` : ""}`);
      toast.success("OpenRouter 连接成功");
    } catch (err) {
      const m = err instanceof Error ? err.message : "连接失败";
      setInfo(null);
      toast.error(m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-10">
      <div className="mx-auto max-w-xl space-y-8">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
            Settings
          </p>
          <h1 className="mt-1 font-display text-2xl tracking-tight md:text-3xl">OpenRouter</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Key 只存在你的浏览器里，请求经工作室服务端转发到 OpenRouter。生成会消耗你账号的额度。
          </p>
        </div>
        <Field label="API Key">
          <Input
            type="password"
            autoComplete="off"
            placeholder="sk-or-..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </Field>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto" onClick={() => void test()} disabled={busy || !draft.trim()}>
            {busy ? "检测中…" : "保存并检测"}
          </Button>
          <Button
            variant="ghost"
            className="h-11 sm:h-11"
            onClick={() => {
              setDraft("");
              setApiKey("");
              setInfo(null);
            }}
          >
            清除
          </Button>
          {info ? <span className="text-xs text-ok">{info}</span> : null}
        </div>

        <div className="grid gap-3">
          <Field label="默认图像模型">
            <SelectNative
              value={settings.imageModel}
              onChange={(e) => patch({ imageModel: e.target.value })}
            >
              {IMAGE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.note}
                </option>
              ))}
            </SelectNative>
          </Field>
          <Field label="默认视频模型">
            <SelectNative
              value={settings.videoModel}
              onChange={(e) => patch({ videoModel: e.target.value })}
            >
              {VIDEO_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.note}
                </option>
              ))}
            </SelectNative>
          </Field>
          <Field label="提示词扩写模型">
            <SelectNative
              value={settings.textModel}
              onChange={(e) => patch({ textModel: e.target.value })}
            >
              {TEXT_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </SelectNative>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="静帧分辨率">
              <SelectNative
                value={settings.defaultResolution}
                onChange={(e) => patch({ defaultResolution: e.target.value })}
              >
                {["1K", "2K", "4K"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </SelectNative>
            </Field>
            <Field label="视频分辨率">
              <SelectNative
                value={settings.videoResolution}
                onChange={(e) => patch({ videoResolution: e.target.value })}
              >
                {["480p", "720p", "1080p"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </SelectNative>
            </Field>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-subtle">
          在 openrouter.ai 创建密钥后粘贴到上方。图像走 /api/v1/images，视频走异步 /api/v1/videos。手机浏览器可把本页加到主屏幕，操作更接近独立 App。
        </p>
        <Button variant="outline" className="w-full md:hidden" onClick={() => setView("playbook")}>
          <BookOpen className="size-4" />
          打开二创手册
        </Button>
      </div>
    </div>
  );
}
