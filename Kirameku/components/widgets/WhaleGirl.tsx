"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { LOVE_QUOTES } from "@/data/love";

/**
 * 鲸鱼娘看板娘 v3（情侣互动版）
 * 多帧表情动画：静止/眨眼/挥手 三帧轮换 + 呼吸浮动 + 鼠标跟随倾斜 + 点击互动。
 * 新增：跟小羊小猪联动——点击/定时弹台词时，大概率冒出「情侣视角」甜话
 * （含替小羊转告小猪的情话），并飘出小心心。
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

// 情侣视角台词：把小羊小猪牵进来
const LOVE_TIPS = [
  "嘘——我听见小羊的心跳，在说小猪的名字~",
  "小羊让我转告你：我的世界里，猪猪永远是第一优先级！",
  "磕到了磕到了！小羊和小猪也太甜了吧！",
  "主人，今天的喜欢，记得说给小猪听哦~",
  "我帮你在深海里，守着这份甜甜的恋爱！",
  "小羊的温柔 + 小猪的可爱 = 满分组合！",
  "嗅嗅……今天的风，都是恋爱的味道！",
  "噜噜噜，深海告白小助手，随时待命！",
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
  const [isLoveTip, setIsLoveTip] = useState(false);
  const [heartKey, setHeartKey] = useState(0);
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
    (text: string, love = false) => {
      setTip(text);
      setIsLoveTip(love);
      if (love) setHeartKey((k) => k + 1); // 换 key 让小心心动画重放
      later(() => setTip(null), 4600);
    },
    [later],
  );

  // 台词选择：65% 情侣池，35% 鲸鱼娘日常池；情侣池里偶尔转述小羊的情话
  const pickTip = useCallback(() => {
    if (Math.random() < 0.65) {
      if (Math.random() < 0.35) {
        const q = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
        return { text: `小羊说：${q}`, love: true };
      }
      return {
        text: LOVE_TIPS[Math.floor(Math.random() * LOVE_TIPS.length)],
        love: true,
      };
    }
    return { text: TIPS[Math.floor(Math.random() * TIPS.length)], love: false };
  }, []);

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

    // 随机台词：每 45~90 秒一条（含情侣互动）
    let tipTimer: ReturnType<typeof setTimeout>;
    const scheduleTip = () => {
      tipTimer = setTimeout(() => {
        const t = pickTip();
        showTip(t.text, t.love);
        scheduleTip();
      }, 45000 + Math.random() * 45000);
      timers.current.push(tipTimer);
    };
    scheduleTip();

    return () => {
      clearTimers();
    };
  }, [blink, later, pickTip, showTip]);

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
      const t = pickTip();
      showTip(t.text, t.love);
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
      {tip && (
        <div className={`whale-tip ${isLoveTip ? "whale-tip-love" : ""}`}>
          {isLoveTip && (
            <span key={heartKey} className="whale-heart whale-heart-1" aria-hidden>
              💗
            </span>
          )}
          {isLoveTip && (
            <span key={`${heartKey}-2`} className="whale-heart whale-heart-2" aria-hidden>
              💕
            </span>
          )}
          {tip}
        </div>
      )}
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
