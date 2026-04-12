import type { Post, Comment, Category, Reactions, ReactionType, User, Session } from "@shared/schema";
import { generateSummary } from "./summarizer";
import { analyzeSentiment } from "./sentiment";
import { recordSnapshot, calculateTrendScore, calculateTrendDirection } from "./trending";
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
    this.seedMockData();
  }

  private seedMockData() {
    const mockPosts: Omit<Post, "id" | "sentiment" | "trendDirection" | "trendScore">[] = [
      {
        title: "點解而家啲後生仔咁鍾意飲手沖？",
        content: "最近發現身邊好多朋友都開始自己買手沖壺，仲成日post啲咖啡相上IG。以前唔係淨係飲奶茶咩？而家個個都變咗咖啡師咁。有冇人同我一樣覺得手沖其實好廢？定係真係好好飲？我試過一次，味道同出面買嘅都差唔多喎。不過可能係我個技術問題。有冇巴打可以教下？",
        summary: "後生仔興起手沖咖啡熱潮，有人質疑係咪真係好飲...",
        category: "吹水",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 87,
        commentCount: 234,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        reactions: { fire: 89, cringe: 12, rofl: 45, dead: 23, chill: 67, rage: 8 },
      },
      {
        title: "返工遇到咁嘅同事你點頂？",
        content: "我間公司有個同事，成日遲到但又最早走。每次開會都話自己做咗好多嘢，但實際上乜都冇做過。最癲係佢仲成日搶其他人嘅credit。老闆又鍾意佢，次次都升佢。我哋呢班做死嘅就冇人理。大家有冇類似經歷？點樣應對呢種人？",
        summary: "打工仔控訴職場上搶credit嘅同事，引發熱議...",
        category: "返工",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 95,
        commentCount: 567,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        reactions: { fire: 234, cringe: 45, rofl: 12, dead: 189, chill: 23, rage: 15 },
      },
      {
        title: "深水埗掃街路線推介 必食清單",
        content: "禮拜日同朋友去咗深水埗掃街，由基隆街食到北河街，搵到幾間好正嘅小店。首先係嗰間開咗幾十年嘅腸粉舖，豉油同辣椒醬一流。然後去咗一間新開嘅台式飲品店，佢哋嘅芋頭鮮奶真係好正。最後去咗鴨寮街附近一間小巷嘅咖哩魚蛋，辣到飛起但好好食！想知完整路線嘅就留言啦。",
        summary: "網民分享深水埗掃街攻略，推薦腸粉舖、台飲、咖哩魚蛋...",
        category: "飲食",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 78,
        commentCount: 189,
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        reactions: { fire: 156, cringe: 8, rofl: 23, dead: 5, chill: 234, rage: 3 },
      },
      {
        title: "女朋友嫌我揸唔起車 應唔應該借錢買？",
        content: "拍拖兩年嘅女朋友最近成日話佢朋友個男朋友揸咩車咩車，暗示我冇車好丟架。我份工得兩萬幾蚊人工，租金都使晒一半，邊度有錢買車？佢仲話如果半年內唔買就分手。我有諗過借錢買，但又驚供唔起。大家覺得呢段關係仲值唔值得維持？",
        summary: "月入兩萬被女友嫌冇車，面臨分手危機...",
        category: "感情",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 92,
        commentCount: 891,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        reactions: { fire: 67, cringe: 234, rofl: 89, dead: 456, chill: 12, rage: 78 },
      },
      {
        title: "ChatGPT出咗新model又貴咗 仲值唔值得俾錢？",
        content: "OpenAI出咗最新嘅model，月費加到$20美金。用咗幾個月覺得佢真係好勁，做功課、寫code、翻譯都好方便。但最近發現免費版其實都夠用，除非你成日要generate圖片。大家覺得值唔值得continue subscribe？有冇其他平台推薦？",
        summary: "網民討論ChatGPT新model是否物有所值...",
        category: "科技",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 71,
        commentCount: 156,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        reactions: { fire: 45, cringe: 23, rofl: 34, dead: 12, chill: 56, rage: 9 },
      },
      {
        title: "有冇人覺得而家啲樓價癲到冇得頂？",
        content: "300呎嘅單位都要500萬，連納米樓都買唔起。呢一代嘅年輕人真係冇希望上車。有人話等跌，但等咗十幾年都係咁貴。政府話起公屋但又起唔夠。而家仲要通關之後多咗好多人返嚟買樓，供應仲少埋。大家覺得樓價仲會唔會繼續升？",
        summary: "港青哀嘆樓價高企，300呎單位500萬令人絕望...",
        category: "時事",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 88,
        commentCount: 432,
        createdAt: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
        reactions: { fire: 178, cringe: 89, rofl: 23, dead: 345, chill: 34, rage: 56 },
      },
      {
        title: "MIRROR成員Solo歌邊首最正？",
        content: "最近幾個MIRROR成員都出咗Solo歌，有啲真係幾好聽。姜B嗰首好chill，Jer嗰首好有feel，Anson Lo嗰首好洗腦。不過都有人話佢哋唱功其實一般。大家覺得邊個唱得最好？除咗靚仔之外，邊個真係有實力？",
        summary: "網民熱議MIRROR成員Solo作品，票選最佳...",
        category: "娛樂",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 83,
        commentCount: 678,
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
        reactions: { fire: 234, cringe: 12, rofl: 56, dead: 23, chill: 567, rage: 18 },
      },
      {
        title: "公司IT部門啲人係咪全部都社恐？",
        content: "我做marketing嘅，有嘢要搵IT幫手就好怕。每次send email俾佢哋都唔覆，打電話又唔聽。行過去搵佢哋就戴住headphone扮聽唔到。好不容易搵到個肯幫我，但全程唔望我一眼。係咪做IT嘅人都係咁㗎？定係我哋公司特別離譜？",
        summary: "打工仔抱怨IT部門同事社恐，溝通困難...",
        category: "返工",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 76,
        commentCount: 345,
        createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
        reactions: { fire: 56, cringe: 34, rofl: 567, dead: 89, chill: 23, rage: 42 },
      },
      {
        title: "今日西九龍出咗咩事？成條路塞晒",
        content: "頭先經過西九龍發現成條路都封晒，好多警車同消防車。有冇住附近嘅巴打知道發生咩事？我趕住返工遲到咗成個鐘。搭的士兜路都兜唔到，最後要行路去地鐵站。呢排西九龍好多事發生，安全問題真係要關注下。",
        summary: "西九龍疑有突發事件，交通大受影響...",
        category: "時事",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 94,
        commentCount: 234,
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        reactions: { fire: 123, cringe: 345, rofl: 5, dead: 12, chill: 8, rage: 67 },
      },
      {
        title: "分享下最近煲緊咩劇",
        content: "最近Netflix出咗好多新劇，但唔知睇邊套好。我自己就煲緊一套韓劇，講殺人犯嘅心理，幾dark但好好睇。之前煲完日劇《重啟人生》，真係笑到碌地。大家有冇好介紹？最好係crime、thriller類型。唔好推薦愛情劇，受夠晒。",
        summary: "Netflix劇荒求推薦，偏好crime thriller類型...",
        category: "娛樂",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 65,
        commentCount: 289,
        createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
        reactions: { fire: 34, cringe: 12, rofl: 45, dead: 8, chill: 189, rage: 5 },
      },
      {
        title: "用咗iPhone 16 Pro一個月嘅真實感受",
        content: "上個月換咗iPhone 16 Pro，本來好期待。不過用落先發現同iPhone 15 Pro真係差唔多。相機係好咗少少，但日常用根本睇唔出分別。個Camera Control button我用咗兩日就冇再撳。電池續航力確實好咗，呢個係最大upgrade。大家覺得值唔值得升級？",
        summary: "iPhone 16 Pro用家分享一個月使用心得...",
        category: "科技",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 68,
        commentCount: 198,
        createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
        reactions: { fire: 23, cringe: 8, rofl: 34, dead: 12, chill: 45, rage: 6 },
      },
      {
        title: "終於同拍咗五年嘅女朋友求婚成功！",
        content: "今日係我哋拍拖五週年，揀咗喺太平山頂求婚。雖然個天氣唔係好好，但佢一見到隻戒指就喊咗出嚟。我預備咗半年，偷偷買咗隻戒指，仲約埋佢啲friend去幫手拍低成個過程。多謝連登巴打之前俾嘅意見！婚禮打算年底搞，有冇場地推薦？",
        summary: "拍拖五年巴打太平山頂求婚成功，連登齊祝福...",
        category: "感情",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 91,
        commentCount: 1023,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        reactions: { fire: 89, cringe: 23, rofl: 12, dead: 5, chill: 1567, rage: 2 },
      },
      {
        title: "觀塘工廈cafe最新推薦 周末好去處",
        content: "觀塘啲工廈cafe越開越多，上個禮拜試咗三間新嘅。第一間喺駱駝漆大廈，裝修好靚，啲甜品好精緻。第二間喺巧明街嗰邊，主打手沖咖啡，環境好chill。第三間係一間結合書店同cafe嘅concept store，可以邊飲嘢邊睇書。價錢都OK，$40-60一杯咖啡。",
        summary: "觀塘工廈cafe三間新店推薦，打卡好去處...",
        category: "飲食",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 72,
        commentCount: 145,
        createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
        reactions: { fire: 67, cringe: 5, rofl: 12, dead: 3, chill: 234, rage: 1 },
      },
      {
        title: "第一次做freelance接到單大project好緊張",
        content: "做咗三年full-time developer，上個月辭咗職轉做freelance。今日竟然接到第一單大project，客戶要我幫佢做個完整嘅電商網站。預算都OK但deadline好趕，得三個禮拜。有冇巴打做開freelance可以分享下經驗？特別係報價同管理客戶期望方面。",
        summary: "新手freelance developer接到大單，向連登取經...",
        category: "返工",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 69,
        commentCount: 201,
        createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
        reactions: { fire: 123, cringe: 12, rofl: 8, dead: 5, chill: 89, rage: 4 },
      },
      {
        title: "頂唔順啲家長group 成日要人回覆收到",
        content: "個仔返學之後被加入咗五六個家長WhatsApp group，每日幾百條message。啲家長成日forward啲假新聞，仲要你reply「收到」。唔覆就被人話唔合群。有次我忘記reply，第二日個班主任仲打嚟問我係咪有咩事。呢個世界真係癲。大家點應對㗎？",
        summary: "家長WhatsApp group地獄，回覆壓力引發共鳴...",
        category: "吹水",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 85,
        commentCount: 456,
        createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
        reactions: { fire: 78, cringe: 56, rofl: 345, dead: 234, chill: 12, rage: 33 },
      },
      {
        title: "港鐵又壞！觀塘線延誤半個鐘",
        content: "今朝返工搭觀塘線，喺彩虹站停咗成半個鐘唔開門。廣播話「列車服務受阻，請耐心等候」但咩原因都唔講。車廂入面迫到爆，又熱又焗。最後要行出嚟搭巴士。港鐵年年加價但服務越嚟越差。大家今日有冇受影響？",
        summary: "觀塘線故障延誤半小時，乘客怨聲載道...",
        category: "時事",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 90,
        commentCount: 567,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        reactions: { fire: 345, cringe: 123, rofl: 56, dead: 89, chill: 5, rage: 99 },
      },
      {
        title: "想學廣東話嘅外國朋友推薦睇咩？",
        content: "有個英國friend話想學廣東話，問我有咩推薦。我自己諗咗幾樣：首先係睇周星馳嘅戲，可以學到好多地道表達。然後推薦佢聽廣東歌，由陳奕迅開始。最後建議佢follow幾個YouTube channel教廣東話嘅。大家有冇其他好建議？要趣味同實用並重嘅。",
        summary: "外國朋友想學粵語，連登集思廣益推薦教材...",
        category: "吹水",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 74,
        commentCount: 178,
        createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
        reactions: { fire: 45, cringe: 8, rofl: 67, dead: 5, chill: 123, rage: 7 },
      },
      {
        title: "荃灣新開嘅日式燒肉放題 $298食到飽",
        content: "尋日同朋友去咗荃灣新開嗰間日式燒肉放題，每位$298，90分鐘食到飽。牛肉質素OK，有和牛同埋牛舌。不過海鮮就一般，蝦唔夠新鮮。甜品有soft cream任食，幾正。整體嚟講呢個價錢算抵食，但唔好expect太高質素。建議booking去，walk-in要等成個鐘。",
        summary: "荃灣新燒肉放題$298評測，性價比尚可...",
        category: "飲食",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 73,
        commentCount: 167,
        createdAt: new Date(Date.now() - 1000 * 60 * 270).toISOString(),
        reactions: { fire: 89, cringe: 5, rofl: 12, dead: 3, chill: 156, rage: 2 },
      },
      {
        title: "有冇人試過用AI幫自己寫情書？",
        content: "我唔係好識表達感情嗰種人，但下個禮拜係女朋友生日。諗住用ChatGPT幫我寫封情書，但又驚被發現好假。試咗幾次，佢寫出嚟嘅嘢真係好formal，完全唔似我講嘢嘅方式。有冇巴打試過？點樣先可以make到佢寫得自然啲？定係應該自己寫？",
        summary: "打工仔想用AI寫情書但怕穿崩，求救連登...",
        category: "感情",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 79,
        commentCount: 234,
        createdAt: new Date(Date.now() - 1000 * 60 * 330).toISOString(),
        reactions: { fire: 34, cringe: 12, rofl: 456, dead: 89, chill: 56, rage: 22 },
      },
      {
        title: "Steam夏季特賣又嚟啦 有咩必買？",
        content: "Steam Summer Sale開始啦，好多遊戲都減到癲。暫時買咗Baldur's Gate 3同Elden Ring，都係半價。仲考慮緊買唔買Cyberpunk 2077嘅DLC。大家有冇推薦？預算大概$500左右。最好係可以打好耐嗰種，因為我暑假有排時間。",
        summary: "Steam夏季特賣開催，巴打分享必買清單...",
        category: "科技",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 82,
        commentCount: 312,
        createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
        reactions: { fire: 234, cringe: 12, rofl: 34, dead: 8, chill: 89, rage: 11 },
      },
      {
        title: "究竟做銀行好定做startup好？",
        content: "今年畢業，手上有兩個offer。一個係大銀行嘅MT programme，人工$28K，穩定但聽聞好辛苦。另一個係間fintech startup，人工$25K但有share option，聽聞文化好自由。家人都話做銀行好，但我自己比較想去startup。大家覺得呢？尤其係做過呢兩種嘅巴打。",
        summary: "畢業生面對銀行MT vs Startup抉擇...",
        category: "返工",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 80,
        commentCount: 389,
        createdAt: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
        reactions: { fire: 67, cringe: 23, rofl: 12, dead: 34, chill: 45, rage: 8 },
      },
      {
        title: "分手後發現前度已經拍緊新嘢",
        content: "分咗手兩個禮拜，今日喺IG見到前度已經同第二個出街。雖然係佢提出分手，但我都覺得好快。係咪一早就有？定係我諗多咗？朋友叫我唔好再睇佢IG，但我控制唔到自己。有冇人可以分享下點樣走出嚟？我真係好唔開心。",
        summary: "分手兩周前度已有新歡，網民安慰鼓勵...",
        category: "感情",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 86,
        commentCount: 567,
        createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        reactions: { fire: 23, cringe: 89, rofl: 12, dead: 156, chill: 234, rage: 44 },
      },
      {
        title: "大埔行山路線推介 新手都啱",
        content: "上個weekend同朋友行咗大埔滘自然護理區，全程大約2個鐘，新手都行到。沿途有好多大樹，好涼爽，完全唔覺得辛苦。最正係行到半路有條小溪，可以浸下腳休息。落山之後去咗大埔墟食車仔麵做ending，完美嘅一日。推薦俾想開始行山嘅朋友！",
        summary: "大埔行山靚路線推介，2小時輕鬆行...",
        category: "吹水",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 62,
        commentCount: 123,
        createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
        reactions: { fire: 56, cringe: 3, rofl: 8, dead: 2, chill: 178, rage: 1 },
      },
      {
        title: "最近啲外賣平台越嚟越貴 仲有人叫？",
        content: "以前叫Foodpanda同Deliveroo仲算OK，依家加埋運費同服務費分分鐘貴過堂食。一碗$45嘅牛腩麵，叫外賣要$68。都唔知點解仲有咁多人叫。係咪大家都懶到唔願意落街？我自己已經改咗帶飯返工，省返唔少。",
        summary: "外賣平台加價潮引不滿，叫外賣費用直逼堂食...",
        category: "吹水",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 77,
        commentCount: 289,
        createdAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
        reactions: { fire: 123, cringe: 45, rofl: 67, dead: 89, chill: 12, rage: 31 },
      },
    ];

    // Assign and store posts with generated summaries + sentiment + trending
    for (const post of mockPosts) {
      const id = this.nextPostId++;
      const summary = generateSummary(post.title, post.content);
      const sentiment = analyzeSentiment(post.title, post.content, post.heat, post.reactions);
      const fullPost: Post = { ...post, id, summary, sentiment, trendDirection: "steady", trendScore: 0 };
      recordSnapshot(fullPost);
      fullPost.trendScore = calculateTrendScore(fullPost);
      fullPost.trendDirection = calculateTrendDirection(fullPost);
      this.posts.set(id, fullPost);
    }

    // Add some mock comments
    const mockComments: { postId: number; content: string }[] = [
      { postId: 2, content: "同感！我公司都有個咁嘅人" },
      { postId: 2, content: "直接同老闆講啦，唔好受氣" },
      { postId: 2, content: "呢啲人遲早會被人發現㗎" },
      { postId: 4, content: "分手啦巴打，呢種女唔值得" },
      { postId: 4, content: "兩萬幾蚊買車？供完車你食乜？" },
      { postId: 1, content: "手沖要講technique㗎，唔係齋沖落去就得" },
      { postId: 12, content: "恭喜恭喜！幾時飲？" },
      { postId: 12, content: "太平山頂求婚好浪漫呀" },
    ];

    for (const c of mockComments) {
      const id = this.nextCommentId++;
      this.comments.set(id, {
        id,
        postId: c.postId,
        nickname: generateNickname(),
        content: c.content,
        createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(),
        likes: Math.floor(Math.random() * 50),
      });
    }
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
      sentiment: analyzeSentiment(post.title, post.content, 50, reactions),
      trendDirection: "up",
      trendScore: 0,
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
