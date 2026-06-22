"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DogDiary() {
  const text = "记得喝水，记得吃饭，记得早睡，记得想我";
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="w-full h-[160px] md:h-[220px] rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-3 md:p-6 flex flex-col justify-between transition-all duration-700 hover:scale-[1.01] cursor-pointer group overflow-hidden"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-pink-500 dark:text-pink-400 tracking-widest uppercase bg-white/50 dark:bg-slate-900/50 px-2 py-0.5 rounded-sm shadow-sm">
              小纸条
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed line-clamp-5 transition-colors duration-700">
            {text}
          </p>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 self-end">
          点击查看全文
        </p>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md glass-card p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  小纸条
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  title="关闭"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-6">
                {text}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
