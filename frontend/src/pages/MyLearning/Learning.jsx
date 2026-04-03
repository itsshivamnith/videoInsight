// frontend/src/pages/MyLearning/Learning.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, AlertCircle, BookOpen, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const BASE_URL = "";

function SkeletonBlock({ width = "w-full", height = "h-4", className = "" }) {
  return (
    <div
      className={`rounded-lg animate-pulse ${width} ${height} ${className}`}
      style={{ background: "var(--bg-elevated)" }}
    />
  );
}

function SectionHeading({ icon: Icon, label, color, extra }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <Icon size={20} style={{ color }} />
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          {label}
        </h2>
      </div>
      {extra}
    </div>
  );
}

export default function Learning() {
  const { isAuthenticated, startGoogleSignIn } = useAuth();
  const [history, setHistory] = useState({ continueWatching: [], smartReview: [] });
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { startGoogleSignIn(); return; }
    (async () => {
      try {
        const [histRes, plRes] = await Promise.all([
          fetch(`${BASE_URL}/api/user/learning-history`, { credentials: "include" }),
          fetch(`${BASE_URL}/api/playlists`, { credentials: "include" }),
        ]);
        if (!histRes.ok || !plRes.ok) throw new Error("Failed to load learning data");
        setHistory(await histRes.json());
        setPlaylists(await plRes.json());
      } catch (e) {
        setError("Failed to load your learning progress.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, startGoogleSignIn]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }} className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-10">
          <SkeletonBlock width="w-64" height="h-9" />
          <SkeletonBlock height="h-52" className="rounded-2xl" />
          <SkeletonBlock height="h-52" className="rounded-2xl" />
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }} className="pb-24">

      {/* Hero header */}
      <div
        className="pt-10 pb-16 px-6 lg:px-10"
        style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            My Learning
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg"
            style={{ color: "var(--text-secondary)" }}
          >
            Pick up where you left off, or review concepts to master them.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 -mt-8 space-y-14">

        {/* Continue Watching */}
        {history.continueWatching.length > 0 && (
          <section>
            <SectionHeading icon={Clock} label="Continue Watching" color="var(--accent)" />
            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar snap-x">
              {history.continueWatching.map((item, i) => (
                <motion.div
                  key={item.videoId}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link
                    to={`/player/${item.playlistId || item.videoId}${item.playlistId ? `?v=${item.videoId}` : ""}`}
                    className="snap-start shrink-0 w-72 group block rounded-2xl overflow-hidden transition-all duration-300"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="relative aspect-video" style={{ background: "var(--bg-elevated)" }}>
                      <img
                        src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(0,0,0,0.2)" }}>
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow">
                          <Play size={16} style={{ color: "var(--accent)", marginLeft: 2 }} />
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "var(--border)" }}>
                        <div className="h-full w-1/3 rounded-r-full" style={{ background: "var(--accent)" }} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1 transition-colors duration-200 group-hover:text-[var(--accent)]"
                        style={{ color: "var(--text-primary)" }}>
                        {item.title || "Untitled Video"}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Last watched: {new Date(item.lastWatched).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Smart Review */}
        {history.smartReview.length > 0 && (
          <section>
            <SectionHeading icon={AlertCircle} label="Smart Review" color="#f59e0b" />
            <div
              className="rounded-2xl p-6"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <p className="mb-5 text-sm" style={{ color: "var(--text-secondary)" }}>
                These topics need a refresher based on your recent quiz results.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.smartReview.map((item, i) => (
                  <motion.div
                    key={item.videoId + item.date}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                  >
                    <div
                      className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
                    >
                      {Math.round((item.score / item.totalQuestions) * 100)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1 mb-1" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </h4>
                      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <Link
                        to={`/player/${item.videoId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-200"
                        style={{ color: "var(--accent)" }}
                      >
                        Review Now <ChevronRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* My Playlists */}
        <section>
          <SectionHeading
            icon={BookOpen}
            label="My Playlists"
            color="#10b981"
            extra={
              <Link
                to="/playlist"
                className="inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-200"
                style={{ color: "var(--accent)" }}
              >
                View all <ChevronRight size={15} />
              </Link>
            }
          />

          {playlists.length === 0 ? (
            <div
              className="text-center py-16 rounded-2xl"
              style={{ border: "2px dashed var(--border)", background: "var(--bg-surface)" }}
            >
              <BookOpen size={36} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="mb-5" style={{ color: "var(--text-secondary)" }}>
                You haven&apos;t added any playlists yet.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                <Zap size={14} /> Get Started
              </Link>
            </div>
          ) : (
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 overflow-x-auto md:overflow-visible pb-4 md:pb-0 no-scrollbar snap-x md:snap-none">
              {playlists.slice(0, 4).map((pl, i) => (
                <motion.div
                  key={pl._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="snap-start shrink-0 w-72 md:w-auto md:shrink"
                >
                  <Link
                    to={`/playlist/${pl._id}`}
                    className="group block rounded-2xl overflow-hidden transition-all duration-300"
                    style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div className="aspect-video relative" style={{ background: "var(--bg-elevated)" }}>
                      {pl.videos?.length > 0 ? (
                        <img
                          src={pl.videos[0].thumbnailUrl || `https://img.youtube.com/vi/${pl.videos[0].videoId}/mqdefault.jpg`}
                          alt={pl.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ color: "var(--text-muted)" }}>
                          <BookOpen size={28} />
                          <span className="text-xs font-medium">Empty Playlist</span>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium text-white"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                        {pl.videos?.length || 0} videos
                      </div>
                    </div>
                    <div className="p-4">
                      <h3
                        className="font-semibold text-sm truncate mb-1 transition-colors duration-200 group-hover:text-[var(--accent)]"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {pl.title}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Created {new Date(pl.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
