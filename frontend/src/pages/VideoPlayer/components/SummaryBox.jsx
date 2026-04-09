// frontend/src/pages/VideoPlayer/components/SummaryBox.jsx
import React from "react";
import MarkdownRenderer from "./MarkdownRenderer";

const SummaryBox = ({ summary, loading }) => {
  return (
    <div className="p-5 border rounded-2xl bg-surface shadow-lg shadow-indigo-50/50 min-h-[200px] relative">
      <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
        <span className="text-amber-500">✨</span> Summary
      </h3>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-secondary">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="font-medium text-secondary">Generating summary...</p>
        </div>
      ) : summary ? (
        <div className="prose prose-sm max-w-none">
          <MarkdownRenderer content={summary} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-muted">
          <span className="text-4xl mb-3 opacity-50">✨</span>
          <p className="font-medium">
            Click "Summarize" to generate a summary.
          </p>
        </div>
      )}
    </div>
  );
};

export default SummaryBox;
