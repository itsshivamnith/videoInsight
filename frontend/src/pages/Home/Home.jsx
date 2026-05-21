import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X, Youtube, Sparkles, Clipboard } from "lucide-react";
import { Helmet } from "react-helmet-async";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";
const AUTH_ROUTE = "/profile";

function isYouTubeUrl(value) {
  if (!value) return false;
  return /(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/playlist\?list=)/i.test(value.trim());
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const abortRef = useRef(null);

  // Three.js Canvas References
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  // Fetch from clipboard handler
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setUrl(text);
    } catch (e) {
      console.warn("Clipboard unavailable", e);
    }
  };

  // Submit link and navigate
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

  // Dynamic script loading for Three.js
  useEffect(() => {
    let active = true;
    let scene, camera, renderer, particleSystem, linesMesh;
    let animationFrameId;

    const mouse = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouse.x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    };

    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const initThree = () => {
      if (!active || !mountRef.current) return;

      const THREE = window.THREE;
      if (!THREE) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      // 1. Scene & Camera Setup
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
      camera.position.z = 220;

      // 2. WebGL Renderer with Alpha transparent background
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Clean previous canvases
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
        mountRef.current.appendChild(renderer.domElement);
      }
      rendererRef.current = renderer;

      // 3. Neural Particle Sphere Geometry
      const particleCount = 140;
      const r = 90;
      const particlePositions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        // Generate uniform points on a sphere using Fibonacci lattice
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;

        particlePositions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        particlePositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        particlePositions[i * 3 + 2] = r * Math.cos(phi);
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

      // Resolve theme-specific node colors (blue for dark theme, dark indigo/charcoal for light theme)
      const isDark = document.documentElement.classList.contains("dark");
      const dotColor = isDark ? 0x3b82f6 : 0x4f46e5;
      const lineColor = isDark ? 0x1e293b : 0xe2e8f0;

      // 4. Dot Material
      const particleMaterial = new THREE.PointsMaterial({
        color: dotColor,
        size: 3,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });

      particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particleSystem);

      // 5. Connect particles with lines to make a structural neural mesh
      const indices = [];
      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = particlePositions[i * 3] - particlePositions[j * 3];
          const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
          const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          // Connect if particles are close
          if (dist < 42) {
            indices.push(i, j);
          }
        }
      }

      const linesGeometry = new THREE.BufferGeometry();
      linesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      linesGeometry.setIndex(indices);

      const linesMaterial = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.35,
        linewidth: 1
      });

      linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      // 6. Animation Render Loop
      const clock = new THREE.Clock();

      const animate = () => {
        if (!active) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Subtle breathing wave simulation
        if (particleSystem && linesMesh) {
          const positions = particleSystem.geometry.attributes.position.array;
          const len = positions.length / 3;
          
          for (let i = 0; i < len; i++) {
            const ix = i * 3;
            const iy = i * 3 + 1;
            const iz = i * 3 + 2;

            // Shift vertices gently using sine/cosine time wave frequencies
            positions[ix] += Math.sin(elapsedTime + i) * 0.05;
            positions[iy] += Math.cos(elapsedTime + i) * 0.05;
            positions[iz] += Math.sin(elapsedTime + i) * 0.05;
          }
          
          particleSystem.geometry.attributes.position.needsUpdate = true;
          linesMesh.geometry.attributes.position.needsUpdate = true;

          // Rotation logic (ambient + cursor follow LERP)
          target.x += (mouse.x - target.x) * 0.05;
          target.y += (mouse.y - target.y) * 0.05;

          particleSystem.rotation.y = elapsedTime * 0.06 + target.x * 0.4;
          particleSystem.rotation.x = elapsedTime * 0.03 + target.y * 0.4;

          linesMesh.rotation.y = elapsedTime * 0.06 + target.x * 0.4;
          linesMesh.rotation.x = elapsedTime * 0.03 + target.y * 0.4;
        }

        renderer.render(scene, camera);
      };

      animate();
      window.addEventListener("resize", handleResize);
      window.addEventListener("mousemove", handleMouseMove);
    };

    // Dynamically load Three.js CDN if not already present
    if (window.THREE) {
      initThree();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      script.async = true;
      script.onload = () => {
        if (active) initThree();
      };
      document.head.appendChild(script);
    }

    // Theme Toggle listener — refreshes Three node colors dynamically
    const observer = new MutationObserver(() => {
      if (renderer) {
        // Redraw scene to pick up new theme variables
        initThree();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.dispose) rendererRef.current.dispose();
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans select-none flex flex-col justify-center items-center"
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <Helmet>
        <title>VideoInsight — Interactive AI Intelligence</title>
        <meta name="description" content="Cinematic AI video intelligence platform. Transform lectures and tutorials into study guides, active recall flashcards, and quizzes." />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* THREE.JS CANVAS CONTAINER (Full-bleed active neural background) */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{ mixBlendMode: "normal" }}
      />

      {/* OVERLAY GLASS GRADIENTS */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30 dark:opacity-20">
        <div className="absolute top-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px]" 
          style={{ background: "radial-gradient(circle, rgba(74, 144, 226, 0.1) 0%, transparent 80%)" }} />
        <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full blur-[120px]" 
          style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 80%)" }} />
      </div>

      {/* HERO CONTENT AREA (Centered, Clean, Minimal text) */}
      <section className="relative z-20 w-full max-w-4xl px-6 text-center flex flex-col items-center justify-center">
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-6 cursor-default shadow-sm border"
          style={{
            background: "var(--accent-subtle)",
            borderColor: "var(--accent-subtle)",
            color: "var(--accent)",
          }}
        >
          <Sparkles size={10} className="animate-pulse" />
          Interactive 3D Engine
        </motion.div>

        {/* Minimal Bold Opener */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-black tracking-tight leading-[0.85] mb-8 font-syne uppercase select-none flex flex-col justify-center items-center gap-0 w-full"
          style={{ 
            fontFamily: "'Syne', sans-serif",
            letterSpacing: "-2px",
            fontSize: "clamp(2.5rem, 11vw, 7.5rem)",
          }}
        >
          {/* Line 1: Video */}
          <div className="flex justify-center items-center flex-wrap gap-0">
            {"Video".split("").map((char, index) => (
              <motion.span
                key={`video-${index}`}
                className="inline-block transition-colors duration-150 cursor-default"
                whileHover={{ 
                  y: -10, 
                  scale: 1.18, 
                  color: "var(--accent)",
                  rotate: index % 2 === 0 ? 6 : -6
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {char}
              </motion.span>
            ))}
          </div>
          
          {/* Line 2: Insight */}
          <div className="flex justify-center items-center flex-wrap gap-0">
            {"Insight".split("").map((char, index) => (
              <motion.span
                key={`insight-${index}`}
                className="inline-block transition-colors duration-150 cursor-default"
                whileHover={{ 
                  y: -10, 
                  scale: 1.18, 
                  color: "var(--accent)",
                  rotate: index % 2 === 0 ? 6 : -6
                }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.h1>

        {/* Simple single-sentence thesis */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-base md:text-lg font-medium max-w-lg mb-10 leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Paste any YouTube link. Instantly synthesize high-fidelity transcripts, English summaries, and recall guides inside an interactive neural canvas.
        </motion.p>

        {/* Unified Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl"
        >
          <form
            onSubmit={handleAddAndGo}
            className="relative flex flex-col sm:flex-row items-center rounded-2xl sm:rounded-full p-1.5 gap-2 backdrop-blur-md"
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="flex items-center flex-1 w-full px-3 py-2 gap-2">
              <Youtube size={20} className="shrink-0 text-red-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube lecture or playlist link..."
                className="flex-1 bg-transparent border-none text-inherit placeholder-gray-400 focus:ring-0 text-xs sm:text-sm font-medium outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="hover:opacity-70 transition-opacity p-1 text-muted shrink-0 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl sm:rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 6px 20px var(--accent-subtle)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing
                </>
              ) : (
                <>
                  Synthesize <ArrowRight size={12} />
                </>
              )}
            </button>
          </form>

          {/* Quick clipboard actions */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1 transition-colors duration-200 hover:text-[var(--accent)] cursor-pointer"
            >
              <Clipboard size={12} />
              Paste URL
            </button>
            <span className="opacity-30">•</span>
            <button
              type="button"
              onClick={() => setUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
              className="transition-colors duration-200 hover:text-[var(--accent)] cursor-pointer"
            >
              Try Demo
            </button>
          </div>

          {/* Error display */}
          {err && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 text-xs text-center font-bold"
              style={{ color: "#ef4444" }}
            >
              {err}
            </motion.p>
          )}
        </motion.div>
      </section>
    </div>
  );
}
