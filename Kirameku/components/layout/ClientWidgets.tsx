"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const FloatingPlayer = dynamic(() => import("@/components/music/FloatingPlayer"), { ssr: false });
const Live2D = dynamic(() => import("@/components/widgets/Live2D"), { ssr: false });
const Toolbox = dynamic(() => import("@/components/widgets/Toolbox"), { ssr: false });
const GamesPanel = dynamic(() => import("@/components/widgets/GamesPanel"), { ssr: false });

export default function ClientWidgets() {
  const pathname = usePathname();
  // 工具箱/游戏面板（壳 + dnd-kit 拖动）在首次用户交互后才挂载，
  // 避免每个页面首屏白下载几十 KB 面板代码
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const activate = () => setInteracted(true);
    window.addEventListener("pointerdown", activate, { once: true });
    window.addEventListener("keydown", activate, { once: true });
    return () => {
      window.removeEventListener("pointerdown", activate);
      window.removeEventListener("keydown", activate);
    };
  }, []);

  if (pathname.startsWith("/garden")) return null;

  return (
    <>
      <FloatingPlayer />
      <Live2D />
      {interacted && (
        <>
          <Toolbox />
          <GamesPanel />
        </>
      )}
    </>
  );
}
