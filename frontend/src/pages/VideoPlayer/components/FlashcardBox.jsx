import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Award, RefreshCw } from "lucide-react";
import FlashcardCard from "./FlashcardCard";

export default function FlashcardBox({ flashcards, loading, onRetry }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [masteredCards, setMasteredCards] = useState(new Set());

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleMastered = (index) => {
    const next = new Set(masteredCards);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setMasteredCards(next);
  };

  if (loading) {
    return (
      <div 
        className="p-8 border rounded-3xl bg-surface flex flex-col items-center justify-center min-h-[360px]"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-4xl mb-4"
        >
          🧠
        </motion.div>
        <p className="font-bold text-center" style={{ color: "var(--text-primary)" }}>
          Neural Core generating study deck...
        </p>
        <p className="text-xs text-center mt-2 px-4 py-1.5 rounded-full" style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}>
          Synthesizing key topics into flashcards
        </p>
      </div>
    );
  }

  if (!flashcards || flashcards.length === 0) {
    return (
      <div 
        className="p-8 border rounded-3xl bg-surface flex flex-col items-center justify-center min-h-[320px] text-center"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        <span className="text-4xl mb-3 opacity-60">💡</span>
        <h4 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Flashcards Uninitialized
        </h4>
        <p className="text-sm max-w-xs mt-2 mb-6" style={{ color: "var(--text-secondary)" }}>
          Create a neural study deck to instantly boost your active recall and retention.
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          style={{ background: "var(--accent)", color: "#fff", boxShadow: "0 4px 14px var(--accent-subtle)" }}
        >
          <RefreshCw size={14} />
          Generate Deck
        </button>
      </div>
    );
  }

  const isMastered = masteredCards.has(currentIndex);

  return (
    <div className="flex flex-col gap-6">
      {/* Deck progress header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Recall Deck
          </span>
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            Interactive Practice
            {masteredCards.size === flashcards.length && (
              <motion.span 
                initial={{ scale: 0 }} 
                animate={{ scale: 1 }} 
                className="text-green-500"
              >
                <Award size={18} />
              </motion.span>
            )}
          </h3>
        </div>
        
        <div className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
          {currentIndex + 1} / {flashcards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <motion.div 
          className="h-full rounded-full" 
          style={{ background: "var(--accent)" }}
          animate={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* The 3D Card Area with Slide animations */}
      <div className="relative min-h-[260px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <FlashcardCard 
              question={flashcards[currentIndex].question} 
              answer={flashcards[currentIndex].answer} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Active Navigation & Mastery Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Prev Card */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl border border-theme hover:bg-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
          title="Previous Card"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Mastered Button */}
        <button
          onClick={() => toggleMastered(currentIndex)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${
            isMastered 
              ? "bg-green-500 text-white shadow-lg shadow-green-100 dark:shadow-none" 
              : "border border-theme hover:border-green-500/50 hover:bg-green-500/5 hover:text-green-500"
          }`}
          style={{ 
            borderColor: isMastered ? "transparent" : "var(--border)",
            color: isMastered ? "#fff" : "var(--text-secondary)"
          }}
        >
          <Check size={16} className={isMastered ? "animate-bounce" : ""} />
          {isMastered ? "Mastered Concept!" : "Mark as Mastered"}
        </button>

        {/* Next Card */}
        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="p-3 rounded-xl border border-theme hover:bg-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
          title="Next Card"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Deck stats overview */}
      <div className="flex justify-between items-center text-xs mt-2 px-4 py-3 rounded-2xl" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        <span>Mastery Level: {Math.round((masteredCards.size / flashcards.length) * 100)}%</span>
        <span>{masteredCards.size} of {flashcards.length} memorized</span>
      </div>
    </div>
  );
}
