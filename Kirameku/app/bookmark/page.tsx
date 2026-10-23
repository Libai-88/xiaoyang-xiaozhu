"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bookmark, ExternalLink, Sparkles } from "lucide-react";
import { getBookmarks } from "@/app/api";
import type { BookmarkCategory, BookmarkSite } from "@/app/api";

/** 如果有自定义 icon 就用，否则自动获取网站 favicon */
function getIcon(site: BookmarkSite): string {
  if (site.icon) return site.icon;
  try {
    const origin = new URL(site.url).origin;
    return `${origin}/favicon.ico`;
  } catch {
    return "";
  }
}

// ===== 站内精选收藏（静态预置，不依赖后端，站点重建即上线） =====
const FALLBACK_CATEGORIES: BookmarkCategory[] = [
  {
    id: -1,
    name: "🎵 一起听歌",
    icon: "",
    description: "循环我们的歌单，把喜欢的歌都分享给对方",
    sort: 0,
    created_at: "",
    sites: [
      { id: -101, category_id: -1, name: "网易云音乐", url: "https://music.163.com/", icon: "", description: "想和你一起听的每一首歌", platforms: ["Web", "Mobile"], sort: 0, created_at: "" },
      { id: -102, category_id: -1, name: "QQ音乐", url: "https://y.qq.com/", icon: "", description: "好听的歌，一半给你一半给我", platforms: ["Web", "Mobile"], sort: 1, created_at: "" },
    ],
  },
  {
    id: -2,
    name: "📸 一起刷",
    icon: "",
    description: "刷到好玩的，第一个就想分享给你",
    sort: 1,
    created_at: "",
    sites: [
      { id: -201, category_id: -2, name: "哔哩哔哩", url: "https://www.bilibili.com/", icon: "", description: "一起追番刷视频的快乐", platforms: ["Web", "Mobile"], sort: 0, created_at: "" },
      { id: -202, category_id: -2, name: "小红书", url: "https://www.xiaohongshu.com/", icon: "", description: "收藏种草，慢慢一起实现", platforms: ["Web", "Mobile"], sort: 1, created_at: "" },
      { id: -203, category_id: -2, name: "抖音", url: "https://www.douyin.com/", icon: "", description: "刷到好玩的第一个@你", platforms: ["Web", "Mobile"], sort: 2, created_at: "" },
      { id: -204, category_id: -2, name: "微博", url: "https://weibo.com/", icon: "", description: "看看今天又有啥新鲜事", platforms: ["Web", "Mobile"], sort: 3, created_at: "" },
    ],
  },
  {
    id: -3,
    name: "🗺️ 说走就走",
    icon: "",
    description: "下一站，想去哪儿？",
    sort: 2,
    created_at: "",
    sites: [
      { id: -301, category_id: -3, name: "高德地图", url: "https://www.amap.com/", icon: "", description: "导航到彼此身边", platforms: ["Web", "Mobile"], sort: 0, created_at: "" },
      { id: -302, category_id: -3, name: "去哪儿旅行", url: "https://www.qunar.com/", icon: "", description: "攒钱去看更大的世界", platforms: ["Web", "Mobile"], sort: 1, created_at: "" },
      { id: -303, category_id: -3, name: "铁路12306", url: "https://www.12306.cn/", icon: "", description: "抢票去见想见的人", platforms: ["Web", "Mobile"], sort: 2, created_at: "" },
    ],
  },
  {
    id: -4,
    name: "📚 一起变好",
    icon: "",
    description: "一起成长，一起发光",
    sort: 3,
    created_at: "",
    sites: [
      { id: -401, category_id: -4, name: "知乎", url: "https://www.zhihu.com/", icon: "", description: "一起讨论这个世界", platforms: ["Web", "Mobile"], sort: 0, created_at: "" },
      { id: -402, category_id: -4, name: "豆瓣", url: "https://www.douban.com/", icon: "", description: "一起标记想看的电影", platforms: ["Web", "Mobile"], sort: 1, created_at: "" },
      { id: -403, category_id: -4, name: "力扣 LeetCode", url: "https://leetcode.cn/", icon: "", description: "一起刷题进步", platforms: ["Web", "Mobile"], sort: 2, created_at: "" },
      { id: -404, category_id: -4, name: "网易公开课", url: "https://open.163.com/", icon: "", description: "一起看点有意思的课", platforms: ["Web"], sort: 3, created_at: "" },
    ],
  },
];

/** 分类卡片渲染（数据库收藏与站内精选共用） */
function CategorySection({ category, catIndex }: { category: BookmarkCategory; catIndex: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: catIndex * 0.1 }}
    >
      {/* Category Header */}
      <div className="flex items-center gap-2.5 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
          {category.name}
        </h2>
        <span className="text-xs text-slate-400 bg-slate-100/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
          {category.sites.length}
        </span>
      </div>
      {category.description && (
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4 -mt-2">
          {category.description}
        </p>
      )}

      {/* Site Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
        {category.sites.map((site, siteIndex) => (
          <motion.a
            key={site.id}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: catIndex * 0.1 + siteIndex * 0.03,
            }}
            className="group relative flex items-center gap-2.5 p-2.5 rounded-xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-sm border border-transparent hover:border-sky-200 dark:hover:border-sky-800 transition-all duration-300 cursor-pointer"
          >
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-slate-100/60 dark:bg-slate-700/40 flex items-center justify-center group-hover:animate-[icon-jelly_2s_ease-in-out]">
              {getIcon(site) ? (
                <img
                  src={getIcon(site)}
                  alt={site.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const t = e.target as HTMLImageElement;
                    t.style.display = "none";
                    const span = t.nextElementSibling as HTMLElement;
                    if (span) span.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="text-sm font-bold text-sky-500 items-center justify-center"
                style={{ display: getIcon(site) ? "none" : "flex" }}
              >
                {site.name[0]}
              </span>
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {site.name}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                {site.description}
              </p>
            </div>
            {/* Hover: top-right tags + link */}
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {site.platforms.slice(0, 2).map((p) => (
                <span
                  key={p}
                  className="text-[8px] font-medium tracking-wider uppercase text-sky-500/70"
                >
                  {p}
                </span>
              ))}
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
            </div>
          </motion.a>
        ))}
      </div>
    </motion.section>
  );
}

export default function BookmarkPage() {
  const [data, setData] = useState<BookmarkCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 md:mb-12"
      >
        <div className="flex items-center gap-3">
          <Bookmark className="w-7 h-7 md:w-8 md:h-8 text-sky-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
            藏宝库
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-10 md:ml-11 text-sm md:text-base">
          收集常用的好用站点和工具
        </p>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">加载中...</div>
      ) : (
        <div className="space-y-10 md:space-y-14">
          {/* 数据库收藏（管理端添加的内容） */}
          {data.length > 0 &&
            data.map((category, catIndex) => (
              <CategorySection key={category.id} category={category} catIndex={catIndex} />
            ))}

          {/* 站内精选（静态预置） */}
          <div className={data.length > 0 ? "mt-12 pt-8 border-t border-white/30 dark:border-white/10" : ""}>
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 bg-rose-100/60 dark:bg-rose-500/10 px-2.5 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                站内精选
              </span>
              <p className="text-xs text-slate-400">随时想用就点，都是好用的地方</p>
            </div>
            <div className="space-y-10 md:space-y-14">
              {FALLBACK_CATEGORIES.map((category, catIndex) => (
                <CategorySection key={category.id} category={category} catIndex={catIndex} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
