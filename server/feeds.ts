import RSSParser from "rss-parser";
import type { Post, Category, Reactions } from "@shared/schema";
import { generateSummary } from "./summarizer";
import { analyzeSentiment } from "./sentiment";
import { calculateTrendScore, calculateTrendDirection } from "./trending";

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    "User-Agent": "CheuiSui/1.0",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

export interface FeedSource {
  name: string;
  url: string;
  category: Category;
}

export const FEED_SOURCES: FeedSource[] = [
  { name: "東方日報娛樂", url: "https://orientaldaily.on.cc/rss/entertainment.xml", category: "娛樂" },
  { name: "RTHK 港聞", url: "https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml", category: "時事" },
  { name: "明報即時", url: "https://news.mingpao.com/rss/ins/s00001.xml", category: "時事" },
  { name: "Unwire.hk", url: "https://unwire.hk/feed/", category: "科技" },
  { name: "東方日報 港聞", url: "https://orientaldaily.on.cc/rss/news.xml", category: "時事" },
  { name: "東周刊", url: "https://eastweek.stheadline.com/rss", category: "娛樂" },
  { name: "東方新地", url: "https://orientalsunday.hk/feed", category: "娛樂" },
  { name: "巴士的報", url: "https://www.bastillepost.com/hongkong/feed", category: "吹水" },
  { name: "RTHK 財經", url: "https://rthk.hk/rthk/news/rss/c_expressnews_cfinance.xml", category: "時事" },
];

function generateHeat(pubDate?: string): number {
  if (!pubDate) return Math.floor(Math.random() * 40) + 30;
  const ageMs = Date.now() - new Date(pubDate).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  // Newer = hotter, cap at 85 for RSS content (mock content gets higher)
  const recency = Math.max(0, 85 - ageHours * 4);
  const engagement = Math.random() * 20;
  return Math.min(85, Math.max(10, Math.floor(recency + engagement)));
}

function generateReactions(): Reactions {
  return {
    fire: Math.floor(Math.random() * 200),
    cringe: Math.floor(Math.random() * 100),
    rofl: Math.floor(Math.random() * 80),
    dead: Math.floor(Math.random() * 60),
    chill: Math.floor(Math.random() * 150),
    rage: Math.floor(Math.random() * 50),
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageUrl(item: any): string | undefined {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.["$"]?.url) return item["media:content"]["$"].url;
  // Try to extract from content
  const content = item["content:encoded"] || item.content || "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1] || undefined;
}

export async function fetchFeeds(): Promise<Omit<Post, "id">[]> {
  const results: Omit<Post, "id">[] = [];

  const feedPromises = FEED_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || []).slice(0, 10);

      for (const item of items) {
        const title = item.title?.trim();
        if (!title) continue;

        const rawContent = item["content:encoded"] || item.content || item.contentSnippet || "";
        const content = stripHtml(rawContent);
        const summary = generateSummary(title, content);
        const pubDate = item.pubDate || item.isoDate;

        const heat = generateHeat(pubDate);
        const reactions = generateReactions();
        const sentiment = analyzeSentiment(title, content || title, heat, reactions);

        results.push({
          title,
          content: content || title,
          summary,
          category: source.category,
          source: source.name,
          sourceUrl: item.link || source.url,
          imageUrl: extractImageUrl(item),
          heat,
          commentCount: Math.floor(Math.random() * 300),
          createdAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          reactions,
          sentiment,
          trendDirection: "steady" as const,
          trendScore: 0,
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${source.name} (${source.url}):`, error instanceof Error ? error.message : error);
    }
  });

  await Promise.allSettled(feedPromises);
  return results;
}
