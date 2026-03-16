import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { fetchFeeds, FEED_SOURCES } from "./feeds";

let lastFetchTime = 0;
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function ensureFreshData() {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) return;
  
  console.log("Fetching fresh news feeds...");
  try {
    const articles = await fetchFeeds();
    await storage.addArticles(articles);
    lastFetchTime = now;
    console.log(`Fetched ${articles.length} articles from ${FEED_SOURCES.length} sources`);
  } catch (error) {
    console.error("Failed to fetch feeds:", error);
  }
}

export async function registerRoutes(server: Server, app: Express) {
  // Initial feed fetch
  ensureFreshData();

  // Get articles with optional category and search filter
  app.get("/api/articles", async (req, res) => {
    await ensureFreshData();
    const { category, search } = req.query;
    const articles = await storage.getArticles(
      category as string | undefined,
      search as string | undefined
    );
    res.json(articles);
  });

  // Get single article
  app.get("/api/articles/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const article = await storage.getArticleById(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  // Toggle bookmark
  app.post("/api/articles/:id/bookmark", async (req, res) => {
    const id = parseInt(req.params.id);
    const article = await storage.toggleBookmark(id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  });

  // Get bookmarked articles
  app.get("/api/bookmarks", async (req, res) => {
    const articles = await storage.getBookmarkedArticles();
    res.json(articles);
  });

  // Get available sources
  app.get("/api/sources", async (_req, res) => {
    res.json(FEED_SOURCES);
  });

  // Force refresh feeds
  app.post("/api/refresh", async (_req, res) => {
    lastFetchTime = 0;
    await ensureFreshData();
    const articles = await storage.getArticles();
    res.json({ count: articles.length, message: "已更新" });
  });
}
