import React, { useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X, Youtube, Sparkles, Clipboard, FileText, BrainCircuit, Zap } from "lucide-react";
import { Helmet } from "react-helmet-async";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const AUTH_ROUTE = "/profile";

function isYouTubeUrl(value) {
  if (!value) return false;
  return /(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/playlist\?list=)/i.test(value.trim());
}

const FEATURES = [
  {
    icon: FileText,
    title: "Cinematic Transcripts",
    desc: "Read through videos like a book. Every word is precisely time-synced for surgical precision in navigation.",
  },
  {
    icon: Sparkles,
    title: "Neural Summaries",
    desc: "Our models distill hours of content into structured, markdown-formatted study notes — instantly.",
  },
  {
    icon: BrainCircuit,
    title: "Active Quizzes",
    desc: "Stop passively watching. Validate your knowledge with dynamically generated quizzes based on the content.",
  },
];

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className="group relative p-8 rounded-3xl transition-all duration-500"
    style={{
      background: "var(--bg-elevated)",
      border: "1px solid var(--border)",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--accent)";
      e.currentTarget.style.boxShadow = "0 0 30px var(--accent-subtle)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
      style={{ background: "var(--accent-subtle)" }}
    >
      <Icon size={22} style={{ color: "var(--accent)" }} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
      {title}
    </h3>
    <p className="leading-relaxed text-sm" style={{ color: "var(--text-muted)" }}>
      {desc}
    </p>
  </motion.div>
);

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const abortRef = useRef(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 180]);
  const opacity1 = useTransform(scrollY, [0, 600], [1, 0]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (e) {
      console.warn("Clipboard unavailable", e);
    }
  };

  const handleAddAndGo = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      setErr("");

      if (!url?.trim()) return setErr("Please paste a YouTube video or playlist URL.");
      if (!isYouTubeUrl(url)) return setErr("Please paste a valid YouTube video or playlist URL.");

      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${BASE_URL}/api/playlists`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url: url.trim() }),
          signal: controller.signal,
        });

        if (res.status === 401) {
          try {
            sessionStorage.setItem("afterAuthRedirect", JSON.stringify({ type: "player", url: url.trim() }));
          } catch (_) {}
          navigate(AUTH_ROUTE, { replace: true, state: { redirectTo: "/player" } });
          return;
        }

        let data = {};
        if (res.headers.get("content-type")?.includes("application/json")) {
          data = await res.json();
        }

        if (!res.ok) throw new Error(data.message || `Server error ${res.status}`);

        const id = data._id ?? data.id ?? data.playlistId;
        if (!id) throw new Error("Invalid response from server.");
        navigate(`/player/${id}`);
      } catch (error) {
        if (error.name === "AbortError") return;
        setErr(error.message || "Failed to process video.");
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    [url, navigate],
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", overflowX: "hidden" }}>
      <Helmet>
        <title>VideoInsight — AI Knowledge Extraction</title>
        <meta name="description" content="Extract knowledge from any YouTube video instantly. AI-powered transcripts, summaries, and quizzes." />
      </Helmet>

      {/* Ambient orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            top: "-20%", left: "-10%",
            width: "60vw", height: "60vw",
            background: "radial-gradient(circle, rgba(26,42,108,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: "-10%", right: "-10%",
            width: "50vw", height: "50vw",
            background: "radial-gradient(circle, rgba(74,144,226,0.08) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center px-6 pb-16 pt-24">
        <motion.div
          style={{ y: y1, opacity: opacity1 }}
          className="w-full max-w-4xl mx-auto flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
            style={{
              background: "var(--accent-subtle)",
              border: "1px solid var(--border)",
              color: "var(--accent)",
            }}
          >
            <Sparkles size={14} />
            AI-Powered Video Intelligence
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter mb-6 leading-[1.05]"
            style={{ color: "var(--text-primary)" }}
          >
            Extract knowledge.
            <br />
            <span style={{ color: "var(--accent)" }}>Instantly.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl font-light max-w-2xl mb-14 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Paste any YouTube link and let our AI synthesize the video into high-fidelity transcripts, deep summaries, and interactive quizzes.
          </motion.p>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl group"
          >
            <form
              onSubmit={handleAddAndGo}
              className="relative flex flex-col sm:flex-row items-center rounded-2xl p-2 transition-all duration-300"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-md)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div className="flex items-center flex-1 w-full px-4 py-2 gap-3">
                <Youtube size={20} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-transparent border-none text-inherit placeholder-gray-400 focus:ring-0 text-base font-light outline-none min-w-0 w-full"
                  style={{ color: "var(--text-primary)" }}
                />
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl("")}
                    style={{ color: "var(--text-muted)", flexShrink: 0 }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(37,99,235,0.25)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Analyze <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Helper links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-sm" style={{ color: "var(--text-muted)" }}>
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                <Clipboard size={13} />
                Paste from clipboard
              </button>
              <span style={{ color: "var(--border)" }}>•</span>
              <button
                type="button"
                onClick={() => setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
                className="transition-colors duration-200"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                Try demo video
              </button>
            </div>

            {/* Error */}
            {err && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-sm text-center font-medium"
                style={{ color: "#ef4444" }}
              >
                {err}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        className="relative z-10 py-28 px-6"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-4" style={{ color: "var(--accent)" }}>
              <Zap size={16} />
              <span className="text-sm font-semibold tracking-widest uppercase">Features</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tighter" style={{ color: "var(--text-primary)" }}>
              The anatomy of insight.
            </h2>
            <p className="mt-4 text-lg font-light max-w-xl" style={{ color: "var(--text-secondary)" }}>
              We don't just transcribe text. We distill hours of video into pure, actionable knowledge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <FeatureCard key={feat.title} {...feat} delay={i * 0.15} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
