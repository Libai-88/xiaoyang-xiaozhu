"use client";

import { useMemo, useState } from "react";

/**
 * 情侣空间站内编辑（管理密码模式）
 * 输入管理密码 → 读取 GitHub 上的 love.ts 当前内容 → 表单修改 →
 * 保存时后端改写 love.ts 并推 GitHub，Vercel 自动重建后全站生效。
 */

interface EventRow {
  id: string;
  name: string;
  emoji: string;
  date: string;
}

interface LetterRow {
  days: number;
  emoji: string;
  title: string;
  content: string;
}

interface PlaceRow {
  id: string;
  name: string;
  lat: string;
  lng: string;
  note: string;
  emoji: string;
}

const PWD_KEY = "love_admin_pwd";

export default function LoveAdmin() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [events, setEvents] = useState<EventRow[]>([]);
  const [wishlist, setWishlist] = useState("");
  const [letters, setLetters] = useState<LetterRow[]>([]);
  const [password, setPassword] = useState("");
  const [places, setPlaces] = useState<PlaceRow[]>([]);

  const dirty = useMemo(
    () => events.length > 0 || wishlist !== "" || letters.length > 0 || places.length > 0,
    [events, wishlist, letters, places]
  );

  const verify = async (p?: string) => {
    const pwdValue = p ?? pwd;
    if (!pwdValue) {
      setMsg({ type: "err", text: "先输入管理密码" });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/love/content", {
        headers: { "X-Admin-Password": pwdValue },
      });
      if (res.status === 401) {
        setMsg({ type: "err", text: "密码不对哦" });
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.data) {
        setMsg({ type: "err", text: data?.detail || "加载失败，稍后再试" });
        return;
      }
      sessionStorage.setItem(PWD_KEY, pwdValue);
      setPwd(pwdValue);
      setAuthed(true);
      const d = data.data;
      setEvents(d.events || []);
      setWishlist((d.wishlist || []).join("\n"));
      setLetters(d.letters || []);
      setPassword(d.password || "");
      setPlaces(
        (d.places || []).map((p: { id: string; name: string; lat: number; lng: number; note: string; emoji: string }) => ({
          id: p.id,
          name: p.name,
          lat: String(p.lat),
          lng: String(p.lng),
          note: p.note,
          emoji: p.emoji,
        }))
      );
    } catch {
      setMsg({ type: "err", text: "连不上服务器，稍后再试" });
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/love/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Password": pwd },
        body: JSON.stringify({
          events: events.map((e) => ({ id: e.id, date: e.date })),
          wishlist: wishlist
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          letters: letters.map((l) => ({ days: l.days, content: l.content })),
          password,
          places: places.map((p) => ({
            name: p.name,
            lat: parseFloat(p.lat) || 0,
            lng: parseFloat(p.lng) || 0,
            note: p.note,
            emoji: p.emoji,
          })),
        }),
      });
      const d = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg({ type: "err", text: d?.detail || "保存失败，稍后再试" });
        return;
      }
      setMsg({ type: "ok", text: d?.message || "已提交！约 1 分钟后全站生效" });
    } catch {
      setMsg({ type: "err", text: "保存失败，稍后再试" });
    } finally {
      setSaving(false);
    }
  };

  const addPlace = () =>
    setPlaces((prev) => [
      ...prev,
      { id: "", name: "", lat: "", lng: "", note: "", emoji: "📍" },
    ]);

  const updatePlace = (i: number, key: keyof PlaceRow, value: string) =>
    setPlaces((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));

  const removePlace = (i: number) => setPlaces((prev) => prev.filter((_, idx) => idx !== i));

  const inputCls =
    "w-full rounded-xl bg-white/60 dark:bg-slate-700/40 border border-white/50 dark:border-slate-600/50 px-3 py-2 text-sm outline-none focus:border-rose-300 dark:focus:border-rose-400/60 transition-colors";

  return (
    <>
      {/* 浮动入口按钮 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-5 bottom-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-rose-200/60 dark:border-rose-400/30 shadow-lg shadow-rose-200/40 hover:scale-110 transition-transform text-lg"
        title="管理小站"
        aria-label="管理小站"
      >
        🔧
      </button>

      {/* 编辑面板 */}
      {open && (
        <div className="fixed left-5 bottom-20 z-50 w-[min(92vw,420px)] max-h-[70vh] overflow-y-auto love-scroll rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl shadow-rose-300/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-rose-500 dark:text-rose-300">🔧 管理小站</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
              aria-label="关闭"
            >
              ✕
            </button>
          </div>

          {!authed ? (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                输入管理密码解锁编辑（访客看不到这里）
              </p>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verify()}
                placeholder="管理密码"
                className={inputCls}
              />
              <button
                onClick={() => verify()}
                disabled={loading}
                className="love-btn w-full disabled:opacity-60"
              >
                {loading ? "解锁中…" : "解锁"}
              </button>
              {msg && (
                <p className={`text-xs ${msg.type === "ok" ? "text-emerald-500" : "text-rose-500"}`}>
                  {msg.text}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* 纪念日 */}
              <section>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">📅 纪念日日期</p>
                <div className="flex flex-col gap-1.5">
                  {events.map((e, i) => (
                    <div key={e.id} className="flex items-center gap-2">
                      <span className="w-6 text-center">{e.emoji}</span>
                      <span className="w-24 shrink-0 text-xs text-slate-600 dark:text-slate-300">{e.name}</span>
                      <input
                        value={e.date}
                        onChange={(ev) =>
                          setEvents((prev) =>
                            prev.map((x, idx) => (idx === i ? { ...x, date: ev.target.value } : x))
                          )
                        }
                        placeholder="留空则不显示"
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* 愿望清单 */}
              <section>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  ✅ 想一起做的事（每行一条）
                </p>
                <textarea
                  value={wishlist}
                  onChange={(e) => setWishlist(e.target.value)}
                  rows={8}
                  className={inputCls + " font-mono text-xs leading-relaxed"}
                />
              </section>

              {/* 里程碑信件 */}
              <section>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">💌 里程碑信件</p>
                <div className="flex flex-col gap-2">
                  {letters.map((l, i) => (
                    <div key={l.days}>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {l.emoji} {l.title}
                      </p>
                      <textarea
                        value={l.content}
                        onChange={(e) =>
                          setLetters((prev) =>
                            prev.map((x, idx) => (idx === i ? { ...x, content: e.target.value } : x))
                          )
                        }
                        rows={2}
                        placeholder="写点什么…（留空则显示等主人来写）"
                        className={inputCls + " text-xs"}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* 悄悄话密码 */}
              <section>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">🤫 悄悄话密码</p>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="访客进悄悄话墙要输的暗号"
                  className={inputCls}
                />
              </section>

              {/* 足迹地图 */}
              <section>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">🗺️ 一起去过的地方</p>
                  <button
                    onClick={addPlace}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    + 添加地点
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {places.map((p, i) => (
                    <div key={i} className="rounded-xl bg-white/50 dark:bg-slate-800/40 border border-white/40 dark:border-white/10 p-2 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <input
                          value={p.emoji}
                          onChange={(e) => updatePlace(i, "emoji", e.target.value)}
                          className="w-10 text-center rounded-lg bg-white/60 dark:bg-slate-700/40 px-1 py-1 text-sm"
                          placeholder="📍"
                        />
                        <input
                          value={p.name}
                          onChange={(e) => updatePlace(i, "name", e.target.value)}
                          placeholder="地点名称（必填）"
                          className={inputCls}
                        />
                        <button
                          onClick={() => removePlace(i)}
                          className="shrink-0 text-xs text-slate-400 hover:text-rose-500"
                          aria-label="删除"
                        >
                          🗑
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <input
                          value={p.lat}
                          onChange={(e) => updatePlace(i, "lat", e.target.value)}
                          placeholder="纬度 lat，如 30.5928"
                          className={inputCls}
                        />
                        <input
                          value={p.lng}
                          onChange={(e) => updatePlace(i, "lng", e.target.value)}
                          placeholder="经度 lng，如 114.3055"
                          className={inputCls}
                        />
                      </div>
                      <input
                        value={p.note}
                        onChange={(e) => updatePlace(i, "note", e.target.value)}
                        placeholder="备注，如：故事开始的地方"
                        className={inputCls}
                      />
                    </div>
                  ))}
                  {places.length === 0 && (
                    <p className="text-xs text-slate-400">还没有地点，点「添加地点」加第一个吧</p>
                  )}
                </div>
              </section>

              {/* 保存 */}
              <button
                onClick={save}
                disabled={saving}
                className="love-btn w-full disabled:opacity-60"
              >
                {saving ? "提交中…" : "💾 保存并生效"}
              </button>
              {msg && (
                <p className={`text-xs ${msg.type === "ok" ? "text-emerald-500" : "text-rose-500"}`}>
                  {msg.text}
                </p>
              )}
              <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                保存后会推送到 GitHub，Vercel 自动重建，约 1 分钟全站生效。
                {dirty ? " 已加载到当前线上内容，直接改就行。" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
