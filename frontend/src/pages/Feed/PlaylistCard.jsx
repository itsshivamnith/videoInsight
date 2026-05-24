// frontend/src/pages/Feed/PlaylistCard.jsx
import { useState } from "react";
import { ListVideo } from "lucide-react";

export default function PlaylistCard({ playlist, onClick }) {
  const [hovered, setHovered] = useState(false);

  const thumbnail = playlist.thumbnailUrl || "https://via.placeholder.com/320x180?text=Playlist";

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
          src={thumbnail}
          alt={playlist.title || "Playlist"}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
          style={{ transform: hovered ? "scale(1.05)" : "scale(1)" }}
          loading="lazy"
        />

        {/* Count strip */}
        <div className="absolute top-0 right-0 bottom-0 w-[30%] flex flex-col items-center justify-center text-white"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}>
          <span className="text-xl font-bold leading-none">{playlist.videoCount}</span>
          <ListVideo size={16} className="mt-1 opacity-80" />
        </div>

        {/* Hover CTA */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200"
          style={{ opacity: hovered ? 1 : 0, background: "rgba(0,0,0,0.2)" }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            style={{ background: "rgba(255,255,255,0.92)", color: "#111" }}>
            <ListVideo size={15} /> View Playlist
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h3
          className="text-sm font-semibold line-clamp-2 mb-2.5 transition-colors duration-200"
          style={{ color: hovered ? "var(--accent)" : "var(--text-primary)" }}
          title={playlist.title}
        >
          {playlist.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          {playlist.uploaderAvatar ? (
            <img
              src={playlist.uploaderAvatar}
              alt={playlist.uploaderName}
              className="w-6 h-6 rounded-full object-cover"
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
            >
              {getInitials(playlist.uploaderName)}
            </div>
          )}
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {playlist.uploaderName || "Unknown"}
          </p>
        </div>

        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
          Playlist • {playlist.videoCount} videos
        </p>
      </div>
    </div>
  );
}
