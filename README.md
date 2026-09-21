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

## Stack

Next.js (App Router) · React 19 · shadcn/ui (Lyra + Radix) · Vercel AI Elements · Zustand · IndexedDB · better-auth

## Run locally

Requires Node 22.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:8080`. Paste an OpenRouter API key in **Settings**, then run the pipeline or queue the graph.

```bash
npm run typecheck
npm run build
```

## Deploy on Vercel

This is a standard Next.js App Router app. Import the GitHub repo in [Vercel](https://vercel.com/new) and deploy. Next.js defaults are enough — no `vercel.json` is required.

### Environment variables

Set these in the Vercel project (Production + Preview):

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_AUTH_ENABLED` | No | Default `false` keeps the local/dev user. Set `true` only when OAuth is configured. |
| `BETTER_AUTH_SECRET` | If auth is on | Random 32+ byte secret. |
| `BETTER_AUTH_URL` | If auth is on | Public origin, e.g. `https://your-app.vercel.app`. |
| `DATABASE_URL` | If auth/DB persist | Pooled Postgres (Neon). When unset, preview uses in-memory PGLite. |
| `GROK_AUTH_ISSUER` / `GROK_AUTH_CLIENT_ID` / `GROK_AUTH_CLIENT_SECRET` | Optional | Grok auth broker federation. Leave empty on a plain Vercel deploy. |

**Do not** put an OpenRouter key in Vercel env. Users paste a key in Settings; it lives in `localStorage` and is sent to `/api/studio/*`, which proxies OpenRouter.

Image generation can take over a minute. On Vercel Pro, function duration is fine (`maxDuration` is set on the studio routes). Hobby plans have a shorter limit — retries or a Pro plan may be needed for slow image/video models.

## Usage

1. Pick a character card, or upload your own portrait / screenshot
2. Choose a recipe (idle breath / battle / vertical daily / OP)
3. Generate a still, then send the first frame into image-to-video
4. Switch to **Graph** when you want finer control over models, aspect, and prompts

Default image models: Nano Banana, Seedream, FLUX, Grok Imagine. Default video: Seedance, Wan, Veo, Hailuo, Grok Imagine Video. Change them in Settings.
