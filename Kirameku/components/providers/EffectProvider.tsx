"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

export type AnimationQuality = "standard" | "light";

interface EffectContextType {
  clickEffect: boolean;
  mouseTrail: boolean;
  seasonalEffect: boolean;
  sparkleEffect: boolean;
  animationQuality: AnimationQuality;
  toggleClickEffect: () => void;
  toggleMouseTrail: () => void;
  toggleSeasonalEffect: () => void;
  toggleSparkleEffect: () => void;
  setAnimationQuality: (q: AnimationQuality) => void;
}

const EffectContext = createContext<EffectContextType>({
  clickEffect: true,
  mouseTrail: false,
  seasonalEffect: false,
  sparkleEffect: false,
  animationQuality: "standard",
  toggleClickEffect: () => {},
  toggleMouseTrail: () => {},
  toggleSeasonalEffect: () => {},
  toggleSparkleEffect: () => {},
  setAnimationQuality: () => {},
});

export function EffectProvider({ children }: { children: ReactNode }) {
  const [clickEffect, setClickEffect] = useState(true);
  const [mouseTrail, setMouseTrail] = useState(false);
  const [seasonalEffect, setSeasonalEffect] = useState(false);
  const [sparkleEffect, setSparkleEffect] = useState(false);
  const [animationQuality, setAnimationQualityState] = useState<AnimationQuality>("standard");

  // 从 localStorage 恢复状态
  useEffect(() => {
    const savedClick = localStorage.getItem("clickEffect");
    const savedTrail = localStorage.getItem("mouseTrail");
    const savedSeasonal = localStorage.getItem("seasonalEffect");
    const savedSparkle = localStorage.getItem("sparkleEffect");
    const savedQuality = localStorage.getItem("animationQuality");
    if (savedClick !== null) setClickEffect(savedClick === "true");
    if (savedTrail !== null) setMouseTrail(savedTrail === "true");
    if (savedSeasonal !== null) setSeasonalEffect(savedSeasonal === "true");
    if (savedSparkle !== null) setSparkleEffect(savedSparkle === "true");
    if (savedQuality === "standard" || savedQuality === "light") {
      setAnimationQualityState(savedQuality);
    }
  }, []);

  // 轻盈模式：body 挂 anim-light 类，CSS 停用背景流动、看板娘摇晃等装饰动画
  useEffect(() => {
    document.body.classList.toggle("anim-light", animationQuality === "light");
    return () => document.body.classList.remove("anim-light");
  }, [animationQuality]);

  const toggleClickEffect = useCallback(() => {
    setClickEffect((prev) => {
      localStorage.setItem("clickEffect", String(!prev));
      return !prev;
    });
  }, []);

  const toggleMouseTrail = useCallback(() => {
    setMouseTrail((prev) => {
      localStorage.setItem("mouseTrail", String(!prev));
      return !prev;
    });
  }, []);

  const toggleSeasonalEffect = useCallback(() => {
    setSeasonalEffect((prev) => {
      localStorage.setItem("seasonalEffect", String(!prev));
      return !prev;
    });
  }, []);

  const toggleSparkleEffect = useCallback(() => {
    setSparkleEffect((prev) => {
      localStorage.setItem("sparkleEffect", String(!prev));
      return !prev;
    });
  }, []);

  const setAnimationQuality = useCallback((q: AnimationQuality) => {
    setAnimationQualityState(q);
    localStorage.setItem("animationQuality", q);
  }, []);

  const value = useMemo(() => ({
    clickEffect, mouseTrail, seasonalEffect, sparkleEffect, animationQuality,
    toggleClickEffect, toggleMouseTrail, toggleSeasonalEffect, toggleSparkleEffect, setAnimationQuality,
  }), [clickEffect, mouseTrail, seasonalEffect, sparkleEffect, animationQuality,
       toggleClickEffect, toggleMouseTrail, toggleSeasonalEffect, toggleSparkleEffect, setAnimationQuality]);

  return (
    <EffectContext.Provider value={value}>
      {children}
    </EffectContext.Provider>
  );
}

export function useEffects() {
  return useContext(EffectContext);
}
