import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sticker } from "lucide-react";

const STICKERS = [
  { tag: "[膠]", label: "膠", preview: "🥴" },
  { tag: "[SLDPK]", label: "SLDPK", preview: "🤣" },
  { tag: "[67]", label: "67", preview: "🌈" },
  { tag: "[感建分]", label: "感建分", preview: "📢" },
  { tag: "[來都來了]", label: "來都來了", preview: "🚪" },
  { tag: "[食花生]", label: "食花生", preview: "🍿" },
  { tag: "[Chill]", label: "Chill", preview: "😎" },
  { tag: "[RIP]", label: "RIP", preview: "⚰️" },
  { tag: "[張中和]", label: "張中和", preview: "🧑‍⚖️" },
];

interface StickerPickerProps {
  onSelect: (tag: string) => void;
}

export function StickerPicker({ onSelect }: StickerPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="self-end px-2 py-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
        data-testid="sticker-picker-toggle"
      >
        <Sticker className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute bottom-full right-0 mb-2 p-2 bg-card border border-border rounded-lg shadow-lg z-50 w-56"
            data-testid="sticker-picker-panel"
          >
            <p className="text-[10px] font-bold text-muted-foreground mb-2 px-1">貼圖</p>
            <div className="grid grid-cols-3 gap-1">
              {STICKERS.map((s) => (
                <button
                  key={s.tag}
                  type="button"
                  onClick={() => { onSelect(s.tag); setOpen(false); }}
                  className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-muted/60 transition-colors"
                  data-testid={`sticker-${s.label}`}
                >
                  <span className="text-lg">{s.preview}</span>
                  <span className="text-[9px] font-mono text-muted-foreground truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Parse sticker tags in comment text and render styled inline elements */
export function renderStickers(text: string): React.ReactNode[] {
  const parts = text.split(/(\[[^\]]+\])/g);
  return parts.map((part, i) => {
    switch (part) {
      case "[膠]":
        return <span key={i} className="sticker-tag bg-yellow-400/20 text-yellow-400">膠 🥴</span>;
      case "[SLDPK]":
        return <span key={i} className="sticker-neon-pink font-bold">SLDPK 🤣</span>;
      case "[67]":
        return <span key={i} className="sticker-rainbow font-bold">67</span>;
      case "[感建分]":
        return <span key={i} className="sticker-quote">感建分</span>;
      case "[來都來了]":
        return <span key={i} className="sticker-quote">「來都來了」</span>;
      case "[食花生]":
        return <span key={i} className="popcorn-anim">🍿</span>;
      case "[Chill]":
        return <span key={i} className="text-cyan-400 font-bold">😎 Chill</span>;
      case "[RIP]":
        return <span key={i} className="text-purple-400 font-bold opacity-80">⚰️ RIP</span>;
      case "[張中和]":
        return <span key={i} className="sticker-quote italic">「我覺得我哋可以理性討論」</span>;
      default:
        return <span key={i}>{part}</span>;
    }
  });
}
