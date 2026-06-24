"use client";

export async function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;z-index:99999;pointer-events:none";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  // 生成粒子，分 3 波从不同位置发射
  const particles: {
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; rotation: number; vr: number;
    gravity: number; opacity: number; shape: number; born: number;
  }[] = [];
  const colors = ["#ff6b6b","#ffd93d","#6bcb77","#4d96ff","#ff6bd6","#c084fc","#fb923c","#38bdf8"];
  for (let wave = 0; wave < 3; wave++) {
    const delay = wave * 15;
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * W,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
        gravity: 0.05 + Math.random() * 0.05,
        opacity: 1,
        shape: Math.floor(Math.random() * 3), // 0=rect 1=circle 2=star
        born: delay,
      });
    }
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of particles) {
      if (frame < p.born) { alive = true; continue; }
      const age = frame - p.born;
      p.x += p.vx + Math.sin(age * 0.02) * 0.5;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.998;
      p.rotation += p.vr;
      p.opacity = Math.max(0, 1 - age / 300);
      if (p.opacity <= 0 || p.y > H + 20) continue;
      alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      if (p.shape === 0) {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.shape === 1) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 五角星
        const s = p.size / 2;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          const a = (j * 4 * Math.PI) / 5 - Math.PI / 2;
          ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    frame++;
    if (alive) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  animate();

  // 彩蛋提示文字，等彩纸下完后出现
  setTimeout(() => {
    const msg = document.createElement("div");
    msg.innerHTML = `
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <div style="font-size:24px;font-weight:bold;margin-bottom:8px">恭喜你发现了彩蛋！</div>
      <div style="font-size:14px;opacity:0.8">连续点击 Logo 7 次触发 · 小羊与小猪</div>
    `;
    msg.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:99999;pointer-events:none;text-align:center;
      color:#fff;
      background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);
      padding:32px 48px;border-radius:20px;
      border:1px solid rgba(255,255,255,0.2);
      box-shadow:0 8px 40px rgba(0,0,0,0.4);
      opacity:0;transition:opacity 0.8s ease;
      font-family:'Noto Serif SC',serif;
    `;
    document.body.appendChild(msg);
    requestAnimationFrame(() => { msg.style.opacity = "1"; });
    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => msg.remove(), 1000);
    }, 3000);
  }, 3500);
}
