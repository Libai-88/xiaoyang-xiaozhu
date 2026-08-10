import HomeClient from "./HomeClient";

// 后端地址只允许 http/https，防止环境变量被注入 javascript:/file: 等危险协议
function resolveBackendUrl(): string {
  const raw = process.env.BACKEND_URL || "http://127.0.0.1:8000";
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return "http://127.0.0.1:8000";
    return u.origin;
  } catch {
    return "http://127.0.0.1:8000";
  }
}

const API = resolveBackendUrl();

async function fetchProfileData() {
  try {
    const [postsRes, chattersRes, albums] = await Promise.all([
      fetch(`${API}/api/posts/count?status=published`, { next: { revalidate: 60 } }).then((r) => r.json()),
      fetch(`${API}/api/chatters/count?status=published`, { next: { revalidate: 60 } }).then((r) => r.json()),
      fetch(`${API}/api/albums`, { next: { revalidate: 60 } }).then((r) => r.json()),
    ]);
    return {
      postCount: postsRes.count ?? 0,
      chatterCount: chattersRes.count ?? 0,
      photoCount: Array.isArray(albums)
        ? albums.reduce((acc: number, a: { photo_count?: number }) => acc + (a.photo_count ?? 0), 0)
        : 0,
    };
  } catch {
    return { postCount: 0, chatterCount: 0, photoCount: 0 };
  }
}

export default async function Home() {
  const { postCount, chatterCount, photoCount } = await fetchProfileData();

  return (
    <HomeClient
      postCount={postCount}
      chatterCount={chatterCount}
      photoCount={photoCount}
    />
  );
}
