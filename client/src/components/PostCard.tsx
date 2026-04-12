import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Flame, Bot, Sparkles } from "lucide-react";
import type { Post, Reactions } from "@shared/schema";
import { ReactionBar } from "./ReactionBar";
import { SentimentBadge } from "./SentimentBadge";
import { TrendIndicator } from "./TrendIndicator";
import { Link } from "wouter";

const CATEGORY_BADGE: Record<string, string> = {
  "熱門": "border-orange-500/50 text-orange-500 bg-orange-500/10",
  "吹水": "border-pink-500/50 text-pink-500 bg-pink-500/10",
  "娛樂": "border-purple-500/50 text-purple-500 bg-purple-500/10",
  "時事": "border-red-500/50 text-red-500 bg-red-500/10",
  "返工": "border-blue-500/50 text-blue-500 bg-blue-500/10",
  "感情": "border-rose-500/50 text-rose-500 bg-rose-500/10",
  "飲食": "border-amber-500/50 text-amber-500 bg-amber-500/10",
  "科技": "border-cyan-500/50 text-cyan-500 bg-cyan-500/10",
};

function getHeatColor(heat: number): string {
  if (heat >= 90) return "text-red-500";
  if (heat >= 75) return "text-orange-500";
  if (heat >= 60) return "text-amber-500";
  return "text-muted-foreground";
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffMs = now - past;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "剛剛";
  if (diffMin < 60) return `${diffMin}分鐘前`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}小時前`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}日前`;
}

/** Compute meme flair based on reaction ratios */
function getMemeFlair(reactions: Reactions): { emoji: string; label: string; color: string } | null {
  const total = reactions.fire + reactions.cringe + reactions.rofl + reactions.dead + reactions.chill + reactions.rage;
  if (total < 20) return null;

  const ratios = {
    fire: reactions.fire / total,
    cringe: reactions.cringe / total,
    rofl: reactions.rofl / total,
    dead: reactions.dead / total,
    chill: reactions.chill / total,
    rage: reactions.rage / total,
  };

  if (ratios.rofl > 0.4) return { emoji: "😂", label: "SLDPK", color: "text-pink-500" };
  if (ratios.dead > 0.4) return { emoji: "⚰️", label: "RIP", color: "text-purple-400" };
  if (ratios.cringe > 0.35) return { emoji: "💩", label: "低質", color: "text-yellow-400" };
  if (ratios.fire > 0.4) return { emoji: "🔥", label: "爆Post", color: "text-orange-500" };
  if (ratios.chill > 0.4) return { emoji: "🐶", label: "Chill", color: "text-cyan-400" };
  if (ratios.rage > 0.3) return { emoji: "🤬", label: "屌", color: "text-red-500" };
  if (total > 200) return { emoji: "👀", label: "食花生", color: "text-amber-400" };
  if (ratios.fire > 0.25 && total > 100) return { emoji: "🧠", label: "高質", color: "text-emerald-400" };
  return null;
}

/** Check if post is a "shitpost" (high rofl+dead) */
function isShitpost(reactions: Reactions): boolean {
  const total = reactions.fire + reactions.cringe + reactions.rofl + reactions.dead + reactions.chill + reactions.rage;
  if (total < 30) return false;
  return (reactions.rofl + reactions.dead) / total > 0.5;
}

interface PostCardProps {
  post: Post;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const [showClickbait, setShowClickbait] = useState(false);
  const badgeClass = CATEGORY_BADGE[post.category] || "border-muted-foreground/30 text-muted-foreground bg-muted";
  const flair = getMemeFlair(post.reactions);
  const shitpost = isShitpost(post.reactions);
  const isHot = post.heat > 90;

  const cardClasses = [
    "post-card block bg-card border border-card-border rounded-lg p-4 cursor-pointer",
    shitpost ? "chaos-border" : "",
    isHot ? "fire-aura" : "",
  ].filter(Boolean).join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/post/${post.id}`}>
        <div className={cardClasses} data-testid={`post-card-${post.id}`}>
          {/* Top row: category + flair + source + time */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${badgeClass}`}>
              {post.category}
            </span>
            {post.sentiment && <SentimentBadge sentiment={post.sentiment} />}
            {flair && (
              <span className={`meme-flair inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${flair.color} bg-current/10`} data-testid="meme-flair">
                <span>{flair.emoji}</span>
                <span>{flair.label}</span>
              </span>
            )}
            <span className="text-[10px] text-muted-foreground font-mono">
              {post.source} · {timeAgo(post.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              {post.trendDirection && <TrendIndicator direction={post.trendDirection} score={post.trendScore} />}
              <Flame className={`w-3 h-3 ${getHeatColor(post.heat)}`} />
              <span className={`text-[11px] font-bold font-mono ${getHeatColor(post.heat)}`}>
                {post.heat}
              </span>
            </div>
          </div>

          {/* Title — with clickbait toggle */}
          <div className="flex items-start gap-1.5 mb-1.5">
            <h3 className="text-sm font-bold leading-snug line-clamp-2 text-foreground flex-1">
              {showClickbait && post.aiClickbait ? post.aiClickbait : post.title}
            </h3>
            {post.aiClickbait && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowClickbait(!showClickbait); }}
                className={`flex-shrink-0 mt-0.5 p-1 rounded transition-all ${
                  showClickbait ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                }`}
                title={showClickbait ? "睇返原標題" : "🤖 AI改標題"}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* AI Hot Take */}
          {post.aiHotTake && (
            <div className="flex items-start gap-1.5 mb-2 px-2 py-1.5 rounded bg-primary/5 border border-primary/10">
              <Bot className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-primary/80 font-medium leading-snug line-clamp-2">
                {post.aiHotTake}
              </p>
            </div>
          )}

          {/* Summary */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {post.summary}
          </p>

          {/* Bottom row: comments + reactions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              <span className="text-[10px] font-mono">{post.commentCount}</span>
            </div>
            <ReactionBar postId={post.id} reactions={post.reactions} size="sm" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
