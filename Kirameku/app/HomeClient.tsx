"use client";

import dynamic from "next/dynamic";
import SearchBar from "@/components/ui/SearchBar";
import ProfileCard from "@/components/home/ProfileCard";
import Reveal from "@/components/effects/Reveal";
import TiltCard from "@/components/effects/TiltCard";

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
const LoveCounter = dynamic(() => import("@/components/love/LoveCounter"), { ssr: false, loading: () => smallPlaceholder });
const LoveNote = dynamic(() => import("@/components/love/LoveNote"), { ssr: false, loading: () => smallPlaceholder });
const MeetProgress = dynamic(() => import("@/components/love/MeetProgress"), { ssr: false, loading: () => smallPlaceholder });
const CouplesQuiz = dynamic(() => import("@/components/love/CouplesQuiz"), { ssr: false, loading: () => smallPlaceholder });
const LoveEvents = dynamic(() => import("@/components/love/LoveEvents"), { ssr: false, loading: () => smallPlaceholder });
const Wishlist = dynamic(() => import("@/components/love/Wishlist"), { ssr: false, loading: () => smallPlaceholder });
const LoveTerminal = dynamic(() => import("@/components/love/LoveTerminal"), { ssr: false, loading: () => smallPlaceholder });
const DailyUnlock = dynamic(() => import("@/components/love/DailyUnlock"), { ssr: false, loading: () => smallPlaceholder });
const SecretWall = dynamic(() => import("@/components/love/SecretWall"), { ssr: false, loading: () => smallPlaceholder });
const LoveMap = dynamic(() => import("@/components/love/LoveMap"), { ssr: false, loading: () => <div className="rounded-3xl bg-white/20 dark:bg-slate-800/30 backdrop-blur-md border border-white/30 animate-pulse min-h-[340px]" /> });
const LoveAdmin = dynamic(() => import("@/components/love/LoveAdmin"), { ssr: false });

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
      <Reveal y={12}>
        <div className="hidden md:block">
          <SearchBar />
        </div>
      </Reveal>

      <main className="flex flex-col gap-4 md:gap-6 w-full">
        {/* 第一行：个人信息 + 播放器 */}
        <Reveal delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 w-full items-stretch">
            <div className="md:col-span-8 flex w-full">
              <TiltCard className="h-full w-full rounded-3xl">
                <ProfileCard
                  postCount={postCount}
                  chatterCount={chatterCount}
                  photoCount={photoCount}
                />
              </TiltCard>
            </div>
            <div className="md:col-span-4 flex w-full">
              <TiltCard className="h-full w-full rounded-3xl">
                <CloudPlayer />
              </TiltCard>
            </div>
          </div>
        </Reveal>

        {/* 歌词栏 */}
        <Reveal delay={0.1}>
          <div className="w-full">
            <LyricBar />
          </div>
        </Reveal>

        {/* 第二行：照片墙 + 文章 + 说说 + 舔狗日记 */}
        <Reveal delay={0.15}>
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
        </Reveal>

        {/* 情侣空间小彩蛋 */}
        <Reveal delay={0.18}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full items-stretch">
            <div className="min-h-[180px]">
              <LoveCounter />
            </div>
            <div className="min-h-[180px]">
              <LoveNote />
            </div>
            <div className="min-h-[180px]">
              <MeetProgress />
            </div>
          </div>
        </Reveal>

        {/* 情侣空间 7 件套 · 第 1 行：问答 / 纪念日 / 愿望清单 */}
        <Reveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full items-stretch">
            <div className="min-h-[280px]">
              <CouplesQuiz />
            </div>
            <div className="min-h-[280px]">
              <LoveEvents />
            </div>
            <div className="min-h-[280px]">
              <Wishlist />
            </div>
          </div>
        </Reveal>

        {/* 情侣空间 7 件套 · 第 2 行：终端 / 解锁信 / 悄悄话 */}
        <Reveal delay={0.22}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full items-stretch">
            <div className="min-h-[260px]">
              <LoveTerminal />
            </div>
            <div className="min-h-[260px]">
              <DailyUnlock />
            </div>
            <div className="min-h-[260px]">
              <SecretWall />
            </div>
          </div>
        </Reveal>

        {/* 情侣空间 7 件套 · 第 3 行：一起去过的地方 */}
        <Reveal delay={0.24}>
          <div className="w-full min-h-[340px]">
            <LoveMap />
          </div>
        </Reveal>

        {/* 底部数据面板 */}
        <Reveal delay={0.2}>
          <div className="w-full">
            <SiteDashboard />
          </div>
        </Reveal>
      </main>

      {/* 站内管理入口（管理密码模式，浮动按钮） */}
      <LoveAdmin />
    </div>
  );
}
