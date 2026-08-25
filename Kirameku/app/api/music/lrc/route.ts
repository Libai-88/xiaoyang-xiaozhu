import { NextRequest, NextResponse } from "next/server";

// 歌词代理：服务端直连网易云获取 LRC 文本（@meting/core 在 serverless 下请求会失败）
// 加内存缓存 + Cache-Control，避免重复请求拖慢播放器

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 小时
const cache = new Map<string, { text: string; expires: number }>();

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return new NextResponse("missing id", { status: 400 });
  }

  const cached = cache.get(id);
  if (cached && cached.expires > Date.now()) {
    return new NextResponse(cached.text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    });
  }

  try {
    const res = await fetch(
      `https://music.163.com/api/song/lyric?id=${id}&lv=1&kv=1&tv=-1`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://music.163.com/",
          Cookie: "os=pc; appver=8.0.0",
        },
        next: { revalidate: 21600 },
      }
    );
    const data = await res.json();
    const lrc = (data?.lrc?.lyric || "") as string;
    cache.set(id, { text: lrc, expires: Date.now() + CACHE_TTL });

    return new NextResponse(lrc, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=21600",
      },
    });
  } catch {
    // 歌词获取失败时返回空文本，前端解析为空数组，不打断播放
    return new NextResponse("", { status: 200 });
  }
}
