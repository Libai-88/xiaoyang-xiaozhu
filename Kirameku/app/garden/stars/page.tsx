"use client";

import dynamic from "next/dynamic";

// 星空页（three.js WebGL，约 1MB）按需加载：先渲染壳 + 骨架，画布代码随后到达
const StarsView = dynamic(() => import("./StarsView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-pulse text-slate-400 text-sm">正在生成星空…</div>
    </div>
  ),
});

export default function Page() {
  return <StarsView />;
}
