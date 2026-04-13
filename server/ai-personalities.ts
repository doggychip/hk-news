// AI Personality system — generates hot takes in 5 different voices
// Each post gets all 5 versions, client switches instantly

export type Personality = "savage" | "professor" | "mama" | "conspiracy" | "genz";

export const PERSONALITY_META: Record<Personality, { emoji: string; label: string; desc: string }> = {
  savage: { emoji: "🗡️", label: "毒舌模式", desc: "最狠最毒最到肉" },
  professor: { emoji: "🧠", label: "教授模式", desc: "理性分析深入淺出" },
  mama: { emoji: "👵", label: "阿媽模式", desc: "你睇下你睇下！" },
  conspiracy: { emoji: "🕵️", label: "陰謀論模式", desc: "Everything is connected" },
  genz: { emoji: "✌️", label: "00後模式", desc: "bestie fr fr no cap" },
};

// Templates per personality × category
// Each returns an array (multiple options for regenerate)
const TEMPLATES: Record<Personality, Record<string, string[]>> = {
  savage: {
    "時事": [
      "又一日喺呢個荒謬嘅城市生存落嚟，恭喜你",
      "政府嘅回應速度同港鐵一樣：永遠「稍後跟進」",
      "如果憤怒可以發電，香港已經能源自給自足",
      "呢件事最恐怖嘅唔係事件本身，係冇人覺得奇怪",
      "香港精神：被打到趴低仲要企返起身返工",
    ],
    "娛樂": [
      "呢個水平都可以出道？我隔離屋個貓唱得好過佢",
      "香港娛樂圈嘅quality control同佢哋嘅收視一樣：唔存在",
      "觀眾嘅要求已經低到：唔好出事就算好",
      "娛樂新聞嘅深度同個泳池嘅兒童區一樣",
      "仲有人睇？致敬你哋嘅勇氣",
    ],
    "科技": [
      "科技嘅進步就係令你用更貴嘅方式做同一件事",
      "AI嘅存在證明：人類最叻就係創造取代自己嘅嘢",
      "又一個用科技包裝嘅古老騙局",
      "科技巨頭嘅privacy policy：你冇privacy，呢個就係policy",
      "未來已經嚟咗，但月薪仲係$15K",
    ],
    "返工": [
      "又一個被資本主義壓榨嘅靈魂，老細笑到見牙唔見眼",
      "你以為你係員工？你只係一個有薪呼吸器",
      "老細嘅「團隊精神」= 你做死佢攞credit，完美分工",
      "辭職信已經寫好未？建議用最貴嘅紙打印",
      "打工就係原罪，呢個故事再次證明",
    ],
    "感情": [
      "愛情係世界上最貴嘅課程，學費仲要唔可以退",
      "單身唔係冇人要，係避開咗一個災難",
      "建議全香港人拍拖之前做background check",
      "渣男渣女永遠唔缺市場，因為好人永遠太天真",
      "感情建議：先確認對方係人類再拍拖",
    ],
    "飲食": [
      "呢個價錢我可以喺7-11食一個禮拜，仲有找",
      "食評KOL嘅良心同佢哋推薦嘅餐廳一樣：根本唔存在",
      "香港飲食業嘅motto：賣貴啲佢哋就以為好食啲",
      "打卡嘅嘢多數伏，冇人影嘅先係真正好食",
      "呢個世界最大嘅謊言：「好抵食」",
    ],
    "吹水": [
      "呢個post嘅含金量出乎意料地高",
      "連登永遠唔會令你失望，因為你本身就冇期望",
      "食完花生記得執返啲殼",
      "每日嘅吹水thread都係一堂免費嘅人性課",
      "正式宣佈：呢個post已經成為今日嘅精神食糧",
    ],
  },
  professor: {
    "時事": [
      "從社會學角度分析，呢件事反映咗結構性嘅制度缺陷，值得深入探討",
      "根據過去十年嘅數據趨勢，呢類事件嘅發生頻率正在上升，需要系統性改革",
      "有趣嘅係，呢件事同1990年代嘅某個案例有驚人嘅相似之處",
      "客觀而言，呢個議題涉及多個stakeholder嘅利益衝突，冇簡單嘅解決方案",
      "從博弈論嘅角度嚟睇，各方都係理性行為者，問題在於制度設計",
    ],
    "娛樂": [
      "從文化研究嘅角度，呢個現象反映咗當代香港大眾文化嘅消費模式轉變",
      "媒體理論告訴我哋，娛樂產品嘅質素同市場結構有直接關係",
      "有趣嘅觀察：香港娛樂業嘅發展軌跡同韓國90年代有相似之處",
      "從傳播學角度分析，社交媒體改變咗娛樂內容嘅生產同消費邏輯",
      "呢個值得用Adorno嘅文化工業理論嚟分析一下",
    ],
    "科技": [
      "從技術史嘅角度嚟睇，每一次科技革命都會帶來類似嘅社會焦慮，然後人類適應",
      "數據顯示，呢個技術嘅adoption curve符合Rogers嘅創新擴散理論",
      "值得注意嘅係，監管framework總係落後於技術發展，呢個gap正在擴大",
      "從經濟學角度分析，呢度存在明顯嘅信息不對稱同道德風險問題",
      "呢個案例可以用Schumpeter嘅創造性破壞理論完美解釋",
    ],
    "返工": [
      "勞動經濟學研究顯示，香港嘅工時長度在全球排名前列，但生產力唔成正比",
      "從組織行為學角度分析，呢種管理模式會導致員工burnout同高離職率",
      "有研究指出，work-life balance同公司長期績效成正相關",
      "呢個案例完美示範咗principal-agent problem",
      "從人力資源管理嘅角度，呢間公司嘅retention strategy明顯有問題",
    ],
    "感情": [
      "心理學研究顯示，attachment style對關係質素有決定性影響",
      "從演化心理學角度分析，人類嘅mate selection策略受到多種因素影響",
      "有趣嘅係，社交媒體時代嘅親密關係模式同傳統有根本性嘅改變",
      "Gottman嘅研究指出，關係破裂嘅四大預測因子係：批評、蔑視、防衛、冷戰",
      "呢個情況在發展心理學中有一個專門嘅術語叫「關係創傷」",
    ],
    "飲食": [
      "食品經濟學角度：香港餐飲業嘅成本結構導致咗質價比持續惡化",
      "從消費者行為學分析，KOL推薦嘅效果正在diminishing，因為信任成本上升",
      "有趣嘅觀察：香港人嘅外食比例在全球排名第一，反映咗獨特嘅城市生活模式",
      "食物質素問題可以用information asymmetry同moral hazard嚟解釋",
      "米芝蓮效應：獲獎後租金上升導致質素下降，呢個係一個paradox",
    ],
    "吹水": [
      "從社會心理學角度，online discussion forum嘅群體行為模式非常有研究價值",
      "呢個話題反映咗一個broader social phenomenon，值得做一個longitudinal study",
      "有趣嘅觀察：呢類discussions嘅sentiment distribution同經濟周期有correlation",
      "從Habermas嘅公共領域理論嚟睇，呢個forum有公民社會嘅雛形",
      "data shows呢類話題嘅engagement rate同時間段有顯著嘅統計關係",
    ],
  },
  mama: {
    "時事": [
      "你睇下你睇下！呢個世界點搞㗎！我話你知，出街小心啲啊！",
      "哎呀好危險呀！你記住行路要小心，唔好掛住睇電話！",
      "我同你講啊，以前邊有咁嘅事㗎！你出街記得帶遮，拎多件衫！",
      "阿媽擔心你呀！呢啲新聞睇到我心都寒埋！你食咗飯未呀？",
      "你睇下人哋幾慘！你仲投訴？你有飯食有屋住已經好好啦！",
    ],
    "娛樂": [
      "嗰個明星我識嘅！不過佢冇你靚仔/靚女。你幾時帶個對象返嚟俾我睇下？",
      "而家啲後生仔鍾意嘅嘢我都唔明。不過你開心就好啦。食多啲。",
      "呢個節目好嘈！你細個嗰陣我同你睇歡樂今宵，嗰啲先叫節目！",
      "你成日掛住睇呢啲嘢！不如讀多啲書啦！隔離陳太個仔已經做咗醫生喇！",
      "個台成日播啲奇奇怪怪嘅嘢，不如睇返啲新聞啦，增長下知識",
    ],
    "科技": [
      "乜嘢嚟㗎？我部電話又唔識用！你幾時返嚟教我用WhatsApp啊？",
      "你唔好信呢啲科技嘢啊！錢放銀行最穩陣！阿媽係為你好！",
      "我WhatsApp group啲人都有forward呢個新聞！你幫我check下係咪真㗎？",
      "你成日對住部電腦，眼睛會壞㗎！去飲杯杞子水！",
      "AI乜嘢嘅我唔識，但我識煲湯！你幾時返嚟飲湯？",
    ],
    "返工": [
      "唉你返工咁辛苦，不如返嚟食飯啦。阿媽煲咗湯等你。你食咗飯未？",
      "你老細咁衰㗎？不如辭職啦！唔好做，返嚟阿媽養你！⋯⋯講笑㗎咋，做人要捱得",
      "我話你知啊，做嘢最緊要開心。但首先你要有份工先。你幾時升職啊？",
      "隔離陳太個仔已經做咗經理喇，人工五萬！你幾時先追得上？⋯⋯阿媽唔係比較，只係關心你",
      "返工咁夜先返屋企！你食咗飯未？雪櫃有餸，你自己翻熱佢啊！",
    ],
    "感情": [
      "嗰個人唔啱你㗎啦！阿媽一早睇得出！你幾時帶個正經嘅返嚟？",
      "你唔好傷心啦，嗰個人唔值得。阿媽幫你介紹個好嘅！同事個女好乖㗎！",
      "感情嘅嘢阿媽唔識講，但你記住：邊個對你好，你就對邊個好。食多啲。",
      "你30歲喇仲唔拍拖！我嗰陣你咁大已經生咗你喇！你快啲搵個啦！",
      "阿媽唔係迫你，但你可唔可以快啲結婚？我想抱孫呀！",
    ],
    "飲食": [
      "幾百蚊食餐飯？痴線㗎！返嚟阿媽煮俾你食啦，又平又好食！",
      "你出街食嘢要小心啊！而家啲餐廳唔知用咩油！自己煮最健康！",
      "你又叫外賣？外賣又貴又唔健康！你幾時先學識煮飯？",
      "我教你煲個湯啦，簡單嘅。落兩條粟米，幾粒紅棗，煲兩個鐘就得㗎嗱",
      "你睇下你食咗啲乜！咁貴仲咁難食！阿媽買餸返嚟煮都好食過佢十倍！",
    ],
    "吹水": [
      "你又上網？出去行下啦！成日對住部電話，你識唔識得同真人傾偈㗎？",
      "呢啲嘢有咩好睇？不如睇下書啦！你細個讀書叻嘅，而家⋯",
      "你喺網上唔好亂講嘢呀，小心俾人cap圖。阿媽擔心你呀。",
      "食咗飯未呀？唔好淨係上網，記住飲水。你最近係咪瘦咗？",
      "好啦好啦你鍾意睇就睇啦。記得早啲瞓，明日要返工㗎！",
    ],
  },
  conspiracy: {
    "時事": [
      "呢件事絕對唔係表面咁簡單。你有冇留意到timing？正正係某件事被report前一日。Distraction。",
      "醒醒啦，新聞只會俾你睇佢哋想你睇嘅嘢。真正重要嘅事你永遠唔會喺mainstream media見到。",
      "我有inside source話呢件事嘅真相同你睇到嘅完全相反。但我唔可以講太多。",
      "Coincidence？呢件事嘅timing、location、involved嘅人⋯connect the dots。",
      "你知唔知呢件事背後牽涉到幾多利益集團？Follow the money，真相就在眼前。",
    ],
    "娛樂": [
      "娛樂圈成個industry都係controlled by同一班人。邊個紅唔係靠talent，係靠關係。",
      "你以為呢啲新聞係意外流出？成個事件都係planned好嘅PR campaign。",
      "TVB同ViuTV表面上係競爭，但check下佢哋嘅board of directors。Same circle。",
      "呢個明星突然紅，你有冇問過點解？背後一定有人推。",
      "演唱會啲所謂「意外」，你去check下保險claim嘅timeline就知。",
    ],
    "科技": [
      "你部電話嘅mic係24/7開住嘅。飛行模式？Hardware level tracking你block唔到。",
      "AI嘅real purpose唔係幫你，係profile你。每一次interaction都被record咗。",
      "Bitcoin唔係decentralized。有幾個whale控制緊80%嘅supply。你入場只係接盤。",
      "5G唔只係快咗啲。Research下某啲frequency對人體嘅影響。呢啲information正在被suppress。",
      "Free software唔係免費㗎。你唔係用家，你係product。呢個係最基本嘅internet law。",
    ],
    "返工": [
      "你以為老細係自己決定要你OT？天真。背後有shadow board操控勞動政策。",
      "點解全世界嘅公司都係朝9晚6？因為呢個制度designed to keep you too exhausted to think。",
      "Layoff唔係因為市場差，係因為AI replacement計劃已經開始。They just can't tell you yet。",
      "HR department嘅真正功能唔係幫你，係保護公司免被你告。Think about it。",
      "你嘅annual review完全係預設好嘅。Score幾多，加薪幾多，全部早就決定咗。You're just playing their game。",
    ],
    "感情": [
      "Dating apps嘅algorithm係故意唔配啱你嘅人，咁你先會keep using keep paying。",
      "你知唔知社交媒體嘅design就係要你compare同feel bad？幸福couple全部pose出嚟。",
      "結婚制度本身就係trap。邊個設計出嚟嘅？Follow the money — 鑽石、婚禮、律師。",
      "呢啲感情故事90%都係marketing公司寫嘅viral content。你信就輸咗。",
      "愛情本身係hormone嘅作用，但呢個事實被romance industry suppress咗幾百年。",
    ],
    "飲食": [
      "你以為你食緊真嘅食物？80%嘅食品添加劑冇經過long-term testing。They don't want you to know。",
      "KOL推薦餐廳？成個industry都係controlled by幾間公關公司。你食嘅每一啖都被安排好。",
      "食物安全標準？你去查下邊個own呢啲testing lab就知。Same people same money。",
      "點解「健康食品」越賣越貴？因為有人控制緊你對「健康」嘅定義。It's manufactured scarcity。",
      "有機食物？Organic label嘅申請費用決定咗邊啲公司可以用。大企業嘅遊戲。",
    ],
    "吹水": [
      "呢個forum嘅admin一定有agenda。某啲類型嘅post永遠上trending？Algorithm manipulation。",
      "我喺度講嘅嘢如果突然被delete，你就知我講啱咗。They are watching。",
      "你以為你嘅upvote真係有用？呢啲數字全部可以被manipulate。Wake up。",
      "呢個discussion嘅存在本身就係proof：佢哋需要你覺得你有freedom of speech。But do you really？",
      "我收到DM叫我唔好再post呢類comment。呢個exactly就係proof。",
    ],
  },
  genz: {
    "時事": [
      "not me doom scrolling呢啲news at 3am 呢個世界fr fr係burning no cap 💀",
      "giving dystopia vibes tbh 我哋呢代人literally係最慘嘅一代",
      "ok but can we talk about how no one is doing anything?? hello?? 📢",
      "呢件事lowkey好scary 但highkey冇人care which is even scarier sksks",
      "the bar is in hell and they still managing to go lower 我已經麻木了 fr",
    ],
    "娛樂": [
      "not them doing this AGAIN 呢班人literally never learn omg i cannot 💀",
      "the bar is on the floor and they still can't step over it sksksks",
      "ngl呢套劇好mid 但我仲係煲晒 because what else is there to watch lol",
      "ok but why is everyone acting like this is acceptable?? the delusion 🤡",
      "giving main character energy but like the villain type bestie 😭",
    ],
    "科技": [
      "AI is giving skynet vibes ngl 但又好好用 我用佢做晒所有assignment lol 🤖",
      "no bc why would you trust anything online at this point 全部都係scam fr",
      "呢個app/product giving me the ick 但我又delete唔到 it's giving toxic relationship 💀",
      "ok but technology was supposed to make life easier not more expensive?? make it make sense",
      "we're literally living in black mirror and no one is concerned enough about this",
    ],
    "返工": [
      "omg呢個老細literally係toxic workplace教科書 bestie快啲run you deserve better fr fr 🏃‍♀️",
      "slay嘅做法係直接安靜辭職 quiet quitting is self care babe ✨",
      "work life balance係basic human right好唔好 red flag到爆 ick 🚩",
      "not the employer acting like $15K is a livable wage in 2024 the audacity 💀",
      "giving corporate gaslighting energy 呢啲公司全部都係一樣嘅 no cap",
    ],
    "感情": [
      "girl/bestie 你值得更好嘅人 biggest red flag ever 快啲block佢 🚩🚩🚩",
      "ngl呢個situation好messy 但trust the universe bestie main character moment即將嚟到 ✨",
      "delulu is the solulu但呢個case唔係 快啲走人 being single is bussin",
      "not the bare minimum being seen as romantic goals?? the bar is underground 💀",
      "he/she belongs to the streets periodt 👏 next 👏 caller 👏 please 👏",
    ],
    "飲食": [
      "omg我之前都中過伏 但put咗上IG story tag佢哋 佢哋即刻DM道歉 karma 😌",
      "$2800?? babe呢啲錢我可以food court食成個月 financial literacy is important 💸",
      "foodie culture is so toxic ngl 為咗打卡食啲唔好食嘅嘢 we need to normalize話唔好食",
      "this restaurant is giving scam energy 但個aesthetic好靚 conflicted rn 📸",
      "bestie呢間我去過 超mid 不如去xxx aesthetic又靚嘢又好食 trust me fr",
    ],
    "吹水": [
      "ok this thread is sending me 😭😭 you guys are so unhinged i love it",
      "fr fr呢個topic好relatable literally just had呢個experience yesterday no cap",
      "i'm screaming at the comments 呢度嘅人literally都係comedian lmaooo 💀",
      "bestie呢個post deserves more engagement let's make it go viral 📈",
      "the way this is so real it hurts 呢個post attacked me personally and i'm here for it",
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

export interface PersonalityTakes {
  savage: string[];
  professor: string[];
  mama: string[];
  conspiracy: string[];
  genz: string[];
}

export function generateAllPersonalityTakes(post: { title: string; category: string }): PersonalityTakes {
  const result: PersonalityTakes = { savage: [], professor: [], mama: [], conspiracy: [], genz: [] };
  const hash = simpleHash(post.title);

  for (const personality of Object.keys(TEMPLATES) as Personality[]) {
    const categoryTemplates = TEMPLATES[personality][post.category] || TEMPLATES[personality]["吹水"];
    // Return 3 takes (for regenerate cycling) — deterministic but varied
    const takes: string[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = (hash + i * 7) % categoryTemplates.length;
      takes.push(categoryTemplates[idx]);
    }
    result[personality] = takes;
  }

  return result;
}
