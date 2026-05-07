import React from "react";
import { motion } from "framer-motion";
import MarkdownRenderer from "./MarkdownRenderer";

const SummaryBox = ({ summary, loading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-5 border rounded-2xl bg-surface shadow-lg flex flex-col relative group min-h-[300px] h-full"
      style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
      role="log"
      aria-live="polite"
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <h3 className="text-xl font-bold text-primary flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="text-amber-500">✨</span> Summary
        </h3>
      </div>

      {/* Main Content — Matches TranscriptBox Size & Scrolling */}
      <div className="flex-grow overflow-y-auto pr-1 no-scrollbar" style={{ maxHeight: "calc(100vh - 360px)" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-4xl mb-4"
            >
              ⏳
            </motion.div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Generating English summary...</p>
            <p className="text-xs mt-2 px-3 py-1 rounded-full" style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}>
              Distilling video notes via Google Gemini
            </p>
          </div>
        ) : summary ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="prose prose-sm max-w-none text-sm sm:text-base leading-relaxed tracking-wide font-normal font-sans"
            style={{ color: "var(--text-primary)" }}
          >
            <MarkdownRenderer content={summary} />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <span className="text-4xl mb-3 opacity-40">✨</span>
            <h4 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No summary generated</h4>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Click the "Summarize" action button to extract key video concept guides.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SummaryBox;
