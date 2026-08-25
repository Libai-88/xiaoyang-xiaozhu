"use client";

import { useRef, ReactNode } from "react";
import { useMotionValue, useSpring, motion, useReducedMotion } from "framer-motion";

// 磁性按钮（framer-motion 弹簧物理）：悬停时向光标方向平滑吸附，松手回弹
export default function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 250, damping: 15, mass: 0.4 });

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`inline-block will-change-transform ${className}`}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}
