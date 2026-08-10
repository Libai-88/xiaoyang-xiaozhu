"use client";

import dynamic from "next/dynamic";

// 3D 工作室（three.js，约 1MB）按需加载：先渲染壳 + 骨架，画布代码随后到达
const StudioView = dynamic(() => import("./StudioView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-pulse text-slate-400 text-sm">正在初始化 3D 场景…</div>
    </div>
  ),
});

export default function Page() {
  return <StudioView />;
}
