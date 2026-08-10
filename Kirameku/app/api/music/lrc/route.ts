import { NextRequest, NextResponse } from "next/server";
import Meting from "@meting/core";

export const dynamic = "force-dynamic";

// 歌词代理：服务端从网易云获取 LRC 文本，客户端不再直连第三方歌词 API
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return new NextResponse("missing id", { status: 400 });
  }

  const meting = new Meting("netease");
  meting.format(false);
  try {
    const raw = await meting.lyric(id);
    const data = JSON.parse(raw as string);
    const lrc = (data.lyric || "") as string;
    return new NextResponse(lrc, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    // 歌词获取失败时返回空文本，前端解析为空数组，不打断播放
    return new NextResponse("", { status: 200 });
  }
}
