"use client";

import { useEffect, useState } from "react";
import { SECRET_PASSWORD } from "@/data/love";

const MSG_KEY = "love-secret-wall-v1";
const AUTH_KEY = "love-secret-auth";

/**
 * 悄悄话密码墙
 * 输入密码解锁私密空间，两个人的悄悄话只有彼此看得见。
 */
export default function SecretWall() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(false);
  const [msgs, setMsgs] = useState<{ text: string; who: string; at: number }[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (localStorage.getItem(AUTH_KEY) === "1") setAuthed(true);
    try {
      const raw = localStorage.getItem(MSG_KEY);
      if (raw) setMsgs(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const unlock = () => {
    if (pwd === SECRET_PASSWORD) {
      setAuthed(true);
      setErr(false);
      localStorage.setItem(AUTH_KEY, "1");
    } else {
      setErr(true);
    }
  };

  const post = () => {
    const v = text.trim();
    if (!v) return;
    const next = [{ text: v, who: "小羊", at: Date.now() }, ...msgs];
    setMsgs(next);
    localStorage.setItem(MSG_KEY, JSON.stringify(next));
    setText("");
  };

  return (
    <div className="love-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="love-card-title">🤫 两个人的悄悄话</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{authed ? "已解锁" : "私密"}</span>
      </div>

      {!authed ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-6">
          <span className="text-4xl love-beat">🔐</span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            这里是只属于两个人的秘密角落
            <br />
            输入密码才能进来哦
          </p>
          <div className="flex gap-2 w-full max-w-[240px]">
            <input
              type="password"
              value={pwd}
              onChange={(e) => {
                setPwd(e.target.value);
                setErr(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && unlock()}
              placeholder="暗号"
              className="glass-input !py-2 text-sm flex-1"
            />
            <button type="button" onClick={unlock} className="love-btn !py-2">
              进入
            </button>
          </div>
          {err && <p className="text-xs text-rose-500">暗号不对哦，再想想~</p>}
          <p className="text-[11px] text-slate-400">
            （默认暗号见 data/love.ts 的 SECRET_PASSWORD，记得改掉）
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && post()}
              placeholder="写一句悄悄话给小猪…"
              className="flex-1 glass-input !py-2 text-sm"
              maxLength={100}
            />
            <button type="button" onClick={post} className="love-btn !py-2">
              说
            </button>
          </div>
          <div className="flex-1 overflow-y-auto love-scroll pr-1 flex flex-col gap-2">
            {msgs.map((m, i) => (
              <div key={i} className="rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-3.5 py-2.5">
                <p className="text-sm text-slate-700 dark:text-slate-200">{m.text}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {m.who} · {new Date(m.at).toLocaleDateString("zh-CN")}
                </p>
              </div>
            ))}
            {msgs.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">还没有悄悄话，写第一句吧~</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
