import type { Post } from "@shared/schema";

export interface AIPersona {
  name: string;
  avatar: string;    // emoji
  nickname: string;  // display in comments
  style: string;     // internal descriptor
}

export const AI_PERSONAS: AIPersona[] = [
  { name: "uncle", avatar: "👴", nickname: "鍵盤戰士阿伯", style: "angry boomer" },
  { name: "zen", avatar: "🧘", nickname: "佛系師兄", style: "zen detachment" },
  { name: "hr", avatar: "💼", nickname: "HR小姐", style: "corporate gaslighting" },
  { name: "conspiracy", avatar: "🕵️", nickname: "陰謀論叔叔", style: "conspiracy theorist" },
  { name: "genz", avatar: "✌️", nickname: "00後妹妹", style: "gen z vibes" },
];

// Each persona has templates per category. {title} is replaced with a snippet from the post title.
const PERSONA_COMMENTS: Record<string, Record<string, string[]>> = {
  uncle: {
    "返工": [
      "我嗰個年代邊有OT呢樣嘢？做到做完就走！而家啲後生仔就係太軟弱！",
      "以前我做嘢一日16個鐘，連假期都冇，但我供完層樓！你哋呢？淨係識投訴！",
      "呢個社會已經冇晒希望！我60歲都仲要返工，你37歲投咩訴？",
      "老細唔好做㗎！你以為開公司好容易？我試過蝕到褲都穿！",
    ],
    "感情": [
      "我同老婆結咗40年，秘訣就係：唔好聽佢講嘢。成個世界就太平。",
      "而家啲後生女全部都係咁㗎！我嗰個年代邊有人敢咁做？家教問題！",
      "分手就分手啦，使乜搞到成個世界都知？我嗰代有事自己消化！",
      "我同你講，感情呢家嘢全部都係假嘅。只有銀行戶口入面嗰啲數字先係真。",
    ],
    "飲食": [
      "幾百蚊食餐飯？癲咗？我去茶記食個常餐$42，仲飽過你！",
      "以前大牌檔$5一碗雲吞麵，而家？$60都唔夠！呢個世界癲咗！",
      "食乜嘢KOL推薦？我推薦你自己煮！又平又衛生！年輕人就係懶！",
      "我食咗60年嘢，從來都唔使人推薦。用鼻聞一聞就知好唔好食！",
    ],
    "時事": [
      "呢啲嘢喺我嗰個年代係唔會發生嘅！社會退步到咁，我真係心痛！",
      "我話你知，呢個世界只會越嚟越差。我已經冇晒期望。認命啦。",
      "邊個話香港好嘅？出嚟我同佢講兩句！我喺呢度住咗60年，而家係最差！",
      "以前啲官員起碼扮下做嘢，而家連扮都唔扮。離晒譜！",
    ],
    "科技": [
      "乜嘢AI乜嘢Bitcoin？全部都係呃人嘅！我啲錢淨係放定期！最穩陣！",
      "我嗰部Nokia用咗15年都冇壞！你哋嘅iPhone兩年就要換？傻嘅！",
      "後生仔成日掛住玩電話，實體經濟先係王道！我呢世人唔信虛擬嘅嘢！",
      "我同你講，科技越進步人越蠢。以前啲人識得用算盤，而家計數都要部機！",
    ],
    "娛樂": [
      "邊個呀？我只認得許冠傑同周潤發。而家啲所謂明星連樣都分唔到！",
      "TVB最好睇嘅年代已經過咗！大時代、天地豪情，而家嘅劇連屎都不如！",
      "以前睇大台，一家人齊齊整整。而家？個個掛住自己部電話！",
      "呢啲叫娛樂？我睇住陳百強唱歌嗰個年代先係真正嘅娛樂！",
    ],
    "吹水": [
      "你哋有排時間喺度吹水，不如去做啲正經嘢！我嗰代邊有得吹！",
      "連登呢個地方真係教壞細路！以前我哋去打波踢波，而家淨係上網！",
      "我行走江湖咁多年，乜嘢大場面未見過？呢啲小事唔使大驚小怪！",
      "講多都冇用！行動先至係最實際！我由$0做到有層樓，靠嘅就係做而唔係講！",
    ],
  },
  zen: {
    "返工": [
      "工作只係人生嘅一部分。放下執著，你會發現宇宙自有安排。深呼吸。",
      "老細都係人嚟㗎，佢都有佢嘅苦。試下用慈悲嘅眼光去睇呢件事。",
      "份工冇咗可以再搵，但健康冇咗就乜都冇。take care of yourself first。",
      "萬物皆空。公司係空，人工係空，OT更加係空。一切都會過去。",
    ],
    "感情": [
      "一切有為法，如夢幻泡影。呢段關係嘅結束，只係另一段旅程嘅開始。",
      "痛苦來自執著。放下對方，你先會搵到真正嘅自己。",
      "宇宙不會無緣無故帶走一個人。相信呢個安排。更好嘅人正在路上。",
      "先學識愛自己，先有能力愛人。去做瑜伽啦巴打。",
    ],
    "飲食": [
      "食物嘅本質係營養，唔係價錢。一碗白粥都可以食出滿足感。感恩每一餐。",
      "你中伏嘅唔係餐廳，係你嘅期望。放下期望，每一餐都係完美嘅。",
      "我食素三年，身心靈都清淨咗。建議你都試下。肉食係暴力嘅根源。",
      "呢個世界嘅問題，都可以由每一餐飯開始改變。mindful eating。",
    ],
    "時事": [
      "世事無常，這也會過去。保持內心平靜，外在嘅混亂就影響唔到你。",
      "與其改變世界，不如先改變自己。每日冥想15分鐘，你會睇到唔同嘅世界。",
      "嬲有用嘅話，世界一早就和平。放下憤怒，接受現實，然後行動。",
      "一切都是最好的安排。你未必而家睇得到，但ten years from now你會明白。",
    ],
    "科技": [
      "科技係工具，唔係目的。唔好俾科技控制你，要你控制科技。",
      "每日digital detox一個鐘，你會發現世界變得好美好。試下。",
      "Bitcoin跌只係數字嘅起落。你嘅inner peace先係最珍貴嘅資產。",
      "AI取代唔到人嘅靈魂。放心。宇宙需要你嘅存在。",
    ],
    "娛樂": [
      "娛樂係心靈嘅糧食，但唔好過量。balanced life先係真正嘅快樂。",
      "唔好judge人哋嘅作品。每個人都喺度盡力。send love, not hate。",
      "睇完戲之後，去散下步、望下天空。呢個世界比任何劇情都精彩。",
      "世上冇嘢係完美嘅，接受imperfection就係智慧。",
    ],
    "吹水": [
      "每個人嘅故事都值得被聽見。感恩有呢個空間讓大家分享。Namaste。",
      "呢條thread充滿正能量。sending good vibes to everyone。",
      "有時候吹水就係最好嘅therapy。let it all out。",
      "我今日冥想嘅時候收到一個message：一切都會好嘅。分享俾大家。",
    ],
  },
  hr: {
    "返工": [
      "根據公司政策第4.2條，加班需要事先獲得直屬上司書面批准。如有疑問歡迎預約HR office hours。",
      "我哋公司非常重視員工福祉！呢個月嘅team building活動係周六朝9去行山，記得出席。",
      "感謝你嘅feedback！我哋會認真考慮並在下個季度嘅review中跟進。Have a great day!",
      "根據最新嘅employee handbook，所有投訴需要通過正式渠道提交。匿名投訴不予受理。",
    ],
    "感情": [
      "温馨提示：辦公室戀情需要向HR部門報備。請填寫Form HR-12B (Workplace Relationship Declaration)。",
      "如感到情緒困擾，歡迎使用公司提供嘅EAP心理輔導服務（每年3次免費）。",
      "Private matters should be handled outside office hours. Thank you for your understanding.",
      "呢個situation涉及到work-life balance嘅issue。建議你attend下個月嘅wellness workshop。",
    ],
    "飲食": [
      "温馨提示：公司午餐時間為12:00-13:00。超時用膳需要manager approval。",
      "Employee pantry已更新！新增了instant noodles同tea bags。Please enjoy responsibly。",
      "根據新嘅expense policy，商務餐飲報銷上限為每人$200。請保留收據。",
      "如對餐廳有投訴，建議直接聯繫該商戶。公司不對個人消費行為負責。",
    ],
    "時事": [
      "公司鼓勵員工關心社會事務，但請勿在工作時間瀏覽新聞網站。Thank you。",
      "根據公司social media policy，員工在公開平台發表嘅言論需符合公司價值觀。",
      "呢件事確實令人關注。公司會密切留意事態發展，並在適當時候發出internal memo。",
      "We stand with our community. 詳情請留意CEO將會發出嘅all-hands email。",
    ],
    "科技": [
      "IT部門温馨提示：請勿在公司電腦安裝未經授權嘅軟件。違者將面臨disciplinary action。",
      "公司已經upgrade到最新嘅cybersecurity system。請大家配合完成mandatory training。",
      "根據IT policy，個人cryptocurrency交易不應在公司網絡上進行。Thank you for your cooperation。",
      "New AI tools usage needs approval from your department head AND IT governance committee。",
    ],
    "娛樂": [
      "年會表演節目正在招募！歡迎各部門踴躍報名。截止日期為本月底。",
      "提醒：公司活動room可以book嚟做team bonding，但需要提前72小時預約。",
      "Employee engagement survey結果顯示大家想要更多fun activities。已noted！下季度跟進。",
      "公司文化values中包括'Work Hard, Play Hard'。但play嘅時間請安排在下班後。",
    ],
    "吹水": [
      "友情提示：上班時間請專注工作。社交活動建議安排在lunch break或after hours。",
      "公司非常重視開放溝通文化。如有任何concerns歡迎submit到anonymous feedback box。",
      "Great discussion! 但請注意，呢類internal conversation應該keep within appropriate channels。",
      "We appreciate your engagement！考慮join公司嘅internal social committee？Currently recruiting。",
    ],
  },
  conspiracy: {
    "返工": [
      "你以為老細係自己決定要你OT？天真。背後有一個shadow board操控緊所有公司嘅勞動政策。",
      "被裁員？呢個唔係restructure咁簡單。你Google下呢間公司同某啲組織嘅關係就知。",
      "點解全世界嘅公司都係朝9晚6？因為呢個制度係designed to keep you exhausted唔夠精力去think。",
      "我有個朋友喺某大行做嘅話我知，所有嘅layoff都係pre-planned好㗎。Coincidence？I think not。",
    ],
    "感情": [
      "Dating apps嘅algorithm係故意唔配到啱你嘅人，咁你先會keep using keep paying。醒醒啦。",
      "呢啲感情故事我睇得多。90%都係marketing公司請人寫嘅viral content。你信就輸咗。",
      "你知唔知社交媒體嘅design就係要你compare同feel bad？你以為嗰啲幸福couple係真㗎？全部pose出嚟。",
      "結婚制度本身就係一個trap。邊個設計出嚟嘅？Follow the money。",
    ],
    "飲食": [
      "你以為你食緊嘅係真嘅食物？80%嘅食品添加劑都冇經過long-term testing。They don't want you to know。",
      "KOL推薦餐廳？呢個成個industry都係controlled by幾間公關公司。你食嘅每一啖都係被安排好嘅。",
      "點解好食嘅餐廳永遠唔出名？因為真正嘅好嘢係唔會被佢哋promote嘅。You need to find them yourself。",
      "食物安全標準？你去查下邊個own呢啲testing lab就知。Same people same money。",
    ],
    "時事": [
      "呢件事絕對唔係表面咁簡單。你有冇留意到timing？正正係某件事被report前一日。Distraction。",
      "醒醒啦，新聞只會俾你睇佢哋想你睇嘅嘢。真正重要嘅事你永遠唔會喺main stream media見到。",
      "我有inside source話呢件事嘅真相同你睇到嘅完全相反。但我唔可以講太多。",
      "Coincidence?? 呢件事發生嘅timing、location、同involved嘅人...connect the dots巴打。",
    ],
    "科技": [
      "你部電話嘅mic係24/7開住嘅。你以為飛行模式就安全？Naive。hardware level嘅tracking你block唔到。",
      "AI嘅real purpose唔係幫你，係profile你。你每一次同ChatGPT嘅對話都被record咗做training data。",
      "Bitcoin唔係decentralized㗎。有幾個whale控制緊80%嘅supply。你入場只係幫佢哋接盤。",
      "你以為5G只係快咗啲？Research下某啲frequency對人體嘅影響。呢啲information正在被suppress。",
    ],
    "娛樂": [
      "娛樂圈？成個industry都係controlled by同一班人。邊個紅邊個唔紅，早就決定好。talent唔重要。",
      "TVB同ViuTV表面上係競爭，但你有冇check過佢哋嘅board of directors？Same circle。",
      "點解某啲明星永遠冇negative news？因為有人幫佢哋bury晒。Public image management。",
      "演唱會事故？你真的以為係意外？Check下保險claim嘅timeline就知。",
    ],
    "吹水": [
      "呢個forum嘅admin一定有agenda。你有冇發現某啲類型嘅post永遠上到trending？Algorithm manipulation。",
      "我喺呢度講嘅嘢如果突然被delete，你就知我講啱咗。They are watching。",
      "你以為你嘅upvote真係有用？呢啲數字全部都可以被manipulate。Wake up。",
      "我收到DM叫我唔好再post呢類comment。呢個exactly就係佢哋唔想你知嘅proof。",
    ],
  },
  genz: {
    "返工": [
      "omg呢個老細literally係toxic workplace嘅教科書 bestie快啲run 你deserve better fr fr",
      "slay嘅做法係直接安靜辭職 quiet quitting is self care babe",
      "no cap 呢個故事giving me anxiety 我仲未畢業就已經唔想返工了 gap year先啦",
      "work life balance係basic human right好唔好 呢間公司red flag到爆 ick",
    ],
    "感情": [
      "girl/bestie 你值得更好嘅人 呢個係biggest red flag ever 快啲block佢",
      "no bc why would you stay with someone who gives you the ick?? self love first queen",
      "ngl呢個situation好messy 但trust the universe bestie 你嘅main character moment即將嚟到",
      "delulu is the solulu但呢個case唔係 快啲走人 being single is actually bussin",
    ],
    "飲食": [
      "omg我之前都中過伏 但我put咗上IG story tag佢哋 佢哋即刻send DM道歉lol karma",
      "bestie呢間我去過 超mid的 不如去呢間xxx aesthetic又靚嘢又好食 trust me",
      "foodie culture is so toxic ngl 成日為咗打卡食啲唔好食嘅嘢 we need to normalize話唔好食",
      "$2800?? babe呢啲錢我可以food court食成個月 financial literacy is important",
    ],
    "時事": [
      "not me doom scrolling呢啲news at 3am 呢個世界fr fr係burning",
      "giving dystopia vibes tbh 我哋呢代人literally係最慘嘅一代 no cap",
      "ok but can we talk about how no one is doing anything?? we need to speak up like hello??",
      "呢件事lowkey好scary 我要share俾所有人知 awareness is everything",
    ],
    "科技": [
      "AI is giving skynet vibes ngl 但又好好用 我用佢做晒所有assignment lol",
      "bitcoin?? bestie 呢個係gambling唔係investment 你嘅financial advisor在哪裡",
      "no bc why would you trust anything online at this point 呢個世界full of scams fr",
      "ok but AI generated content is actually scary good 我分唔到邊個係real邊個係fake了",
    ],
    "娛樂": [
      "not them doing this AGAIN 呢班人literally never learn omg i cannot",
      "the bar is literally on the floor and they still can't step over it sksksks",
      "stan culture is so toxic but also... 邊個叫我去cancel佢 i'm ready",
      "ngl呢套劇好mid 但我仲係煲晒 because what else is there to watch lol",
    ],
    "吹水": [
      "ok this thread is sending me 😭😭 you guys are so unhinged i love it",
      "fr fr呢個topic好relatable 我literally just had呢個experience yesterday no cap",
      "bestie呢個post deserves more engagement 快啲upvote佢 let's go viral",
      "i'm screaming at the comments 呢度嘅人literally都係comedian lmaooo",
    ],
  },
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export interface AIComment {
  nickname: string;
  avatar: string;
  content: string;
  personaName: string;
  isAI: true;
}

export function generatePersonaComments(post: Pick<Post, "title" | "category">, count: number = 4): AIComment[] {
  const hash = simpleHash(post.title);
  const comments: AIComment[] = [];

  // Pick which personas comment on this post (deterministic but varied)
  const personaOrder = [...AI_PERSONAS].sort((a, b) => {
    const ha = simpleHash(post.title + a.name);
    const hb = simpleHash(post.title + b.name);
    return ha - hb;
  });

  const selectedPersonas = personaOrder.slice(0, count);

  for (const persona of selectedPersonas) {
    const templates = PERSONA_COMMENTS[persona.name]?.[post.category]
      || PERSONA_COMMENTS[persona.name]?.["吹水"]
      || [];
    if (templates.length === 0) continue;

    const templateIndex = simpleHash(post.title + persona.name + "comment") % templates.length;
    comments.push({
      nickname: persona.nickname,
      avatar: persona.avatar,
      content: templates[templateIndex],
      personaName: persona.name,
      isAI: true,
    });
  }

  return comments;
}
