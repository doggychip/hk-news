import type { Sentiment } from "@shared/schema";

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; emoji: string; className: string }> = {
  positive: { label: "正面", emoji: "✨", className: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
  negative: { label: "負面", emoji: "😤", className: "text-red-500 bg-red-500/10 border-red-500/30" },
  neutral: { label: "中立", emoji: "😐", className: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  explosive: { label: "爆炸", emoji: "💥", className: "text-orange-500 bg-orange-500/10 border-orange-500/30" },
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const config = SENTIMENT_CONFIG[sentiment];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border ${config.className}`}>
      <span>{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
