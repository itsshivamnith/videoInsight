import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RefreshCw, Award } from "lucide-react";

const QuizBox = ({ quiz, loading, onRetry, onQuizComplete }) => {
  const [difficulty, setDifficulty] = useState("medium");
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionSelect = (qIndex, optIndex) => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
  };

  const checkAnswers = () => {
    setShowResults(true);
    const score = quiz.reduce((acc, q, i) => {
      return acc + (answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);

    if (onQuizComplete) {
      onQuizComplete(score, quiz.length, difficulty);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setShowResults(false);
    onRetry(difficulty);
  };

  if (loading) {
    return (
      <div 
        className="p-5 border rounded-2xl bg-surface shadow-lg flex flex-col items-center justify-center min-h-[300px] h-full"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="text-4xl mb-4"
        >
          🧠
        </motion.div>
        <p className="font-semibold text-secondary" style={{ color: "var(--text-primary)" }}>
          Generating quiz ({difficulty})...
        </p>
      </div>
    );
  }

  if (!quiz || quiz.length === 0) {
    return (
      <div 
        className="p-5 border rounded-2xl bg-surface shadow-lg flex flex-col items-center justify-center min-h-[300px] h-full text-center"
        style={{ borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
      >
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center justify-center gap-2" style={{ color: "var(--text-primary)" }}>
          <span className="text-emerald-500">🧠</span> Generate Quiz
        </h3>

        <div className="flex gap-2 mb-6 justify-center">
          {["easy", "medium", "hard"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-lg capitalize transition-all text-xs font-bold border cursor-pointer ${
                difficulty === level
                  ? "bg-emerald-500 text-white border-transparent shadow-md scale-105"
                  : "bg-elevated hover:bg-surface"
              }`}
              style={{
                borderColor: difficulty === level ? "transparent" : "var(--border)",
                color: difficulty === level ? "#fff" : "var(--text-secondary)",
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={() => onRetry(difficulty)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          style={{ boxShadow: "0 4px 14px rgba(16, 185, 129, 0.2)" }}
        >
          <span>⚡</span> Generate Quiz
        </button>
      </div>
    );
  }

  const score = quiz.reduce((acc, q, i) => {
    return acc + (answers[i] === q.correctAnswer ? 1 : 0);
  }, 0);

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
          <span className="text-emerald-500">🧠</span> Quiz
        </h3>
        <button
          onClick={resetQuiz}
          className="p-2 text-secondary hover:text-emerald-600 hover:bg-[var(--accent-subtle)] rounded-lg transition-all cursor-pointer border border-theme"
          title="Regenerate Quiz"
          style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Main scrollable content — exactly matching TranscriptBox/SummaryBox */}
      <div className="flex-grow overflow-y-auto pr-1 no-scrollbar space-y-6" style={{ maxHeight: "calc(100vh - 360px)" }}>
        {quiz.map((q, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border"
            style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}
          >
            <p className="font-semibold text-sm sm:text-base mb-3 leading-snug" style={{ color: "var(--text-primary)" }}>
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIndex) => {
                const isSelected = answers[i] === optIndex;
                const isCorrect = q.correctAnswer === optIndex;
                
                let btnStyle = {
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  transition: "all 0.2s ease",
                  border: "1px solid var(--border)",
                  cursor: showResults ? "default" : "pointer"
                };

                if (showResults) {
                  if (isCorrect) {
                    btnStyle.background = "rgba(16, 185, 129, 0.15)";
                    btnStyle.borderColor = "#10b981";
                    btnStyle.color = "#047857";
                    btnStyle.fontWeight = "bold";
                  } else if (isSelected) {
                    btnStyle.background = "rgba(239, 68, 68, 0.15)";
                    btnStyle.borderColor = "#ef4444";
                    btnStyle.color = "#b91c1c";
                  } else {
                    btnStyle.background = "var(--bg-surface)";
                    btnStyle.color = "var(--text-muted)";
                    btnStyle.opacity = 0.5;
                  }
                } else {
                  if (isSelected) {
                    btnStyle.background = "var(--accent-subtle)";
                    btnStyle.borderColor = "var(--accent)";
                    btnStyle.color = "var(--accent)";
                    btnStyle.fontWeight = "bold";
                  } else {
                    btnStyle.background = "var(--bg-surface)";
                    btnStyle.color = "var(--text-secondary)";
                  }
                }

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleOptionSelect(i, optIndex)}
                    disabled={showResults}
                    style={btnStyle}
                    className="hover:scale-[1.01] active:scale-95"
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showResults && isCorrect && (
                        <Check size={14} className="text-green-600 shrink-0 ml-2" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <X size={14} className="text-red-500 shrink-0 ml-2" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer actions or score displays inside the scroll */}
        {!showResults ? (
          <button
            onClick={checkAnswers}
            disabled={Object.keys(answers).length < quiz.length}
            className={`w-full mt-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all cursor-pointer ${
              Object.keys(answers).length < quiz.length
                ? "bg-gray-400 opacity-50 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 hover:scale-[1.01] active:scale-95"
            }`}
            style={{ boxShadow: Object.keys(answers).length < quiz.length ? "none" : "0 4px 14px rgba(16, 185, 129, 0.2)" }}
          >
            Check Answers
          </button>
        ) : (
          <div className="mt-2 p-4 rounded-xl border text-center flex flex-col items-center gap-1 bg-green-500/5" style={{ borderColor: "var(--border)" }}>
            <Award size={24} className="text-emerald-500 animate-bounce" />
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              You scored {score} / {quiz.length}
            </p>
            <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              {score === quiz.length ? "Perfect! 🎉 Keep it up." : "Good attempt! 📚 Try again to improve."}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizBox;
