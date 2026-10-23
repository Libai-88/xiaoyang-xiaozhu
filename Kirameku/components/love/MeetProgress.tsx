"use client";

/**
 * 双向奔赴
 * 小羊 🐑 从左侧、小猪 🐷 从右侧，沿着爱之路走向彼此；
 * 相遇时中央迸发爱心，短暂拥抱后各自回到起点，循环往复。
 * 纯 CSS 动画，零 JS 开销。
 */

export default function MeetProgress() {
  return (
    <div className="h-full rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 flex flex-col justify-between transition-colors duration-700 overflow-hidden relative group">
      <div className="absolute -right-3 -bottom-3 text-6xl opacity-10 group-hover:opacity-20 transition-opacity select-none">
        🌊
      </div>

      <div className="flex items-center gap-2 text-[10px] font-bold text-sky-500/80 dark:text-sky-300/70 uppercase tracking-widest mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        双向奔赴
      </div>

      {/* 爱之路 */}
      <div className="relative flex-1 flex items-center mt-2">
        {/* 轨道 */}
        <div className="relative w-full h-20">
          {/* 路面 */}
          <div className="absolute left-[6%] right-[6%] top-1/2 -translate-y-1/2 h-[3px] rounded-full bg-gradient-to-r from-rose-200 via-pink-300 to-rose-200 dark:from-rose-500/20 dark:via-pink-400/40 dark:to-rose-500/20" />
          {/* 路点 */}
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-rose-300/60 dark:bg-rose-400/30"
              style={{ left: `${8 + i * 7.6}%` }}
            />
          ))}

          {/* 小羊：左 → 右 */}
          <span className="absolute text-3xl meet-runner meet-sheep" title="小羊">🐑</span>
          {/* 小猪：右 → 左 */}
          <span className="absolute text-3xl meet-runner meet-pig" title="小猪">🐷</span>

          {/* 相遇点爱心（在两只小动物相遇的中央迸发） */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl meet-heart select-none">
            💗
          </span>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3">
        双向奔赴的爱，才有意义
      </p>
    </div>
  );
}
