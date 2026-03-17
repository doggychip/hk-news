import { useState } from "react";
import { motion } from "framer-motion";
import type { Reactions, ReactionType } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

const REACTION_CONFIG: { type: ReactionType; emoji: string; color: string }[] = [
  { type: "fire", emoji: "🔥", color: "text-orange-500" },
  { type: "shocked", emoji: "😱", color: "text-cyan-400" },
  { type: "laughing", emoji: "🤣", color: "text-yellow-400" },
  { type: "skull", emoji: "💀", color: "text-purple-400" },
  { type: "heart", emoji: "❤️", color: "text-red-500" },
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
    setTimeout(() => setAnimating(null), 300);
  };

  const isLarge = size === "lg";

  return (
    <div className={`flex items-center flex-wrap ${isLarge ? "gap-2" : "gap-1.5"}`} data-testid="reaction-bar">
      {REACTION_CONFIG.map(({ type, emoji, color }) => {
        const count = reactions[type];
        return (
          <motion.button
            key={type}
            onClick={(e) => handleReact(type, e)}
            whileTap={{ scale: 1.2 }}
            className={`flex items-center gap-0.5 ${isLarge ? "px-3 py-1.5" : "px-1.5 py-0.5"} rounded-full bg-muted/50 hover:bg-muted transition-colors`}
            data-testid={`reaction-${type}`}
          >
            <motion.span
              className={isLarge ? "text-base" : "text-xs"}
              animate={animating === type ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {emoji}
            </motion.span>
            <span className={`${color} font-mono ${isLarge ? "text-sm" : "text-[10px]"} font-medium`}>
              {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
