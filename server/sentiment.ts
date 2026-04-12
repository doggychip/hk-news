import type { Sentiment, Reactions } from "@shared/schema";

const POSITIVE_WORDS = [
  "正", "勁", "靚", "開心", "好嘢", "讚", "感動", "幸福", "恭喜", "成功",
  "好好", "推薦", "抵食", "好食", "好飲", "好睇", "好正", "好玩", "感謝", "多謝",
  "amazing", "good", "great", "love", "best", "happy", "perfect", "excellent",
  "chill", "浪漫", "甜蜜", "升級", "進步", "突破", "受歡迎", "回升", "增長",
];

const NEGATIVE_WORDS = [
  "衰", "慘", "嬲", "廢", "垃圾", "死", "崩潰", "離譜", "黑心", "差",
  "唔好", "難食", "伏", "中伏", "爛", "假", "呃人", "坑", "劣質", "嘥錢",
  "bad", "worse", "worst", "terrible", "hate", "fail", "ugly", "poor",
  "延誤", "塞車", "遲到", "分手", "失敗", "跌", "蝕", "裁員", "倒閉",
  "投訴", "不滿", "嫌", "怕", "危機", "問題", "封路",
];

export function analyzeSentiment(title: string, content: string, heat: number, reactions: Reactions): Sentiment {
  const text = `${title} ${content}`.toLowerCase();

  // Check explosive first: high heat + high total reactions
  const totalReactions = reactions.fire + reactions.cringe + reactions.rofl + reactions.dead + reactions.chill + reactions.rage;
  if (heat > 75 && totalReactions > 150) {
    return "explosive";
  }

  let positiveHits = 0;
  let negativeHits = 0;

  for (const word of POSITIVE_WORDS) {
    if (text.includes(word.toLowerCase())) positiveHits++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (text.includes(word.toLowerCase())) negativeHits++;
  }

  const diff = positiveHits - negativeHits;

  if (diff >= 2) return "positive";
  if (diff <= -2) return "negative";

  // Borderline: check reaction sentiment as tiebreaker
  if (positiveHits > 0 || negativeHits > 0) {
    const positiveReactions = reactions.fire + reactions.chill;
    const negativeReactions = reactions.cringe + reactions.rage + reactions.dead;
    if (positiveReactions > negativeReactions * 1.5) return "positive";
    if (negativeReactions > positiveReactions * 1.5) return "negative";
  }

  return "neutral";
}
