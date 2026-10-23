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
