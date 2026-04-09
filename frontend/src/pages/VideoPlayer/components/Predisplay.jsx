import React from "react";

const Predisplay = () => {
  return (
    <div className="hidden lg:flex p-6 rounded-xl bg-[var(--accent-subtle)] border border-theme h-full flex-col justify-center items-center text-center">
      <h3 className="text-lg font-bold text-indigo-800 mb-4">🚀 Ready to Learn?</h3>
      <div className="space-y-4 text-left max-w-xs">
        <div className="flex items-start gap-3">
          <span className="bg-surface p-1.5 rounded-md shadow-theme-sm text-lg">📖</span>
          <div>
            <p className="font-semibold text-primary text-sm">1. Transcribe</p>
            <p className="text-xs text-secondary">Get the full text of the video.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-surface p-1.5 rounded-md shadow-theme-sm text-lg">✨</span>
          <div>
            <p className="font-semibold text-primary text-sm">2. Summarize</p>
            <p className="text-xs text-secondary">Get key points and insights.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="bg-surface p-1.5 rounded-md shadow-theme-sm text-lg">🧠</span>
          <div>
            <p className="font-semibold text-primary text-sm">3. Quizzify</p>
            <p className="text-xs text-secondary">Test your knowledge.</p>
          </div>
        </div>
      </div>
      <p className="mt-6 text-xs text-indigo-400 font-medium">Click "Transcribe" to start!</p>
    </div>
  );
};

export default Predisplay;
