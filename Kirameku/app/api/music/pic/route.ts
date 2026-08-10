import { NextRequest, NextResponse } from "next/server";
import Meting from "@meting/core";

export const dynamic = "force-dynamic";

// 封面代理：服务端从网易云 CDN 拉取封面图字节，客户端只连本站，避免 CDN 被网络阻断
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^\d+$/.test(id)) {
    return new NextResponse("missing id", { status: 400 });
  }

  const meting = new Meting("netease");
  meting.format(false);
  try {
    const picRaw = await meting.pic(id, 300);
    const picData = JSON.parse(picRaw as string);
    const url = (picData.url || "").replace(/^http:\/\//, "https://");
    if (!url) return new NextResponse("not found", { status: 404 });

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return new NextResponse("upstream error", { status: 502 });
    const buf = await res.arrayBuffer();

    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("upstream error", { status: 502 });
  }
}
