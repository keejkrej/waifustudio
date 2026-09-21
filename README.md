# WaifuStudio

Anime mobile-game character video studio. Lock a character card, generate a still, then image-to-video. The flow mirrors ComfyUI (Load Image / CLIP / KSampler / I2V) and runs on [OpenRouter](https://openrouter.ai).

Phone layout is an app-style tab bar with safe areas. Desktop is a sidebar plus a node canvas.

## Features

- **Pipeline:** cast → shot recipe → still → image-to-video → cut / Bilibili checklist
- **Graph:** ComfyUI-style workflow. Wire nodes on desktop; edit a card stack on phone
- **Cast:** reference portraits plus a lock prompt (text-side IP-Adapter)
- **Gallery:** stills and clips stored in IndexedDB on this device
- **OpenRouter:** the API key stays in `localStorage` and is proxied by the server — never committed

Sample characters are original. They are not existing game IP.

## Run locally

Requires Node 22.

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:8080`). Paste an OpenRouter API key in **Settings**, then run the pipeline or queue the graph.

```bash
npm run typecheck
npm run build
```

## Usage

1. Pick a character card, or upload your own portrait / screenshot
2. Choose a recipe (idle breath / battle / vertical daily / OP)
3. Generate a still, then send the first frame into image-to-video
4. Switch to **Graph** when you want finer control over models, aspect, and prompts

Default image models: Nano Banana, Seedream, FLUX, Grok Imagine. Default video: Seedance, Wan, Veo, Hailuo, Grok Imagine Video. Change them in Settings.

## Stack

TanStack Start · React 19 · Tailwind v4 · Zustand · IndexedDB
