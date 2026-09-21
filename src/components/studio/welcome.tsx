import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStudio } from "@/lib/studio/store";

export function Welcome() {
  const seen = useStudio((s) => s.welcomeSeen);
  const setSeen = useStudio((s) => s.setWelcomeSeen);
  const setView = useStudio((s) => s.setView);

  return (
    <Dialog open={!seen} onOpenChange={(o) => !o && setSeen()}>
      <DialogContent>
        <p className="text-[11px] font-medium tracking-[0.18em] text-muted uppercase">
          WaifuStudio
        </p>
        <DialogTitle className="mt-2 text-xl sm:text-2xl">从立绘到动态，一条管线。</DialogTitle>
        <DialogDescription>
          对照 B 站二次元手游角色二创的常用做法：角色卡锁定外形，生成静帧，再图生视频。使用你自己的
          OpenRouter Key。
        </DialogDescription>
        <ol className="mt-4 space-y-2 text-sm text-fg">
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted tabular-nums">01</span>
            选角色卡，或上传立绘参考
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted tabular-nums">02</span>
            选配方：立绘呼吸 / 战斗 / 日常竖屏 / OP
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-muted tabular-nums">03</span>
            出静帧，再把首帧送进图生视频
          </li>
        </ol>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1"
            onClick={() => {
              setSeen();
              setView("pipeline");
            }}
          >
            开始创作
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setSeen();
              setView("graph");
            }}
          >
            节点工作流
          </Button>
        </div>
        <button
          type="button"
          className="mt-3 w-full text-center text-xs text-subtle hover:text-muted"
          onClick={setSeen}
        >
          稍后填写 API Key
        </button>
      </DialogContent>
    </Dialog>
  );
}
