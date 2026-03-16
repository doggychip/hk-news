import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/components/ThemeProvider";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Sun,
  Moon,
  Newspaper,
  TrendingUp,
  Globe,
  Dumbbell,
  Cpu,
  Bitcoin,
  MessageCircle,
  Clock,
} from "lucide-react";
import type { Article } from "@shared/schema";

const CATEGORIES = ["全部", "港聞", "財經", "加密貨幣", "國際", "體育", "科技"] as const;

const categoryIcons: Record<string, React.ReactNode> = {
  "全部": <Newspaper className="w-3.5 h-3.5" />,
  "港聞": <Globe className="w-3.5 h-3.5" />,
  "財經": <TrendingUp className="w-3.5 h-3.5" />,
  "加密貨幣": <Bitcoin className="w-3.5 h-3.5" />,
  "國際": <Globe className="w-3.5 h-3.5" />,
  "體育": <Dumbbell className="w-3.5 h-3.5" />,
  "科技": <Cpu className="w-3.5 h-3.5" />,
  "社交熱話": <MessageCircle className="w-3.5 h-3.5" />,
};

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "剛剛";
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString("zh-HK", { month: "short", day: "numeric" });
}

function ArticleSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton-shimmer h-4 w-16 rounded" />
        <div className="skeleton-shimmer h-3 w-20 rounded" />
      </div>
      <div className="skeleton-shimmer h-5 w-full rounded" />
      <div className="skeleton-shimmer h-5 w-3/4 rounded" />
      <div className="space-y-1.5">
        <div className="skeleton-shimmer h-3 w-full rounded" />
        <div className="skeleton-shimmer h-3 w-5/6 rounded" />
      </div>
    </Card>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/articles/${article.id}/bookmark`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
    },
  });

  const sourceColor = getSourceColor(article.category);

  return (
    <Card
      className="article-card group p-4 flex flex-col gap-2.5 cursor-pointer border border-border/60 bg-card"
      data-testid={`article-card-${article.id}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Badge
            variant="secondary"
            className={`text-xs shrink-0 ${sourceColor}`}
            data-testid={`badge-source-${article.id}`}
          >
            {article.source}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(article.pubDate)}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            bookmarkMutation.mutate();
          }}
          data-testid={`bookmark-btn-${article.id}`}
        >
          {article.isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-primary" />
          ) : (
            <Bookmark className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group/link"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm font-semibold leading-snug line-clamp-2 group-hover/link:text-primary transition-colors"
          data-testid={`title-${article.id}`}
        >
          {article.title}
        </h3>
      </a>

      {article.description && (
        <p
          className="text-xs text-muted-foreground leading-relaxed line-clamp-2"
          data-testid={`desc-${article.id}`}
        >
          {article.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <Badge variant="outline" className="text-xs">
          {categoryIcons[article.category]}
          <span className="ml-1">{article.category}</span>
        </Badge>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          onClick={(e) => e.stopPropagation()}
          data-testid={`link-${article.id}`}
        >
          閱讀全文
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Card>
  );
}

function getSourceColor(category: string): string {
  switch (category) {
    case "港聞":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "財經":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "加密貨幣":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "國際":
      return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
    case "體育":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "科技":
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
    default:
      return "";
  }
}

export default function HomePage() {
  const { theme, toggleTheme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarks, setShowBookmarks] = useState(false);

  const articlesQuery = useQuery<Article[]>({
    queryKey: ["/api/articles", activeCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== "全部") params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);
      const res = await apiRequest("GET", `/api/articles?${params.toString()}`);
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000,
  });

  const bookmarksQuery = useQuery<Article[]>({
    queryKey: ["/api/bookmarks"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bookmarks");
      return res.json();
    },
    enabled: showBookmarks,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/refresh");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
    },
  });

  const displayedArticles = showBookmarks
    ? bookmarksQuery.data || []
    : articlesQuery.data || [];
  const isLoading = showBookmarks ? bookmarksQuery.isLoading : articlesQuery.isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16v2H4V4zm0 4h10v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2zm0 4h16v2H4v-2z" fill="currentColor" className="text-primary-foreground"/>
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold leading-none tracking-tight">
                  港聞匯
                </h1>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                  香港新聞聚合平台
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="搜尋新聞..."
                  className="pl-9 h-9 text-sm bg-muted/50 border-border/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowBookmarks(!showBookmarks);
                  if (!showBookmarks) {
                    queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
                  }
                }}
                className={showBookmarks ? "text-primary" : ""}
                data-testid="bookmarks-toggle"
              >
                {showBookmarks ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                data-testid="refresh-btn"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleTheme}
                data-testid="theme-toggle"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      {!showBookmarks && (
        <div className="sticky top-[57px] z-40 bg-background/80 backdrop-blur-lg border-b border-border/30">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v)}>
              <TabsList className="h-8 bg-transparent gap-1 w-full justify-start overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="text-xs h-7 px-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full"
                    data-testid={`tab-${cat}`}
                  >
                    <span className="mr-1">{categoryIcons[cat]}</span>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">
              {showBookmarks ? "已收藏" : activeCategory === "全部" ? "最新新聞" : activeCategory}
            </h2>
            {!isLoading && (
              <Badge variant="secondary" className="text-xs h-5">
                {displayedArticles.length} 篇
              </Badge>
            )}
          </div>
          {!isLoading && !showBookmarks && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
              即時更新
            </p>
          )}
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : displayedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-sm font-medium mb-1">
              {showBookmarks ? "暫無收藏" : "暫無新聞"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              {showBookmarks
                ? "點擊新聞卡片上的書籤圖標來收藏文章"
                : "嘗試切換分類或修改搜尋關鍵字"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-2">
          <p className="text-xs text-muted-foreground">
            港聞匯 — 聚合 {CATEGORIES.length - 1} 個分類的香港新聞
          </p>
          <PerplexityAttribution />
        </div>
      </footer>
    </div>
  );
}
