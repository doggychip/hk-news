import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Flame, MessageSquare, ExternalLink, ChevronUp, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "@shared/schema";
import { ReactionBar } from "@/components/ReactionBar";
import { CommentSection } from "@/components/CommentSection";
import { AIDebatePanel } from "@/components/AIDebatePanel";
import { SentimentBadge } from "@/components/SentimentBadge";
import { apiRequest } from "@/lib/queryClient";

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

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const postId = parseInt(id || "0");
  const [showScroll, setShowScroll] = useState(false);

  const { data: post, isLoading, error } = useQuery<Post>({
    queryKey: ["/api/posts", postId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/posts/${postId}`);
      return res.json();
    },
    enabled: postId > 0,
  });

  // Track scroll for back-to-top button
  useState(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (isLoading) {
    return (
      <div className="bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="skeleton-shimmer h-4 w-16 rounded mb-4" />
          <div className="skeleton-shimmer h-5 w-24 rounded mb-3" />
          <div className="skeleton-shimmer h-8 w-full rounded mb-2" />
          <div className="skeleton-shimmer h-8 w-3/4 rounded mb-4" />
          <div className="skeleton-shimmer h-3 w-40 rounded mb-6" />
          <div className="skeleton-shimmer h-28 rounded mb-4" />
          <div className="skeleton-shimmer h-20 rounded mb-4" />
          <div className="skeleton-shimmer h-48 rounded mb-4" />
          <div className="skeleton-shimmer h-10 rounded mb-6" />
          <div className="skeleton-shimmer h-6 w-24 rounded mb-3" />
          <div className="skeleton-shimmer h-20 rounded mb-2" />
          <div className="skeleton-shimmer h-20 rounded" />
        </div>
      </div>
    );
  }

  if (!post || error) {
    return (
      <div className="bg-background flex items-center justify-center" style={{ minHeight: "50vh" }}>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground mb-2">搵唔到呢個帖</p>
          <Link href="/">
            <span className="text-primary text-sm hover:underline cursor-pointer">返回主頁</span>
          </Link>
        </div>
      </div>
    );
  }

  const badgeClass = CATEGORY_BADGE[post.category] || "border-muted-foreground/30 text-muted-foreground bg-muted";

  return (
    <div className="bg-background pb-8">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Sticky back button */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md -mx-4 px-4 py-2 mb-2 border-b border-border/50">
          <Link href="/">
            <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors" data-testid="back-button">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">返���</span>
            </button>
          </Link>
        </div>

        {/* Post header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${badgeClass}`}>
              {post.category}
            </span>
            {post.sentiment && <SentimentBadge sentiment={post.sentiment} />}
            <span className="text-[10px] text-muted-foreground font-mono">
              {post.source} · {timeAgo(post.createdAt)}
            </span>
          </div>

          <h1 className="text-xl font-black leading-tight text-foreground mb-3" data-testid="post-title">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${getHeatColor(post.heat)}`} />
              <span className={`font-bold font-mono ${getHeatColor(post.heat)}`}>熱度 {post.heat}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="font-mono">{post.commentCount} 留言</span>
            </div>
          </div>
        </div>

        {/* Summary box */}
        <div className="mb-4 p-4 rounded-lg border-2 border-primary/30 bg-primary/5" data-testid="post-summary">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">📋</span>
            <span className="text-xs font-bold text-primary">30秒懶人包</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">{post.summary}</p>
        </div>

        {/* AI Hot Take */}
        {post.aiHotTake && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
            <Bot className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-primary block mb-0.5">🤖 AI 毒舌評論</span>
              <p className="text-sm text-primary/80 font-medium leading-snug">{post.aiHotTake}</p>
            </div>
          </div>
        )}

        {/* AI Debate */}
        {post.aiDebate && (
          <div className="mb-4">
            <AIDebatePanel debate={post.aiDebate} />
          </div>
        )}

        {/* Full content */}
        <div className="mb-4" data-testid="post-content">
          <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Source link */}
        {post.sourceUrl && (
          <div className="mb-4">
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              data-testid="source-link"
            >
              <ExternalLink className="w-3 h-3" />
              查看原文
            </a>
          </div>
        )}

        {/* Reaction bar (large) */}
        <div className="mb-6 py-3 border-y border-border">
          <ReactionBar postId={post.id} reactions={post.reactions} size="lg" />
        </div>

        {/* Comments */}
        <CommentSection postId={post.id} />
      </div>

      {/* Floating scroll-to-top */}
      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/90 transition-colors"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
