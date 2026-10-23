// data/love.ts - 情侣空间小彩蛋数据

// 情话池（本地兜底，线上优先请求 /api/love 接口）
export const LOVE_QUOTES = [
  "小羊说：世界再大，也想早点回家陪小猪吃饭。",
  "你是我的小猪，也是我唯一的宝藏。",
  "两只小动物，在爱的星球上慢慢散步。",
  "你的名字，是我写过最短的情书。",
  "有你在，连空气都是甜的。",
  "把小羊的温柔，都攒给小猪一个人。",
  "和你在一起，日子都慢了下来。",
  "我的世界里，猪猪永远是第一优先级。",
  "每一次心跳，都在悄悄对你说喜欢。",
  "余生很长，只想牵着你的手慢慢走。",
  "小羊和小猪，名字连在一起就是一辈子。",
  "你不是运气好才遇见我，是我特意来找你的。",
  "把今天的好心情，都归功于你。",
  "我在人间贩卖黄昏，只为收集世间温柔去见你。",
];

// 恋爱运势文案池
export const LOVE_FORTUNES = [
  { fortune: "今天适合牵手散步，晚风会替你说情话。", luck: 99 },
  { fortune: "宜撒娇，宜抱抱，宜一起追一部老电影。", luck: 96 },
  { fortune: "今日默契值拉满，一个眼神就懂对方在想什么。", luck: 93 },
  { fortune: "适合偷偷准备小惊喜，ta 一定会心花怒放。", luck: 95 },
  { fortune: "今天别太黏，留一点想念给明天。", luck: 88 },
  { fortune: "一起下厨的话，记得多夸对方手艺好。", luck: 91 },
  { fortune: "适合拍一张合照，今天的阳光正好。", luck: 97 },
  { fortune: "把手机放一放，好好听对方说说话。", luck: 90 },
  { fortune: "今天的心动指数，比昨天又多了一点点。", luck: 98 },
  { fortune: "适合重温你们的聊天记录，笑一笑就很甜。", luck: 92 },
];

// 甜蜜节日（公历固定，用于倒计时）
export interface SweetDay {
  name: string;
  month: number;
  day: number;
  emoji: string;
}

export const SWEET_DAYS: SweetDay[] = [
  { name: "情人节", month: 2, day: 14, emoji: "🌹" },
  { name: "520", month: 5, day: 20, emoji: "💕" },
  { name: "七夕", month: 8, day: 29, emoji: "🌙" },
  { name: "圣诞", month: 12, day: 25, emoji: "🎄" },
  { name: "跨年", month: 12, day: 31, emoji: "🎆" },
];

// ========== 情侣问答（CouplesQuiz） ==========
export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // 正确选项下标
  right?: string;  // 答对反馈
  wrong?: string;  // 答错反馈
}

export const QUIZ_DATA: QuizQuestion[] = [
  {
    q: "我们的纪念日是哪一天？",
    options: ["2025.12.14", "2025.12.15", "2026.1.1"],
    correct: 0,
    right: "当然啦，2025.12.14 是我们故事的开始！",
    wrong: "笨猪猪！是 2025.12.14，这都能记错？",
  },
  {
    q: "谁先动心的？",
    options: ["小羊先", "小猪先", "同时"],
    correct: 0,
    right: "嘿嘿，小羊先被你勾走了魂~",
    wrong: "才不是呢，明明是小羊先沦陷的！",
  },
  {
    q: "我们第一次约会最适合做什么？",
    options: ["牵手散步看晚霞", "一起去吃火锅", "在家窝着看剧"],
    correct: 0,
    right: "答对！晚风、晚霞和你，刚刚好。",
    wrong: "再想想？跟你有关的每一件事都甜，但我选牵手散步~",
  },
  {
    q: "谁是这个世界上最好的小猪？",
    options: ["我家小猪", "别人家的", "没有小猪"],
    correct: 0,
    right: "当然是全世界唯一的小猪呀！",
    wrong: "这都能选错？重来！",
  },
  {
    q: "愿意永远当小羊的小猪吗？",
    options: ["愿意！", "超级愿意！"],
    correct: 0,
    right: "锁死了，这辈子不许反悔！💍",
    wrong: "答案只有 YES，没有别的选项哦~",
  },
];

// ========== 纪念事件胶囊墙（LoveEvents） ==========
export interface LoveEvent {
  id: string;
  name: string;
  emoji: string;
  date: string;      // YYYY-MM-DD，留空表示待补充
  repeat?: boolean;  // 是否每年重复
}

export const LOVE_EVENTS: LoveEvent[] = [
  { id: "together", name: "在一起", emoji: "💑", date: "2025-12-14", repeat: false },
  { id: "confess", name: "小羊表白", emoji: "💌", date: "", repeat: false },
  { id: "trip", name: "第一次旅行", emoji: "✈️", date: "", repeat: false },
  { id: "birthday-pig", name: "小猪生日", emoji: "🎂", date: "2026-09-13", repeat: true },
  { id: "birthday-sheep", name: "小羊生日", emoji: "🎂", date: "2026-08-05", repeat: true },
];

// ========== 愿望清单（Wishlist） ==========
export const WISHLIST_DEFAULT: string[] = [
  "一起看一次日出",
  "一起去海边踩水",
  "一起拍一组写真",
  "一起去迪士尼",
  "一起跨年倒计时",
  "一起做饭给对方吃",
  "一起养一只小动物",
  "一起去一次音乐节",
  "一起看演唱会",
  "一起滑雪",
  "一起看烟花",
  "一起放风筝",
  "一起坐摩天轮",
  "一起逛超市买零食",
  "一起在雨里撑一把伞",
  "一起去看雪",
  "一起去动物园",
  "一起坐一次绿皮火车",
  "一起露营看星星",
  "一起骑双人自行车",
  "一起给对方写一封信",
  "一起拍一次大头贴",
  "一起去游乐园坐过山车",
  "一起学一支舞",
  "一起看一场球赛",
  "一起养一盆花",
  "一起做陶艺",
  "一起去图书馆看书",
  "一起逛夜市吃到撑",
  "一起给对方买礼物",
  "一起看一部通宵电影",
  "一起去古镇散步",
  "一起堆一个雪人",
  "一起去寺庙祈福",
  "一起坐热气球",
  "一起去漂流",
  "一起泡温泉",
  "一起做蛋糕",
  "一起拍抖音",
  "一起开一个共同账户",
];

// ========== 里程碑信件（DailyUnlock） ==========
export interface MilestoneLetter {
  days: number;      // 在一起满多少天解锁
  emoji: string;
  title: string;
  content: string;   // 留空则显示「等主人来写」占位
}

export const MILESTONE_LETTERS: MilestoneLetter[] = [
  {
    days: 30,
    emoji: "🌱",
    title: "第 30 天 · 刚刚好",
    content: "",
  },
  {
    days: 100,
    emoji: "💞",
    title: "第 100 天 · 心动满格",
    content: "",
  },
  {
    days: 200,
    emoji: "🌹",
    title: "第 200 天 · 越来越爱",
    content: "",
  },
  {
    days: 365,
    emoji: "🎂",
    title: "一周年 · 岁岁年年",
    content: "",
  },
];

// ========== 一起去过的地方（LoveMap） ==========
export const HOME_CITY = {
  name: "武汉",
  lat: 30.5928,
  lng: 114.3055,
};

export const MAP_PLACES_INIT = [
  { id: "home", name: "我们的家", lat: 30.5928, lng: 114.3055, note: "故事开始的地方", emoji: "🏠" },
];

// ========== 悄悄话密码（SecretWall） ==========
// 默认密码请主人修改为自定义值，如 "" 表示关闭该功能
export const SECRET_PASSWORD = "5201314";
