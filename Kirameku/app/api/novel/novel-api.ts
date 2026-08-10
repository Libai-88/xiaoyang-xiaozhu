// 小说 API 地址只允许 http/https；非法时回退为空（走同源相对请求，与原行为一致）
const NOVEL_API_BASE = (() => {
  const raw = process.env.NEXT_PUBLIC_NOVEL_API_URL || "";
  if (!raw) return "";
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "";
    return u.origin;
  } catch {
    return "";
  }
})();

export async function novelFetch(path: string, options?: RequestInit) {
  // 只允许相对路径的 reader3 接口，拒绝绝对地址、协议相对地址（防 SSRF 与路径注入）
  if (!path.startsWith("/reader3/") || path.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(path)) {
    throw new Error("非法请求路径");
  }
  // 通过 URL 构造器拼接，任何非法组合都会直接抛错而不是被 fetch 解释
  const url = NOVEL_API_BASE ? new URL(path, NOVEL_API_BASE).toString() : path;
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`);
  }
  return res;
}

// 获取书架
export async function getBookshelf() {
  const res = await novelFetch("/reader3/getBookshelf");
  return res.json();
}

// 校验书源 URL：仅允许 http/https 公网地址，拒绝回环与内网（防经小说代理探测内网）
function assertSafeBookUrl(url?: string) {
  if (!url) return;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("非法的书源地址");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("书源地址仅支持 http/https");
  }
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local") ||
    host === "::1" ||
    host === "[::1]" ||
    host.startsWith("0.") ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    throw new Error("书源地址不允许访问内网");
  }
}

// 获取目录
export async function getChapterList(bookUrl: string, bookSourceUrl?: string) {
  assertSafeBookUrl(bookUrl);
  assertSafeBookUrl(bookSourceUrl);
  const res = await novelFetch("/reader3/getChapterList", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: bookUrl, bookSourceUrl: bookSourceUrl || "", refresh: 0 }),
  });
  return res.json();
}

// 获取章节内容
export async function getBookContent(bookUrl: string, index: number) {
  assertSafeBookUrl(bookUrl);
  const res = await novelFetch("/reader3/getBookContent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: bookUrl, index }),
  });
  return res.json();
}

// 搜索小说（多源）
export async function searchBookMulti(key: string) {
  const res = await novelFetch("/reader3/searchBookMulti", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, searchSize: 20, concurrentCount: 36 }),
  });
  return res.json();
}

// 搜索小说 SSE 流式 URL（GET，EventSource 用）
export function searchBookMultiSSEUrl(key: string, lastIndex = -1) {
  const params = new URLSearchParams({ key, lastIndex: String(lastIndex), searchSize: "50", concurrentCount: "24" });
  return `${NOVEL_API_BASE}/reader3/searchBookMultiSSE?${params}`;
}

// 获取书源列表
export async function getBookSources() {
  const res = await novelFetch("/reader3/getBookSources?simple=1");
  return res.json();
}

// 搜索单源
export async function searchBook(key: string, bookSourceUrl: string) {
  const res = await novelFetch("/reader3/searchBook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, bookSourceUrl }),
  });
  return res.json();
}

// 保存阅读进度
export async function saveBookProgress(bookUrl: string, index: number) {
  assertSafeBookUrl(bookUrl);
  const res = await novelFetch("/reader3/saveBookProgress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: bookUrl, index }),
  });
  return res.json();
}
