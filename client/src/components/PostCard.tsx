import { motion } from "framer-motion";
import { MessageSquare, Flame, ExternalLink } from "lucide-react";
import type { Post } from "@shared/schema";
import { ReactionBar } from "./ReactionBar";
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

interface PostCardProps {
  post: Post;
  index: number;
}

export function PostCard({ post, index }: PostCardProps) {
  const badgeClass = CATEGORY_BADGE[post.category] || "border-muted-foreground/30 text-muted-foreground bg-muted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/post/${post.id}`}>
        <div
          className="post-card block bg-card border border-card-border rounded-lg p-4 cursor-pointer"
          data-testid={`post-card-${post.id}`}
        >
          {/* Top row: category + source + time */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${badgeClass}`}>
              {post.category}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {post.source} · {timeAgo(post.createdAt)}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <Flame className={`w-3 h-3 ${getHeatColor(post.heat)}`} />
              <span className={`text-[11px] font-bold font-mono ${getHeatColor(post.heat)}`}>
                {post.heat}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold leading-snug mb-1.5 line-clamp-2 text-foreground">
            {post.title}
          </h3>

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
