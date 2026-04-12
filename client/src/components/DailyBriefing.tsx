import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DailyBriefing as BriefingType } from "@shared/schema";
import { SentimentBadge } from "./SentimentBadge";

const MOOD_GRADIENTS: Record<string, string> = {
  "正面": "from-emerald-500/10 to-cyan-500/10",
  "負面": "from-red-500/10 to-orange-500/10",
  "中立": "from-gray-500/10 to-slate-500/10",
  "爆炸": "from-orange-500/10 to-yellow-500/10",
  "default": "from-primary/5 to-purple-500/5",
};

function getMoodGradient(mood: string): string {
  if (mood.includes("正面")) return MOOD_GRADIENTS["正面"];
  if (mood.includes("負面")) return MOOD_GRADIENTS["負面"];
  if (mood.includes("爆炸")) return MOOD_GRADIENTS["爆炸"];
  if (mood.includes("中立")) return MOOD_GRADIENTS["中立"];
  return MOOD_GRADIENTS["default"];
}

export function DailyBriefingCard() {
  const [expanded, setExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: briefing, isLoading } = useQuery<BriefingType>({
    queryKey: ["/api/briefing"],
    refetchInterval: 30 * 60 * 1000, // 30 minutes
  });

  if (isLoading || !briefing) return null;

  const gradient = getMoodGradient(briefing.overallMood);
  const total = briefing.sentimentBreakdown.positive + briefing.sentimentBreakdown.negative +
    briefing.sentimentBreakdown.neutral + briefing.sentimentBreakdown.explosive;

  return (
    <div className="max-w-2xl mx-auto px-3 pt-3">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${gradient} border border-border rounded-lg overflow-hidden`}
      >
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">每日AI簡報</span>
            <span className="text-[10px] text-muted-foreground font-mono">{briefing.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{briefing.greeting}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
        </button>

        {/* Collapsed preview */}
        {!expanded && (
          <div className="px-4 pb-3 -mt-1">
            <p className="text-xs text-foreground/80">{briefing.overallMood}</p>
          </div>
        )}

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Overall mood */}
                <p className="text-sm font-bold text-foreground">{briefing.overallMood}</p>

                {/* Sentiment bar */}
                {total > 0 && (
                  <div className="space-y-1">
                    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                      {briefing.sentimentBreakdown.positive > 0 && (
                        <div className="bg-emerald-500" style={{ width: `${(briefing.sentimentBreakdown.positive / total) * 100}%` }} />
                      )}
                      {briefing.sentimentBreakdown.neutral > 0 && (
                        <div className="bg-gray-400" style={{ width: `${(briefing.sentimentBreakdown.neutral / total) * 100}%` }} />
                      )}
                      {briefing.sentimentBreakdown.negative > 0 && (
                        <div className="bg-red-500" style={{ width: `${(briefing.sentimentBreakdown.negative / total) * 100}%` }} />
                      )}
                      {briefing.sentimentBreakdown.explosive > 0 && (
                        <div className="bg-orange-500" style={{ width: `${(briefing.sentimentBreakdown.explosive / total) * 100}%` }} />
                      )}
                    </div>
                    <div className="flex gap-3 text-[9px] text-muted-foreground font-mono">
                      <span>✨正面 {briefing.sentimentBreakdown.positive}</span>
                      <span>😐中立 {briefing.sentimentBreakdown.neutral}</span>
                      <span>😤負面 {briefing.sentimentBreakdown.negative}</span>
                      <span>💥爆炸 {briefing.sentimentBreakdown.explosive}</span>
                    </div>
                  </div>
                )}

                {/* Category sections */}
                <div className="space-y-1">
                  {briefing.categories.map((cat) => (
                    <div key={cat.category} className="border border-border/50 rounded-md overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === cat.category ? null : cat.category)}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{cat.category}</span>
                          <span className="text-[10px] text-muted-foreground">{cat.categoryMood}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{cat.topStories.length} 條</span>
                      </button>

                      <AnimatePresence>
                        {expandedCategory === cat.category && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-2 space-y-2">
                              {cat.topStories.map((story, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{i + 1}.</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-xs font-medium text-foreground line-clamp-1">{story.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <SentimentBadge sentiment={story.sentiment} />
                                      <span className="text-[9px] font-mono text-muted-foreground">🔥{story.heat}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Hot take footer */}
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground italic">「{briefing.hotTake}」</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
