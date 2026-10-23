"use client";

import dynamic from "next/dynamic";

const LoveMapView = dynamic(() => import("./LoveMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[260px] rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
  ),
});

/**
 * 一起去过的地方：地图打卡
 * 点击地图添加标记，localStorage 持久化。
 */
export default function LoveMap() {
  return (
    <div className="love-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="love-card-title">🗺️ 一起去过的地方</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">点击地图添加打卡点</span>
      </div>
      <div className="flex-1 min-h-[300px]">
        <LoveMapView />
      </div>
    </div>
  );
}
