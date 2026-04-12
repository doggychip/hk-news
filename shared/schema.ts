import { z } from "zod";

// Categories
export const CATEGORIES = ["熱門", "吹水", "娛樂", "時事", "返工", "感情", "飲食", "科技"] as const;
export type Category = typeof CATEGORIES[number];

// Reactions type — HK meme reactions
export interface Reactions {
  fire: number;
  cringe: number;
  rofl: number;
  dead: number;
  chill: number;
  rage: number;
}

export type ReactionType = keyof Reactions;

// Sentiment types
export const SENTIMENT_TYPES = ["positive", "negative", "neutral", "explosive"] as const;
export type Sentiment = typeof SENTIMENT_TYPES[number];

// Trend direction
export const TREND_DIRECTIONS = ["up", "down", "steady"] as const;
export type TrendDirection = typeof TREND_DIRECTIONS[number];

// Post
export interface Post {
  id: number;
  title: string;
  content: string;
  summary: string;
  category: Category;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  heat: number;
  commentCount: number;
  createdAt: string;
  reactions: Reactions;
  userId?: number;
  sentiment: Sentiment;
  trendDirection: TrendDirection;
  trendScore: number;
  aiHotTake: string;
  aiClickbait: string;
  aiDebate: { optimist: string; pessimist: string };
}

// Mood types for feed filtering
export const MOODS = ["laugh", "angry", "popcorn", "chill", "cry"] as const;
export type Mood = typeof MOODS[number];

// Daily Briefing
export interface BriefingCategory {
  category: string;
  topStories: Array<{ title: string; summary: string; sentiment: Sentiment; heat: number }>;
  categoryMood: string;
}

export interface DailyBriefing {
  date: string;
  greeting: string;
  overallMood: string;
  sentimentBreakdown: { positive: number; negative: number; neutral: number; explosive: number };
  categories: BriefingCategory[];
  hotTake: string;
  generatedAt: string;
}

// Comment
export interface Comment {
  id: number;
  postId: number;
  nickname: string;
  content: string;
  createdAt: string;
  likes: number;
  userId?: number;
  displayName?: string;
}

// User
export interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string; // emoji avatar
  joinedAt: string;
  postCount: number;
  commentCount: number;
  karmaPoints: number;
}

// Session
export interface Session {
  id: string; // UUID
  userId: number;
  createdAt: string;
}

// Insert types
export const insertCommentSchema = z.object({
  content: z.string().min(1, "請輸入內容").max(500, "最多500字"),
});
export type InsertComment = z.infer<typeof insertCommentSchema>;

export const reactSchema = z.object({
  type: z.enum(["fire", "cringe", "rofl", "dead", "chill", "rage"]),
});
export type ReactInput = z.infer<typeof reactSchema>;

export const insertUserSchema = z.object({
  username: z.string().min(2, "用戶名最少2個字").max(20, "用戶名最多20個字"),
  displayName: z.string().min(1, "顯示名稱最少1個字").max(20, "顯示名稱最多20個字"),
  avatar: z.string(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  username: z.string(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const insertPostSchema = z.object({
  title: z.string().min(1, "請輸入標題").max(100, "標題最多100字"),
  content: z.string().min(1, "請輸入內容").max(5000, "內容最多5000字"),
  category: z.enum(["吹水", "娛樂", "時事", "返工", "感情", "飲食", "科技"]),
});
export type InsertPost = z.infer<typeof insertPostSchema>;
