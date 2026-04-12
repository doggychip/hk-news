import type { Post, DailyBriefing, Sentiment, BriefingCategory } from "@shared/schema";
import { CATEGORIES } from "@shared/schema";

const GREETINGS: Record<string, string[]> = {
  morning: ["早晨！", "朝早好！", "Good morning 巴打！"],
  afternoon: ["午安！", "食咗飯未？", "下午好巴打！"],
  evening: ["晚安！", "放工喇？", "食完飯喇？"],
  night: ["夜啦仲唔瞓？", "夜貓子好！", "咁夜仲上網？"],
};

const HOT_TAKES = [
  "今日香港，冇日好過。",
  "打工仔嘅命，連AI都唔敢生成。",
  "有頭髮邊個想做癩痢？但而家連癩痢都租唔起。",
  "樓價跌？你信政府定信天氣預報？",
  "努力唔一定成功，但唔努力一定好舒服。",
  "人生如戲，但呢套戲係cult片。",
  "老細嘅團隊精神 = 你做佢攞credit。",
  "港鐵遲到你扣錢，港鐵遲到佢道歉。公平。",
  "買唔起樓就買杯奶茶，奶茶都$38。",
  "呢個世界最唔缺嘅就係離譜嘅事。",
  "香港精神：做到死但死唔去。",
  "躺平唔係放棄，係自我保護。",
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  let period: string;
  if (hour >= 5 && hour < 12) period = "morning";
  else if (hour >= 12 && hour < 17) period = "afternoon";
  else if (hour >= 17 && hour < 22) period = "evening";
  else period = "night";

  const options = GREETINGS[period];
  return options[Math.floor(Math.random() * options.length)];
}

function getMoodLabel(breakdown: DailyBriefing["sentimentBreakdown"]): string {
  const total = breakdown.positive + breakdown.negative + breakdown.neutral + breakdown.explosive;
  if (total === 0) return "今日暫時好靜 🤫";

  if (breakdown.explosive > total * 0.3) return "今日香港心情：爆炸級 💥💥💥";
  if (breakdown.positive > breakdown.negative * 2) return "今日香港心情：偏正面 ✨";
  if (breakdown.negative > breakdown.positive * 2) return "今日香港心情：偏負面 😤";
  if (breakdown.positive > breakdown.negative) return "今日香港心情：尚算OK 😊";
  if (breakdown.negative > breakdown.positive) return "今日香港心情：有少少負面 😐";
  return "今日香港心情：中立 🤷";
}

function getCategoryMood(stories: Array<{ sentiment: Sentiment }>): string {
  const counts = { positive: 0, negative: 0, neutral: 0, explosive: 0 };
  for (const s of stories) counts[s.sentiment]++;

  if (counts.explosive > 0) return "💥 爆";
  if (counts.positive > counts.negative) return "✨ 正面";
  if (counts.negative > counts.positive) return "😤 負面";
  return "😐 中立";
}

let cachedBriefing: DailyBriefing | null = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function generateBriefing(posts: Post[]): DailyBriefing {
  const now = Date.now();
  if (cachedBriefing && now - cacheTime < CACHE_TTL) {
    return cachedBriefing;
  }

  const sentimentBreakdown = { positive: 0, negative: 0, neutral: 0, explosive: 0 };
  for (const post of posts) {
    sentimentBreakdown[post.sentiment]++;
  }

  // Group by category and pick top 3 per category by heat
  const categoryMap = new Map<string, Post[]>();
  for (const post of posts) {
    const existing = categoryMap.get(post.category) || [];
    existing.push(post);
    categoryMap.set(post.category, existing);
  }

  const categories: BriefingCategory[] = [];
  // Use display categories (skip 熱門 as it's a virtual category)
  const displayCategories = CATEGORIES.filter(c => c !== "熱門");

  for (const cat of displayCategories) {
    const catPosts = categoryMap.get(cat) || [];
    if (catPosts.length === 0) continue;

    catPosts.sort((a, b) => b.heat - a.heat);
    const topStories = catPosts.slice(0, 3).map(p => ({
      title: p.title,
      summary: p.summary,
      sentiment: p.sentiment,
      heat: p.heat,
    }));

    categories.push({
      category: cat,
      topStories,
      categoryMood: getCategoryMood(topStories),
    });
  }

  const briefing: DailyBriefing = {
    date: new Date().toLocaleDateString("zh-HK", { year: "numeric", month: "long", day: "numeric", weekday: "long" }),
    greeting: getTimeGreeting(),
    overallMood: getMoodLabel(sentimentBreakdown),
    sentimentBreakdown,
    categories,
    hotTake: HOT_TAKES[Math.floor(Math.random() * HOT_TAKES.length)],
    generatedAt: new Date().toISOString(),
  };

  cachedBriefing = briefing;
  cacheTime = now;
  return briefing;
}

export function invalidateBriefingCache(): void {
  cachedBriefing = null;
  cacheTime = 0;
}
