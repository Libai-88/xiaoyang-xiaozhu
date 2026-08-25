import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wemust-99.cc.cd";
const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/posts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/moments`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/messages`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/bookmark`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/projects`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/friends`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/photowall`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/timeline`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/music`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/about`, changeFrequency: "yearly", priority: 0.4 },
  ];

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${backendUrl}/api/posts?status=published&page=1&size=200`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = (await res.json()) as { slug: string; updated_at?: string }[];
      if (Array.isArray(data)) {
        postRoutes = data.map((p) => ({
          url: `${baseUrl}/posts/${encodeURIComponent(p.slug)}`,
          lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      }
    }
  } catch {
    // 后端不可达时只返回静态路由
  }

  return [...staticRoutes, ...postRoutes];
}
