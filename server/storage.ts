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
        title: "老細叫我OT到凌晨3點 第二日9點照返 仲話係「團隊精神」",
        content: "頂唔順喇真係！連續一個月每日OT到凌晨2-3點，第二朝9點照返工。問老細攞番啲補假，佢話「呢個就係startup嘅精神」「你唔肯捱就唔好做」。最離譜係佢自己每日5點準時收工！我份contract寫明朝9晚6，而家等於每日做18個鐘但得一份糧。想辭職但驚搵唔到工。有冇巴打試過勞工處投訴？有冇用？",
        summary: "打工仔被迫通宵OT無補水，老細自己準時走人...",
        category: "返工",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 98,
        commentCount: 2341,
        createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        reactions: { fire: 567, cringe: 89, rofl: 34, dead: 890, chill: 5, rage: 1234 },
      },
      {
        title: "揭發女友同時拍緊3個 仲用我張信用卡碌爆",
        content: "我同女朋友拍咗一年幾，一直覺得好sweet。直到尋日佢電話彈咗幾個通知出嚟，我先發現佢同時同3個男人拍緊。最離譜係佢仲用我張副卡去同其他男人食飯買嘢！碌咗成$8萬幾蚊！我confronted佢，佢竟然話「你有乜資格管我」仲反過嚟話我查佢電話侵犯私隱。我而家真係想死。呢$8萬點算？可唔可以追返？",
        summary: "被女友腳踏三船兼碌爆信用卡$8萬，巴打崩潰...",
        category: "感情",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 99,
        commentCount: 4567,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        reactions: { fire: 234, cringe: 567, rofl: 123, dead: 2345, chill: 8, rage: 1890 },
      },
      {
        title: "食完$2800嘅omakase 發現啲魚係急凍貨 黑店！",
        content: "朋友生日去咗中環一間新開嘅omakase，每位$2800，14道菜。食到第三道嗰陣我已經覺得唔對路，啲三文魚明顯係急凍解凍嘅質感。個師傅仲扮到好專業咁介紹「今朝空運到港」，我做開餐飲嘅一試就知係假。最癲係佢哋嗰個「宮崎A5和牛」根本就係普通美國牛扮嘅！問佢攞certificate佢支吾以對。$2800食急凍貨，搵鬼都唔會再去！已經report咗消委會。",
        summary: "中環$2800 omakase被揭用急凍魚扮空運，A5和牛疑造假...",
        category: "飲食",
        source: "OpenRice",
        sourceUrl: "https://lihkg.com",
        heat: 96,
        commentCount: 1890,
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        reactions: { fire: 890, cringe: 456, rofl: 234, dead: 123, chill: 3, rage: 2345 },
      },
      {
        title: "剛被裁員 37歲IT人 供緊$2萬樓 老婆懷孕 點算",
        content: "今朝返到公司就被HR叫入房，話restructure要裁走我哋成個team。做咗6年，冇任何warning就炒。得一個月notice。而家每個月供樓$20,000、家用$8,000、保險$3,000，老婆仲大緊肚預產期下個月。戶口得$15萬。我而家手震到打唔到字。37歲轉行仲有冇機會？IT market而家好差，LinkedIn投咗50份都冇人覆。有冇巴打經歷過可以俾啲建議？",
        summary: "37歲IT人突被裁員，供樓加老婆待產壓力爆煲...",
        category: "返工",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 97,
        commentCount: 3456,
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        reactions: { fire: 123, cringe: 34, rofl: 5, dead: 3456, chill: 890, rage: 567 },
      },
      {
        title: "AI生成嘅假新聞瘋傳 阿媽forward咗20次俾我叫我小心",
        content: "今日收到阿媽狂send嘅WhatsApp，話「政府宣佈取消MPF！全部可以攞返！」仲有張好official嘅圖。我一check就知係AI生成嘅假新聞。同佢講係假嘅，佢反而話我「你唔好乜都唔信」「電視都有播」（根本冇播）。最恐怖係佢已經forward咗俾晒佢成個group，幾百個退休人士以為真。呢個AI deepfake問題越嚟越嚴重，政府做咗乜？",
        summary: "AI假新聞瘋傳長輩群組，假冒政府取消MPF公告...",
        category: "科技",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 94,
        commentCount: 1567,
        createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        reactions: { fire: 456, cringe: 890, rofl: 345, dead: 678, chill: 12, rage: 1234 },
      },
      {
        title: "200呎劏房月租$9800 仲要同老鼠共處 香港仲係人住嘅地方？",
        content: "搬咗入深水埗一間200呎劏房，月租$9,800。入住第一晚就見到兩隻老鼠喺廚房走嚟走去。同業主講佢話「呢度一向都有㗎」。冇窗，焗到成40度，開冷氣電費每月$1,500。洗手盤啲水係黃色嘅。最癲係呢個價仲算「抵」，隔離間250呎要$12,000。我每個月人工$18,000，交完租食飯都成問題。呢個城市到底仲有冇希望？",
        summary: "200呎劏房$9800月租老鼠為伴，打工仔絕望控訴...",
        category: "時事",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 99,
        commentCount: 5678,
        createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
        reactions: { fire: 345, cringe: 234, rofl: 56, dead: 4567, chill: 12, rage: 3456 },
      },
      {
        title: "MIRROR演唱會再出事 舞台裝置差啲跌落觀眾席",
        content: "尋晚MIRROR演唱會仲有人敢去？舞台側邊一塊LED panel突然鬆咗，差啲跌落去前排觀眾度。好彩被工作人員即時頂住。上次屏幕跌落嚟嘅事故先過咗幾耐？搞到阿Mo到而家都仲未復原！呢班搞手到底有冇吸取教訓？觀眾嘅命就咁唔值錢？MIRROR自己都唔出聲？失望！",
        summary: "MIRROR演唱會舞台裝置再鬆脫，觀眾安全受威脅...",
        category: "娛樂",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 98,
        commentCount: 6789,
        createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        reactions: { fire: 890, cringe: 345, rofl: 23, dead: 567, chill: 5, rage: 4567 },
      },
      {
        title: "同事偷咗我個idea去present 仲被升職 我就被PIP",
        content: "花咗成個月整嗰份proposal，私底下同個「好朋友」同事傾過。點知佢偷咗成份proposal直接present俾VP！仲加咗佢個名做lead author。VP大讚佢創新有能力，即場話考慮升佢做manager。我去complain，HR話「冇evidence證明係你原創」因為我用咗自己email draft冇用公司email。仲要而家佢做咗我上司，第一件事就係PIP我！我快癲！",
        summary: "同事偷proposal升職反PIP原創者，職場黑暗面...",
        category: "返工",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 97,
        commentCount: 3890,
        createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
        reactions: { fire: 678, cringe: 123, rofl: 45, dead: 1234, chill: 8, rage: 3456 },
      },
      {
        title: "港鐵今朝全線癱瘓 過百萬人遲到 CEO人工照袋$700萬",
        content: "今朝港鐵全線信號系統故障，由7點半到10點完全停頂。過百萬人遲到返工返學。巴士站迫到有人暈倒。的士坐地起價$500去中環。最離譜係港鐵CEO年薪$700萬，出嚟講句「不便之處敬請原諒」就算。港鐵年年加價年年蝕人命。罰款？最多罰$2500萬，CEO一個月糧都唔夠。呢個城市嘅交通系統已經完全崩潰。",
        summary: "港鐵全線癱瘓3小時，百萬市民受災CEO年薪$700萬...",
        category: "時事",
        source: "RTHK 港聞",
        sourceUrl: "https://lihkg.com",
        heat: 100,
        commentCount: 8901,
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        reactions: { fire: 2345, cringe: 890, rofl: 123, dead: 1567, chill: 3, rage: 6789 },
      },
      {
        title: "終極中伏！網紅推薦嘅「必食」餐廳 根本係paid ad",
        content: "睇咗個有50萬follower嘅foodie KOL推薦一間尖沙咀嘅意大利餐廳，話「全港最正嘅truffle pasta」。去到一試，$280一碟pasta得五條麵加兩片truffle，味道同出前一丁差唔多。之後先發現個KOL原來收咗$30,000做paid partnership但完全冇標明#ad。而家啲KOL為咗錢乜都敢講，害死人。已經report咗IG，但有冇用？",
        summary: "網紅收$3萬推薦劣質餐廳冇標ad，$280 pasta味同出前一丁...",
        category: "飲食",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 93,
        commentCount: 2345,
        createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
        reactions: { fire: 567, cringe: 1234, rofl: 890, dead: 345, chill: 5, rage: 1567 },
      },
      {
        title: "Bitcoin一夜暴跌40% 全副身家$200萬清零 想跳樓",
        content: "聽咗朋友講all in Bitcoin，將成副身家$200萬加埋借嘅$80萬全部買入。尋日一夜之間跌咗40%，margin call被強制平倉。而家唔單止$200萬冇晒，仲倒欠broker $30萬。我未同老婆講，佢仲以為我哋嘅首期錢仲喺度。下個月要簽臨約買樓。我真係諗過跳落去。有冇人可以幫我？",
        summary: "All in Bitcoin爆倉蝕清$200萬兼欠$30萬，求助巴打...",
        category: "科技",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 99,
        commentCount: 5678,
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        reactions: { fire: 89, cringe: 234, rofl: 56, dead: 5678, chill: 890, rage: 345 },
      },
      {
        title: "捉到老公同公司女同事開房 結婚先得兩年",
        content: "結婚兩年，以為好幸福。老公最近成日話要OT，我信以為真。直到尋日有個unknown number send咗張相俾我，係我老公同佢公司個女同事喺酒店門口攬住錫。我即刻去check佢信用卡statement，過去三個月佢開咗6次房，全部係同一間W Hotel。我而家坐喺律師樓等緊。兩年婚姻就係咁。仲有，個第三者竟然係之前我哋婚禮嘅伴娘。",
        summary: "結婚兩年老公偷食伴娘，W Hotel開房6次被抓包...",
        category: "感情",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 100,
        commentCount: 7890,
        createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
        reactions: { fire: 345, cringe: 890, rofl: 67, dead: 3456, chill: 12, rage: 5678 },
      },
      {
        title: "見到隔離屋啲人虐待隻狗 報警冇人理 點算",
        content: "過去一個月聽到隔離屋傳出狗叫聲越嚟越慘，由朝到晚都喺度叫。今日終於喺走廊撞到佢哋遛狗，隻金毛瘦到見骨，身上仲有傷痕。我影咗相報咗警同SPCA，警察話「呢啲係民事嘢」SPCA話「要安排人手上門了解」但一個禮拜都冇消息。隻狗越嚟越慘，而家連叫都冇力叫。我可以點做？有冇方法即時救到佢？",
        summary: "隔離屋疑虐狗金毛瘦到見骨，報警SPCA均無回應...",
        category: "時事",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 96,
        commentCount: 4567,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        reactions: { fire: 234, cringe: 123, rofl: 5, dead: 890, chill: 3, rage: 6789 },
      },
      {
        title: "ViuTV新劇爛到破紀錄 男主角演技似AI生成",
        content: "有冇人頂得順ViuTV嗰套新劇？男主角全程面癱冇表情，對白背到明顯到一個點。劇情更加離譜，第一集個角色仲係CEO，第二集突然變咗臥底，第三集又變返CEO？編劇係咪用ChatGPT寫劇本？最慘係ViuTV成日話自己係「創新」，但拍出嚟嘅嘢連TVB十年前都不如。$2000萬投資拍出嚟嘅垃圾。",
        summary: "ViuTV新劇被轟爛到極點，男主角面癱劇情混亂...",
        category: "娛樂",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 88,
        commentCount: 2345,
        createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
        reactions: { fire: 123, cringe: 2345, rofl: 1890, dead: 567, chill: 8, rage: 345 },
      },
      {
        title: "阿媽逼我30歲前結婚 唔結就趕我出屋企",
        content: "我今年28歲女仔，有份穩定嘅工。阿媽最近日日催婚，話「你30歲仲未嫁就冇人要」「隔離陳太個女25歲就嫁咗」。我話我未ready，佢就發晒癲話「你30歲之前唔結婚就搬出去」。我而家月入$22K，點負擔得起出去住？阿媽仲幫我arrange咗5個相親，其中一個係46歲離過婚嘅。呢個年代仲興逼婚？",
        summary: "28歲女被母親逼婚威脅趕出屋企，安排46歲離婚男相親...",
        category: "感情",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 95,
        commentCount: 3456,
        createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        reactions: { fire: 567, cringe: 1234, rofl: 890, dead: 678, chill: 34, rage: 2345 },
      },
      {
        title: "網購iPhone 16 Pro Max收到磚頭 PO寶話賣家已離線",
        content: "喺PO寶用$6800買咗部iPhone 16 Pro Max，個listing寫住「全新未開封行貨」。收到打開個盒原來入面係兩塊磚頭加一張紙寫住「多謝光顧」。即刻contact平台客服，等咗3個鐘先有人覆。覆完話「賣家已離線，需要14個工作天調查」。$6800就咁冇咗！平台零保障。已經報警，但差人都話追唔返機會好低。",
        summary: "網購$6800 iPhone收到磚頭，平台推卸責任賣家消失...",
        category: "科技",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 92,
        commentCount: 2890,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        reactions: { fire: 345, cringe: 678, rofl: 1234, dead: 890, chill: 5, rage: 2345 },
      },
      {
        title: "Foodpanda外賣員被車撞 公司話佢係「自僱人士」唔關佢事",
        content: "我朋友做Foodpanda外賣員，尋日送餐途中被的士撞到，斷咗隻手。去到醫院先發現Foodpanda冇幫佢買勞保，公司話佢係「independent contractor」所以冇醫療保障。佢每日送12個鐘，時薪計落得$35，而家斷手要休息三個月，一蚊收入都冇。平台每單抽40%佣金但出事就話唔關佢事？呢個gig economy根本係新時代奴隸制！",
        summary: "外賣員送餐被撞斷手，Foodpanda拒絕承認僱傭關係...",
        category: "時事",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 97,
        commentCount: 4890,
        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        reactions: { fire: 890, cringe: 234, rofl: 12, dead: 1567, chill: 5, rage: 5678 },
      },
      {
        title: "TVB台慶劇竟然抄Netflix韓劇 一模一樣！",
        content: "有冇人睇緊TVB嗰套台慶劇？我睇到第二集已經覺得好熟口熟面。返去翻睇Netflix嗰套韓國劇《The Glory》，TVB直接抄足劇情！連角色設定都一樣：女主角童年被欺凌，長大後逐個報復。分別得主角由韓國人變咗香港人。佢哋改都唔改就照搬？仲要大大隻字寫「原創劇本」？恥唔恥呀？",
        summary: "TVB台慶劇被揭抄足Netflix韓劇《The Glory》劇情...",
        category: "娛樂",
        source: "社交熱話",
        sourceUrl: "https://lihkg.com",
        heat: 91,
        commentCount: 3567,
        createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
        reactions: { fire: 567, cringe: 1890, rofl: 1234, dead: 456, chill: 23, rage: 890 },
      },
      {
        title: "全家去食buffet俾人歧視 因為我哋著得唔夠靚",
        content: "生日帶阿媽去尖沙咀一間五星酒店食Sunday brunch buffet，每位$688。入到去個經理明顯嫌我哋著得casual，安排我哋坐喺最入面近廁所嗰張枱。隔離著西裝嗰啲就坐window seat。叫waiter落單等咗成20分鐘冇人理。最後我去complain，個經理話「我哋嘅座位安排係按預約時間」但我明明係最早book嘅！$688一個人就係買呢種待遇？",
        summary: "五星酒店$688 buffet因衣著被歧視安排廁所旁座位...",
        category: "飲食",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 94,
        commentCount: 3456,
        createdAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
        reactions: { fire: 678, cringe: 567, rofl: 234, dead: 345, chill: 12, rage: 3456 },
      },
      {
        title: "搭Uber去機場 司機兜大圈收$580 正常得$180",
        content: "趕飛機搭Uber由九龍塘去機場，正常行應該$180左右。個司機一上車就話「今日好塞車我行另一條路」，然後兜咗去青衣、荃灣、再上屯門先入機場！全程個meter跳到$580！我投訴Uber，佢哋退咗$100算數。$100？兜多咗$400路你退$100？呢個平台根本冇人監管。差啲仲趕唔切flight。",
        summary: "Uber司機兜路去機場$180變$580，平台僅退$100...",
        category: "吹水",
        source: "連登",
        sourceUrl: "https://lihkg.com",
        heat: 89,
        commentCount: 1890,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        reactions: { fire: 456, cringe: 890, rofl: 567, dead: 234, chill: 8, rage: 2345 },
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
      { postId: 1, content: "勞工處投訴啦巴打！呢啲已經違法！唔好再忍！" },
      { postId: 1, content: "我上間公司都係咁，走咗先係最正確嘅決定" },
      { postId: 1, content: "記得保留晒啲WhatsApp record做evidence先好走" },
      { postId: 2, content: "巴打你仲唔跑？呢條女根本當你ATM！" },
      { postId: 2, content: "嗰$8萬可以告佢架，副卡消費你有權追" },
      { postId: 2, content: "RIP 巴打...呢個世界真係太黑暗" },
      { postId: 4, content: "巴打頂住！37歲IT好多公司請㗎" },
      { postId: 4, content: "先唔好慌，即刻apply遣散費同長期服務金" },
      { postId: 6, content: "香港已經唔係人住嘅地方 移民啦大佬" },
      { postId: 6, content: "呢個政府只係幫地產商，市民死活佢唔理" },
      { postId: 9, content: "港鐵CEO一個月糧夠你搭十年車 佢唔痛唔癢" },
      { postId: 9, content: "今朝遲到被扣$500 港鐵你賠唔賠？" },
      { postId: 12, content: "巴打保重！錢可以再搵 人冇咗就乜都冇" },
      { postId: 12, content: "快啲同老婆坦白 越遲越難收拾" },
      { postId: 11, content: "即刻打999！如果隻狗有即時危險警察一定要處理" },
      { postId: 11, content: "post上動物權益group啦 佢哋有律師幫手" },
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
