"use client";

import { useMemo, useState } from "react";
import { MILESTONE_LETTERS } from "@/data/love";
import { siteConfig } from "@/siteConfig";

const READ_KEY = "love-letters-read";

/**
 * 每日解锁 · 里程碑情书
 * 在一起满 N 天解锁一封信，未到期模糊锁定，解锁后淡入展开。
 * 信内容在 data/love.ts 的 MILESTONE_LETTERS 里填写。
 */
export default function DailyUnlock() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [read, setRead] = useState<Set<number>>(new Set());

  const { days, total } = useMemo(() => {
    const ann = siteConfig.couple.anniversary ? new Date(siteConfig.couple.anniversary) : null;
    const d = ann ? Math.max(0, Math.floor((Date.now() - ann.getTime()) / 86400000)) : 0;
    const done = MILESTONE_LETTERS.filter((m) => d >= m.days).length;
    return { days: d, total: MILESTONE_LETTERS.length };
  }, []);

  const open = (idx: number) => {
    const next = new Set(read);
    next.add(idx);
    setRead(next);
    localStorage.setItem(READ_KEY, JSON.stringify([...next]));
    setOpenId(idx === openId ? null : idx);
  };

  return (
    <div className="love-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <h3 className="love-card-title">🔐 写给猪猪的信</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          已在一起 {days} 天
        </span>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
        恋爱里程碑，每到一个日子解锁一封专属情书
      </p>

      <div className="flex flex-col gap-2 flex-1">
        {MILESTONE_LETTERS.map((m, i) => {
          const unlocked = days >= m.days;
          return (
            <div
              key={m.days}
              className={`rounded-2xl border transition-all duration-500 ${
                unlocked
                  ? "border-rose-200 dark:border-rose-500/30 bg-rose-50/60 dark:bg-rose-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30"
              }`}
            >
              <button
                type="button"
                onClick={() => unlocked && open(i)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left ${unlocked ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span className="text-xl">{unlocked ? m.emoji : "🔒"}</span>
                <span className="flex-1">
                  <span className={`block text-sm font-semibold ${unlocked ? "text-rose-500 dark:text-rose-300" : "text-slate-400"}`}>
                    {m.title}
                  </span>
                  <span className={`block text-[11px] ${unlocked ? "text-rose-400/80" : "text-slate-400"}`}>
                    {unlocked
                      ? read.has(i)
                        ? "已拆开 · 再看一遍"
                        : "已解锁，点开看看 💌"
                      : `还需 ${m.days - days} 天解锁`}
                  </span>
                </span>
                <span className="text-slate-400 text-xs">{unlocked ? (openId === i ? "▾" : "▸") : "🔒"}</span>
              </button>
              {openId === i && unlocked && (
                <div className="px-4 pb-3 -mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed love-letter-in">
                  {m.content ? (
                    <p>{m.content}</p>
                  ) : (
                    <p className="italic text-slate-400">
                      （这封信还空着，主人记得去 data/love.ts 的 MILESTONE_LETTERS 里把情书写给小猪 💌）
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${days >= MILESTONE_LETTERS[i].days ? "bg-rose-400" : "bg-slate-200 dark:bg-slate-700"}`}
          />
        ))}
      </div>
    </div>
  );
}
