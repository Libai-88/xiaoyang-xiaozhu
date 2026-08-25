import type { MetadataRoute } from "next";
import { siteConfig } from "@/siteConfig";

// Web App Manifest：移动端支持“添加到主屏幕”，图标与主题色复用站点品牌色
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.title,
    description: siteConfig.bio,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7fb",
    theme_color: "#a18cd1",
    icons: [
      { src: "/icon.png", sizes: "640x639", type: "image/png" },
      { src: "/icon.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
  };
}
