import { useState } from "react";
import { motion } from "framer-motion";
import type { Sentiment } from "@shared/schema";

const SENTIMENT_LABELS: Record<Sentiment, string> = {
  positive: "正面 ✨",
  negative: "負面 😤",
  neutral: "中立 😐",
  explosive: "爆炸 💥",
};

interface AIPollProps {
  postId: number;
  sentiment: Sentiment;
}

export function AIPoll({ postId, sentiment }: AIPollProps) {
  const [vote, setVote] = useState<"agree" | "disagree" | null>(null);

  // Simulate community votes — deterministic from postId
  const baseAgree = 55 + (postId * 7) % 30; // 55-85%
  const totalFakeVotes = 100 + (postId * 13) % 400;
  const agreeCount = Math.floor(totalFakeVotes * baseAgree / 100) + (vote === "agree" ? 1 : 0);
  const disagreeCount = totalFakeVotes - Math.floor(totalFakeVotes * baseAgree / 100) + (vote === "disagree" ? 1 : 0);
  const total = agreeCount + disagreeCount;
  const agreePercent = Math.round((agreeCount / total) * 100);

  if (!sentiment) return null;

  return (
    <div className="px-4 py-2.5 border-t border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-muted-foreground">🤖 AI判定：{SENTIMENT_LABELS[sentiment]}</span>
        <span className="text-[10px] text-muted-foreground">你同意嗎？</span>
      </div>

      {vote === null ? (
        <div className="flex gap-2">
          <button
            onClick={() => setVote("agree")}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition-colors"
          >
            👍 同意
          </button>
          <button
            onClick={() => setVote("disagree")}
            className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
          >
            👎 唔同意
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Result bar */}
          <div className="flex h-6 rounded-lg overflow-hidden bg-muted/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${agreePercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-emerald-500/30 flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-emerald-500">{agreePercent}% 同意</span>
            </motion.div>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - agreePercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-red-400/20 flex items-center justify-center"
            >
              <span className="text-[10px] font-bold text-red-400">{100 - agreePercent}%</span>
            </motion.div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {total} 人投咗票 · 你{vote === "agree" ? "同意" : "唔同意"}AI
          </p>
        </div>
      )}
    </div>
  );
}
