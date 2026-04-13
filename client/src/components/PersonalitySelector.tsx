import { motion } from "framer-motion";
import type { Personality } from "@shared/schema";

const PERSONALITIES: { mode: Personality; emoji: string; label: string }[] = [
  { mode: "savage", emoji: "🗡️", label: "毒舌" },
  { mode: "professor", emoji: "🧠", label: "教授" },
  { mode: "mama", emoji: "👵", label: "阿媽" },
  { mode: "conspiracy", emoji: "🕵️", label: "陰謀論" },
  { mode: "genz", emoji: "✌️", label: "00後" },
];

interface PersonalitySelectorProps {
  selected: Personality;
  onSelect: (p: Personality) => void;
}

export function PersonalitySelector({ selected, onSelect }: PersonalitySelectorProps) {
  return (
    <div className="max-w-xl mx-auto px-3 pt-2 pb-1">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap flex-shrink-0">
          🤖 AI人格
        </span>
        {PERSONALITIES.map(({ mode, emoji, label }) => {
          const isActive = selected === mode;
          return (
            <motion.button
              key={mode}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(mode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
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
