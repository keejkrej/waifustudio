import { ChevronLeft } from "lucide-react";
import { useStudio } from "@/lib/studio/store";

export function PlaybookView() {
  const setView = useStudio((s) => s.setView);

  return (
    <div className="h-full overflow-y-auto px-4 py-6 md:px-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          className="mb-4 inline-flex h-11 items-center gap-1 text-sm text-muted md:hidden"
          onClick={() => setView("settings")}
        >
          <ChevronLeft className="size-4" />
          设置
        </button>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Playbook</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight md:text-4xl">B 站二创管线</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          二次元手游角色 AI 视频二创，核心不是「把立绘丢进模型复制」，而是用参考图 +
          锁定词保住外形，用分镜把动作写清楚，再用图生视频把静帧动起来。下面是目前常见做法，以及在
          WaifuStudio 里对应的模块。
        </p>

        <Section n="01" title="素材采集">
          官方立绘、Live2D 截图、战斗结算图、角色设定。只作参考，不要直接当成品搬运。上传到「角色库」，一张正脸半身 +
          一张全身通常够用。
        </Section>
        <Section n="02" title="角色锁定">
          本地 ComfyUI 常用 IP-Adapter / InstantID / PuLID / 角色 LoRA，并固定
          seed。云端路径改为：参考图（input_references）+ 锁定提示词。强度过高会贴图，过低会换脸，先从
          一张清晰立绘试。
        </Section>
        <Section n="03" title="分镜脚本">
          3–8 个镜头：建立 → 动作 → 高潮 → 收束。每个镜头写清机位、动作、光。配方里的「立绘呼吸 / 回眸 /
          战斗 / OP」就是高频镜号。
        </Section>
        <Section n="04" title="静帧">
          对应 ComfyUI 的 Checkpoint + CLIP + KSampler。这里走 OpenRouter 图像模型（Nano Banana、Seedream、FLUX、Grok
          Imagine）。画幅先按成片走：竖屏 9:16 / 2:3，正片 16:9。
        </Section>
        <Section n="05" title="图生视频">
          把静帧当 first_frame。动作提示词写镜头，而不是再描述一遍服装。Seedance / Wan / Veo / Hailuo / Grok
          Imagine Video 都在设置里可选。先 5–8 秒，确认脸不崩再加长。
        </Section>
        <Section n="06" title="后期与投稿">
          补帧、超分、BGM、字幕是本地或剪辑软件的事。B 站：16:9 封面、前 3
          秒给钩子、标题带角色或作品名、简介标明二创与模型。
        </Section>

        <h2 className="mt-10 font-display text-2xl tracking-tight">和 ComfyUI 的对应</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">ComfyUI</th>
                <th className="px-3 py-2 font-medium">WaifuStudio</th>
              </tr>
            </thead>
            <tbody className="text-fg">
              {[
                ["Load Image", "角色卡节点 / 角色库参考图"],
                ["CLIP Text Encode", "提示词节点 + 锁定词"],
                ["KSampler / 图像模型", "静帧节点（OpenRouter Images）"],
                ["AnimateDiff / I2V", "图生视频节点（OpenRouter Videos）"],
                ["Preview / Save", "输出节点 + 图库"],
                ["Queue Prompt", "顶栏 Queue Prompt"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-hairline">
                  <td className="px-3 py-2 font-mono text-xs text-muted">{row[0]}</td>
                  <td className="px-3 py-2">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs leading-relaxed text-subtle">
          示例角色均为原创，不对应任何现有游戏 IP。用你自己的立绘与提示词做二创时，请遵守作品与平台规则。
        </p>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: string }) {
  return (
    <section className="mt-8 grid grid-cols-[48px_1fr] gap-4">
      <span className="font-mono text-xs text-subtle">{n}</span>
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </section>
  );
}
