"use client";

import Script from "next/script";

export default function Live2D() {
  // 经 ClientWidgets 的 dynamic(ssr: false) 引入，渲染时可直接读 matchMedia
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return null;
  }

  return (
    <Script
      src="/live2d/jsdelivr/random/autoload.js?v=4"
      strategy="lazyOnload"
    />
  );
}
