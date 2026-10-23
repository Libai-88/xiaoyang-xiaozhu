"use client";

import { useEffect, useRef, useState } from "react";
import { LOVE_QUOTES } from "@/data/love";
import { siteConfig } from "@/siteConfig";

interface Line {
  text: string;
  type: "out" | "cmd" | "ok";
}

/**
 * 恋爱终端：geek 式浪漫
 * 提示符小羊@love，输入 help/love/date/whoami 等命令，情话打字机输出。
 */
export default function LoveTerminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const typeOut = (text: string, ms = 28) => {
    return new Promise<void>((resolve) => {
      setTyping("");
      let i = 0;
      const t = setInterval(() => {
        i += 1;
        setTyping(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(t);
          setTyping(null);
          resolve();
        }
      }, ms);
    });
  };

  const boot = async () => {
    await typeOut("小羊@love:~$ system boot... 恋爱系统加载中", 18);
    await new Promise((r) => setTimeout(r, 300));
    setLines((l) => [
      ...l,
      { text: "小羊@love:~$ system boot... 恋爱系统加载中", type: "out" },
      { text: "💗 欢迎回家，我的小猪。输入 help 查看命令", type: "ok" },
    ]);
  };

  useEffect(() => {
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, typing]);

  const run = async (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    setLines((l) => [...l, { text: `小羊@love:~$ ${raw}`, type: "cmd" }]);
    setInput("");

    const day = (() => {
      const ann = siteConfig.couple.anniversary ? new Date(siteConfig.couple.anniversary) : null;
      if (!ann) return null;
      return Math.max(0, Math.floor((Date.now() - ann.getTime()) / 86400000));
    })();

    const reply = (text: string) => setLines((l) => [...l, { text, type: "ok" }]);

    if (cmd === "help") {
      reply("可用命令：love / date / whoami / sheep / pig / clear");
    } else if (cmd === "love") {
      const q = LOVE_QUOTES[Math.floor(Math.random() * LOVE_QUOTES.length)];
      await typeOut(q);
    } else if (cmd === "date") {
      reply(day !== null ? `已运行恋爱系统 ${day} 天，稳定不掉线` : "恋爱日期未配置，先设置 anniversary 吧");
    } else if (cmd === "whoami") {
      reply("全世界最爱小猪的那只小羊 🐑");
    } else if (cmd === "sheep") {
      reply("🐑 咩~ 小羊在，随时待命");
    } else if (cmd === "pig") {
      reply("🐷 噜噜噜~ 小猪永远是小羊的小猪");
    } else if (cmd === "clear") {
      setLines([]);
    } else if (cmd === "") {
      // ignore
    } else {
      reply(`command not found: ${cmd} —— 试试 help`);
    }
  };

  return (
    <div className="love-card love-terminal h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="w-3 h-3 rounded-full bg-rose-400" />
        <span className="w-3 h-3 rounded-full bg-amber-400" />
        <span className="w-3 h-3 rounded-full bg-emerald-400" />
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 ml-2">love@sheep:~</span>
      </div>
      <div ref={boxRef} className="flex-1 overflow-y-auto love-scroll font-mono text-[13px] leading-relaxed pr-1">
        {lines.map((ln, i) => (
          <p key={i} className={ln.type === "cmd" ? "text-sky-500 dark:text-sky-300" : ln.type === "ok" ? "text-rose-500 dark:text-rose-300" : "text-slate-600 dark:text-slate-300"}>
            {ln.text}
          </p>
        ))}
        {typing !== null && (
          <p className="text-rose-500 dark:text-rose-300">
            {typing}
            <span className="love-terminal-cursor" />
          </p>
        )}
        {typing === null && (
          <p className="text-sky-500 dark:text-sky-300">
            小羊@love:~$ <span className="love-terminal-cursor" />
          </p>
        )}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && run(input)}
        placeholder="输入 help 看看"
        className="mt-2 bg-transparent border-t border-slate-200 dark:border-slate-700 pt-2 font-mono text-[13px] outline-none placeholder:text-slate-400"
        disabled={typing !== null}
      />
    </div>
  );
}
