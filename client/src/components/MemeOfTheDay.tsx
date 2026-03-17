import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const MEME_ENTRIES = [
  { phrase: "來都來了", subtitle: "既然嚟咗，就留低啦", style: "neon" as const },
  { phrase: "感建分", subtitle: "感覺被建議同分享攻擊", style: "glitch" as const },
  { phrase: "67 67 67", subtitle: "呢個世界就係咁荒謬", style: "rainbow" as const },
  { phrase: "張中和", subtitle: "我覺得我哋可以理性討論", style: "formal" as const },
  { phrase: "SLDPK", subtitle: "笑到屁股開花", style: "neon" as const },
  { phrase: "影到我\nplz del", subtitle: "隱私好重要㗎", style: "glitch" as const },
  { phrase: "認真你就輸了", subtitle: "呢度冇嘢係認真㗎", style: "rainbow" as const },
  { phrase: "訓啦毛", subtitle: "都幾點啦仲上網", style: "formal" as const },
  { phrase: "巴打萬歲", subtitle: "連登精神永存", style: "neon" as const },
  { phrase: "我大我惡我咬人", subtitle: "弱肉強食嘅世界", style: "glitch" as const },
];

function getDailyMeme() {
  const dayIndex = Math.floor(Date.now() / 86400000) % MEME_ENTRIES.length;
  return MEME_ENTRIES[dayIndex];
}

export function MemeOfTheDay() {
  const [dismissed, setDismissed] = useState(false);
  const meme = getDailyMeme();

  if (dismissed) return null;

  const phraseStyle = {
    neon: "text-pink-500 neon-text-pink",
    glitch: "glitch-text text-cyan-400",
    rainbow: "sticker-rainbow",
    formal: "text-amber-400 font-serif italic",
  }[meme.style];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="max-w-2xl mx-auto px-3 pt-3"
        data-testid="meme-of-the-day"
      >
        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-card p-4">
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="meme-dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-primary font-mono">🎭 今日迷因</span>
            <span className="text-[9px] text-muted-foreground font-mono">MEME OF THE DAY</span>
          </div>

          <p className={`text-2xl font-black leading-tight mb-1 whitespace-pre-line ${phraseStyle}`}>
            {meme.phrase}
          </p>
          <p className="text-xs text-muted-foreground">{meme.subtitle}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
