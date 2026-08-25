"use client";

import { useRef, ReactNode } from "react";
import {
  useMotionValue,
  useSpring,
  useTransform,
  motion,
  useReducedMotion,
} from "framer-motion";

// 3D 倾斜卡片（framer-motion 弹簧物理）：光标驱动 rotateX/rotateY，带光斑跟随，松手回弹
export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // 光标在卡片内的归一化坐标（0~1）
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const springPx = useSpring(px, { stiffness: 220, damping: 20 });
  const springPy = useSpring(py, { stiffness: 220, damping: 20 });

  const rotateX = useTransform(springPy, (v) => (0.5 - v) * maxTilt);
  const rotateY = useTransform(springPx, (v) => (v - 0.5) * maxTilt);
  const glareX = useTransform(springPx, (v) => `${(v * 100).toFixed(2)}%`);
  const glareY = useTransform(springPy, (v) => `${(v * 100).toFixed(2)}%`);

  function onMove(e: React.MouseEvent) {
    if (reduce || window.matchMedia("(pointer: coarse)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt-card ${className}`}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        "--glare-x": glareX,
        "--glare-y": glareY,
      } as React.CSSProperties}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 tilt-glare" />
    </motion.div>
  );
}
