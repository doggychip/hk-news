import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull(),
  description: text("description"),
  summary: text("summary"),
  source: text("source").notNull(),
  category: text("category").notNull(),
  pubDate: text("pub_date"),
  imageUrl: text("image_url"),
  isBookmarked: boolean("is_bookmarked").default(false),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Category type
export const CATEGORIES = ["全部", "港聞", "財經", "加密貨幣", "國際", "體育", "科技", "社交熱話"] as const;
export type Category = typeof CATEGORIES[number];

// Source definitions
export interface FeedSource {
  name: string;
  url: string;
  category: string;
  language: string;
}
