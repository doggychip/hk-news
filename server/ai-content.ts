import type { Post } from "@shared/schema";

// ============================================================
// AI Hot Take Generator — savage one-liner per post
// ============================================================

const HOT_TAKE_TEMPLATES: Record<string, string[]> = {
  "返工": [
    "又一個被資本主義壓榨嘅靈魂，老細笑到見牙唔見眼",
    "呢個故事教訓我哋：打工就係原罪",
    "HR部門嘅存在就係為咗幫老細合法剝削你",
    "你以為你係員工？你只係一個有薪呼吸器",
    "老細嘅「團隊精神」= 你做死佢攞credit，完美分工",
    "辭職信已經寫好未？建議用最貴嘅紙打印",
    "LinkedIn上面啲「感恩公司栽培」全部都係斯德哥爾摩症候群",
    "呢間公司嘅management style：壓榨完你仲要你say thank you",
  ],
  "感情": [
    "愛情係世界上最貴嘅課程，學費仲要唔可以退",
    "呢個故事證明：單身唔係冇人要，係避開咗一個災難",
    "感情嘅世界只有兩種人：未受過傷嘅，同正在受傷嘅",
    "建議全香港人拍拖之前做background check",
    "渣男/渣女永遠唔缺市場，因為好人永遠太天真",
    "婚姻就係一場豪賭，而莊家永遠係律師",
    "呢件事教訓我哋：相信愛情不如相信銀行月結單",
    "感情建議：先確認對方係人類再拍拖",
  ],
  "飲食": [
    "呢個價錢我可以喺7-11食一個禮拜，仲有找",
    "「空運到港」嘅意思係：空氣運輸，由冰箱到你碟",
    "食評KOL嘅良心同佢哋推薦嘅餐廳一樣：根本唔存在",
    "呢個世界最大嘅謊言：「好抵食」",
    "建議消委會開個專線處理「食物同相片不符」嘅case",
    "你以為你食緊A5和牛？其實係A5影印紙嘅價錢",
    "香港飲食業嘅motto：賣貴啲佢哋就以為好食啲",
    "打卡嘅嘢多數伏，冇人影嘅先係真正好食",
  ],
  "時事": [
    "呢個城市嘅日常：荒謬到連小說家都寫唔出",
    "政府嘅回應速度同港鐵一樣：永遠「稍後跟進」",
    "如果憤怒可以發電，香港已經能源自給自足",
    "呢件事最恐怖嘅唔係事件本身，係冇人覺得奇怪",
    "又一日喺呢個瘋狂嘅城市生存落去",
    "新聞自由嘅意思係：你自由咁睇新聞，但唔好有意見",
    "香港精神：被打到趴低仲要企返起身返工",
    "呢個社會嘅bug report已經爆晒，但admin永遠offline",
  ],
  "科技": [
    "科技嘅進步就係令你用更貴嘅方式做同一件事",
    "AI嘅存在證明：人類最叻就係創造取代自己嘅嘢",
    "每一次「創新」背後都有一班被裁嘅員工",
    "Web3嘅精神：去中心化你嘅錢包，中心化佢嘅利潤",
    "呢個app/產品最大嘅feature：幫你更有效率咁嘥時間",
    "科技巨頭嘅privacy policy：你冇privacy，呢個就係policy",
    "又一個用科技包裝嘅古老騙局",
    "未來已經嚟咗，但月薪仲係$15K",
  ],
  "娛樂": [
    "娛樂圈最唔缺嘅就係驚喜，但全部都係壞嘅嗰種",
    "呢個水平都可以出道？我隔離屋個貓唱得好過佢",
    "TVB嘅劇本：Ctrl+C Ctrl+V嘅藝術",
    "香港娛樂圈嘅quality control同佢哋嘅收視一樣：唔存在",
    "觀眾嘅要求已經低到：唔好出事就算好",
    "呢班人嘅演技只有一個level：災難級",
    "娛樂新聞嘅深度同個泳池嘅兒童區一樣",
    "仲有人睇？致敬你哋嘅勇氣",
  ],
  "吹水": [
    "呢個post嘅含金量同個標題一樣：出乎意料地高",
    "連登永遠唔會令你失望，因為你本身就冇期望",
    "食完花生記得執返啲殼",
    "呢個topic嘅深度超越咗我嘅理解能力",
    "巴打你贏咗，我已經冇嘢好講",
    "每日嘅吹水thread都係一堂免費嘅人性課",
    "呢個世界需要更多呢種無聊但治癒嘅content",
    "正式宣佈：呢個post已經成為今日嘅精神食糧",
  ],
};

const FALLBACK_TAKES = [
  "呢件事我真係忍唔住要講兩句",
  "香港日常，見怪不怪",
  "如果你覺得離譜，恭喜你仲有正常人嘅反應",
  "建議全文背誦，考試一定會出",
];

export function generateHotTake(post: Pick<Post, "title" | "content" | "category" | "sentiment">): string {
  const templates = HOT_TAKE_TEMPLATES[post.category] || FALLBACK_TAKES;
  // Use title hash for deterministic but varied selection
  const hash = simpleHash(post.title);
  return templates[hash % templates.length];
}

// ============================================================
// AI Debate Generator — 樂觀L vs 悲觀L
// ============================================================

interface AIDebate {
  optimist: string;  // 樂觀L
  pessimist: string; // 悲觀L
}

const OPTIMIST_TEMPLATES: Record<string, string[]> = {
  "返工": [
    "起碼你有份工吖！好多人連OT嘅機會都冇。而且呢啲經歷會令你嘅CV好靚，下一份工人工一定高啲！",
    "老細咁做一定係想訓練你。捱得過呢關你就進化咗。呢啲都係character building嚟㗎！",
    "積極啲諗，至少你學到嘢。而且經濟環境好快會好返，到時你就係最搶手嘅人才！",
  ],
  "感情": [
    "分咗先有機會搵到更好嘅！宇宙幫你淘汰咗唔啱嘅人，真命天子/女可能聽日就出現！",
    "呢件事令你成長咗。下次你會更加識得保護自己。失去嘅只係一段關係，得到嘅係一世嘅智慧！",
    "起碼你而家自由咗！一個人都可以好開心。去旅行、學新嘢、投資自己，人生仲有好多可能性！",
  ],
  "飲食": [
    "食一次中伏就學識咗，下次就唔會再俾人呃。而且香港仲有好多真正好食嘅餐廳等緊你發掘！",
    "起碼你有得食嘢抱怨嘛！呢個經歷可以寫成food blog，搞唔好仲紅過嗰個KOL！",
    "用正面嘅角度睇：你嘅味覺好敏銳，可以考慮做food critic！壞事變好事！",
  ],
  "時事": [
    "每一次危機都係改變嘅契機。社會進步就係靠呢啲事件推動大家去改善制度！",
    "起碼大家有渠道發聲，有討論就有希望。一齊努力，香港一定會好返！",
    "呢件事引起咗咁大迴響，證明市民嘅公民意識越嚟越高。有覺醒就有進步！",
  ],
  "科技": [
    "科技嘅陣痛係必經之路。今日嘅問題會催生聽日嘅解決方案。AI時代充滿機遇！",
    "每一次disruption都會創造新工種。學多啲新skill，你就係下一個受益者！",
    "危中有機！呢啲變化正正係創業嘅最佳時機。睇到問題就係睇到商機！",
  ],
  "娛樂": [
    "雖然質素參差，但起碼香港仲有人肯投資做娛樂。支持本地創作，佢哋會進步㗎！",
    "呢次唔好唔代表下次唔好！好多經典都係由失敗中誕生嘅。俾啲耐性！",
    "起碼有嘢俾你睇住笑吓嘛！就當做免費嘅comedy show，心態決定一切！",
  ],
  "吹水": [
    "連登最正就係呢種百花齊放嘅討論文化。每個人都有自己嘅故事，呢個先係真正嘅社區！",
    "呢個topic幾有趣喎！反映緊香港人嘅生活百態。開心嘅、唔開心嘅，都係人生嘅一部分！",
    "最正就係有呢個地方可以傾偈吹水。virtual community都係community嚟㗎！",
  ],
};

const PESSIMIST_TEMPLATES: Record<string, string[]> = {
  "返工": [
    "辭咗呢份仲有下一份咁嘅公司等緊你。香港嘅工作文化爛到骨子裡，你走到邊都一樣。OT文化唔會因為你辭職就消失。",
    "你以為投訴有用？HR同老細係同一夥嘅。勞工處？結案速度同港鐵維修一樣慢。認命啦。",
    "呢個唔係個別事件，係整個制度嘅問題。一個打工仔點鬥得過成個系統？認清現實先好過盲目樂觀。",
  ],
  "感情": [
    "下一個可能更差。統計學話你知，遇到渣嘅機率高過中六合彩。與其期望下一個更好，不如習慣一個人。",
    "成長？講就容易。創傷後遺症可以跟你十幾年。而且呢個社會只會獎勵渣嘅人，好人永遠輸。",
    "你話自由？自由即係一個人食飯、一個人睇戲、一個人生病冇人理。呢種「自由」你真係想要？",
  ],
  "飲食": [
    "學識咗又點？香港嘅食物安全監管同擺設一樣：得個樣。下次你中伏嘅可能係另一種手法。防不勝防。",
    "呢個行業已經爛晒。由KOL到食材供應鏈，全部都係假嘢。你食嘅每一啖都可能係一個謊言。",
    "仲天真以為有好餐廳？通脹加租金加人工，能夠keep到質素嘅餐廳已經買少見少。呢個trend只會更差。",
  ],
  "時事": [
    "改善？你睇下過去十年改善咗乜？問題只會越積越多，而解決方案永遠係「稍後跟進」。",
    "發聲有用嘅話，呢啲問題一早就解決咗。現實係：你嘅聲音喺算法入面連一粒灰塵都不如。",
    "呢件事會同所有嘅社會議題一樣：熱三日，然後冇人記得。下個禮拜又有新嘅荒謬事件取代佢。",
  ],
  "科技": [
    "機遇？對有錢人嚟講先係機遇。普通人只會被AI取代然後失業。Digital divide只會越嚟越大。",
    "新工種？即係由一份穩定嘅工變成三份freelance加零保障。進步嘅只有資本家嘅利潤。",
    "每次有人話「危中有機」，最後有機嗰個永遠唔係你。醒醒啦。",
  ],
  "娛樂": [
    "本地創作？你睇下佢哋嘅budget同質素就知。唔係唔支持，係真係冇嘢值得支持。好嘅人才全部走晒。",
    "下次都唔會好。因為decision makers唔會換，啲人唔肯承認自己水平差。呢個cycle會一直重複。",
    "笑？我已經笑唔出。呢個唔係comedy，係tragedy扮comedy。但全場只有我察覺到。",
  ],
  "吹水": [
    "百花齊放？其實九成都係廢post。真正有營養嘅內容已經被meme同情緒帖淹沒。呢度只係一個巨型echo chamber。",
    "社區？大家只係喺度互相發洩而已。傾完又傾，問題一個都冇解決。明日覆明日。",
    "呢個地方嘅存在只係證明咗大家都好得閒。如果將呢啲時間拎去做正經嘢..算啦，都係嘥氣。",
  ],
};

export function generateDebate(post: Pick<Post, "title" | "content" | "category">): AIDebate {
  const hash = simpleHash(post.title);
  const optTemplates = OPTIMIST_TEMPLATES[post.category] || OPTIMIST_TEMPLATES["吹水"];
  const pesTemplates = PESSIMIST_TEMPLATES[post.category] || PESSIMIST_TEMPLATES["吹水"];
  return {
    optimist: optTemplates[hash % optTemplates.length],
    pessimist: pesTemplates[(hash + 1) % pesTemplates.length],
  };
}

// ============================================================
// AI Clickbait Rewriter
// ============================================================

const CLICKBAIT_PREFIXES = [
  "震驚！", "崩潰！", "離譜到爆！", "全城轟動！",
  "你唔會信！", "嚇到瞓唔著！", "絕望！", "癲咗！",
  "荒謬！", "忍唔住要講！", "爆料！", "緊急！",
];

const CLICKBAIT_SUFFIXES = [
  "網民嬲到想掀枱",
  "全香港都嬲爆",
  "睇完冇人唔嬲",
  "巴打紛紛表示RIP",
  "真相令人心寒",
  "結局出人意料",
  "全城熱議中",
  "更新：情況比想像更嚴重",
  "專家都睇唔過眼",
  "仲有人話正常？",
  "你仲唔分享出去？",
  "後續發展超離譜",
];

const CLICKBAIT_INTENSIFIERS: Record<string, string[]> = {
  "返工": ["老細竟然咁講", "HR嘅反應令人心寒", "打工仔血淚控訴"],
  "感情": ["對方竟然咁做", "真相令人崩潰", "過來人嘅忠告"],
  "飲食": ["食完先知中伏", "黑店手法曝光", "業內人士爆料"],
  "時事": ["官方零回應", "影片瘋傳全城", "市民忍無可忍"],
  "科技": ["用家踩中陷阱", "專家發出警告", "你嘅個人資料可能已經外洩"],
  "娛樂": ["粉絲嬲到退follow", "收視跌到見骨", "圈中人匿名爆料"],
  "吹水": ["巴打嘅回覆笑死人", "成個thread爆咗", "Admin都睇唔過眼"],
};

export function generateClickbait(post: Pick<Post, "title" | "category">): string {
  const hash = simpleHash(post.title);
  const prefix = CLICKBAIT_PREFIXES[hash % CLICKBAIT_PREFIXES.length];
  const suffix = CLICKBAIT_SUFFIXES[(hash + 3) % CLICKBAIT_SUFFIXES.length];
  const intensifiers = CLICKBAIT_INTENSIFIERS[post.category] || CLICKBAIT_INTENSIFIERS["吹水"];
  const intensifier = intensifiers[(hash + 5) % intensifiers.length];

  // Take the core subject from original title (first ~15 chars) and rewrite
  const core = post.title.length > 20 ? post.title.slice(0, 20) + "..." : post.title;
  return `${prefix}${core} ${intensifier}！${suffix}`;
}

// ============================================================
// Mood matching — maps moods to post characteristics
// ============================================================

export type Mood = "laugh" | "angry" | "popcorn" | "chill" | "cry";

export function matchesMood(post: Post, mood: Mood): boolean {
  const r = post.reactions;
  const total = r.fire + r.cringe + r.rofl + r.dead + r.chill + r.rage;
  if (total === 0) return true;

  switch (mood) {
    case "laugh":
      // High rofl ratio or high cringe (so bad it's funny)
      return (r.rofl / total > 0.15) || (r.cringe / total > 0.2 && r.rofl / total > 0.1);
    case "angry":
      // High rage or negative sentiment
      return (r.rage / total > 0.15) || post.sentiment === "negative" || post.sentiment === "explosive";
    case "popcorn":
      // High engagement, dramatic content — explosive or very high total
      return post.sentiment === "explosive" || total > 3000 || post.heat > 90;
    case "chill":
      // High chill ratio, positive sentiment
      return (r.chill / total > 0.15) || post.sentiment === "positive";
    case "cry":
      // High dead ratio, sad/emotional content
      return (r.dead / total > 0.2) || (post.sentiment === "negative" && r.dead > r.rage);
    default:
      return true;
  }
}

// ============================================================
// Meme Card Generator — visual meme card per post
// ============================================================

const MEME_EMOJIS: Record<string, string[]> = {
  "返工": ["💀", "🏃", "😤", "🔥", "⚰️", "🤡"],
  "感情": ["💔", "🤡", "😭", "🔪", "👻", "💸"],
  "飲食": ["🤮", "💰", "🍜", "🐀", "🤬", "🍿"],
  "時事": ["🏚️", "🚇", "💀", "🤯", "📢", "😱"],
  "科技": ["🤖", "💸", "📱", "🧠", "⚠️", "🔮"],
  "娛樂": ["🎭", "🤡", "📺", "💩", "🎬", "😂"],
  "吹水": ["🍿", "👀", "🤔", "😂", "🗣️", "💬"],
};

const GRADIENTS = [
  "from-red-600 to-orange-500",
  "from-purple-600 to-pink-500",
  "from-blue-600 to-cyan-500",
  "from-emerald-600 to-teal-500",
  "from-amber-600 to-yellow-500",
  "from-rose-600 to-red-500",
  "from-indigo-600 to-purple-500",
  "from-pink-600 to-rose-500",
];

const SENTIMENT_GRADIENTS: Record<string, string> = {
  positive: "from-emerald-600 to-cyan-500",
  negative: "from-red-700 to-rose-500",
  neutral: "from-slate-600 to-gray-500",
  explosive: "from-orange-600 via-red-500 to-pink-600",
};

function extractMemeText(title: string): { topText: string; bottomText: string } {
  // Split title roughly in half at a natural break point
  const mid = Math.floor(title.length / 2);
  // Find nearest space/punctuation near midpoint
  let splitAt = mid;
  for (let i = mid; i < Math.min(mid + 15, title.length); i++) {
    if (" ，。！？、".includes(title[i])) {
      splitAt = i + 1;
      break;
    }
  }
  for (let i = mid; i > Math.max(mid - 15, 0); i--) {
    if (" ，。！？、".includes(title[i])) {
      splitAt = i + 1;
      break;
    }
  }

  const top = title.slice(0, splitAt).trim();
  const bottom = title.slice(splitAt).trim();

  // If split failed, just use the whole title
  if (!bottom) return { topText: title, bottomText: "" };
  return { topText: top, bottomText: bottom };
}

export function generateMemeCard(post: Pick<Post, "title" | "category" | "sentiment">): {
  topText: string;
  bottomText: string;
  emoji: string;
  gradient: string;
} {
  const hash = simpleHash(post.title);
  const emojis = MEME_EMOJIS[post.category] || MEME_EMOJIS["吹水"];
  const emoji = emojis[hash % emojis.length];
  const gradient = SENTIMENT_GRADIENTS[post.sentiment] || GRADIENTS[hash % GRADIENTS.length];
  const { topText, bottomText } = extractMemeText(post.title);

  return { topText, bottomText, emoji, gradient };
}

// ============================================================
// Utility
// ============================================================

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
