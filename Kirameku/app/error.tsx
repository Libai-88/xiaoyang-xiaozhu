"use client";

import { useEffect } from "react";

// 根错误边界：渲染层异常时的兜底页面，提供重试入口
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl sm:text-7xl font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 select-none">
        出错了
      </p>
      <p className="mt-4 max-w-md text-sm text-slate-500 dark:text-slate-400">
        页面在加载时遇到了一点小问题，稍后再试一次吧。
      </p>
      <button
        onClick={reset}
        className="glass-button mt-8 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        重试
      </button>
    </div>
  );
}
