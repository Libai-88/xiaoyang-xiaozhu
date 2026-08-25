"use client";

import { useMemo } from "react";

// 流星特效：装饰性元素，纯 CSS 动画，不参与交互、不影响布局
export default function Meteors({
  count = 12,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const meteors = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 47 + 5) % 100}%`,
        top: `${(i * 23 + 8) % 45}%`,
        delay: `${(i * 0.8) % 5}s`,
        duration: `${3.5 + ((i * 1.7) % 4)}s`,
      })),
    [count]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {meteors.map((m, i) => (
        <span
          key={i}
          className="meteor"
          style={{
            left: m.left,
            top: m.top,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}
    </div>
  );
}
