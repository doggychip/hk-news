import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { fetchFeeds } from "./feeds";
import { insertCommentSchema, reactSchema, insertUserSchema, loginSchema, insertPostSchema } from "@shared/schema";
import type { User, Mood } from "@shared/schema";
import { MOODS } from "@shared/schema";
import { generateBriefing, invalidateBriefingCache } from "./briefing";
import { matchesMood } from "./ai-content";

async function getAuthUser(req: any): Promise<User | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  const session = await storage.getSession(token);
  if (!session) return null;
  return await storage.getUserById(session.userId) ?? null;
}

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

  // GET /api/posts - list posts with optional category, search, mood filter
  app.get("/api/posts", async (req, res) => {
    await ensureFreshData();
    const { category, search, mood } = req.query;
    let posts = await storage.getPosts(
      category as string | undefined,
      search as string | undefined
    );
    // Apply mood filter
    if (mood && MOODS.includes(mood as Mood)) {
      posts = posts.filter(p => matchesMood(p, mood as Mood));
    }
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
    if (!post) return res.status(404).json({ message: "搵唔到呢個帖子" });

    const user = await getAuthUser(req);
    const comment = user
      ? await storage.addComment(id, parsed.data.content, user.id, user.displayName)
      : await storage.addComment(id, parsed.data.content);
    res.status(201).json(comment);
  });

  // GET /api/trending - top 10 by heat
  app.get("/api/trending", async (_req, res) => {
    const trending = await storage.getTrending();
    res.json(trending);
  });

  // GET /api/briefing - daily AI briefing
  app.get("/api/briefing", async (_req, res) => {
    await ensureFreshData();
    const posts = await storage.getPosts();
    const briefing = generateBriefing(posts);
    res.json(briefing);
  });

  // GET /api/trending/velocity - posts sorted by trend velocity
  app.get("/api/trending/velocity", async (_req, res) => {
    const posts = await storage.getPosts();
    const sorted = [...posts].sort((a, b) => b.trendScore - a.trendScore).slice(0, 10);
    res.json(sorted);
  });

  // POST /api/refresh - re-fetch RSS feeds
  app.post("/api/refresh", async (_req, res) => {
    lastFetchTime = 0;
    invalidateBriefingCache();
    await ensureFreshData();
    const posts = await storage.getPosts();
    res.json({ count: posts.length, message: "已更新" });
  });

  // POST /api/auth/register - create account
  app.post("/api/auth/register", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "輸入資料有誤" });

    const existing = await storage.getUserByUsername(parsed.data.username);
    if (existing) return res.status(409).json({ message: "用戶名已被使用" });

    const user = await storage.createUser(parsed.data.username, parsed.data.displayName, parsed.data.avatar);
    const session = await storage.createSession(user.id);
    res.status(201).json({ user, token: session.id });
  });

  // POST /api/auth/login - login
  app.post("/api/auth/login", async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "請輸入用戶名" });

    const user = await storage.getUserByUsername(parsed.data.username);
    if (!user) return res.status(404).json({ message: "搵唔到呢個用戶" });

    const session = await storage.createSession(user.id);
    res.json({ user, token: session.id });
  });

  // GET /api/auth/me - get current user
  app.get("/api/auth/me", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "未登入" });
    res.json(user);
  });

  // POST /api/auth/logout - logout
  app.post("/api/auth/logout", async (req, res) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      await storage.deleteSession(token);
    }
    res.json({ message: "已登出" });
  });

  // GET /api/users/:id - get user profile
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "無效嘅用戶ID" });

    const user = await storage.getUserById(id);
    if (!user) return res.status(404).json({ message: "搵唔到呢個用戶" });
    res.json(user);
  });

  // GET /api/users/:id/posts - user's posts
  app.get("/api/users/:id/posts", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "無效嘅用戶ID" });

    const posts = await storage.getUserPosts(id);
    res.json(posts);
  });

  // GET /api/users/:id/comments - user's comments
  app.get("/api/users/:id/comments", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "無效嘅用戶ID" });

    const comments = await storage.getUserComments(id);
    res.json(comments);
  });

  // POST /api/posts - create user post (requires auth)
  app.post("/api/posts", async (req, res) => {
    const user = await getAuthUser(req);
    if (!user) return res.status(401).json({ message: "請先登入" });

    const parsed = insertPostSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.errors[0]?.message || "輸入資料有誤" });

    const post = await storage.createPost({
      title: parsed.data.title,
      content: parsed.data.content,
      category: parsed.data.category,
      userId: user.id,
    });
    res.status(201).json(post);
  });
}
