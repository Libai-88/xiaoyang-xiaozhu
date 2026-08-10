"use client";

import dynamic from "next/dynamic";

// Python 编辑器（codemirror，约 700KB）按需加载：先渲染壳 + 骨架，编辑器代码随后到达
const PythonView = dynamic(() => import("./PythonView"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-pulse text-slate-400 text-sm">正在加载编辑器…</div>
    </div>
  ),
});

export default function Page() {
  return <PythonView />;
}
