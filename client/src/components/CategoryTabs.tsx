import { CATEGORIES } from "@shared/schema";
import { useRef, useEffect } from "react";

const CATEGORY_COLORS: Record<string, string> = {
  "熱門": "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400",
  "吹水": "border-pink-600 text-pink-600 dark:border-pink-400 dark:text-pink-400",
  "娛樂": "border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400",
  "時事": "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400",
  "返工": "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400",
  "感情": "border-rose-600 text-rose-600 dark:border-rose-400 dark:text-rose-400",
  "飲食": "border-amber-700 text-amber-700 dark:border-amber-400 dark:text-amber-400",
  "科技": "border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400",
};

const ACTIVE_COLORS: Record<string, string> = {
  "熱門": "bg-orange-500 text-white border-orange-500",
  "吹水": "bg-pink-500 text-white border-pink-500",
  "娛樂": "bg-purple-500 text-white border-purple-500",
  "時事": "bg-red-500 text-white border-red-500",
  "返工": "bg-blue-500 text-white border-blue-500",
  "感情": "bg-rose-500 text-white border-rose-500",
  "飲食": "bg-amber-500 text-white border-amber-500",
  "科技": "bg-cyan-500 text-white border-cyan-500",
};

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll active tab into view
    const active = scrollRef.current?.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selected]);

  const allCategories = ["全部", ...CATEGORIES] as const;

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto hide-scrollbar py-2 px-1"
      data-testid="category-tabs"
    >
      {allCategories.map((cat) => {
        const isActive = selected === cat || (selected === "" && cat === "全部");
        const colorClass = cat === "全部"
          ? isActive
            ? "bg-primary text-primary-foreground border-primary"
            : "border-muted-foreground/30 text-muted-foreground"
          : isActive
            ? ACTIVE_COLORS[cat] || "bg-primary text-primary-foreground border-primary"
            : CATEGORY_COLORS[cat] || "border-muted-foreground/30 text-muted-foreground";

        return (
          <button
            key={cat}
            onClick={() => onSelect(cat === "全部" ? "" : cat)}
            data-active={isActive}
            data-testid={`category-tab-${cat}`}
            className={`category-pill flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border-2 whitespace-nowrap ${colorClass}`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
