// frontend/src/pages/Dashboard/components/StatsCards.jsx
import React from "react";
import { Clock, CheckCircle, PlayCircle, Flame } from "lucide-react";

const CARDS = [
  { key: "watchTime", title: "Watch Time", icon: Clock, accent: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.15)" },
  { key: "quizzes", title: "Quizzes", icon: CheckCircle, accent: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.15)" },
  { key: "videos", title: "Videos", icon: PlayCircle, accent: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.15)" },
  { key: "streak", title: "Streak", icon: Flame, accent: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.15)" },
];

function StatCard({ title, value, icon: Icon, accent, bg, border }) {
  return (
    <div
      className="relative overflow-hidden p-5 sm:p-7 rounded-3xl flex flex-col justify-between transition-all duration-300 group"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      {/* Glow orb */}
      <div
        className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: accent, filter: "blur(40px)", opacity: 0.08 }}
      />

      <div className="relative z-10 flex items-center justify-between w-full mb-5">
        <div
          className="p-3.5 rounded-2xl flex items-center justify-center"
          style={{ background: bg, border: `1px solid ${border}`, color: accent }}
        >
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
      </div>

      <div className="relative z-10">
        <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none mb-2" style={{ color: "var(--text-primary)" }}>
          {value}
        </h3>
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
      </div>
    </div>
  );
}

export default function StatsCards({ stats }) {
  const fmt = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      <StatCard title="Watch Time" value={fmt(stats.totalWatchTime || 0)} {...CARDS[0]} />
      <StatCard title="Quizzes" value={stats.totalQuizzesSolved || 0} {...CARDS[1]} />
      <StatCard title="Videos" value={stats.totalVideosWatched || 0} {...CARDS[2]} />
      <StatCard title="Streak" value={`${stats.streak || 0}d`} {...CARDS[3]} />
    </div>
  );
}
