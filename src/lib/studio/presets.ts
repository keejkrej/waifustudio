import type { CharacterCard } from "./types";

export const SAMPLE_CAST: CharacterCard[] = [
  {
    id: "cast_aoi",
    name: "Aoi",
    game: "Blade Echo",
    role: "Melee DPS · Sword",
    look: "Long silver-white hair with side bangs, sharp teal-gray eyes, cool expression",
    outfit: "Navy school-style combat jacket with silver trim, white shirt, slim sword at hip",
    props: "Slim sword, academy crest",
    lockPrompt:
      "same character, long silver-white hair with side bangs, sharp teal-gray eyes, navy school-style combat jacket with silver trim, white shirt, slim sword at hip, original anime game character, cel-shaded official illustration",
    negative:
      "photorealistic, 3d render, western cartoon, extra fingers, extra limbs, deformed face, watermark, text, logo, purple lighting",
    refs: ["/cast/aoi.jpg"],
    createdAt: 0,
    sample: true,
  },
  {
    id: "cast_sayo",
    name: "Sayo",
    game: "Star Pact",
    role: "Mage · Crowd control",
    look: "Short black hair with ink-blue inner color, amber-gray eyes, calm face",
    outfit: "Charcoal academic mage coat, silver star hairpin",
    props: "Slim grimoire, star hairpin",
    lockPrompt:
      "same character, short black hair with ink-blue inner color, amber-gray eyes, dark charcoal academic mage coat, silver star hairpin, slim grimoire, original anime game character, cel-shaded official illustration",
    negative:
      "photorealistic, 3d render, extra fingers, deformed face, watermark, text, logo",
    refs: ["/cast/sayo.jpg"],
    createdAt: 0,
    sample: true,
  },
  {
    id: "cast_ori",
    name: "Ori",
    game: "Ashreach",
    role: "Mecha pilot",
    look: "Cropped copper-brown hair, cool gray eyes, sharp jaw",
    outfit: "White and slate pilot suit, visor raised on forehead",
    props: "Visor, comms headset",
    lockPrompt:
      "same character, cropped copper-brown hair, cool gray eyes, white and slate mecha pilot suit, visor raised on forehead, original anime game character, cel-shaded official illustration",
    negative:
      "photorealistic, 3d render, extra fingers, deformed face, watermark, text, logo",
    refs: ["/cast/ori.jpg"],
    createdAt: 0,
    sample: true,
  },
  {
    id: "cast_sumi",
    name: "Sumi",
    game: "Woodland Verse",
    role: "Support · Healer",
    look: "Long ash-brown hair, gentle green-gray eyes",
    outfit: "Ivory linen healer robes with a forest-green sash",
    props: "Slender wooden staff",
    lockPrompt:
      "same character, long ash-brown hair, gentle green-gray eyes, ivory linen healer robes with forest-green sash, slender wooden staff, original anime game character, cel-shaded official illustration",
    negative:
      "photorealistic, 3d render, extra fingers, deformed face, watermark, text, logo",
    refs: ["/cast/sumi.jpg"],
    createdAt: 0,
    sample: true,
  },
];

export interface Recipe {
  id: string;
  name: string;
  blurb: string;
  aspect: string;
  still: string;
  motion: string;
  duration: number;
  videoAspect: string;
  biliTip: string;
}

export const RECIPES: Recipe[] = [
  {
    id: "idle-breath",
    name: "Idle breath",
    blurb: "Waist-up portrait plus hair and cloth micro-motion. Good as a looping cover or live wallpaper.",
    aspect: "2:3",
    still:
      "official character portrait, waist-up, looking at viewer, clean studio lighting, pale gray background, detailed eyes, anime cel-shaded, game illustration",
    motion:
      "subtle idle animation, hair drifting in a light breeze, fabric of the jacket gently moving, slow blink, camera locked, no walking, no morphing, high consistency",
    duration: 5,
    videoAspect: "9:16",
    biliTip: "Vertical motion · Dynamics partition, or use as a looping cover",
  },
  {
    id: "battle-cut",
    name: "Battle cut",
    blurb: "Widescreen keyframe plus a lunge. Make a 15–30s highlight clip.",
    aspect: "16:9",
    still:
      "cinematic battle keyframe, dynamic three-quarter pose, motion implied, debris and wind, dramatic side light, wide shot, anime film still, no text",
    motion:
      "camera slowly pushes in then a quick cut-like camera shake, character steps forward and draws the weapon, cloth and hair whipping, cinematic, keep face consistent",
    duration: 6,
    videoAspect: "16:9",
    biliTip: "16:9 highlight · Title like [Character] one clean strike",
  },
  {
    id: "daily-short",
    name: "Daily short",
    blurb: "9:16 vertical walk on campus or a quiet street. Short-video friendly.",
    aspect: "9:16",
    still:
      "vertical full-body shot, walking in a quiet dusk street, rain-wet stone, muted teal reflections, anime cinematic, shallow depth",
    motion:
      "slow walk toward camera then past, gentle camera pan, hair and coat moving naturally, street ambience, no sudden morph",
    duration: 8,
    videoAspect: "9:16",
    biliTip: "Vertical upload · Crop the face for the cover, hook in the first 3 seconds",
  },
  {
    id: "op-title",
    name: "OP title",
    blurb: "Push from wide to waist-up. The first 6 seconds of a mobile-game OP.",
    aspect: "16:9",
    still:
      "wide cinematic establishing shot, character standing at the edge of a cliff overlooking an ink-wash city, dusk, wind, anime film still, no logos",
    motion:
      "slow crane-in from wide to medium close-up, wind intensifies, coat flares, hair streaming, orchestral-scale motion, keep identity locked",
    duration: 6,
    videoAspect: "16:9",
    biliTip: "Use as a 5s title card + game-name subtitle, Games partition",
  },
  {
    id: "look-back",
    name: "Look back",
    blurb: "Over-shoulder to a look-back close-up. The most stable emotional shot in this genre.",
    aspect: "3:4",
    still:
      "over-the-shoulder then looking back, medium close-up, catchlight in eyes, soft rim light, anime portrait, detailed face",
    motion:
      "character turns head over the shoulder to look at camera, slow, hair follows, subtle smile, camera locked, no warping",
    duration: 5,
    videoAspect: "9:16",
    biliTip: "Mood clip · Pair with piano or a game OST chorus",
  },
];

export const STYLE_PRESETS = [
  {
    id: "cel",
    name: "Cel-shaded",
    text: "cel-shaded anime, official mobile game illustration, clean lineart, flat colors with soft shading, detailed eyes",
  },
  {
    id: "thick",
    name: "Thick-paint CG",
    text: "anime thick-paint CG, painterly lighting, detailed skin, cinematic color grade, still from a gacha splash art",
  },
  {
    id: "lightnovel",
    name: "Light novel",
    text: "light novel cover illustration, delicate linework, airy colors, waist-up, elegant pose",
  },
  {
    id: "2.5d",
    name: "2.5D",
    text: "anime 2.5D look, slight subsurface, game engine beauty shot, not photorealistic",
  },
  {
    id: "ink",
    name: "Ink-wash night",
    text: "ink-wash night city, muted teal and graphite, cinematic anime, film grain, no neon purple",
  },
];

export const SHOT_PRESETS = [
  { id: "bust", name: "Bust", text: "waist-up portrait, looking at viewer" },
  { id: "full", name: "Full body", text: "full body, standing pose, head to toe visible" },
  { id: "close", name: "Close-up", text: "close-up on face, detailed eyes, catchlight" },
  { id: "low", name: "Low angle", text: "low angle heroic shot, looming silhouette" },
  { id: "over", name: "Over-shoulder", text: "over-the-shoulder, looking back" },
  { id: "wide", name: "Wide", text: "wide establishing shot, environment dominant" },
];

export const MOTION_PRESETS = [
  { id: "breeze", name: "Hair breeze", text: "hair and cloth drifting in a light breeze, idle, camera locked" },
  { id: "blink", name: "Idle blink", text: "slow blink and subtle breathing, micro-motion only" },
  { id: "turn", name: "Look back", text: "turns head to look at camera over the shoulder" },
  { id: "draw", name: "Draw blade", text: "draws weapon in one clean motion, cloth whipping" },
  { id: "walk", name: "Walk", text: "slow walk toward camera, natural gait, no sliding feet" },
  { id: "pushin", name: "Push-in", text: "slow camera push-in from medium to close-up" },
];

export const NEGATIVE_DEFAULT =
  "photorealistic, 3d render, western cartoon, extra fingers, extra limbs, deformed hands, deformed face, lowres, blurry, watermark, text, logo, subtitle, purple neon, duplicate character";

export const BILI_CHECKLIST = [
  { id: "cover", label: "16:9 cover, face readable, no watermark" },
  { id: "title", label: "Title: [character / game] + a hook — skip stuffing “AI”" },
  { id: "tag", label: "Tags: game, character, fan work, AI, motion" },
  { id: "partition", label: "Partition: Games (if a title is named) or Variety" },
  { id: "credit", label: "Description: fan work / model used / unofficial" },
  { id: "audio", label: "Use licensable BGM or a game OST and credit it" },
  { id: "hook", label: "First 3 seconds: action or a face, not a black frame" },
];

export function buildLockPrompt(c: Pick<CharacterCard, "look" | "outfit" | "props" | "name">) {
  return `same character named ${c.name}, ${c.look}, wearing ${c.outfit}, ${c.props}, original anime mobile-game character, official illustration style, consistent face and outfit`;
}
