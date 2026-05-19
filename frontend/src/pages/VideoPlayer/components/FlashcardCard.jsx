import React, { useState } from "react";
import { motion } from "framer-motion";
import { RotateCw, HelpCircle, BookOpen } from "lucide-react";

export default function FlashcardCard({ question, answer }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="w-full h-64 cursor-pointer select-none"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-full h-full relative duration-500"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* FRONT SIDE */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            <span className="flex items-center gap-1.5">
              <HelpCircle size={14} />
              Concept / Question
            </span>
            <RotateCw size={14} className="opacity-50 animate-pulse" />
          </div>

          {/* Main text */}
          <div className="flex-1 flex items-center justify-center py-4">
            <h4 
              className="text-lg md:text-xl font-bold text-center leading-snug tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {question}
            </h4>
          </div>

          {/* Footer */}
          <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Click anywhere to reveal answer
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "var(--bg-elevated)",
            border: "1px solid var(--accent-subtle)",
            boxShadow: "0 8px 30px var(--accent-subtle)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
              <BookOpen size={14} />
              Definition / Explanation
            </span>
            <RotateCw size={14} className="opacity-50" />
          </div>

          {/* Main text */}
          <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto max-h-[140px] no-scrollbar">
            <p 
              className="text-sm md:text-base font-medium text-center leading-relaxed tracking-wide"
              style={{ color: "var(--text-primary)" }}
            >
              {answer}
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Click anywhere to flip back
          </div>
        </div>
      </motion.div>
    </div>
  );
}
