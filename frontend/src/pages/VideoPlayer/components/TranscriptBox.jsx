import React, { useState } from "react";
import { Copy, Check, Languages, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const TranscriptBox = ({ transcript, loading, onTranslate, translating }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!transcript) return;
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <span className="text-[var(--accent)]">📖</span> Transcript
        </h3>
        
        {transcript && !loading && (
          <div className="flex items-center gap-2">
            {/* Translate Button */}
            <button
              onClick={onTranslate}
              disabled={translating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[var(--accent-subtle)] text-secondary hover:text-[var(--accent)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold border border-theme cursor-pointer"
              title="Translate to English"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
            >
              {translating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages size={13} />
                  English
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg hover:bg-[var(--accent-subtle)] text-secondary hover:text-[var(--accent)] transition-all active:scale-95 cursor-pointer border border-theme"
              title="Copy entire transcript"
              style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
            >
              {copied ? (
                <Check size={14} className="text-green-600" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Content — Plain Text Book Style */}
      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar" style={{ maxHeight: "calc(100vh - 360px)" }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-secondary">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-4xl mb-4"
            >
              ⏳
            </motion.div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Fetching transcript...</p>
            <p className="text-xs mt-2 px-3 py-1 rounded-full" style={{ color: "var(--text-muted)", background: "var(--bg-elevated)" }}>
              Running multi-provider scraper fallbacks
            </p>
          </div>
        ) : transcript ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base leading-relaxed tracking-wide font-normal font-sans text-justify whitespace-pre-line"
            style={{ color: "var(--text-primary)" }}
          >
            {transcript}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted">
            <span className="text-4xl mb-3 opacity-40">📝</span>
            <h4 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>No transcript available</h4>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              Try entering a different video link or check your internet connection.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TranscriptBox;
