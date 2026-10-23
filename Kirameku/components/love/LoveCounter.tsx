"use client";

import { useEffect, useMemo, useState } from "react";
import { SWEET_DAYS } from "@/data/love";
import { siteConfig } from "@/siteConfig";

/**
 * 心动计数器
 * 主视觉：小羊 ❤ 小猪（配置了恋爱纪念日时显示「在一起第 N 天」实时秒表）
 * 辅助：倒计时到下一个甜蜜节日（520/七夕/圣诞/跨年等）
 */

function getNextSweetDay(now: Date) {
  const y = now.getFullYear();
  const days = SWEET_DAYS.map((d) => {
    let target = new Date(y, d.month - 1, d.day, 0, 0, 0);
    if (target.getTime() < now.getTime()) {
      target = new Date(y + 1, d.month - 1, d.day, 0, 0, 0);
    }
    return { ...d, target, ms: target.getTime() - now.getTime() };
  }).sort((a, b) => a.ms - b.ms);
  return days[0];
}

export default function LoveCounter() {
  const anniversary = siteConfig.couple?.anniversary;
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // 秒级刷新，页面隐藏时暂停避免后台空转
    let timer: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (!timer) {
        setNow(new Date());
        timer = setInterval(() => setNow(new Date()), 1000);
      }
    };
    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };
    start();
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const nextDay = useMemo(() => getNextSweetDay(now), [now]);

  // 恋爱纪念日计数（可选配置）
  let togetherText: string | null = null;
  if (anniversary) {
    const start = new Date(anniversary).getTime();
    if (!Number.isNaN(start)) {
      const diff = now.getTime() - start;
      const days = Math.max(0, Math.floor(diff / 864e5));
      const hours = Math.floor((diff / 36e5) % 24);
      const mins = Math.floor((diff / 6e4) % 60);
      const secs = Math.floor((diff / 1e3) % 60);
      togetherText = `${days} 天 ${hours}时 ${mins}分 ${secs}秒`;
    }
  }

  const countdownDays = Math.ceil(nextDay.ms / 864e5);
  const countdownText =
    countdownDays <= 1
      ? "就是明天！"
      : `${countdownDays} 天后`;

  return (
    <div className="h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 flex flex-col justify-between transition-colors duration-700 overflow-hidden relative group">
      {/* 角落装饰爱心 */}
      <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:opacity-20 transition-opacity select-none">
        💕
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400/80 dark:text-rose-300/70 uppercase tracking-widest mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        心动计数器
      </div>

      {/* 主视觉：小羊 ❤ 小猪 */}
      <div className="flex items-center justify-center gap-2 md:gap-3 py-2">
        <span className="text-3xl md:text-4xl love-bounce" title="小羊">🐑</span>
        <span className="relative inline-flex items-center justify-center">
          <span className="text-2xl md:text-3xl love-beat">❤️</span>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow love-beat-delay select-none">
            ∞
          </span>
        </span>
        <span className="text-3xl md:text-4xl love-bounce-delay" title="小猪">🐷</span>
      </div>

      <div className="text-center mt-2">
        {togetherText ? (
          <>
            <p className="text-xs text-slate-500 dark:text-slate-400">在一起</p>
            <p className="text-lg md:text-xl font-black text-rose-500 dark:text-rose-400 font-mono">
              {togetherText}
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            小羊 ❤ 小猪 · 永远在一起
          </p>
        )}
      </div>

      {/* 甜蜜节日倒计时 */}
      <div className="mt-3 rounded-2xl bg-white/40 dark:bg-slate-700/30 border border-white/30 dark:border-white/5 px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl">{nextDay.emoji}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-600 dark:text-slate-200 truncate">
              下一个甜蜜节日
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {nextDay.name} · {nextDay.target.getMonth() + 1}月{nextDay.target.getDate()}日
            </p>
          </div>
        </div>
        <span className="shrink-0 text-sm font-black text-rose-500 dark:text-rose-400">
          {countdownText}
        </span>
      </div>
    </div>
  );
}
