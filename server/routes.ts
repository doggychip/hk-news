import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { fetchFeeds } from "./feeds";
import { insertCommentSchema, reactSchema } from "@shared/schema";

let lastFetchTime = 0;
const FETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function ensureFreshData() {
  const now = Date.now();
  if (now - lastFetchTime < FETCH_INTERVAL) return;

  console.log("Fetching fresh RSS feeds...");
  try {
    const posts = await fetchFeeds();
    await storage.addPosts(posts);
    lastFetchTime = now;
    console.log(`Fetched ${posts.length} posts from RSS feeds`);
  } catch (error) {
    console.error("Failed to fetch feeds:", error);
  }
}

export async function registerRoutes(server: Server, app: Express) {
  // Initial feed fetch
  ensureFreshData();

  // GET /api/posts - list posts with optional category filter
  app.get("/api/posts", async (req, res) => {
    await ensureFreshData();
    const { category, search } = req.query;
    const posts = await storage.getPosts(
      category as string | undefined,
      search as string | undefined
    );
    res.json(posts);
  });

  // GET /api/posts/:id - get single post
  app.get("/api/posts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const post = await storage.getPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  // POST /api/posts/:id/react - add a reaction
  app.post("/api/posts/:id/react", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const parsed = reactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid reaction type" });

    const post = await storage.addReaction(id, parsed.data.type);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  });

  // GET /api/posts/:id/comments - list comments
  app.get("/api/posts/:id/comments", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const comments = await storage.getComments(id);
    res.json(comments);
  });

  // POST /api/posts/:id/comments - add comment
  app.post("/api/posts/:id/comments", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.message });

    const post = await storage.getPostById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await storage.addComment(id, parsed.data.content);
    res.status(201).json(comment);
  });

  // GET /api/trending - top 10 by heat
  app.get("/api/trending", async (_req, res) => {
    const trending = await storage.getTrending();
    res.json(trending);
  });

  // POST /api/refresh - re-fetch RSS feeds
  app.post("/api/refresh", async (_req, res) => {
    lastFetchTime = 0;
    await ensureFreshData();
    const posts = await storage.getPosts();
    res.json({ count: posts.length, message: "已更新" });
  });
}
