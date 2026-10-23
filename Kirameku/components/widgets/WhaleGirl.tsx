"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * 鲸鱼娘看板娘 v2
 * 多帧表情动画：静止/眨眼/挥手 三帧轮换 + 呼吸浮动 + 鼠标跟随倾斜 + 点击互动。
 * 功能：右下角浮动展示、随机眨眼、点击弹台词并挥手、可拖拽、可隐藏；
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

const FRAMES = {
  idle: "https://aka.doubaocdn.com/s/fTho2zYBMM",
  blink: "https://aka.doubaocdn.com/s/QvAn3R01tl",
  wave: "https://aka.doubaocdn.com/s/HmelBJsULH",
} as const;

type FrameKey = keyof typeof FRAMES;

export default function WhaleGirl() {
  const [frame, setFrame] = useState<FrameKey>("idle");
  const [tip, setTip] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  // 拖拽后的左上角位置；null 表示未拖拽，走 CSS 的 right/bottom 定位
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  // 鼠标悬停倾斜角度（-6 ~ 6 deg）
  const [tilt, setTilt] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const drag = useRef<{ px: number; py: number; x: number; y: number; moved: boolean } | null>(null);
  const elRef = useRef<HTMLDivElement>(null);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  }, []);

  const showTip = useCallback(
    (text: string) => {
      setTip(text);
      later(() => setTip(null), 4600);
    },
    [later],
  );

  // 眨眼：1.6s 后回到静止
  const blink = useCallback(() => {
    setFrame("blink");
    later(() => setFrame("idle"), 1600);
  }, [later]);

  // 挥手：2.2s 后回到静止
  const wave = useCallback(() => {
    setFrame("wave");
    later(() => setFrame("idle"), 2200);
  }, [later]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("whale-reduced");
    }
    // 开场问候
    later(() => showTip(TIPS[0]), 1600);

    // 随机眨眼：每 7~13 秒眨一次
    let blinkTimer: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        blink();
        scheduleBlink();
      }, 7000 + Math.random() * 6000);
      timers.current.push(blinkTimer);
    };
    scheduleBlink();

    // 随机台词：每 2 分钟一条
    const tipInterval = setInterval(() => {
      showTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
    }, 120000);

    return () => {
      clearTimers();
      clearInterval(tipInterval);
    };
  }, [blink, later, showTip]);

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
    // 只有未被判定为拖拽的点击才互动：弹台词 + 挥手
    if (d && !d.moved) {
      showTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
      wave();
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // 悬停时轻微朝鼠标方向倾斜（未拖拽时）
  const onHoverMove = (e: React.PointerEvent) => {
    if (drag.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - r.left) / r.width - 0.5;
    setTilt(Math.round(Math.max(-1, Math.min(1, ratio * 2)) * 6));
  };

  const onHoverLeave = () => {
    setTilt(0);
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
      onPointerEnter={onHoverMove}
      onPointerLeave={onHoverLeave}
      role="img"
      aria-label="鲸鱼娘看板娘"
    >
      <div
        className="whale-hide"
        role="button"
        aria-label="隐藏看板娘"
        onClick={(e) => {
          e.stopPropagation();
          setHidden(true);
        }}
        title="让鲸鱼娘去歇会儿"
      >
        ×
      </div>
      {tip && <div className="whale-tip">{tip}</div>}
      <div className="whale-bobber">
        <div className="whale-stage" style={{ "--tilt": `${tilt}deg` } as CSSProperties}>
          {(Object.keys(FRAMES) as FrameKey[]).map((k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={k}
              src={FRAMES[k]}
              alt={k === "idle" ? "鲸鱼娘" : "鲸鱼娘表情"}
              draggable={false}
              className={`whale-frame ${frame === k ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
