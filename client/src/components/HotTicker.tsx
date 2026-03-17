import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Flame } from "lucide-react";

export function HotTicker() {
  const { data: trending } = useQuery<Post[]>({
    queryKey: ["/api/trending"],
    refetchInterval: 60000,
  });

  const items = trending?.slice(0, 5) || [];
  if (items.length === 0) return null;

  // Duplicate for seamless loop
  const allItems = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden bg-muted/30 border-y border-border"
      data-testid="hot-ticker"
    >
      <div className="flex items-center">
        {/* Label */}
        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-primary/10 border-r border-border z-10">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-primary whitespace-nowrap">即時熱話</span>
        </div>
        {/* Scrolling content */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-animate flex items-center whitespace-nowrap">
            {allItems.map((post, i) => (
              <span key={`${post.id}-${i}`} className="inline-flex items-center gap-2 px-4 py-2">
                <span className="text-xs font-mono text-orange-500/80">#{i % items.length + 1}</span>
                <span className="text-xs font-medium text-foreground/90 max-w-[200px] truncate">
                  {post.title}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">🔥{post.heat}</span>
                <span className="text-muted-foreground/30 mx-1">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
