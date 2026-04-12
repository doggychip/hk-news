import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ThumbsUp, ThumbsDown } from "lucide-react";

interface AIDebatePanelProps {
  debate: { optimist: string; pessimist: string };
}

export function AIDebatePanel({ debate }: AIDebatePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [vote, setVote] = useState<"optimist" | "pessimist" | null>(null);

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-muted/30 transition-colors"
      >
        <Bot className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-foreground">🤖 AI 正反論戰</span>
        <span className="text-[10px] text-muted-foreground">樂觀L vs 悲觀L</span>
        <span className="ml-auto text-[10px] text-primary">{expanded ? "收起" : "展開"}</span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Optimist */}
              <div className={`rounded-lg p-3 border transition-all ${
                vote === "optimist" ? "border-emerald-500/50 bg-emerald-500/10" : "border-border bg-card"
              }`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">😇</span>
                  <span className="text-[11px] font-bold text-emerald-500">樂觀L</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{debate.optimist}</p>
              </div>

              {/* VS divider */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] font-bold text-primary neon-text-pink">⚔️ VS</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Pessimist */}
              <div className={`rounded-lg p-3 border transition-all ${
                vote === "pessimist" ? "border-red-500/50 bg-red-500/10" : "border-border bg-card"
              }`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">😈</span>
                  <span className="text-[11px] font-bold text-red-400">悲觀L</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{debate.pessimist}</p>
              </div>

              {/* Vote buttons */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="text-[10px] text-muted-foreground">你撐邊個？</span>
                <button
                  onClick={() => setVote("optimist")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    vote === "optimist"
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-emerald-500"
                  }`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span>樂觀L</span>
                </button>
                <button
                  onClick={() => setVote("pessimist")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                    vote === "pessimist"
                      ? "bg-red-500/20 border-red-500/50 text-red-400"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-red-400"
                  }`}
                >
                  <ThumbsDown className="w-3 h-3" />
                  <span>悲觀L</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
