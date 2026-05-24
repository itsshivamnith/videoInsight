// frontend/src/pages/Feed/FilterBar.jsx
import { Search } from "lucide-react";

const CHIPS = [
  { id: "all", label: "All" },
  { id: "playlist", label: "Playlists" },
  { id: "video", label: "Videos" },
];

export default function FilterBar({ searchQuery, setSearchQuery, activeFilter, setActiveFilter, setDebouncedSearch }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full items-center justify-between">
      {/* Filter Chips */}
      <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
        {CHIPS.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:scale-105"
              style={{
                background: isActive ? "var(--accent)" : "var(--bg-elevated)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                border: "1px solid var(--border)",
                boxShadow: isActive ? "0 2px 10px rgba(37,99,235,0.2)" : "none",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64 shrink-0">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search videos…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && setDebouncedSearch) setDebouncedSearch(searchQuery); }}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all duration-200"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>
    </div>
  );
}
