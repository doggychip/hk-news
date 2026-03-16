import type { Article, InsertArticle } from "@shared/schema";

export interface IStorage {
  getArticles(category?: string, search?: string): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | undefined>;
  addArticles(articles: InsertArticle[]): Promise<Article[]>;
  toggleBookmark(id: number): Promise<Article | undefined>;
  getBookmarkedArticles(): Promise<Article[]>;
  clearArticles(): Promise<void>;
}

export class MemStorage implements IStorage {
  private articles: Map<number, Article>;
  private nextId: number;

  constructor() {
    this.articles = new Map();
    this.nextId = 1;
  }

  async getArticles(category?: string, search?: string): Promise<Article[]> {
    let results = Array.from(this.articles.values());
    
    if (category && category !== "全部") {
      results = results.filter(a => a.category === category);
    }
    
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a => 
        a.title.toLowerCase().includes(q) || 
        (a.description && a.description.toLowerCase().includes(q)) ||
        a.source.toLowerCase().includes(q)
      );
    }
    
    // Sort by pubDate descending (newest first)
    results.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });
    
    return results;
  }

  async getArticleById(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async addArticles(articles: InsertArticle[]): Promise<Article[]> {
    const added: Article[] = [];
    for (const article of articles) {
      // Deduplicate by link
      const existing = Array.from(this.articles.values()).find(a => a.link === article.link);
      if (existing) continue;
      
      const id = this.nextId++;
      const newArticle: Article = { 
        ...article, 
        id,
        description: article.description ?? null,
        summary: article.summary ?? null,
        imageUrl: article.imageUrl ?? null,
        pubDate: article.pubDate ?? null,
        isBookmarked: article.isBookmarked ?? false,
      };
      this.articles.set(id, newArticle);
      added.push(newArticle);
    }
    return added;
  }

  async toggleBookmark(id: number): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;
    article.isBookmarked = !article.isBookmarked;
    this.articles.set(id, article);
    return article;
  }

  async getBookmarkedArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(a => a.isBookmarked);
  }

  async clearArticles(): Promise<void> {
    this.articles.clear();
    this.nextId = 1;
  }
}

export const storage = new MemStorage();
