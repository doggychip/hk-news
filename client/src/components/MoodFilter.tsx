import { motion } from "framer-motion";
import type { Mood } from "@shared/schema";

const MOOD_OPTIONS: { mood: Mood; emoji: string; label: string }[] = [
  { mood: "laugh", emoji: "😂", label: "想笑" },
  { mood: "angry", emoji: "🤬", label: "想嬲" },
  { mood: "popcorn", emoji: "🍿", label: "食花生" },
  { mood: "chill", emoji: "😎", label: "想Chill" },
  { mood: "cry", emoji: "😭", label: "想喊" },
];

interface MoodFilterProps {
  selected: Mood | null;
  onSelect: (mood: Mood | null) => void;
}

export function MoodFilter({ selected, onSelect }: MoodFilterProps) {
  return (
    <div className="max-w-2xl mx-auto px-3 pt-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap flex-shrink-0">
          🤖 AI心情
        </span>
        {MOOD_OPTIONS.map(({ mood, emoji, label }) => {
          const isActive = selected === mood;
          return (
            <motion.button
              key={mood}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(isActive ? null : mood)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-primary/20 border-primary/50 text-primary neon-text-pink"
                  : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
