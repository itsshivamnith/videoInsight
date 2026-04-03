// frontend/src/components/header/Header.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, LogIn, LogOut, User, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/feed", label: "Feed" },
  { to: "/playlist", label: "Playlists" },
  { to: "/learning", label: "My Learning" },
  { to: "/dashboard", label: "Dashboard" },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Sun size={16} style={{ color: "#f59e0b" }} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <Moon size={16} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function UserMenu({ isAuthenticated, user, onSignIn, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const DEFAULT_DP = "https://www.gravatar.com/avatar/?d=mp";

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <button
        onClick={onSignIn}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: "var(--accent)",
          color: "#fff",
          boxShadow: "0 2px 12px rgba(37,99,235,0.3)",
        }}
      >
        <LogIn size={14} />
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
        style={{
          background: open ? "var(--bg-elevated)" : "var(--bg-elevated)",
          border: "1px solid var(--border)",
        }}
      >
        <img
          src={user?.picture || DEFAULT_DP}
          alt={user?.name || "User"}
          className="w-7 h-7 rounded-lg object-cover"
        />
        <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate" style={{ color: "var(--text-primary)" }}>
          {user?.name?.split(" ")[0] || "User"}
        </span>
        <ChevronDown
          size={14}
          className="transition-transform duration-200"
          style={{
            color: "var(--text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-60 rounded-2xl py-2 z-[100]"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 mb-1" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                {user?.name || "User"}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                {user?.email}
              </p>
            </div>

            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 mx-1 rounded-xl"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <User size={15} />
              My Profile
            </Link>

            <div className="mx-3 my-1" style={{ borderTop: "1px solid var(--border)" }} />

            <button
              onClick={() => { onSignOut(); setOpen(false); }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors duration-150 mx-1 rounded-xl"
              style={{ color: "#ef4444" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <LogOut size={15} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();

  useEffect(() => { onClose(); }, [location.pathname]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />
          <motion.nav
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed top-0 left-0 bottom-0 w-72 z-[90] flex flex-col pt-16 pb-8 px-4"
            style={{
              background: "var(--bg-surface)",
              borderRight: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl text-base font-medium transition-all duration-200"
                  style={{
                    color: location.pathname === to ? "var(--accent)" : "var(--text-secondary)",
                    background: location.pathname === to ? "var(--accent-subtle)" : "transparent",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Header() {
  const { isAuthenticated, user, startGoogleSignIn, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-40 transition-all duration-300"
        style={{
          background: scrolled ? "var(--glass-bg)" : "var(--bg-primary)",
          borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
          backdropFilter: scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* LEFT — Mobile menu toggle */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
              style={{ color: "var(--text-secondary)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* CENTER/LEFT — Brand */}
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-sm tracking-tight shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ background: "linear-gradient(135deg, #1a2a6c, var(--accent))" }}
              >
                VI
              </div>
              <span className="hidden sm:block text-base font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                VideoInsight
              </span>
            </Link>

            {/* CENTER — Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      color: isActive ? "var(--accent)" : "var(--text-secondary)",
                      background: isActive ? "var(--accent-subtle)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg-elevated)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: "var(--accent-subtle)", zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT — Theme toggle + User */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu
                isAuthenticated={isAuthenticated}
                user={user}
                onSignIn={startGoogleSignIn}
                onSignOut={signOut}
              />
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
