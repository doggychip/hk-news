import { z } from "zod";

// Categories
export const CATEGORIES = ["熱門", "吹水", "娛樂", "時事", "返工", "感情", "飲食", "科技"] as const;
export type Category = typeof CATEGORIES[number];

// Reactions type
export interface Reactions {
  fire: number;
  shocked: number;
  laughing: number;
  skull: number;
  heart: number;
}

export type ReactionType = keyof Reactions;

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
}

// Comment
export interface Comment {
  id: number;
  postId: number;
  nickname: string;
  content: string;
  createdAt: string;
  likes: number;
}

// Insert types
export const insertCommentSchema = z.object({
  content: z.string().min(1, "請輸入內容").max(500, "最多500字"),
});
export type InsertComment = z.infer<typeof insertCommentSchema>;

export const reactSchema = z.object({
  type: z.enum(["fire", "shocked", "laughing", "skull", "heart"]),
});
export type ReactInput = z.infer<typeof reactSchema>;
