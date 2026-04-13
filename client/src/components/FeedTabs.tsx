import { motion } from "framer-motion";
import { Flame, Clock, Shuffle } from "lucide-react";

export type FeedMode = "hot" | "fresh" | "random";

const TABS: { mode: FeedMode; icon: typeof Flame; label: string; emoji: string }[] = [
  { mode: "hot", icon: Flame, label: "熱門", emoji: "🔥" },
  { mode: "fresh", icon: Clock, label: "最新", emoji: "🆕" },
  { mode: "random", icon: Shuffle, label: "隨機", emoji: "🔀" },
];

interface FeedTabsProps {
  selected: FeedMode;
  onSelect: (mode: FeedMode) => void;
}

export function FeedTabs({ selected, onSelect }: FeedTabsProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-2">
      {TABS.map(({ mode, label, emoji }) => {
        const isActive = selected === mode;
        return (
          <motion.button
            key={mode}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(mode)}
            className={`relative flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span>{emoji}</span>
            <span>{label}</span>
            {isActive && (
              <motion.div
                layoutId="feed-tab-indicator"
                className="absolute inset-0 bg-primary rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
