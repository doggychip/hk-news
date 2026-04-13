import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, ThumbsDown, Laugh, Share2, Sparkles, Bot } from "lucide-react";
import type { Post } from "@shared/schema";
import { SentimentBadge } from "./SentimentBadge";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORY_COLORS: Record<string, string> = {
  "熱門": "text-orange-400",
  "吹水": "text-pink-400",
  "娛樂": "text-purple-400",
  "時事": "text-red-400",
  "返工": "text-blue-400",
  "感情": "text-rose-400",
  "飲食": "text-amber-400",
  "科技": "text-cyan-400",
};

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

function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface PostCardProps {
  post: Post;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const [showClickbait, setShowClickbait] = useState(false);
  const [votes, setVotes] = useState({ up: 0, down: 0, laughs: 0 });
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const totalReactions = post.reactions.fire + post.reactions.cringe + post.reactions.rofl +
    post.reactions.dead + post.reactions.chill + post.reactions.rage;
  const netScore = (post.reactions.fire + post.reactions.chill) - (post.reactions.cringe + post.reactions.rage) + votes.up - votes.down;

  const handleVote = async (dir: "up" | "down", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (voted === dir) return;
    setVoted(dir);
    setVotes(v => ({ ...v, [dir]: v[dir === "up" ? "up" : "down"] + 1 }));
    try {
      await apiRequest("POST", `/api/posts/${post.id}/react`, { type: dir === "up" ? "fire" : "cringe" });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    } catch {}
  };

  const handleLaugh = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVotes(v => ({ ...v, laughs: v.laughs + 1 }));
    try {
      await apiRequest("POST", `/api/posts/${post.id}/react`, { type: "rofl" });
    } catch {}
  };

  const displayTitle = showClickbait && post.aiClickbait ? post.aiClickbait : post.title;
  const catColor = CATEGORY_COLORS[post.category] || "text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="mb-4"
    >
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        {/* Meme Card Hero */}
        <Link href={`/post/${post.id}`}>
          <div className={`relative bg-gradient-to-br ${post.memeCard?.gradient || "from-gray-700 to-gray-900"} px-5 py-8 min-h-[180px] flex flex-col justify-center cursor-pointer`}>
            {/* Category + sentiment badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className={`text-[10px] font-bold font-mono ${catColor} bg-black/30 px-2 py-0.5 rounded-full`}>
                {post.category}
              </span>
              {post.sentiment && (
                <span className="bg-black/30 rounded-full px-1.5 py-0.5">
                  <SentimentBadge sentiment={post.sentiment} />
                </span>
              )}
            </div>

            {/* Time + source */}
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-mono text-white/50">
                {post.source} · {timeAgo(post.createdAt)}
              </span>
            </div>

            {/* Big emoji */}
            <div className="text-5xl mb-3 opacity-90 drop-shadow-lg">
              {post.memeCard?.emoji || "📰"}
            </div>

            {/* Meme text */}
            <h3 className="text-lg font-black text-white leading-tight drop-shadow-md">
              {post.memeCard?.topText || displayTitle}
            </h3>
            {post.memeCard?.bottomText && (
              <p className="text-base font-bold text-white/90 leading-tight mt-1 drop-shadow-md">
                {post.memeCard.bottomText}
              </p>
            )}
          </div>
        </Link>

        {/* AI Hot Take */}
        <div className="px-4 py-2.5 border-b border-border/50">
          <div className="flex items-start gap-2">
            <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-primary/80 font-medium leading-snug line-clamp-2">
              {post.aiHotTake}
            </p>
            {post.aiClickbait && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowClickbait(!showClickbait); }}
                className={`flex-shrink-0 p-0.5 rounded transition-all ${
                  showClickbait ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                title="🤖 AI改標題"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned top comment */}
        {post.topComment && (
          <div className="px-4 py-2 border-b border-border/50 bg-muted/20">
            <p className="text-[11px] text-muted-foreground leading-snug line-clamp-1">
              💬 {post.topComment}
            </p>
          </div>
        )}

        {/* 9GAG-style action bar */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Upvote / Score / Downvote */}
          <div className="flex items-center gap-0.5">
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={(e) => handleVote("up", e)}
              className={`p-2 rounded-lg transition-colors ${voted === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"}`}
            >
              <ThumbsUp className="w-5 h-5" />
            </motion.button>
            <span className={`text-sm font-bold font-mono min-w-[2.5rem] text-center ${netScore > 0 ? "text-emerald-500" : netScore < 0 ? "text-red-400" : "text-muted-foreground"}`}>
              {formatCount(netScore)}
            </span>
            <motion.button
              whileTap={{ scale: 1.3 }}
              onClick={(e) => handleVote("down", e)}
              className={`p-2 rounded-lg transition-colors ${voted === "down" ? "text-red-400 bg-red-400/10" : "text-muted-foreground hover:text-red-400 hover:bg-red-400/10"}`}
            >
              <ThumbsDown className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Laugh button */}
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={handleLaugh}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-pink-500 hover:bg-pink-500/10 transition-colors"
          >
            <Laugh className="w-5 h-5" />
            <span className="text-xs font-bold font-mono">{formatCount(post.reactions.rofl + votes.laughs)}</span>
          </motion.button>

          {/* Comments */}
          <Link href={`/post/${post.id}`}>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs font-bold font-mono">{post.commentCount}</span>
            </div>
          </Link>

          {/* Share */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (navigator.share) {
                navigator.share({ title: post.title, url: window.location.origin + `/post/${post.id}` });
              }
            }}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
