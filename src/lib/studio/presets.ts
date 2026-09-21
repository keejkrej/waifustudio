import type { CharacterCard } from "./types";

export const SAMPLE_CAST: CharacterCard[] = [
  {
    id: "cast_aoi",
    name: "绫",
    game: "刀锋回响",
    role: "近战主C · 剑士",
    look: "长银白发，侧刘海，锐利青灰瞳，清冷面孔",
    outfit: "海军蓝学院战斗夹克，银边，白衬衫，腰间细剑",
    props: "细剑、学院校徽",
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
    name: "朔夜",
    game: "星轨契约",
    role: "法师 · 控场",
    look: "短黑发，墨蓝内层，琥珀灰瞳，沉静",
    outfit: "炭黑学院法袍，银星发夹",
    props: "薄魔导书、星形发夹",
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
    name: "织",
    game: "灰域领航",
    role: "机甲驾驶员",
    look: "赤褐短发，冷灰瞳，利落下颌",
    outfit: "白与石板色驾驶服，额前掀起的护目镜",
    props: "护目镜、通讯耳麦",
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
    name: "栖",
    game: "林间诗篇",
    role: "辅助 · 治疗",
    look: "长烟灰褐发，柔和绿灰瞳",
    outfit: "象牙色亚麻袍，森林绿腰带",
    props: "细木杖",
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
    name: "立绘呼吸",
    blurb: "半身立绘 + 发丝与布料微动，适合当动态封面或循环切片。",
    aspect: "2:3",
    still:
      "official character portrait, waist-up, looking at viewer, clean studio lighting, pale gray background, detailed eyes, anime cel-shaded, game illustration",
    motion:
      "subtle idle animation, hair drifting in a light breeze, fabric of the jacket gently moving, slow blink, camera locked, no walking, no morphing, high consistency",
    duration: 5,
    videoAspect: "9:16",
    biliTip: "竖屏动态 · 适合「动态」分区或当视频循环封面",
  },
  {
    id: "battle-cut",
    name: "战斗演出",
    blurb: "宽银幕关键帧 + 突击镜头，做 15–30 秒高光切片。",
    aspect: "16:9",
    still:
      "cinematic battle keyframe, dynamic three-quarter pose, motion implied, debris and wind, dramatic side light, wide shot, anime film still, no text",
    motion:
      "camera slowly pushes in then a quick cut-like camera shake, character steps forward and draws the weapon, cloth and hair whipping, cinematic, keep face consistent",
    duration: 6,
    videoAspect: "16:9",
    biliTip: "16:9 正片高光 · 标题可用【角色名】一刀入魂",
  },
  {
    id: "daily-short",
    name: "日常切片",
    blurb: "9:16 竖屏，校园或街道慢走，B 站短视频友好。",
    aspect: "9:16",
    still:
      "vertical full-body shot, walking in a quiet dusk street, rain-wet stone, muted teal reflections, anime cinematic, shallow depth",
    motion:
      "slow walk toward camera then past, gentle camera pan, hair and coat moving naturally, street ambience, no sudden morph",
    duration: 8,
    videoAspect: "9:16",
    biliTip: "竖屏投稿 · 封面裁切角色脸部，前 3 秒给钩子",
  },
  {
    id: "op-title",
    name: "OP 片头",
    blurb: "从远景推进到半身，模拟手游 OP 前 6 秒。",
    aspect: "16:9",
    still:
      "wide cinematic establishing shot, character standing at the edge of a cliff overlooking an ink-wash city, dusk, wind, anime film still, no logos",
    motion:
      "slow crane-in from wide to medium close-up, wind intensifies, coat flares, hair streaming, orchestral-scale motion, keep identity locked",
    duration: 6,
    videoAspect: "16:9",
    biliTip: "当片头 5 秒 + 游戏名字幕，分区选游戏",
  },
  {
    id: "look-back",
    name: "回眸",
    blurb: "过肩到回眸特写，二创里最稳的情绪镜头。",
    aspect: "3:4",
    still:
      "over-the-shoulder then looking back, medium close-up, catchlight in eyes, soft rim light, anime portrait, detailed face",
    motion:
      "character turns head over the shoulder to look at camera, slow, hair follows, subtle smile, camera locked, no warping",
    duration: 5,
    videoAspect: "9:16",
    biliTip: "情绪向切片 · 配一首钢琴或游戏 OST 副歌",
  },
];

export const STYLE_PRESETS = [
  {
    id: "cel",
    name: "赛璐璐立绘",
    text: "cel-shaded anime, official mobile game illustration, clean lineart, flat colors with soft shading, detailed eyes",
  },
  {
    id: "thick",
    name: "厚涂 CG",
    text: "anime thick-paint CG, painterly lighting, detailed skin, cinematic color grade, still from a gacha splash art",
  },
  {
    id: "lightnovel",
    name: "轻小说插画",
    text: "light novel cover illustration, delicate linework, airy colors, waist-up, elegant pose",
  },
  {
    id: "2.5d",
    name: "三渲二",
    text: "anime 2.5D look, slight subsurface, game engine beauty shot, not photorealistic",
  },
  {
    id: "ink",
    name: "水墨夜景",
    text: "ink-wash night city, muted teal and graphite, cinematic anime, film grain, no neon purple",
  },
];

export const SHOT_PRESETS = [
  { id: "bust", name: "半身", text: "waist-up portrait, looking at viewer" },
  { id: "full", name: "全身", text: "full body, standing pose, head to toe visible" },
  { id: "close", name: "特写", text: "close-up on face, detailed eyes, catchlight" },
  { id: "low", name: "低机位", text: "low angle heroic shot, looming silhouette" },
  { id: "over", name: "过肩", text: "over-the-shoulder, looking back" },
  { id: "wide", name: "远景", text: "wide establishing shot, environment dominant" },
];

export const MOTION_PRESETS = [
  { id: "breeze", name: "发丝微风", text: "hair and cloth drifting in a light breeze, idle, camera locked" },
  { id: "blink", name: "呼吸眨眼", text: "slow blink and subtle breathing, micro-motion only" },
  { id: "turn", name: "转身回眸", text: "turns head to look at camera over the shoulder" },
  { id: "draw", name: "拔刀", text: "draws weapon in one clean motion, cloth whipping" },
  { id: "walk", name: "慢走", text: "slow walk toward camera, natural gait, no sliding feet" },
  { id: "pushin", name: "镜头推进", text: "slow camera push-in from medium to close-up" },
];

export const NEGATIVE_DEFAULT =
  "photorealistic, 3d render, western cartoon, extra fingers, extra limbs, deformed hands, deformed face, lowres, blurry, watermark, text, logo, subtitle, purple neon, duplicate character";

export const BILI_CHECKLIST = [
  { id: "cover", label: "16:9 封面，角色脸清晰，无水印" },
  { id: "title", label: "标题：【角色/游戏】+ 钩子，少用纯 AI 字样堆砌" },
  { id: "tag", label: "标签：游戏名、角色名、二创、AI、动态" },
  { id: "partition", label: "分区：游戏（有明确作品）或综合" },
  { id: "credit", label: "简介注明：二创 / 使用模型 / 非官方" },
  { id: "audio", label: "BGM 用可商用或游戏 OST 并注明" },
  { id: "hook", label: "前 3 秒给动作或脸，避免黑场" },
];

export function buildLockPrompt(c: Pick<CharacterCard, "look" | "outfit" | "props" | "name">) {
  return `same character named ${c.name}, ${c.look}, wearing ${c.outfit}, ${c.props}, original anime mobile-game character, official illustration style, consistent face and outfit`;
}
