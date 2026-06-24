# Kirameku 前端性能优化方案

> 原则：**所有优化动作均不削减现有视觉效果**，仅通过技术手段减少不必要的资源消耗。

---

## 目录

1. [Canvas 动画系统优化](#1-canvas-动画系统优化)
2. [API 请求层优化](#2-api-请求层优化)
3. [Provider 渲染优化](#3-provider-渲染优化)
4. [首页加载优化](#4-首页加载优化)
5. [CSS 优化](#5-css-优化)
6. [Next.js 配置优化](#6-nextjs-配置优化)
7. [零影响速效优化](#7-零影响速效优化)

---

## 1. Canvas 动画系统优化

### 1.1 问题：动画循环永不停止

**影响文件：**
- `components/ui/ClickEffect.tsx` (行 68-84)
- `components/ui/MouseTrail.tsx` (行 61-90)
- `components/ui/SeasonalEffect.tsx` (行 257-294)
- `components/ui/KiraSparkle.tsx` (行 98-133)

**当前问题：**
每个 Canvas 动画组件都在 `useEffect` 中启动 `requestAnimationFrame` 循环，即使粒子数组为空（无交互状态），循环仍然在空跑，持续消耗 CPU。

**优化方案：添加"空闲检测"**

```typescript
// 修改前（以 ClickEffect.tsx 行 68-84 为例）
const loop = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.current = particles.current.filter((p) => p.alpha > 0);
  for (const p of particles.current) {
    // ... 绘制逻辑 ...
  }
  ctx.globalAlpha = 1;
  animFrame.current = requestAnimationFrame(loop); // 无条件循环
};
loop();

// 修改后
let running = true;
const loop = () => {
  if (!running) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.current = particles.current.filter((p) => p.alpha > 0);
  for (const p of particles.current) {
    // ... 绘制逻辑（完全不变） ...
  }
  ctx.globalAlpha = 1;
  if (particles.current.length > 0) {
    animFrame.current = requestAnimationFrame(loop); // 有粒子才继续
  }
};
loop();
```

**效果：** 粒子消失后自动停止循环，交互时重新启动。视觉效果完全一致。

---

### 1.2 问题：标签页不可见时动画仍在运行

**影响文件：** 所有 Canvas 动画组件

**当前问题：** 用户切换到其他浏览器标签页后，Canvas 动画仍在后台运行，浪费资源。

**优化方案：添加 `visibilitychange` 监听**

```typescript
// 在每个动画组件的 useEffect 中添加
useEffect(() => {
  // ... 现有的动画初始化代码 ...

  const handleVisibility = () => {
    if (document.hidden) {
      // 页面不可见时停止循环
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    } else {
      // 页面重新可见时恢复循环（仅在有粒子时）
      if (particles.current.length > 0) loop();
    }
  };
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  };
}, []);
```

**效果：** 标签页不可见时完全暂停，切回时无缝恢复。视觉效果完全一致。

---

### 1.3 问题：MouseTrail 粒子 shadowBlur 性能杀手

**影响文件：** `components/ui/MouseTrail.tsx` (行 80)

**当前问题：**
```typescript
ctx.shadowBlur = 6; // 对每个粒子都设置阴影模糊
```
Canvas 2D 的 `shadowBlur` 需要逐像素模糊计算，200 个粒子 × 60fps = 每秒 12000 次模糊运算。

**优化方案：移动端禁用 shadow，桌面端保留**

```typescript
// 修改前
ctx.shadowBlur = 6;

// 修改后
if (window.innerWidth >= 768) {
  ctx.shadowBlur = 6;
} else {
  ctx.shadowBlur = 0;
}
```

**效果：** 移动端帧率提升，桌面端视觉效果不变。粒子的发光效果通过 `fillStyle` 的 HSL 颜色仍然可见，只是少了微弱的模糊光晕（肉眼几乎不可辨）。

---

### 1.4 问题：MouseTrail 粒子超限时突然裁剪

**影响文件：** `components/ui/MouseTrail.tsx` (行 54-57)

**当前问题：**
```typescript
if (particles.current.length > 200) {
  particles.current = particles.current.slice(-150); // 突然移除 50 个粒子
}
```
视觉上会出现粒子突然消失的闪烁。

**优化方案：降低生成速率而非裁剪**

```typescript
// 修改前（行 40-43，每次 mousemove 生成 2 个粒子）
for (let i = 0; i < 2; i++) { ... }

// 修改后（根据当前粒子数动态调整生成量）
const generateCount = particles.current.length > 100 ? 1 : 2;
for (let i = 0; i < generateCount; i++) { ... }

// 同时移除超限裁剪逻辑
```

**效果：** 粒子密度平滑过渡，无闪烁。视觉效果几乎一致。

---

### 1.5 问题：SeasonalEffect 粒子阈值不一致

**影响文件：** `components/ui/SeasonalEffect.tsx` (行 56 vs 行 262)

**当前问题：**
```typescript
// 行 56：初始填充用 40
const maxParticles = isMobile ? 20 : 40;

// 行 262：动画循环用 50
const max = isMobile ? 25 : 50;
```

**优化方案：统一为同一常量**

```typescript
const MAX_PARTICLES = isMobile ? 20 : 40; // 统一使用这个值

// 行 262 处改为
if (particles.current.length < MAX_PARTICLES) { ... }
```

**效果：** 逻辑一致，粒子数量无变化。视觉效果完全一致。

---

### 1.6 问题：SeasonalEffect drawFirefly 缺少 save/restore

**影响文件：** `components/ui/SeasonalEffect.tsx` (行 219-232)

**当前问题：** `drawFirefly` 函数有 `ctx.restore()` 但没有对应的 `ctx.save()`，导致 Canvas 状态泄漏。

**优化方案：**

```typescript
// 修改前（行 219-232）
function drawFirefly(p: Particle) {
  // ... 设置样式 ...
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore(); // 没有对应的 save()
}

// 修改后
function drawFirefly(p: Particle) {
  ctx.save();  // 添加 save
  // ... 原有逻辑完全不变 ...
  ctx.restore();
}
```

**效果：** 修复 Canvas 状态泄漏 bug，可能意外改善后续粒子的渲染正确性。

---

### 1.7 问题：ClickEffect 粒子无数量上限

**影响文件：** `components/ui/ClickEffect.tsx` (行 55)

**当前问题：** 快速连续点击时粒子无限累积（每次 8-13 个）。

**优化方案：添加粒子总数上限**

```typescript
// 修改前（行 55）
particles.current.push({ ... });

// 修改后
if (particles.current.length < 100) { // 最多 100 个粒子
  particles.current.push({ ... });
}
```

**效果：** 防止极端情况下粒子过多导致卡顿，正常使用时粒子数量远低于 100。视觉效果完全一致。

---

### 1.8 问题：KiraSparkle 动画循环空跑

**影响文件：** `components/ui/KiraSparkle.tsx` (行 98-133)

**优化方案：** 同 1.1，添加空闲检测。

---

### 1.9 问题：Navbar confetti 内联 120 行代码

**影响文件：** `components/layout/Navbar.tsx` (行 52-174)

**当前问题：** 彩蛋代码（600 粒子动画）内联在 Navbar 中，即使不触发也会被解析执行。

**优化方案：提取为独立函数并延迟导入**

```typescript
// 新建 components/ui/Confetti.tsx
export async function launchConfetti() {
  const canvas = document.createElement("canvas");
  // ... 原有 confetti 逻辑 ...
}

// Navbar.tsx 中修改
const handleLogoClick = async () => {
  clickTimes.current.push(Date.now());
  clickTimes.current = clickTimes.current.filter((t) => now - t < 2000);
  if (clickTimes.current.length >= 7) {
    clickTimes.current = [];
    const { launchConfetti } = await import("./Confetti");
    launchConfetti();
  }
};
```

**效果：** Navbar 代码量减少 120 行，彩蛋功能完全不变（只是触发时才加载代码）。

---

## 2. API 请求层优化

### 2.1 问题：PhotoWallPreview N+1 查询

**影响文件：** `components/home/PhotoWallPreview.tsx` (行 23-36)

**当前问题：**
```typescript
getAlbums().then(async (albums) => {
  const allPhotos = [];
  for (const album of albums) {
    const photos = await getAlbumPhotos(album.id); // N 次串行请求
    allPhotos.push(...photos);
  }
});
```
5 个相册 = 1 + 5 = 6 次 API 请求，串行执行。

**优化方案 A：后端添加批量接口（推荐）**

后端新增 `GET /api/albums/all-photos` 接口，一次性返回所有相册的照片：

```python
# Kirameku-backend/app/api/albums.py 新增
@router.get("/all-photos", response_model=list[PhotoOut])
def get_all_photos(session: Session = Depends(get_session)):
    return album_service.get_all_photos(session)
```

```python
# Kirameku-backend/app/services/album_service.py 新增
def get_all_photos(session: Session) -> list[Photo]:
    return list(session.exec(select(Photo).order_by(Photo.sort.desc())).all())
```

前端修改：

```typescript
// 修改前
getAlbums().then(async (albums) => {
  const allPhotos = [];
  for (const album of albums) {
    const photos = await getAlbumPhotos(album.id);
    allPhotos.push(...photos);
  }
  if (allPhotos.length) setPhotos(allPhotos.reverse());
});

// 修改后
import { getAllPhotos } from "@/app/api"; // 新增 API 函数

useEffect(() => {
  getAllPhotos()
    .then((data) => {
      if (data?.length) setPhotos(data);
    })
    .catch(() => {});
}, []);
```

**效果：** 6 次请求 → 1 次请求，加载速度提升数倍。视觉效果完全一致。

---

### 2.2 问题：LatestChatterCarousel 过度请求

**影响文件：** `components/home/LatestChatterCarousel.tsx` (行 59-69)

**当前问题：**
```typescript
getChatters({ status: "published", page: 1, size: 50 }) // 请求 50 条
  .then((data) => {
    const latestDate = data[0].created_at.slice(0, 10);
    const latestDay = data.filter(c => c.created_at.slice(0, 10) === latestDate);
    setItems(latestDay); // 只用最新一天的
  });
```
请求 50 条数据，但只用最新一天的（通常 1-5 条）。

**优化方案 A：后端添加日期过滤参数**

```python
# 后端 chatters.py 新增查询参数
@router.get("", response_model=list[dict])
def list_chatters(
    status: str = "published",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=200),
    latest_only: bool = Query(False),  # 新增参数
    session: Session = Depends(get_session),
    _: dict = Depends(get_current_user),
):
    if latest_only:
        return chatter_service.get_latest_day_chatters(session)
    return chatter_service.get_chatters(session, status, page, size)
```

**优化方案 B：前端减少请求量（不改后端）**

```typescript
// 修改前
getChatters({ status: "published", page: 1, size: 50 })

// 修改后
getChatters({ status: "published", page: 1, size: 10 })
```

**效果：** 数据传输量减少 80%，视觉效果完全一致。

---

### 2.3 问题：API 客户端无超时和取消

**影响文件：** `app/api/client.ts` (行 14-29)

**优化方案：添加 AbortController 超时**

```typescript
async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 秒超时

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
    if (!res.ok) {
      throw new ApiError(`API Error: ${res.status}`, res.status);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}
```

**效果：** 网络异常时 15 秒后自动失败，不会无限挂起。不影响正常请求。

---

### 2.4 问题：组件卸载后仍更新状态

**影响文件：** `LatestPostsCarousel.tsx`, `LatestChatterCarousel.tsx`, `PhotoWallPreview.tsx`

**优化方案：添加 AbortController 取消请求**

```typescript
useEffect(() => {
  const controller = new AbortController();

  getChatters({ status: "published", page: 1, size: 10 }, { signal: controller.signal })
    .then(setItems)
    .catch(() => {});

  return () => controller.abort(); // 组件卸载时取消请求
}, []);
```

**效果：** 防止内存泄漏和竞态条件。不影响正常功能。

---

## 3. Provider 渲染优化

### 3.1 问题：BackgroundProvider 阻塞子组件渲染

**影响文件：** `components/providers/BackgroundProvider.tsx` (行 55)

**当前问题：**
```typescript
if (!mounted) return null; // 阻塞所有子组件！
```
首次加载时整个页面空白，mounted 后才渲染。

**优化方案：CSS 隐藏替代 return null**

```typescript
// 修改前
if (!mounted) return null;

// 修改后
return (
  <div style={{ visibility: mounted ? "visible" : "hidden" }}>
    {children}
  </div>
);
```

或者更好的方案，用 CSS class 控制：

```typescript
return (
  <div className={mounted ? "" : "opacity-0"}>
    {children}
  </div>
);
```

**效果：** 子组件正常挂载和预渲染，只是视觉上不可见。mounted 后平滑显示。消除空白闪烁。

---

### 3.2 问题：EffectProvider toggle 函数引用不稳定

**影响文件：** `components/providers/EffectProvider.tsx` (行 45-71)

**当前问题：** 4 个 toggle 函数每次渲染都重新创建，导致所有消费者重渲染。

**优化方案：用 `useCallback` 包装**

```typescript
// 修改前
const toggleClickEffect = () => {
  setClickEffect((prev) => {
    localStorage.setItem("clickEffect", String(!prev));
    return !prev;
  });
};

// 修改后
const toggleClickEffect = useCallback(() => {
  setClickEffect((prev) => {
    localStorage.setItem("clickEffect", String(!prev));
    return !prev;
  });
}, []);
```

对 4 个 toggle 函数都做同样处理。

---

### 3.3 问题：EffectProvider value 每次渲染创建新对象

**影响文件：** `components/providers/EffectProvider.tsx` (行 74)

**当前问题：**
```typescript
value={{ clickEffect, mouseTrail, ..., toggleClickEffect, ... }}
// 每次渲染都是新对象，所有消费者重渲染
```

**优化方案：用 `useMemo` 稳定 value**

```typescript
const value = useMemo(() => ({
  clickEffect, mouseTrail, seasonalEffect, sparkleEffect,
  toggleClickEffect, toggleMouseTrail, toggleSeasonalEffect, toggleSparkleEffect,
}), [clickEffect, mouseTrail, seasonalEffect, sparkleEffect,
     toggleClickEffect, toggleMouseTrail, toggleSeasonalEffect, toggleSparkleEffect]);
```

**效果：** 只有状态实际变化时才触发消费者重渲染。

---

## 4. 首页加载优化

### 4.1 问题：动态组件无 loading 骨架屏

**影响文件：** `app/HomeClient.tsx` (行 8-14)

**当前问题：** 7 个 `dynamic` 组件在加载期间显示空白。

**优化方案：添加 loading 骨架屏**

```typescript
const PhotoWallPreview = dynamic(
  () => import("@/components/home/PhotoWallPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-md
                      border border-white/30 animate-pulse min-h-[240px] md:min-h-[420px]" />
    ),
  }
);

// 对其他 6 个组件也添加类似的 loading 骨架屏
```

**效果：** 加载期间显示半透明骨架，用户体验更好。视觉效果无负面影响。

---

### 4.2 问题：视觉特效组件静态导入

**影响文件：** `app/layout.tsx` (行 13-17)

**当前问题：**
```typescript
import ClickEffect from "@/components/ui/ClickEffect";
import RadialMenu from "@/components/ui/RadialMenu";
import MouseTrail from "@/components/ui/MouseTrail";
import SeasonalEffect from "@/components/ui/SeasonalEffect";
import KiraSparkle from "@/components/ui/KiraSparkle";
```
5 个特效组件的 JS 代码始终打包进首页 bundle。

**优化方案：改为动态导入**

```typescript
import dynamic from "next/dynamic";

const ClickEffect = dynamic(() => import("@/components/ui/ClickEffect"), { ssr: false });
const RadialMenu = dynamic(() => import("@/components/ui/RadialMenu"), { ssr: false });
const MouseTrail = dynamic(() => import("@/components/ui/MouseTrail"), { ssr: false });
const SeasonalEffect = dynamic(() => import("@/components/ui/SeasonalEffect"), { ssr: false });
const KiraSparkle = dynamic(() => import("@/components/ui/KiraSparkle"), { ssr: false });
```

**效果：** 这些组件只在客户端加载，减少首屏 JS 解析时间。视觉效果完全一致。

---

## 5. CSS 优化

### 5.1 问题：highlight.js 全局引入

**影响文件：** `app/layout.tsx` (行 4)

**当前问题：**
```typescript
import "highlight.js/styles/vs2015.css";
```
在 layout 中全局引入，所有页面都加载这段 CSS（约 30KB），但只有文章详情页需要代码高亮。

**优化方案：移到文章页面局部引入**

```typescript
// 从 layout.tsx 中删除
// import "highlight.js/styles/vs2015.css";

// 在文章页面中引入（如 app/posts/[slug]/page.tsx）
import "highlight.js/styles/vs2015.css";
```

**效果：** 减少非文章页面的 CSS 体积约 30KB。视觉效果完全一致。

---

### 5.2 问题：重复的 line-clamp CSS

**影响文件：** `app/globals.css` (行 141-153)

**当前问题：** 手动定义了 `.line-clamp-1` 和 `.line-clamp-2`，但 Tailwind CSS 4 已内置。

**优化方案：删除重复定义**

```css
/* 删除以下内容 */
.line-clamp-1 { ... }
.line-clamp-2 { ... }
```

**效果：** CSS 体积减小，功能完全一致。

---

### 5.3 问题：暗色模式 body 持续动画

**影响文件：** `app/globals.css` (行 157-161)

**当前问题：**
```css
.dark body {
  animation: gradient-flow 20s ease infinite;
}
```
暗色模式下 body 背景持续做 20 秒循环动画，消耗 GPU。

**优化方案：** 保留动画（视觉效果需要），但将 `will-change` 添加到合成层优化：

```css
.dark body {
  animation: gradient-flow 20s ease infinite;
  will-change: background-position;
}
```

**效果：** GPU 合成层优化，减少重绘开销。视觉效果完全一致。

---

## 6. Next.js 配置优化

### 6.1 问题：缺少缓存头配置

**影响文件：** `next.config.ts`

**优化方案：添加 headers 配置**

```typescript
const nextConfig: NextConfig = {
  // ... 现有配置 ...

  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};
```

**效果：** 静态资源被浏览器缓存，二次访问秒开。

---

### 6.2 问题：缺少 poweredByHeader 安全配置

**优化方案：**

```typescript
const nextConfig: NextConfig = {
  poweredByHeader: false, // 隐藏 X-Powered-By: Next.js
  // ...
};
```

---

### 6.3 问题：optimizePackageImports 不完整

**影响文件：** `next.config.ts` (行 38-43)

**当前配置：**
```typescript
optimizePackageImports: [
  "framer-motion",
  "lucide-react",
  "@dnd-kit/core",
  "@dnd-kit/sortable",
  "@dnd-kit/utilities",
],
```

**优化方案：补充更多大型库**

```typescript
optimizePackageImports: [
  "framer-motion",
  "lucide-react",
  "@dnd-kit/core",
  "@dnd-kit/sortable",
  "@dnd-kit/utilities",
  "recharts",
  "date-fns",
],
```

**效果：** 这些库的 tree-shaking 更彻底，减少 bundle 体积。

---

## 7. 零影响速效优化

以下优化可以在 **30 分钟内全部完成**，完全不影响视觉效果：

| 序号 | 优化项 | 涉及文件 | 耗时 | 收益 |
|------|--------|----------|------|------|
| 1 | Canvas 动画空闲检测 | 4 个特效组件 | 15min | CPU 占用降低 50%+ |
| 2 | visibilitychange 暂停 | 4 个特效组件 | 10min | 标签页不可见时零消耗 |
| 3 | ClickEffect 粒子上限 | ClickEffect.tsx | 2min | 防止极端卡顿 |
| 4 | MouseTrail 移动端禁用 shadow | MouseTrail.tsx | 2min | 移动端帧率提升 |
| 5 | SeasonalEffect 阈值统一 | SeasonalEffect.tsx | 2min | 修复逻辑 bug |
| 6 | SeasonalEffect save/restore | SeasonalEffect.tsx | 2min | 修复状态泄漏 |
| 7 | toggle 函数 useCallback | EffectProvider.tsx | 5min | 减少重渲染 |
| 8 | value useMemo | EffectProvider.tsx | 3min | 减少重渲染 |
| 9 | 删除重复 line-clamp | globals.css | 1min | CSS 体积减小 |
| 10 | 添加 headers 缓存 | next.config.ts | 3min | 二次访问秒开 |
| 11 | optimizePackageImports | next.config.ts | 2min | Bundle 体积减小 |

**总计：约 47 分钟，11 项优化**

---

## 实施优先级

```
第一批（立即实施，零风险）：
  ├── 7.1-7.6: Canvas 动画优化（1.1-1.6）
  ├── 7.7-7.8: EffectProvider useMemo/useCallback（3.2-3.3）
  └── 7.9-7.11: CSS 和配置速效优化

第二批（需要少量测试）：
  ├── 1.7: ClickEffect 粒子上限
  ├── 1.9: Navbar confetti 提取
  ├── 3.1: BackgroundProvider mounted 优化
  └── 4.1: 动态组件 loading 骨架屏

第三批（需要后端配合）：
  ├── 2.1: 照片墙批量接口
  ├── 2.2: 说说请求量优化
  ├── 2.3: API 超时
  └── 4.2: 特效组件动态导入
```

---

## 预期效果

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| Canvas 动画 CPU 占用（空闲时） | 持续运行 | 接近 0 |
| 标签页不可见时 CPU 占用 | 持续运行 | 0 |
| 首页 API 请求数（照片墙） | 6 次串行 | 1 次 |
| 说说 API 数据传输量 | 50 条 | 10 条 |
| Context 重渲染频率 | 每次状态变化全部重渲染 | 仅变化部分 |
| 首屏空白闪烁 | 有（BackgroundProvider） | 无 |
| 非文章页 CSS 体积 | 包含 highlight.js | 不包含 |
