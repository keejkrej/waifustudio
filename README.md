# WaifuStudio

二次元手游角色 AI 视频二创工作室。角色卡锁定外形，生成静帧，再图生视频。对照 ComfyUI 里 Load Image / CLIP / KSampler / I2V 的流程，云端走 [OpenRouter](https://openrouter.ai)。

手机端是底部 Tab + 安全区的 App 式布局；桌面端是侧栏 + 节点画布。

## 功能

- **流程**：角色 → 分镜配方 → 静帧 → 图生视频 → 成片 / B 站投稿清单
- **节点**：ComfyUI 式工作流。桌面可连线跑 Queue Prompt；手机上是卡片列表
- **角色库**：立绘参考图 + 锁定提示词（文本侧的 IP-Adapter）
- **图库**：生图/生视频结果存在本机 IndexedDB
- **OpenRouter**：Key 只存在浏览器 `localStorage`，经服务端转发，不进仓库

示例角色均为原创，不对应任何现有游戏 IP。

## 本地运行

需要 Node 22。

```bash
npm install
npm run dev
```

浏览器打开提示的地址（默认 `http://localhost:8080`）。到 **设置** 粘贴 OpenRouter API Key，再走流程或执行节点。

```bash
npm run typecheck
npm run build
```

## 使用

1. 选角色卡，或上传自己的立绘 / 截图
2. 选配方（立绘呼吸 / 战斗 / 日常竖屏 / OP）
3. 出静帧，把首帧送进图生视频
4. 需要精细控制时切到 **节点** 改模型、画幅、提示词

图像默认走 Nano Banana / Seedream / FLUX / Grok Imagine；视频走 Seedance / Wan / Veo / Hailuo / Grok Imagine Video，可在设置里改。

## 技术栈

TanStack Start · React 19 · Tailwind v4 · Zustand · IndexedDB
