"use client";

import dynamic from "next/dynamic";
import SearchBar from "@/components/ui/SearchBar";
import ProfileCard from "@/components/home/ProfileCard";
import FadeIn from "@/components/ui/FadeIn";

const placeholder = (
  <div className="rounded-3xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-md border border-white/30 animate-pulse min-h-[240px] md:min-h-[420px]" />
);

const smallPlaceholder = (
  <div className="rounded-3xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-md border border-white/30 animate-pulse min-h-[160px] md:min-h-[220px]" />
);

const CloudPlayer = dynamic(() => import("@/components/music/CloudPlayer"), { ssr: false, loading: () => smallPlaceholder });
const LyricBar = dynamic(() => import("@/components/music/LyricBar"), { ssr: false, loading: () => smallPlaceholder });
const LatestPostsCarousel = dynamic(() => import("@/components/home/LatestPostsCarousel"), { ssr: false, loading: () => smallPlaceholder });
const LatestChatterCarousel = dynamic(() => import("@/components/home/LatestChatterCarousel"), { ssr: false, loading: () => smallPlaceholder });
const PhotoWallPreview = dynamic(() => import("@/components/home/PhotoWallPreview"), { ssr: false, loading: () => placeholder });
const DogDiary = dynamic(() => import("@/components/home/DogDiary"), { ssr: false, loading: () => smallPlaceholder });
const SiteDashboard = dynamic(() => import("@/components/widgets/SiteDashboard"), { ssr: false, loading: () => smallPlaceholder });

export default function HomeClient({
  postCount,
  chatterCount,
  photoCount,
}: {
  postCount: number;
  chatterCount: number;
  photoCount: number;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto py-6 md:py-12 px-4 sm:px-10 relative z-10">
      {/* 搜索栏 */}
      <FadeIn>
        <div className="hidden md:block">
          <SearchBar />
        </div>
      </FadeIn>

      <main className="flex flex-col gap-4 md:gap-6 w-full">
        {/* 第一行：个人信息 + 播放器 */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full items-stretch">
            <div className="md:col-span-8 flex w-full">
              <ProfileCard
                postCount={postCount}
                chatterCount={chatterCount}
                photoCount={photoCount}
              />
            </div>
            <div className="md:col-span-4 flex w-full">
              <CloudPlayer />
            </div>
          </div>
        </FadeIn>

        {/* 歌词栏 */}
        <FadeIn delay={0.15}>
          <div className="w-full">
            <LyricBar />
          </div>
        </FadeIn>

        {/* 第二行：照片墙 + 文章 + 说说 + 舔狗日记 */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full items-stretch">
            <div className="md:col-span-4 h-full">
              <PhotoWallPreview />
            </div>
            <div className="md:col-span-8 flex flex-col gap-4 md:gap-6 h-full">
              <LatestPostsCarousel />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 flex-1 md:min-h-[220px] items-stretch">
                <div className="md:col-span-8 h-full">
                  <LatestChatterCarousel />
                </div>
                <div className="md:col-span-4 h-full flex">
                  <DogDiary />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 底部数据面板 */}
        <FadeIn delay={0.25}>
          <div className="w-full">
            <SiteDashboard />
          </div>
        </FadeIn>
      </main>
    </div>
  );
}
