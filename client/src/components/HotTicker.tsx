import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Flame } from "lucide-react";

const MEME_INJECTIONS = [
  "RIP 巴打",
  "SLDPK到震",
  "呢個世界已經癲咗",
  "港鐵：不便之處 敬請原諒",
  "老細：呢個係團隊精神",
  "業主：已減價 得$900萬",
  "食花生食到飽",
  "社會已死",
  "膠到無朋友",
  "又一日做牛做馬",
  "躺平先係出路",
  "全部都係垃圾",
];

function getRandomMemes(count: number): string[] {
  const shuffled = [...MEME_INJECTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function HotTicker() {
  const { data: trending } = useQuery<Post[]>({
    queryKey: ["/api/trending"],
    refetchInterval: 60000,
  });

  const items = trending?.slice(0, 5) || [];
  if (items.length === 0) return null;

  // Check if any item is "breaking" (heat > 95)
  const hasBreaking = items.some((p) => p.heat > 95);

  // Inject 2 random meme phrases among the real items
  const memes = getRandomMemes(2);

  // Build ticker items: interleave posts with meme injections
  const tickerItems: { type: "post"; post: Post; rank: number }[] | { type: "meme"; text: string }[] = [];
  const mixed: ({ type: "post"; post: Post; rank: number } | { type: "meme"; text: string })[] = [];

  items.forEach((post, i) => {
    mixed.push({ type: "post", post, rank: i + 1 });
    // Inject a meme after the 2nd and 4th items
    if (i === 1 && memes[0]) mixed.push({ type: "meme", text: memes[0] });
    if (i === 3 && memes[1]) mixed.push({ type: "meme", text: memes[1] });
  });

  // Duplicate for seamless loop
  const allItems = [...mixed, ...mixed];

  return (
    <div
      className="relative overflow-hidden bg-muted/30 border-y border-border"
      data-testid="hot-ticker"
    >
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-primary/10 border-r border-border z-10">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-primary whitespace-nowrap">
            {hasBreaking ? "🚨 爆Breaking" : "即時熱話"}
          </span>
        </div>
        {/* Scrolling content */}
        <div className="overflow-hidden flex-1">
          <div className={`ticker-animate flex items-center whitespace-nowrap ${hasBreaking ? "ticker-fast" : ""}`}>
            {allItems.map((item, i) => (
              <span key={`ticker-${i}`} className="inline-flex items-center gap-2 px-4 py-2">
                {item.type === "post" ? (
                  <>
                    <span className="text-xs font-mono text-orange-500/80">#{item.rank}</span>
                    <span className="text-xs font-medium text-foreground/90 max-w-[200px] truncate">
                      {item.post.title}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">🔥{item.post.heat}</span>
                  </>
                ) : (
                  <span className="text-[10px] font-bold text-pink-500 neon-text-pink opacity-70">
                    {item.text}
                  </span>
                )}
                <span className="text-muted-foreground/30 mx-1">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
