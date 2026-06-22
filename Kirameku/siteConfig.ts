// siteConfig.ts - 全站配置中心

export const siteConfig = {
  // 网站标题与博主信息
  title: "小羊与小猪",
  url: process.env.NEXT_PUBLIC_SITE_URL || "",
  authorName: "小羊",
  bio: "世界很大，但这里很小，小到只放得下我和你。这里记录的不是热闹，是我想留给你的每一份偏爱和想念。",

  // 头像设置
  avatarUrl: "/images/hong.jpg",

  // 背景设置
  useGradient: false,
  themeColors: ["#a18cd1", "#fbc2eb", "#a1c4fd", "#c2e9fb"],
  bgImages: [
    "/images/1.webp",
    "/images/42.webp",
    "/images/20.webp",
    "/images/36.webp",
    "/images/39.webp",
    "/images/41.webp",
  ],

  // 默认封面图
  defaultPostCover: "/images/default-cover.jpg",

  // 照片墙预览图
  photoWallImage: "/images/photo-wall.jpg",

  // 云音乐配置（网易云音乐）
  // 填歌单 ID 则自动拉取整个歌单，填歌曲 ID 列表则只播放指定歌曲
  cloudMusicPlaylistId: "17943739323",  // 歌单 ID（优先）
  cloudMusicIds: [],                     // 歌曲 ID 列表（歌单为空时使用）

  // 后端 API 地址（留空，开发通过 next.config.ts rewrites 代理，生产通过 Nginx 反代）
  apiBaseUrl: "",

  // 社交链接
  social: {
    github: "https://github.com/Libai-88",
    gitee: "",
    google: "",
    email: "1603739641@qq.com",
    qq: "1603739641",
    wechat: "",
  },

  // 站点信息
  buildDate: "2025-12-02T00:00:00",
  footerBadges: [
    { name: "小羊", color: "text-sky-500" },
    { name: "小猪", color: "text-cyan-400" },
    { name: "我们", color: "text-teal-400" },
  ],
  icpConfig: {
    name: "",
    link: "",
  },
  moeIcpConfig: {
    name: "",
    link: "",
  },

  // 分类标题
  chatterTitle: "留言",
  chatterDescription: "生活、技术、随想的碎片记录",
};
