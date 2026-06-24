"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/providers/ThemeProvider";

import SettingsPanel from "@/components/ui/SettingsPanel";
import {
  Home,
  BookOpen,
  MessageSquare,
  Newspaper,
  FolderGit2,
  Users,
  Camera,
  Clock,
  Music,
  User,
  Sun,
  Moon,
  Menu,
  X,
  Settings,
  Bookmark,
} from "lucide-react";

const navLinks = [
  { href: "/", label: "首页", icon: Home },
  { href: "/posts", label: "杂记", icon: BookOpen },
  { href: "/moments", label: "碎碎念", icon: MessageSquare },
  { href: "/messages", label: "悄悄话", icon: Newspaper },
  { href: "/bookmark", label: "藏宝库", icon: Bookmark },
  { href: "/projects", label: "瞬间", icon: FolderGit2 },
  { href: "/friends", label: "友链", icon: Users },
  { href: "/photowall", label: "留影", icon: Camera },
  { href: "/timeline", label: "时光轴", icon: Clock },
  { href: "/music", label: "想和你听", icon: Music },
  { href: "/about", label: "关于我们", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [easterEgg, setEasterEgg] = useState(false);
  const clickTimes = useRef<number[]>([]);

  const handleLogoClick = useCallback(() => {
    const now = Date.now();
    clickTimes.current.push(now);
    clickTimes.current = clickTimes.current.filter(t => now - t < 2000);
    if (clickTimes.current.length >= 7) {
      clickTimes.current = [];
      setEasterEgg(true);
      import("@/components/ui/Confetti").then(({ launchConfetti }) => launchConfetti());
      setTimeout(() => setEasterEgg(false), 8000);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 子站页面隐藏主站导航栏
  if (pathname.startsWith("/garden")) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className={`shrink-0 flex items-center space-x-0.5 select-none ${easterEgg ? "animate-[spin_0.5s_ease-in-out_3]" : ""}`}
              style={easterEgg ? { animation: "spin 0.5s ease-in-out 6, rainbow 3s linear" } : undefined}
            >
              <span className={`whitespace-nowrap text-xl font-bold tracking-tight ${easterEgg ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" : "text-slate-800 dark:text-white"}`} style={{ fontFamily: "'Noto Serif SC', serif" }}>
                小羊与小猪
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-1 min-w-0 items-center justify-center overflow-x-auto space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${isActive
                        ? "text-sky-600 dark:text-sky-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-sky-500 rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Theme Toggle, Settings & Mobile Menu */}
            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Settings Button */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  title="设置"
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {isSettingsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 glass-card rounded-none border-x-0 md:hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                        ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
