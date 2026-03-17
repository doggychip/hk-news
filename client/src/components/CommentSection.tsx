import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, Send } from "lucide-react";
import type { Comment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  const [newComment, setNewComment] = useState("");

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

  return (
    <div data-testid="comment-section">
      <h3 className="text-base font-bold mb-4 flex items-center gap-2">
        <span>💬</span>
        <span>吹水區</span>
        <span className="text-xs font-mono text-muted-foreground">({comments.length})</span>
      </h3>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="講啲嘢啦..."
            maxLength={500}
            rows={2}
            className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
            data-testid="comment-input"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || addComment.isPending}
            className="self-end px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center gap-1"
            data-testid="comment-submit"
          >
            <Send className="w-3 h-3" />
            匿名發表
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
                    {comment.nickname}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed mb-2">
                  {comment.content}
                </p>
                <button
                  className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  data-testid={`comment-like-${comment.id}`}
                >
                  <ThumbsUp className="w-3 h-3" />
                  <span className="text-[10px] font-mono">{comment.likes}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
