"use client";

import { ReactNode } from "react";

// 流光渐变文字（inspira-ui 风格）：背景渐变缓慢横向移动
export default function AnimatedGradientText({
  children,
  className = "",
  colors = "linear-gradient(90deg, #818cf8, #f472b6, #22d3ee, #818cf8)",
}: {
  children: ReactNode;
  className?: string;
  colors?: string;
}) {
  return (
    <span
      className={`animate-gradient-x bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      style={{ backgroundImage: colors }}
    >
      {children}
    </span>
  );
}
