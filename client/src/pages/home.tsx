import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post, Mood } from "@shared/schema";
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
import { MemeOfTheDay } from "@/components/MemeOfTheDay";
import { DailyBriefingCard } from "@/components/DailyBriefing";
import { MoodFilter } from "@/components/MoodFilter";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

const IRONIC_LOADING = [
  "連登仔正在加載中...",
  "巴打請等等，膠都要時間黐...",
  "Loading緊，唔好急，急你就輸咗",
  "幫緊你幫緊你...",
  "正在搵緊啲膠嘢...",
  "SLDPK Loading...",
];

const EASTER_EGGS = [
  "「我覺得我哋可以理性討論」",
  "「呢個社會已經冇得救」",
  "RIP 全香港打工仔",
  "「老細：你肯捱就有前途」",
  "「業主：已減價，得$1200萬」",
  "「港鐵：列車服務受阻」",
  "「最慘嗰個永遠係自己」",
  "「仲以為努力就會有回報？」",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HomePage() {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [showScroll, setShowScroll] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const easterEggTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollCount = useRef(0);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", category, search, mood],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (mood) params.set("mood", mood);
      const url = `/api/posts${params.toString() ? `?${params}` : ""}`;
      const res = await apiRequest("GET", url);
      return res.json();
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);

      // Easter egg: show random meme phrase after every ~15 scroll events
      scrollCount.current++;
      if (scrollCount.current % 15 === 0 && !easterEgg) {
        setEasterEgg(getRandomItem(EASTER_EGGS));
        if (easterEggTimer.current) clearTimeout(easterEggTimer.current);
        easterEggTimer.current = setTimeout(() => setEasterEgg(null), 2500);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (easterEggTimer.current) clearTimeout(easterEggTimer.current);
    };
  }, [easterEgg]);

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

  const loadingMsg = getRandomItem(IRONIC_LOADING);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={28} className="text-primary neon-text-pink" />
            <div>
              <h1 className="text-base font-black leading-none text-foreground glitch-text">吹水台</h1>
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

      {/* AI Daily Briefing */}
      <DailyBriefingCard />

      {/* AI Mood Filter */}
      <MoodFilter selected={mood} onSelect={setMood} />

      {/* Meme of the Day */}
      <MemeOfTheDay />

      {/* Category Tabs */}
      <div className="sticky top-[53px] z-40 bg-background/95 backdrop-blur-md border-b border-border transition-shadow" style={{ WebkitBackfaceVisibility: "hidden" }}>
        <div className="max-w-2xl mx-auto px-3">
          <CategoryTabs selected={category} onSelect={setCategory} />
        </div>
      </div>

      {/* Feed */}
      <main className="max-w-2xl mx-auto px-3 py-4">
        {isLoading ? (
          <div className="space-y-3">
            <p className="text-center text-muted-foreground text-xs font-mono py-2 animate-pulse">
              {loadingMsg}
            </p>
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
          <>
            <div className="space-y-3">
              {posts.slice(0, visibleCount).map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {/* Load more / end indicator */}
            {posts.length > visibleCount ? (
              <div className="py-6 text-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 20)}
                  className="px-6 py-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-full border border-border transition-colors"
                >
                  載入更多 ({posts.length - visibleCount} 篇)
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground/50 text-xs font-mono">— 到底啦 巴打 —</p>
              </div>
            )}
          </>
        )}

        {/* Attribution */}
        <div className="pb-4">
          <PerplexityAttribution />
        </div>
      </main>

      {/* Easter egg floating message */}
      <AnimatePresence>
        {easterEgg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.9, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-card/90 border border-primary/30 rounded-lg text-xs font-bold text-primary neon-text-pink pointer-events-none"
          >
            {easterEgg}
          </motion.div>
        )}
      </AnimatePresence>

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
