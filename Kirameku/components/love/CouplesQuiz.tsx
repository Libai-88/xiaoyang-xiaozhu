"use client";

import { useMemo, useState } from "react";
import { QUIZ_DATA } from "@/data/love";

/**
 * 情侣问答小游戏
 * 答对撒爱心、进度条推进，最后一道送命题只有两个答案。
 * 完成状态存 localStorage，可重新挑战。
 */
export default function CouplesQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [hearts, setHearts] = useState(false);
  const [score, setScore] = useState(0);

  const finishedBefore = useMemo(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("love-quiz-done") === "1";
  }, []);

  const q = QUIZ_DATA[current];
  const isLast = current === QUIZ_DATA.length - 1;
  const isCorrect = selected === q.correct;

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correct) {
      const next = score + 1;
      setScore(next);
      if (isLast) {
        setHearts(true);
        setDone(true);
        localStorage.setItem("love-quiz-done", "1");
      }
    }
  };

  const next = () => {
    setSelected(null);
    setCurrent((c) => c + 1);
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setDone(false);
    setHearts(false);
    setScore(0);
    localStorage.removeItem("love-quiz-done");
  };

  return (
    <div className="love-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="love-card-title">💘 恋爱小测验</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {done ? `答对 ${score}/${QUIZ_DATA.length}` : `${current + 1}/${QUIZ_DATA.length}`}
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 rounded-full bg-pink-100 dark:bg-slate-700/50 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-400 to-rose-400 transition-all duration-500"
          style={{ width: `${((done ? QUIZ_DATA.length : current) / QUIZ_DATA.length) * 100}%` }}
        />
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden">
          {hearts && (
            <div className="love-rain" aria-hidden>
              {Array.from({ length: 18 }).map((_, i) => (
                <span key={i} style={{ left: `${(i * 53) % 100}%`, animationDelay: `${(i % 6) * 0.5}s` }}>
                  {["💗", "💕", "💖", "💘", "🩷"][i % 5]}
                </span>
              ))}
            </div>
          )}
          <div className="text-5xl love-beat">💍</div>
          <p className="font-semibold text-rose-500 dark:text-rose-300">
            {finishedBefore ? "锁死的一对小动物~" : "全部答对！锁死了，不许反悔！"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">满分通过，奖励一个亲亲~</p>
          <button type="button" onClick={restart} className="love-btn mt-1">
            再考一遍
          </button>
        </div>
      ) : (
        <>
          <p className="font-medium text-slate-700 dark:text-slate-200 mb-4 min-h-[2.5rem] leading-snug">
            {q.q}
          </p>
          <div className="flex flex-col gap-2 flex-1">
            {q.options.map((opt, i) => {
              let cls = "love-option";
              if (selected !== null) {
                if (i === q.correct) cls += " love-option-right";
                else if (i === selected) cls += " love-option-wrong";
                else cls += " love-option-dim";
              }
              return (
                <button key={i} type="button" className={cls} onClick={() => choose(i)}>
                  {opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <div className="mt-3 flex flex-col gap-2">
              <p className={`text-sm ${isCorrect ? "text-emerald-500" : "text-rose-500"}`}>
                {isCorrect ? q.right : q.wrong}
              </p>
              {!isLast && (
                <button type="button" onClick={next} className="love-btn">
                  下一题 →
                </button>
              )}
              {isLast && isCorrect && <p className="text-sm text-slate-500">等等，还有惊喜……</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
