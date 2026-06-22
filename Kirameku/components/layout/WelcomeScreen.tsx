"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { siteConfig } from "@/siteConfig";

const SESSION_KEY = "welcome-shown";

export default function WelcomeScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      setShow(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 3500);
    return () => clearTimeout(timer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1, pointerEvents: "auto" }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* 背景 */}
          <motion.div
            className="absolute inset-0 bg-slate-950"
            exit={{ scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${siteConfig.bgImages[0]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(20px)",
            }}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 1.2 }}
          />

          {/* 内容 */}
          <div className="relative z-10 text-center px-6">
            {/* 欢迎语 */}
            <motion.p
              className="text-lg md:text-xl text-slate-400 mb-4 tracking-[0.3em]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              欢迎来到小羊与小猪的小小世界
            </motion.p>

            {/* 站名 */}
            <motion.div
              className="flex items-center justify-center space-x-1 mb-4"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
            >
              <span
                className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {siteConfig.title}
              </span>
            </motion.div>

            {/* 时间问候 */}
            <motion.p
              className="text-sm md:text-base text-slate-500 tracking-wider"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
            >
              今天也很适合想你
            </motion.p>

            {/* 装饰线 */}
            <motion.div
              className="mx-auto mt-8 h-px bg-gradient-to-r from-transparent via-sky-500/40 to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 160, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
