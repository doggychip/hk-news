import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import type { Comment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { StickerPicker, renderStickers } from "./StickerPicker";

const COMMENT_REACTIONS = [
  { emoji: "👍", label: "推" },
  { emoji: "👎", label: "沉" },
  { emoji: "😂", label: "笑死" },
  { emoji: "💀", label: "RIP" },
  { emoji: "🍿", label: "食花生" },
];

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

interface CommentSectionProps {
  postId: number;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  // Track local comment reaction counts (in-memory only)
  const [commentReactions, setCommentReactions] = useState<Record<number, Record<string, number>>>({});

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/posts/${postId}/comments`);
      return res.json();
    },
  });

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setNewComment("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment.mutate(newComment.trim());
    }
  };

  const handleStickerSelect = (tag: string) => {
    setNewComment((prev) => prev + tag);
  };

  const handleCommentReaction = (commentId: number, emoji: string) => {
    setCommentReactions((prev) => ({
      ...prev,
      [commentId]: {
        ...prev[commentId],
        [emoji]: (prev[commentId]?.[emoji] || 0) + 1,
      },
    }));
  };

  return (
    <div data-testid="comment-section">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
        <span>💬</span>
        <span>吹水區</span>
        <span className="text-xs font-mono text-muted-foreground">({comments.length})</span>
      </h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="mb-6">
        {user && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm">{user.avatar}</span>
            <span className="text-xs font-bold text-primary">{user.displayName}</span>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 flex flex-col gap-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="講啲嘢啦..."
              maxLength={500}
              rows={2}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
              data-testid="comment-input"
            />
            <div className="flex items-center justify-between">
              <StickerPicker onSelect={handleStickerSelect} />
              <span className="text-[10px] text-muted-foreground font-mono">{newComment.length}/500</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || addComment.isPending}
            className="self-end px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center gap-1"
            data-testid="comment-submit"
          >
            <Send className="w-3 h-3" />
            {user ? "發表" : "匿名發表"}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-16 rounded-lg" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          暫時冇留言，做第一個吹水嘅人啦！
        </p>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-muted/30 border border-border/50 rounded-lg p-3"
                data-testid={`comment-${comment.id}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-primary font-mono">
                    {comment.displayName || comment.nickname}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed mb-2">
                  {renderStickers(comment.content)}
                </div>
                {/* Comment sticker reactions */}
                <div className="flex items-center gap-1 flex-wrap">
                  {COMMENT_REACTIONS.map((r) => {
                    const count = commentReactions[comment.id]?.[r.emoji] || 0;
                    return (
                      <button
                        key={r.emoji}
                        type="button"
                        onClick={() => handleCommentReaction(comment.id, r.emoji)}
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border transition-colors ${
                          count > 0
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary"
                        }`}
                        data-testid={`comment-reaction-${comment.id}-${r.label}`}
                      >
                        <span>{r.emoji}</span>
                        <span className="font-mono">{r.label}</span>
                        {count > 0 && <span className="font-mono font-bold ml-0.5">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
