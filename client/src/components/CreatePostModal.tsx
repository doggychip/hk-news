import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";

const CATEGORIES = ["吹水", "娛樂", "時事", "返工", "感情", "飲食", "科技"] as const;

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("吹水");

  const createPost = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/posts", { title, content, category });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trending"] });
      setTitle("");
      setContent("");
      setCategory("吹水");
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      createPost.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground text-center text-lg font-black">
            發表新帖
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">分類</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  data-testid={`category-select-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">標題</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="輸入標題..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              required
              maxLength={100}
              data-testid="post-title-input"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block text-right">{title.length}/100</span>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground mb-1 block">內容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="講啲嘢啦..."
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/50"
              rows={6}
              required
              maxLength={5000}
              data-testid="post-content-input"
            />
            <span className="text-[10px] text-muted-foreground mt-0.5 block text-right">{content.length}/5000</span>
          </div>

          {createPost.isError && (
            <p className="text-xs text-red-500 font-bold">發帖失敗，請再試一次</p>
          )}

          <button
            type="submit"
            disabled={!title.trim() || !content.trim() || createPost.isPending}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors"
            data-testid="create-post-submit"
          >
            {createPost.isPending ? "發帖中..." : "發帖 🚀"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
