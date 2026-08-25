import Link from "next/link";

// 自定义 404 页面：与全站风格一致（毛玻璃 + 渐变文字），纯 CSS 动画避免水合差异
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-[7rem] sm:text-[10rem] font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-teal-400 select-none">
        404
      </p>

      <p className="mt-2 text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200">
        这里还没有留下小纸条
      </p>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        你找的页面可能被风吹走了，或者还没有被我们写下来。回首页看看吧，故事都收在那里。
      </p>

      <Link
        href="/"
        className="glass-button mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        回到首页
      </Link>
    </div>
  );
}
