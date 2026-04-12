import type { Post, Comment, Category, Reactions, ReactionType, User, Session } from "@shared/schema";
import { generateSummary } from "./summarizer";
import { analyzeSentiment } from "./sentiment";
import { recordSnapshot, calculateTrendScore, calculateTrendDirection } from "./trending";
import { generateHotTake, generateDebate, generateClickbait } from "./ai-content";
import { generatePersonaComments } from "./ai-personas";
import crypto from "crypto";

export interface IStorage {
  getPosts(category?: string, search?: string): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  addPosts(posts: Omit<Post, "id">[]): Promise<Post[]>;
  addReaction(postId: number, type: ReactionType): Promise<Post | undefined>;
  getComments(postId: number): Promise<Comment[]>;
  addComment(postId: number, content: string, userId?: number, displayName?: string): Promise<Comment>;
  likeComment(commentId: number): Promise<Comment | undefined>;
  getTrending(): Promise<Post[]>;
  clearPosts(): Promise<void>;
  createUser(username: string, displayName: string, avatar: string): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createSession(userId: number): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  getUserPosts(userId: number): Promise<Post[]>;
  getUserComments(userId: number): Promise<Comment[]>;
  createPost(post: { title: string; content: string; category: string; userId: number }): Promise<Post>;
  incrementUserKarma(userId: number, points: number): Promise<void>;
}

// Anonymous nickname generator
const NICKNAMES = [
  "茶記常客", "巴打", "小薯", "打工仔", "肥宅", "隱世高手",
  "鍵盤戰士", "廢青", "師兄", "大佬", "阿叔", "阿姐",
  "老鬼", "新手", "路人甲", "毒撚", "公主", "小王子",
  "太空人", "文青", "IT狗", "金融佬", "MK仔", "港女",
  "九龍佬", "港島人", "新界仔", "街坊", "熟客", "食家",
];

function generateNickname(): string {
  const name = NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)];
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `${name} #${num}`;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private users: Map<number, User>;
  private sessions: Map<string, Session>;
  private nextPostId: number;
  private nextCommentId: number;
  private nextUserId: number = 1;

  constructor() {
    this.posts = new Map();
    this.comments = new Map();
    this.users = new Map();
    this.sessions = new Map();
    this.nextPostId = 1;
    this.nextCommentId = 1;
    // No mock data — app runs on real RSS feeds.
    // AI features applied when posts arrive via addPosts().
  }

  async getPosts(category?: string, search?: string): Promise<Post[]> {
    let results = Array.from(this.posts.values());

    if (category && category !== "全部") {
      results = results.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.source.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort by heat score descending
    results.sort((a, b) => b.heat - a.heat);

    return results;
  }

  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async addPosts(posts: Omit<Post, "id">[]): Promise<Post[]> {
    const added: Post[] = [];
    for (const post of posts) {
      // Deduplicate by sourceUrl
      const existing = Array.from(this.posts.values()).find(
        (p) => p.sourceUrl === post.sourceUrl && p.title === post.title
      );
      if (existing) continue;

      const id = this.nextPostId++;
      const newPost: Post = { ...post, id };
      recordSnapshot(newPost);
      newPost.trendScore = calculateTrendScore(newPost);
      newPost.trendDirection = calculateTrendDirection(newPost);
      this.posts.set(id, newPost);
      added.push(newPost);

      // Generate AI persona comments for each new post
      const aiComments = generatePersonaComments({ title: newPost.title, category: newPost.category }, 4);
      for (const ac of aiComments) {
        const cid = this.nextCommentId++;
        this.comments.set(cid, {
          id: cid,
          postId: id,
          nickname: `${ac.avatar} ${ac.nickname}`,
          content: ac.content,
          createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 6).toISOString(),
          likes: Math.floor(Math.random() * 200) + 5,
          isAI: true,
          aiPersona: ac.personaName,
          aiAvatar: ac.avatar,
        });
      }
      newPost.commentCount = aiComments.length;
      this.posts.set(id, newPost);
    }
    return added;
  }

  async addReaction(postId: number, type: ReactionType): Promise<Post | undefined> {
    const post = this.posts.get(postId);
    if (!post) return undefined;
    post.reactions[type]++;
    // Slightly increase heat
    post.heat = Math.min(100, post.heat + 0.5);
    // Update trending data
    recordSnapshot(post);
    post.trendScore = calculateTrendScore(post);
    post.trendDirection = calculateTrendDirection(post);
    // Re-evaluate sentiment with new reactions
    post.sentiment = analyzeSentiment(post.title, post.content, post.heat, post.reactions);
    this.posts.set(postId, post);
    return post;
  }

  async getComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.postId === postId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async addComment(postId: number, content: string, userId?: number, displayName?: string): Promise<Comment> {
    const id = this.nextCommentId++;
    const comment: Comment = {
      id,
      postId,
      nickname: displayName ?? generateNickname(),
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      userId,
      displayName,
    };
    this.comments.set(id, comment);
    // Increase comment count on post
    const post = this.posts.get(postId);
    if (post) {
      post.commentCount++;
      this.posts.set(postId, post);
    }
    // Increment user karma and comment count
    if (userId) {
      const user = this.users.get(userId);
      if (user) {
        user.commentCount++;
        user.karmaPoints += 1;
        this.users.set(userId, user);
      }
    }
    return comment;
  }

  async likeComment(commentId: number): Promise<Comment | undefined> {
    const comment = this.comments.get(commentId);
    if (!comment) return undefined;
    comment.likes++;
    this.comments.set(commentId, comment);
    return comment;
  }

  async getTrending(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.heat - a.heat)
      .slice(0, 10);
  }

  async clearPosts(): Promise<void> {
    this.posts.clear();
    this.nextPostId = 1;
  }

  async createUser(username: string, displayName: string, avatar: string): Promise<User> {
    const id = this.nextUserId++;
    const user: User = {
      id,
      username,
      displayName,
      avatar,
      joinedAt: new Date().toISOString(),
      postCount: 0,
      commentCount: 0,
      karmaPoints: 0,
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createSession(userId: number): Promise<Session> {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUserComments(userId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createPost(post: { title: string; content: string; category: string; userId: number }): Promise<Post> {
    const id = this.nextPostId++;
    const reactions = { fire: 0, cringe: 0, rofl: 0, dead: 0, chill: 0, rage: 0 };
    const sentiment = analyzeSentiment(post.title, post.content, 50, reactions);
    const postData = { title: post.title, content: post.content, category: post.category as Category, sentiment };
    const newPost: Post = {
      id,
      title: post.title,
      content: post.content,
      summary: generateSummary(post.title, post.content),
      category: post.category as Category,
      source: "用戶投稿",
      sourceUrl: "",
      heat: 50,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      reactions,
      userId: post.userId,
      sentiment,
      trendDirection: "up",
      trendScore: 0,
      aiHotTake: generateHotTake(postData),
      aiClickbait: generateClickbait({ title: post.title, category: post.category as Category }),
      aiDebate: generateDebate({ title: post.title, content: post.content, category: post.category as Category }),
    };
    this.posts.set(id, newPost);
    // Increment user stats
    const user = this.users.get(post.userId);
    if (user) {
      user.postCount++;
      user.karmaPoints += 5;
      this.users.set(post.userId, user);
    }
    return newPost;
  }

  async incrementUserKarma(userId: number, points: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.karmaPoints += points;
      this.users.set(userId, user);
    }
  }
}

export const storage = new MemStorage();
