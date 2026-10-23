"use client";

import { useMemo } from "react";
import { LOVE_EVENTS } from "@/data/love";
import { siteConfig } from "@/siteConfig";

function daysSince(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / 86400000);
}

function daysUntilNext(year: number, month: number, day: number, now: Date): number {
  let next = new Date(year, month - 1, day);
  if (next.getTime() <= now.getTime()) next = new Date(year + 1, month - 1, day);
  return Math.ceil((next.getTime() - now.getTime()) / 86400000);
}

/**
 * 纪念事件胶囊墙
 * 「在一起」实时天数 + 每年重复事件倒计时 + 彩色胶囊卡片。
 */
export default function LoveEvents() {
  const items = useMemo(() => {
    const now = new Date();
    const ann = siteConfig.couple.anniversary
      ? new Date(siteConfig.couple.anniversary)
      : null;

    return LOVE_EVENTS.map((ev) => {
      if (ev.id === "together" && ann) {
        const d = daysSince(ann, now);
        return {
          ...ev,
          label: d >= 0 ? `已经在一起 ${d} 天` : "快到啦",
          sub: d >= 0 ? `${d} 天的喜欢只增不减` : "即将开启倒计时",
          accent: "from-pink-400 to-rose-400",
        };
      }
      if (ev.date) {
        const [y, m, d] = ev.date.split("-").map(Number);
        const past = now.getTime() >= new Date(y, m - 1, d).getTime();
        if (ev.repeat) {
          const dd = daysUntilNext(y, m, d, now);
          return {
            ...ev,
            label: `距离下次还有 ${dd} 天`,
            sub: `每年都记得（${m} 月 ${d} 日）`,
            accent: "from-amber-400 to-orange-400",
          };
        }
        const dn = daysSince(new Date(y, m - 1, d), now);
        return {
          ...ev,
          label: past ? `已经 ${Math.abs(dn)} 天` : `还有 ${Math.abs(dn)} 天`,
          sub: ev.date,
          accent: "from-sky-400 to-cyan-400",
        };
      }
      return {
        ...ev,
        label: "等你来补充",
        sub: "在 data/love.ts 里填上日期",
        accent: "from-slate-300 to-slate-400",
      };
    });
  }, []);

  return (
    <div className="love-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="love-card-title">📅 我们的纪念日</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{items.length} 个日子</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {items.map((ev) => (
          <div
            key={ev.id}
            className={`flex items-center gap-3 rounded-2xl bg-gradient-to-r ${ev.accent} px-3.5 py-2.5 text-white shadow-md`}
          >
            <span className="text-xl leading-none">{ev.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">{ev.name}</p>
              <p className="text-[11px] opacity-90 leading-tight truncate">{ev.sub}</p>
            </div>
            <span className="text-xs font-bold whitespace-nowrap bg-white/25 rounded-full px-2.5 py-1">
              {ev.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
