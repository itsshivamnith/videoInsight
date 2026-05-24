// frontend/src/pages/Feed/VideoCard.jsx
import { useState } from "react";

export default function VideoCard({ video, onClick }) {
  const [hovered, setHovered] = useState(false);

  const hq = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
  const mq = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
  const thumb = video.thumbnailUrl || hq;

  const handleErr = (e) => {
    const s = e.currentTarget.src;
    if (s.includes("hqdefault")) e.currentTarget.src = mq;
    else e.currentTarget.src = "https://via.placeholder.com/320x180?text=No+Image";
  };

  const getInitials = (n) => {
    if (!n) return "U";
    const p = n.trim().split(/\s+/);
    return p.length === 1 ? p[0].slice(0, 2).toUpperCase() : (p[0][0] + p[1][0]).toUpperCase();
  };

  return (
    <div
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
        <img
          src={thumb}
          alt={video.title || "Video"}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
          onError={handleErr}
          loading="lazy"
          decoding="async"
        />

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-semibold text-white"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
            {video.duration}
          </div>
        )}

        {/* Play icon on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0, background: "rgba(0,0,0,0.15)" }}
        >
          <div className="w-11 h-11 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 ml-0.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3
          className="text-sm font-semibold line-clamp-2 mb-2.5 transition-colors duration-200"
          style={{ color: hovered ? "var(--accent)" : "var(--text-primary)" }}
          title={video.title}
        >
          {video.title || "Untitled"}
        </h3>

        <div className="flex items-center gap-2">
          {video.uploaderAvatar ? (
            <img
              src={video.uploaderAvatar}
              alt={video.uploaderName}
              className="w-6 h-6 rounded-full object-cover"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              {getInitials(video.uploaderName)}
            </div>
          )}
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {video.uploaderName || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
