import type { SyntheticEvent } from "react";

// 图片加载失败时降级到占位图；dataset 标记防止占位图也失败时死循环
export function imgFallback(fallbackSrc: string) {
  return (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.dataset.fallback) {
      img.dataset.fallback = "1";
      img.src = fallbackSrc;
    }
  };
}

export const postCoverFallback = imgFallback("/images/default-cover.jpg");
export const musicCoverFallback = imgFallback("/images/music-cover.jpg");
