import { useState } from "react";
import { motion } from "framer-motion";
import type { Reactions, ReactionType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const REACTION_CONFIG: { type: ReactionType; emoji: string; label: string; color: string }[] = [
  { type: "fire", emoji: "🔥", label: "正", color: "text-orange-500" },
  { type: "cringe", emoji: "🥴", label: "膠", color: "text-yellow-400" },
  { type: "rofl", emoji: "🤣", label: "SLDPK", color: "text-pink-500" },
  { type: "dead", emoji: "💀", label: "RIP", color: "text-purple-400" },
  { type: "chill", emoji: "😎", label: "Chill", color: "text-cyan-400" },
  { type: "rage", emoji: "🤬", label: "屌", color: "text-red-500" },
];

interface ReactionBarProps {
  postId: number;
  reactions: Reactions;
  size?: "sm" | "lg";
}

export function ReactionBar({ postId, reactions, size = "sm" }: ReactionBarProps) {
  const [animating, setAnimating] = useState<string | null>(null);

  const handleReact = async (type: ReactionType, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAnimating(type);
    try {
      await apiRequest("POST", `/api/posts/${postId}/react`, { type });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/trending"] });
    } catch (err) {
      // silently fail
    }
    setTimeout(() => setAnimating(null), 400);
  };

  const isLarge = size === "lg";

  return (
    <div className={`flex items-center flex-wrap ${isLarge ? "gap-2" : "gap-1.5"}`} data-testid="reaction-bar">
      {REACTION_CONFIG.map(({ type, emoji, label, color }) => {
        const count = reactions[type];
        const isActive = animating === type;
        return (
          <motion.button
            key={type}
            onClick={(e) => handleReact(type, e)}
            whileTap={{ scale: 1.3 }}
            whileHover={{ scale: 1.15 }}
            className={`group relative flex items-center gap-0.5 ${isLarge ? "px-3 py-1.5" : "px-1.5 py-0.5"} rounded-full bg-muted/50 hover:bg-muted transition-colors`}
            data-testid={`reaction-${type}`}
          >
            <motion.span
              className={`${isLarge ? "text-base" : "text-xs"} ${isActive ? "reaction-shake" : ""}`}
              animate={isActive ? { scale: [1, 1.5, 1] } : {}}
              transition={{ duration: 0.4 }}
            >
              {emoji}
            </motion.span>
            <span className={`${color} font-mono ${isLarge ? "text-sm" : "text-[10px]"} font-medium`}>
              {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
            </span>
            {/* Hover label */}
            <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-foreground text-background text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
