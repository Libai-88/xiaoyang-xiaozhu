"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LOVE_QUOTES, LOVE_FORTUNES } from "@/data/love";

/**
 * 今日情话 + 恋爱运势
 * 优先请求后端 /api/love 接口（当日种子），失败时回退本地数据池。
 * 点击卡片可换一条。
 */

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";

interface FortuneItem {
  fortune: string;
  luck: number;
}

export default function LoveNote() {
  const [quote, setQuote] = useState(LOVE_QUOTES[0]);
  const [fortune, setFortune] = useState<FortuneItem | null>(null);
  const [fallback, setFallback] = useState(false);
  const idxRef = useRef(0);

  const pickQuote = useCallback(() => {
    idxRef.current = (idxRef.current + 1) % LOVE_QUOTES.length;
    setQuote(LOVE_QUOTES[idxRef.current]);
  }, []);

  useEffect(() => {
    let alive = true;

    const fetchLove = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/love/today`);
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (!alive) return;
        if (typeof data.quote === "string") setQuote(data.quote);
        if (data.fortune && typeof data.fortune.fortune === "string") {
          setFortune(data.fortune);
        } else {
          setFortune(LOVE_FORTUNES[new Date().getDate() % LOVE_FORTUNES.length]);
        }
      } catch {
        if (!alive) return;
        setFallback(true);
        setFortune(LOVE_FORTUNES[new Date().getDate() % LOVE_FORTUNES.length]);
      }
    };

    fetchLove();
    return () => {
      alive = false;
    };
  }, []);

  const luck = fortune?.luck ?? 0;

  return (
    <div className="h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 flex flex-col justify-between transition-colors duration-700 overflow-hidden relative group">
      <div className="absolute -left-3 -bottom-3 text-6xl opacity-10 group-hover:opacity-20 transition-opacity select-none">
        💌
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500/80 dark:text-amber-300/70 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          今日情话
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
          {fallback ? "离线小纸条" : "云端小纸条"}
        </span>
      </div>

      <button
        type="button"
        onClick={pickQuote}
        className="flex-1 flex items-center text-left mt-3 mb-2 group/quote cursor-pointer"
        title="点我换一句"
      >
        <p className="text-sm md:text-[15px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed transition-colors group-hover/quote:text-rose-500 dark:group-hover/quote:text-rose-300">
          “{quote}”
        </p>
      </button>

      <div className="flex items-end justify-between gap-3 mt-auto">
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">今日恋爱运势</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
            {fortune?.fortune ?? "正在占卜…"}
          </p>
        </div>
        {/* 幸运指数 */}
        <div className="shrink-0 flex items-center gap-1.5">
          <div className="flex items-end gap-[3px] h-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`w-[5px] rounded-full transition-all ${
                  i < Math.round(luck / 20)
                    ? "bg-gradient-to-t from-rose-400 to-pink-300"
                    : "bg-slate-200 dark:bg-slate-600"
                }`}
                style={{ height: `${6 + i * 4}px` }}
              />
            ))}
          </div>
          <span className="text-xs font-black text-rose-500 dark:text-rose-400">
            {luck}
          </span>
        </div>
      </div>
    </div>
  );
}
