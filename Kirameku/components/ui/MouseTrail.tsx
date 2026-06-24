"use client";

import { useEffect, useRef } from "react";
import { useEffects } from "@/components/providers/EffectProvider";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export default function MouseTrail() {
  const { mouseTrail } = useEffects();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const isMobile = useRef(false);

  useEffect(() => {
    if (!mouseTrail) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    isMobile.current = window.innerWidth < 768;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      isMobile.current = window.innerWidth < 768;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // 动态生成数量：粒子多时减少生成
      const generateCount = particles.current.length > 100 ? 1 : 2;
      for (let i = 0; i < generateCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5 + 0.5;
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 0,
          maxLife: Math.random() * 30 + 20,
          size: Math.random() * 3 + 1.5,
          hue: Math.random() * 60 + 180, // 蓝紫色系
        });
      }
    };
    window.addEventListener("mousemove", handleMove);

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02; // 微弱重力
        p.vx *= 0.98;
        p.vy *= 0.98;

        const progress = p.life / p.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const scale = 1 - progress * 0.5;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha) * 0.8;
        ctx.fillStyle = `hsl(${p.hue}, 80%, 70%)`;
        // 移动端禁用 shadowBlur 提升帧率
        if (!isMobile.current) {
          ctx.shadowColor = `hsl(${p.hue}, 80%, 70%)`;
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      particles.current = particles.current.filter((p) => p.life < p.maxLife);
      if (particles.current.length > 0) {
        frame.current = requestAnimationFrame(animate);
      }
    };

    const startAnimate = () => {
      if (!running) return;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(animate);
    };

    // 初始启动 + 有新粒子时启动
    const originalHandleMove = handleMove;
    const wrappedHandleMove = (e: MouseEvent) => {
      const prevLen = particles.current.length;
      originalHandleMove(e);
      if (prevLen === 0 && particles.current.length > 0) {
        startAnimate();
      }
    };
    window.removeEventListener("mousemove", handleMove);
    window.addEventListener("mousemove", wrappedHandleMove);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame.current);
      } else if (particles.current.length > 0) {
        startAnimate();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", wrappedHandleMove);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mouseTrail]);

  if (!mouseTrail) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9997] pointer-events-none"
    />
  );
}
