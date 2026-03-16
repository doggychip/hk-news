import type { FeedSource, InsertArticle } from "@shared/schema";

// HK News RSS Feed Sources
export const FEED_SOURCES: FeedSource[] = [
  // 港聞 (Local HK News)
  { name: "香港電台", url: "https://rthk.hk/rthk/news/rss/c_expressnews_clocal.xml", category: "港聞", language: "zh" },
  { name: "明報", url: "https://news.mingpao.com/rss/pns/s00002.xml", category: "港聞", language: "zh" },
  { name: "香港經濟日報", url: "https://www.hket.com/rss/hongkong", category: "港聞", language: "zh" },
  { name: "南華早報", url: "https://www.scmp.com/rss/2/feed", category: "港聞", language: "en" },
  { name: "巴士的報", url: "https://www.bastillepost.com/hongkong/feed", category: "港聞", language: "zh" },
  { name: "政府新聞網", url: "https://www.news.gov.hk/tc/common/html/topstories.rss.xml", category: "港聞", language: "zh" },
  
  // 財經 (Finance)
  { name: "香港電台財經", url: "https://rthk.hk/rthk/news/rss/c_expressnews_cfinance.xml", category: "財經", language: "zh" },
  { name: "經濟通", url: "https://www.etnet.com.hk/www/tc/news/rss.php?section=editor", category: "財經", language: "zh" },
  { name: "信報", url: "https://www.hkej.com/rss/onlinenews.xml", category: "財經", language: "zh" },
  { name: "AAStocks", url: "https://www.aastocks.com/tc/resources/datafeed/rss/leading/aafn_cn.xml", category: "財經", language: "zh" },
  { name: "香港經濟日報財經", url: "https://www.hket.com/rss/finance", category: "財經", language: "zh" },
  
  // 國際 (International)
  { name: "香港電台國際", url: "https://rthk.hk/rthk/news/rss/c_expressnews_cinternational.xml", category: "國際", language: "zh" },
  { name: "香港電台大中華", url: "https://rthk.hk/rthk/news/rss/c_expressnews_greaterchina.xml", category: "國際", language: "zh" },
  
  // 體育 (Sports)
  { name: "香港電台體育", url: "https://rthk.hk/rthk/news/rss/c_expressnews_csport.xml", category: "體育", language: "zh" },
  
  // 科技 (Tech)
  { name: "香港經濟日報科技", url: "https://www.hket.com/rss/technology", category: "科技", language: "zh" },
  { name: "Unwire.hk", url: "https://unwire.hk/feed/", category: "科技", language: "zh" },
  
  // 加密貨幣 (Crypto / Web3)
  { name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "加密貨幣", language: "en" },
  { name: "鏈新聞", url: "https://abmedia.io/feed", category: "加密貨幣", language: "zh" },
  { name: "Blockchain News", url: "https://blockchain.news/rss", category: "加密貨幣", language: "en" },
];

function extractImageFromContent(content: string | undefined): string | null {
  if (!content) return null;
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imgMatch ? imgMatch[1] : null;
}

function cleanHtml(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, 500);
}

export async function fetchFeeds(): Promise<InsertArticle[]> {
  const RssParser = (await import("rss-parser")).default;
  const parser = new RssParser({
    timeout: 10000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HKNewsAggregator/1.0)',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  });

  const allArticles: InsertArticle[] = [];

  const feedPromises = FEED_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const articles: InsertArticle[] = (feed.items || []).slice(0, 15).map((item) => ({
        title: item.title || "無標題",
        link: item.link || "",
        description: cleanHtml(item.contentSnippet || item.content || item.summary || ""),
        summary: null,
        source: source.name,
        category: source.category,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        imageUrl: item.enclosure?.url || extractImageFromContent(item.content || item["content:encoded"]) || null,
        isBookmarked: false,
      }));
      return articles;
    } catch (error) {
      console.error(`Failed to fetch ${source.name} (${source.url}):`, (error as Error).message);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    }
  }

  return allArticles;
}
