// frontend/src/pages/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import ActivityChart from "./components/ActivityChart";
import StatsCards from "./components/StatsCards";
import QuizHistory from "./components/QuizHistory";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

function SkeletonBlock({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-2xl ${className}`}
      style={{ background: "var(--bg-elevated)" }}
    />
  );
}

const Dashboard = () => {
  const { isAuthenticated, loading: authLoading, startGoogleSignIn } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { startGoogleSignIn(); return; }
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/user/dashboard`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load dashboard data");
        setData(await res.json());
      } catch (err) {
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, isAuthenticated, startGoogleSignIn]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonBlock className="h-12 w-72" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-36" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonBlock className="lg:col-span-2 h-96" />
            <SkeletonBlock className="h-96" />
          </div>
          <SkeletonBlock className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="text-center">
          <p className="text-lg mb-6" style={{ color: "#ef4444" }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm hover:scale-105 transition-transform"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getAggregatedChartData = () => {
    if (!data) return [];
    const chartMap = {};
    (data.dailyActivity || []).forEach((a) => {
      chartMap[a.date] = {
        date: a.date,
        watchTime: a.watchTime || 0,
        appOpenTime: a.appOpenTime || 0,
        videosWatched: Array.isArray(a.videosWatched) ? a.videosWatched.length : 0,
        quizzesSolved: 0,
      };
    });
    (data.quizHistory || []).forEach((q) => {
      const d = new Date(q.date).toISOString().split("T")[0];
      if (!chartMap[d]) chartMap[d] = { date: d, watchTime: 0, appOpenTime: 0, videosWatched: 0, quizzesSolved: 0 };
      chartMap[d].quizzesSolved += 1;
    });
    return Object.values(chartMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getInsights = () => {
    if (!data) return { avgScore: 0, activeDays: 0, avgWatchMins: 0 };
    let avgScore = 0;
    if (data.quizHistory?.length > 0) {
      const total = data.quizHistory.reduce((acc, q) => acc + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0), 0);
      avgScore = Math.round(total / data.quizHistory.length);
    }
    const activeDays = data.dailyActivity?.length || 0;
    const avgWatchMins = Math.round((data.stats?.totalWatchTime || 0) / (activeDays || 1) / 60);
    return { avgScore, activeDays, avgWatchMins };
  };

  const insights = getInsights();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", position: "relative", overflow: "hidden" }}
      className="p-4 sm:p-6 lg:p-10 font-sans">

      {/* Ambient orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full" style={{
          top: "-10%", left: "-10%", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)", filter: "blur(60px)"
        }} />
        <div className="absolute rounded-full" style={{
          bottom: "-10%", right: "-5%", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", filter: "blur(80px)"
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8 md:space-y-10">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--text-muted)" }}>
              Overview
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Welcome back,{" "}
              <span style={{ color: "var(--accent)" }}>{data?.user?.name?.split(" ")[0]}</span>
            </h1>
          </div>
          <div
            className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Last seen {new Date(data?.user?.lastLogin).toLocaleDateString()}
          </div>
        </motion.div>

        {/* Stats cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <StatsCards
            stats={{
              ...data?.stats,
              streak: data?.streak || 0,
              totalVideosWatched: (data?.dailyActivity || []).reduce(
                (acc, a) => acc + (Array.isArray(a.videosWatched) ? a.videosWatched.length : 0), 0
              ),
            }}
          />
        </motion.div>

        {/* Chart + Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Chart */}
          <div className="lg:col-span-2">
            <ActivityChart data={getAggregatedChartData()} />
          </div>

          {/* Insights Panel */}
          <div className="lg:col-span-1">
            <div
              className="rounded-3xl p-6 lg:p-8 h-full flex flex-col relative overflow-hidden"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none rounded-full"
                style={{ background: "radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%)", filter: "blur(40px)", transform: "translate(30%, -30%)" }} />

              <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-3" style={{ color: "var(--text-primary)" }}>
                <span className="p-2.5 rounded-xl" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Quick Insights
              </h3>

              <div className="flex-1 flex flex-col justify-center gap-4">
                {/* Avg Score */}
                <div
                  className="rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-200"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Avg Score</p>
                    <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{insights.avgScore}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center relative" style={{ background: "var(--accent-subtle)" }}>
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
                      <path
                        style={{ stroke: "var(--accent)", transition: "stroke-dasharray 1s ease" }}
                        strokeDasharray={`${insights.avgScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" strokeLinecap="round" strokeWidth="3"
                      />
                    </svg>
                    <span className="text-[10px] font-bold" style={{ color: "var(--accent)" }}>{insights.avgScore}%</span>
                  </div>
                </div>

                {/* Daily Focus */}
                <div
                  className="rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-200"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Daily Focus</p>
                    <p className="text-2xl font-extrabold flex items-baseline gap-1" style={{ color: "var(--text-primary)" }}>
                      {insights.avgWatchMins}
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>min</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.15)" }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Active Days */}
                <div
                  className="rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-200"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-sm)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Active Days</p>
                    <p className="text-2xl font-extrabold flex items-baseline gap-1" style={{ color: "var(--text-primary)" }}>
                      {insights.activeDays}
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>sessions</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background: "rgba(249,115,22,0.1)", color: "#f97316", border: "1px solid rgba(249,115,22,0.15)" }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quiz History */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <QuizHistory history={data?.quizHistory || []} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
