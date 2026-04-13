import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Post, Mood } from "@shared/schema";
import { Logo } from "@/components/Logo";
import { FeedTabs, type FeedMode } from "@/components/FeedTabs";
import { PostCard } from "@/components/PostCard";
import { HotTicker } from "@/components/HotTicker";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { CreatePostModal } from "@/components/CreatePostModal";
import { AuthModal } from "@/components/AuthModal";
import { MoodFilter } from "@/components/MoodFilter";
import { DailyBriefingCard } from "@/components/DailyBriefing";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

const IRONIC_LOADING = [
  "搵緊啲新聞...",
  "AI正在毒舌中...",
  "Loading緊，唔好急",
  "幫緊你幫緊你...",
  "RSS feeds更新中...",
];

const EASTER_EGGS = [
  "「呢個社會已經冇得救」",
  "RIP 全香港打工仔",
  "「老細：你肯捱就有前途」",
  "「港鐵：列車服務受阻」",
  "「仲以為努力就會有回報？」",
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function HomePage() {
  const { user } = useAuth();
  const [feedMode, setFeedMode] = useState<FeedMode>("hot");
  const [mood, setMood] = useState<Mood | null>(null);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [showScroll, setShowScroll] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [easterEgg, setEasterEgg] = useState<string | null>(null);
  const easterEggTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollCount = useRef(0);

  // Reset visible count when changing feed mode or mood
  useEffect(() => { setVisibleCount(10); }, [feedMode, mood, search]);

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", feedMode, mood, search],
    queryFn: async () => {
      // Random mode uses shuffle endpoint
      if (feedMode === "random") {
        const res = await apiRequest("GET", "/api/posts/shuffle");
        return res.json();
      }
      const params = new URLSearchParams();
      if (mood) params.set("mood", mood);
      if (search) params.set("search", search);
      const url = `/api/posts${params.toString() ? `?${params}` : ""}`;
      const res = await apiRequest("GET", url);
      const data: Post[] = await res.json();
      // Sort by mode
      if (feedMode === "fresh") {
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      // "hot" is already sorted by heat from server
      return data;
    },
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 400);
      scrollCount.current++;
      if (scrollCount.current % 20 === 0 && !easterEgg) {
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
    if (user) setShowCreatePost(true);
    else setShowAuth(true);
  };

  const loadingMsg = getRandomItem(IRONIC_LOADING);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo size={28} className="text-primary neon-text-pink" />
            <div>
              <h1 className="text-base font-black leading-none text-foreground glitch-text">吹水台</h1>
              <p className="text-[9px] text-muted-foreground font-mono tracking-wider">CHEUISUI · AI NEWS</p>
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

      {/* AI Briefing */}
      <DailyBriefingCard />

      {/* Mood Filter */}
      <MoodFilter selected={mood} onSelect={setMood} />

      {/* 9GAG-style Feed Tabs: Hot / Fresh / Random */}
      <div className="sticky top-[53px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-xl mx-auto">
          <FeedTabs selected={feedMode} onSelect={setFeedMode} />
        </div>
      </div>

      {/* Feed */}
      <main className="max-w-xl mx-auto px-3 py-4">
        {isLoading ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground text-xs font-mono py-2 animate-pulse">
              {loadingMsg}
            </p>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="skeleton-shimmer h-[200px]" />
                <div className="bg-card p-4 space-y-2">
                  <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                  <div className="skeleton-shimmer h-10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🤷</p>
            <p className="text-muted-foreground text-sm">搵唔到相關內容</p>
            <p className="text-muted-foreground/60 text-xs mt-1">試下換個filter或者等RSS更新</p>
          </div>
        ) : (
          <>
            {posts.slice(0, visibleCount).map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}

            {posts.length > visibleCount ? (
              <div className="py-6 text-center">
                <button
                  onClick={() => setVisibleCount((c) => c + 10)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                  載入更多 ({posts.length - visibleCount})
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground/40 text-xs font-mono">— 到底啦 巴打 —</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Easter egg */}
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

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleCreatePost}
        className="fixed bottom-20 right-6 z-50 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg"
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
