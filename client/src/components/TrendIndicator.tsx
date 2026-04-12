import type { TrendDirection } from "@shared/schema";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const TREND_CONFIG: Record<TrendDirection, { icon: typeof TrendingUp; className: string; label: string }> = {
  up: { icon: TrendingUp, className: "text-emerald-500", label: "趨勢上升" },
  down: { icon: TrendingDown, className: "text-red-400", label: "趨勢下降" },
  steady: { icon: Minus, className: "text-muted-foreground", label: "趨勢平穩" },
};

export function TrendIndicator({ direction, score }: { direction: TrendDirection; score?: number }) {
  const config = TREND_CONFIG[direction];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-0.5 ${config.className}`} title={config.label}>
      <Icon className="w-3 h-3" />
      {score !== undefined && score > 0 && (
        <span className="text-[9px] font-mono">{score.toFixed(0)}</span>
      )}
    </span>
  );
}
