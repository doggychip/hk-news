import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post } from "@shared/schema";
import { Logo } from "@/components/Logo";
import { CategoryTabs } from "@/components/CategoryTabs";
import { PostCard } from "@/components/PostCard";
import { HotTicker } from "@/components/HotTicker";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { CreatePostModal } from "@/components/CreatePostModal";
import { AuthModal } from "@/components/AuthModal";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export default function HomePage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", category, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      const url = `/api/posts${params.toString() ? `?${params}` : ""}`;
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCreatePost = () => {
    if (user) {
      setShowCreatePost(true);
    } else {
      setShowAuth(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={28} className="text-primary neon-text-pink" />
            <div>
              <h1 className="text-base font-black leading-none text-foreground">吹水台</h1>
              <p className="text-[9px] text-muted-foreground font-mono tracking-wider">CHEUISUI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <SearchBar onSearch={setSearch} />
            <ThemeToggle />
            <UserMenu onCreatePost={handleCreatePost} />
          </div>
        </div>
      </header>

      {/* Hot Ticker */}
      <HotTicker />

      {/* Category Tabs */}
      <div className="sticky top-[57px] z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-3">
          <CategoryTabs selected={category} onSelect={setCategory} />
        </div>
      </div>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-3 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer h-32 rounded-lg" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">搵唔到相關內容 🤷</p>
            <p className="text-muted-foreground/60 text-xs mt-1">試下換個分類或者搜尋字</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}

        {/* Attribution */}
        <div className="mt-8 pb-4">
          <PerplexityAttribution />
        </div>
      </main>

      {/* Floating create post button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreatePost}
        className="fixed bottom-20 right-6 z-50 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg neon-glow-pink"
        data-testid="create-post-fab"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-secondary/90 transition-colors"
            data-testid="scroll-to-top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreatePostModal open={showCreatePost} onClose={() => setShowCreatePost(false)} />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
