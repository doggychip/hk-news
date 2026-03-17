import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, Star, MessageSquare, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { User, Post, Comment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id || "0");
  const [tab, setTab] = useState<"posts" | "comments">("posts");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${userId}`);
      return res.json();
    },
    enabled: userId > 0,
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["/api/users", userId, "posts"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${userId}/posts`);
      return res.json();
    },
    enabled: userId > 0 && tab === "posts",
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/users", userId, "comments"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/users/${userId}/comments`);
      return res.json();
    },
    enabled: userId > 0 && tab === "comments",
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="skeleton-shimmer h-8 w-20 rounded mb-6" />
          <div className="skeleton-shimmer h-24 rounded-lg mb-4" />
          <div className="skeleton-shimmer h-40 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground mb-2">搵唔到呢個用戶 😅</p>
          <Link href="/">
            <span className="text-primary text-sm hover:underline cursor-pointer">返回主頁</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto px-4 py-4"
      >
        {/* Back */}
        <Link href="/">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-4" data-testid="back-button">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </button>
        </Link>

        {/* Profile card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-3xl" data-testid="profile-avatar">
              {user.avatar}
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground" data-testid="profile-name">
                {user.displayName}
              </h1>
              <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(user.joinedAt)} 加入</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold font-mono text-amber-500">{user.karmaPoints}</span>
              <span>karma</span>
            </div>
          </div>

          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{user.postCount}</strong> 帖子</span>
            <span><strong className="text-foreground">{user.commentCount}</strong> 留言</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-4">
          <button
            onClick={() => setTab("posts")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === "posts" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
            data-testid="tab-posts"
          >
            <FileText className="w-4 h-4" />
            帖子
          </button>
          <button
            onClick={() => setTab("comments")}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors ${
              tab === "comments" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
            data-testid="tab-comments"
          >
            <MessageSquare className="w-4 h-4" />
            留言
          </button>
        </div>

        {/* Content */}
        {tab === "posts" ? (
          posts.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">暫時冇帖子</p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/post/${post.id}`}>
                  <div className="post-card bg-card border border-border rounded-lg p-3 cursor-pointer" data-testid={`profile-post-${post.id}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-primary font-mono">{post.category}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(post.createdAt)}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          comments.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">暫時冇留言</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card border border-border rounded-lg p-3" data-testid={`profile-comment-${comment.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground font-mono">帖子 #{comment.postId}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{comment.content}</p>
                </div>
              ))}
            </div>
          )
        )}

        <div className="mt-8 pb-4">
          <PerplexityAttribution />
        </div>
      </motion.div>
    </div>
  );
}
