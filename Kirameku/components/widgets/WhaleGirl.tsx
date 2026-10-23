"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 鲸鱼娘看板娘
 * 替换原有 Live2D 看板娘（/live2d/jsdelivr/random/autoload.js）。
 * 功能：右下角浮动展示、呼吸浮动动画、点击弹台词、可拖拽、可隐藏；
 * 尊重 prefers-reduced-motion；移动端隐藏（见 globals.css）。
 */

const TIPS = [
  "咕噜咕噜~ 欢迎回来主人！",
  "我是小鲸鱼，今天也想陪着你~",
  "戳我一下，会有好运哦！",
  "深海的晚风好舒服呀~",
  "主人要记得喝水休息哦！",
  "蓝蓝的尾巴是我最骄傲的！",
  "嘘——我听到了海的声音！",
  "噜噜噜，抓到一只认真工作的主人！",
  "累了就看看我，治愈一下~",
  "主人今天也要开开心心的！",
  "这片海，我替你守着哦~",
  "噗——喷个水柱给你加油！",
];

export default function WhaleGirl() {
  const [tip, setTip] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  // 拖拽后的左上角位置；null 表示未拖拽，走 CSS 的 right/bottom 定位
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  const showTip = useCallback((text: string) => {
    setTip(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTip(null), 4600);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("whale-reduced");
    }
    const hello = setTimeout(() => showTip(TIPS[0]), 1600);
    const interval = setInterval(() => {
      showTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, 150000);
    return () => {
      clearTimeout(hello);
      clearInterval(interval);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [showTip]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { px: e.clientX, py: e.clientY, x: 0, y: 0, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || !elRef.current) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    if (!d.moved && Math.hypot(dx, dy) > 6) {
      const rect = elRef.current.getBoundingClientRect();
      d.x = rect.left;
      d.y = rect.top;
      d.moved = true;
    }
    if (d.moved) {
      const rect = elRef.current.getBoundingClientRect();
      setPos({
        x: Math.min(Math.max(d.x + dx, 4), window.innerWidth - rect.width - 4),
        y: Math.min(Math.max(d.y + dy, 4), window.innerHeight - rect.height - 4),
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    // 只有未被判定为拖拽的点击才弹台词
    if (d && !d.moved) {
      showTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  if (hidden) {
    return (
      <button
        type="button"
        aria-label="显示鲸鱼娘"
        className="whale-dot"
        onClick={() => setHidden(false)}
        title="把鲸鱼娘叫回来"
      >
        🐳
      </button>
    );
  }

  return (
    <div
      ref={elRef}
      className="whale-girl"
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" } : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="img"
      aria-label="鲸鱼娘看板娘"
    >
      <div className="whale-hide" role="button" aria-label="隐藏看板娘" onClick={() => setHidden(true)} title="让鲸鱼娘去歇会儿">
        ×
      </div>
      {tip && <div className="whale-tip">{tip}</div>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://aka.doubaocdn.com/s/YBWWIwSLRn" alt="鲸鱼娘" draggable={false} />
    </div>
  );
}
