"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { pingKeyFn } from "@/lib/studio/api";
import { IMAGE_MODELS, TEXT_MODELS, VIDEO_MODELS } from "@/lib/studio/models";
import { useStudio } from "@/lib/studio/store";
import { FormField, SelectField } from "./fields";

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
      setInfo(`Connected${res.label ? ` · ${res.label}` : ""}`);
      toast.success("OpenRouter connected");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Could not connect";
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
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Settings
          </p>
          <h1 className="mt-1 text-2xl font-medium tracking-tight md:text-3xl">OpenRouter</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The key stays in this browser. Requests are proxied to OpenRouter and billed to your
            account.
          </p>
        </div>
        <FormField label="API Key">
          <Input
            type="password"
            autoComplete="off"
            placeholder="sk-or-..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </FormField>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button className="w-full sm:w-auto" onClick={() => void test()} disabled={busy || !draft.trim()}>
            {busy ? "Checking…" : "Save and test"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setDraft("");
              setApiKey("");
              setInfo(null);
            }}
          >
            Clear
          </Button>
          {info ? <span className="text-xs text-muted-foreground">{info}</span> : null}
        </div>

        <div className="grid gap-3">
          <FormField label="Default image model">
            <SelectField
              value={settings.imageModel}
              onValueChange={(imageModel) => patch({ imageModel })}
              items={IMAGE_MODELS.map((m) => ({
                value: m.id,
                label: `${m.name} — ${m.note}`,
              }))}
            />
          </FormField>
          <FormField label="Default video model">
            <SelectField
              value={settings.videoModel}
              onValueChange={(videoModel) => patch({ videoModel })}
              items={VIDEO_MODELS.map((m) => ({
                value: m.id,
                label: `${m.name} — ${m.note}`,
              }))}
            />
          </FormField>
          <FormField label="Prompt expand model">
            <SelectField
              value={settings.textModel}
              onValueChange={(textModel) => patch({ textModel })}
              items={TEXT_MODELS.map((m) => ({ value: m.id, label: m.name }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Still resolution">
              <SelectField
                value={settings.defaultResolution}
                onValueChange={(defaultResolution) => patch({ defaultResolution })}
                items={["1K", "2K", "4K"].map((r) => ({ value: r, label: r }))}
              />
            </FormField>
            <FormField label="Video resolution">
              <SelectField
                value={settings.videoResolution}
                onValueChange={(videoResolution) => patch({ videoResolution })}
                items={["480p", "720p", "1080p"].map((r) => ({ value: r, label: r }))}
              />
            </FormField>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Create a key at openrouter.ai and paste it above. Images use /api/v1/images; video is
          async /api/v1/videos. On a phone, add this page to the home screen for an app-like shell.
        </p>
        <Button variant="outline" className="w-full md:hidden" onClick={() => setView("playbook")}>
          <BookOpen className="size-4" />
          Open the playbook
        </Button>
      </div>
    </div>
  );
}
