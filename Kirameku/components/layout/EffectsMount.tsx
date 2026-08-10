"use client";

import dynamic from "next/dynamic";

// 5 个装饰特效组件：点击粒子、径向菜单、鼠标拖尾、季节粒子、选中闪光
// 全部懒加载（ssr: false），不进入首屏 JS 基线；
// 特效本身是事件/可见性驱动，加载完成后行为与之前完全一致
const ClickEffect = dynamic(() => import("@/components/ui/ClickEffect"), { ssr: false });
const RadialMenu = dynamic(() => import("@/components/ui/RadialMenu"), { ssr: false });
const MouseTrail = dynamic(() => import("@/components/ui/MouseTrail"), { ssr: false });
const SeasonalEffect = dynamic(() => import("@/components/ui/SeasonalEffect"), { ssr: false });
const KiraSparkle = dynamic(() => import("@/components/ui/KiraSparkle"), { ssr: false });

export default function EffectsMount() {
  return (
    <>
      <ClickEffect />
      <RadialMenu />
      <MouseTrail />
      <SeasonalEffect />
      <KiraSparkle />
    </>
  );
}
