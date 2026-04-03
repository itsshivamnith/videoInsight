// frontend/src/pages/Dashboard/components/QuizHistory.jsx
import React from "react";
import { Trophy, XCircle, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const DIFF_STYLES = {
  hard:   { bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)",   color: "#ef4444", label: "Hard" },
  medium: { bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  color: "#f59e0b", label: "Medium" },
  easy:   { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  color: "#10b981", label: "Easy" },
};

export default function QuizHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <div
        className="rounded-3xl p-8 text-center py-14"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <BookOpen size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-muted)" }}>No quizzes taken yet. Start one from any video!</p>
      </div>
    );
  }

  const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <h3 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Recent Quizzes
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Date", "Video / Topic", "Difficulty", "Score", "Result"].map((h, i) => (
                <th
                  key={h}
                  className="px-4 pb-3 pt-3 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap"
                  style={{ color: "var(--text-muted)", textAlign: i === 3 ? "center" : i === 4 ? "right" : "left" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((quiz, idx) => {
              const passed = quiz.score / quiz.totalQuestions >= 0.6;
              const diff = DIFF_STYLES[quiz.difficulty] || DIFF_STYLES.medium;
              return (
                <tr
                  key={idx}
                  className="transition-colors duration-150"
                  style={{ borderBottom: idx < sorted.length - 1 ? "1px solid var(--border)" : "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Date */}
                  <td className="px-4 py-3.5 text-sm font-medium whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                    {new Date(quiz.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </td>

                  {/* Video title */}
                  <td className="px-4 py-3.5 text-sm font-medium max-w-[200px]" style={{ color: "var(--text-primary)" }}>
                    {quiz.videoId ? (
                      <Link
                        to={`/player/${quiz.videoId}`}
                        className="line-clamp-1 hover:underline transition-colors duration-200"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                      >
                        {quiz.videoTitle || "Unknown Video"}
                      </Link>
                    ) : (
                      <span className="line-clamp-1">{quiz.videoTitle || "Unknown Video"}</span>
                    )}
                  </td>

                  {/* Difficulty badge */}
                  <td className="px-4 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: diff.bg, border: `1px solid ${diff.border}`, color: diff.color }}
                    >
                      {diff.label}
                    </span>
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3.5 text-sm font-bold text-center" style={{ color: "var(--text-primary)" }}>
                    {quiz.score}/{quiz.totalQuestions}
                  </td>

                  {/* Result */}
                  <td className="px-4 py-3.5 text-right">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: passed ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: passed ? "#10b981" : "#ef4444",
                        border: `1px solid ${passed ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                      }}
                    >
                      {passed ? <Trophy size={13} /> : <XCircle size={13} />}
                      {passed ? "Pass" : "Fail"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
