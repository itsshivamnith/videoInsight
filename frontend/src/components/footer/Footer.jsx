// frontend/src/components/footer/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Youtube, Github, Twitter, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const LINKS = {
  product: [
    { label: "Feed", to: "/feed" },
    { label: "Playlists", to: "/playlist" },
    { label: "My Learning", to: "/learning" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  company: [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
  ],
};

const FooterLink = ({ to, label, external }) => (
  <li>
    {external ? (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm transition-colors duration-200 group"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        {label}
        <ArrowUpRight size={12} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
      </a>
    ) : (
      <Link
        to={to}
        className="text-sm transition-colors duration-200"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        {label}
      </Link>
    )}
  </li>
);

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}
    >
      {/* Main footer body */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="lg:col-span-2 space-y-5">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #1a2a6c, var(--accent))" }}
            >
              VI
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              VideoInsight
            </span>
          </Link>

          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
            Transform any YouTube video into a rich learning experience with AI-powered transcripts, summaries, and adaptive quizzes.
          </p>

          <div className="flex items-center gap-2">
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <Youtube size={16} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-primary)";
                e.currentTarget.style.borderColor = "var(--text-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <Github size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#1d9bf0";
                e.currentTarget.style.borderColor = "rgba(29,155,240,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Product
          </h4>
          <ul className="space-y-3">
            {LINKS.product.map((l) => (
              <FooterLink key={l.to} {...l} />
            ))}
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Company
          </h4>
          <ul className="space-y-3">
            {LINKS.company.map((l) => (
              <FooterLink key={l.to} {...l} />
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{ borderTop: "1px solid var(--border)" }}
        className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} VideoInsight. All rights reserved.
        </p>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          <Sparkles size={12} style={{ color: "var(--accent)" }} />
          <span>Built with AI &mdash; Designed for learners</span>
        </div>
      </div>
    </footer>
  );
}
