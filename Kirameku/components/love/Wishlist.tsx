"use client";

import { useEffect, useMemo, useState } from "react";
import { WISHLIST_DEFAULT } from "@/data/love";

const KEY = "love-wishlist-v1";

/**
 * 愿望清单：一起做的 100 件事
 * 勾选完成冒爱心，进度条实时更新，localStorage 持久化，可自由增删。
 */
export default function Wishlist() {
  const [items, setItems] = useState<{ text: string; done: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [burst, setBurst] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      else setItems(WISHLIST_DEFAULT.map((t) => ({ text: t, done: false })));
    } catch {
      setItems(WISHLIST_DEFAULT.map((t) => ({ text: t, done: false })));
    }
  }, []);

  const save = (next: { text: string; done: boolean }[]) => {
    setItems(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const doneCount = useMemo(() => items.filter((i) => i.done).length, [items]);
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  const toggle = (idx: number) => {
    const next = items.map((it, i) => {
      if (i !== idx) return it;
      if (!it.done) {
        setBurst(it.text);
        setTimeout(() => setBurst(null), 1200);
      }
      return { ...it, done: !it.done };
    });
    save(next);
  };

  const add = () => {
    const v = input.trim();
    if (!v) return;
    save([...items, { text: v, done: false }]);
    setInput("");
  };

  return (
    <div className="love-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="love-card-title">✅ 想和你做的 100 件事</h3>
        <span className="text-xs text-rose-500 font-semibold">{pct}%</span>
      </div>

      {/* 进度条 */}
      <div className="h-2 rounded-full bg-amber-100 dark:bg-slate-700/50 overflow-hidden mb-1">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-rose-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
        已完成 {doneCount} / {items.length} 件
      </p>

      <div className="flex-1 overflow-y-auto love-scroll pr-1 flex flex-col gap-1.5">
        {items.map((it, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={`love-wish-item ${it.done ? "love-wish-done" : ""}`}
          >
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] transition-colors ${it.done ? "bg-rose-400 border-rose-400 text-white" : "border-slate-300 dark:border-slate-500 text-transparent"}`}>
              ✓
            </span>
            <span className="text-sm text-left leading-snug">{it.text}</span>
            {it.done && <span className="ml-auto text-pink-400">💗</span>}
          </button>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">添加第一个愿望吧~</p>
        )}
      </div>

      {burst && <div className="love-wish-burst">{["💖", "✨", "💕"][Math.floor(Math.random() * 3)]}</div>}

      <div className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="+ 添加一个新愿望"
          className="flex-1 glass-input !py-2 text-sm"
          maxLength={40}
        />
        <button type="button" onClick={add} className="love-btn !py-2">
          添加
        </button>
      </div>
    </div>
  );
}
