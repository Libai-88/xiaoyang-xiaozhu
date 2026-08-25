"use client";

// Aurora 极光背景（inspira-ui 风格）：多层模糊光斑缓慢漂移
export default function Aurora() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div
        className="aurora-blob left-[-12%] top-[-12%] h-[48vw] w-[48vw] min-h-[300px] min-w-[300px] bg-indigo-400/25 dark:bg-indigo-500/15"
      />
      <div
        className="aurora-blob right-[-8%] top-[5%] h-[42vw] w-[42vw] min-h-[280px] min-w-[280px] bg-purple-400/20 dark:bg-purple-500/15"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="aurora-blob bottom-[-18%] left-[12%] h-[50vw] w-[50vw] min-h-[320px] min-w-[320px] bg-sky-400/20 dark:bg-sky-500/10"
        style={{ animationDelay: "-12s" }}
      />
      <div
        className="aurora-blob top-[30%] left-[35%] h-[36vw] w-[36vw] min-h-[240px] min-w-[240px] bg-pink-400/15 dark:bg-pink-500/10"
        style={{ animationDelay: "-3s" }}
      />
    </div>
  );
}
