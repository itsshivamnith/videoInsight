// frontend/src/pages/Feed/Feed.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import VideoCard from "./VideoCard";
import PlaylistCard from "./PlaylistCard";
import FilterBar from "./FilterBar";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

let feedCache = {
  items: [],
  hasMore: true,
  seed: null,
  scrollPos: 0,
  searchQuery: "",
  activeFilter: "all",
};

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: "var(--bg-elevated)" }}>
          <div className="aspect-video" style={{ background: "var(--bg-surface)" }} />
          <div className="p-4 space-y-3">
            <div className="h-3 rounded-full w-4/5" style={{ background: "var(--bg-surface)" }} />
            <div className="h-3 rounded-full w-3/5" style={{ background: "var(--bg-surface)" }} />
            <div className="flex items-center gap-2 mt-4">
              <div className="w-6 h-6 rounded-full" style={{ background: "var(--bg-surface)" }} />
              <div className="h-2.5 rounded-full w-2/5" style={{ background: "var(--bg-surface)" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Feed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(feedCache.searchQuery || "");
  const [debouncedSearch, setDebouncedSearch] = useState(feedCache.searchQuery || "");
  const [activeFilter, setActiveFilter] = useState(feedCache.activeFilter || "all");
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();
  const seedRef = useRef(feedCache.seed || String(Math.floor(Math.random() * 1e9)));
  const mountedRef = useRef(false);

  const fetchVideos = useCallback(
    async (isLoadMore = false) => {
      if (loading) return;
      setLoading(true);
      if (!isLoadMore) setError("");
      try {
        const offset = isLoadMore ? items.length : 0;
        const params = new URLSearchParams({
          search: debouncedSearch,
          limit: "20",
          offset: offset.toString(),
          seed: seedRef.current,
          type: activeFilter,
        });
        const res = await fetch(`${BASE_URL}/api/feed?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch feed");
        setItems((prev) => (isLoadMore ? [...prev, ...data.videos] : data.videos));
        setHasMore(Boolean(data.hasMore));
      } catch (err) {
        setError(err.message || "Failed to fetch feed");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, activeFilter, items.length, loading],
  );

  useEffect(() => {
    mountedRef.current = true;
    if (
      feedCache.items.length > 0 &&
      feedCache.searchQuery === debouncedSearch &&
      feedCache.activeFilter === activeFilter
    ) {
      setItems(feedCache.items);
      setHasMore(feedCache.hasMore);
      seedRef.current = feedCache.seed;
      setTimeout(() => window.scrollTo(0, feedCache.scrollPos), 50);
    } else {
      fetchVideos(false);
    }
    return () => { feedCache.scrollPos = window.scrollY; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    if (debouncedSearch !== feedCache.searchQuery || activeFilter !== feedCache.activeFilter) {
      seedRef.current = String(Math.floor(Math.random() * 1e9));
      setItems([]);
      setHasMore(true);
      fetchVideos(false);
      feedCache.searchQuery = debouncedSearch;
      feedCache.activeFilter = activeFilter;
      feedCache.scrollPos = 0;
    }
  }, [debouncedSearch, activeFilter, fetchVideos]);

  useEffect(() => {
    if (items.length > 0) {
      feedCache.items = items;
      feedCache.hasMore = hasMore;
      feedCache.seed = seedRef.current;
    }
  }, [items, hasMore]);

  const handleVideoClick = (video) => navigate(`/player/${video.videoId}`, { state: { video } });
  const handlePlaylistClick = (playlist) => navigate(`/playlist/${playlist.playlistId}`);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Sticky filter bar */}
      <div
        className="sticky z-10 top-16 transition-all"
        style={{
          background: "var(--glass-bg)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setDebouncedSearch={setDebouncedSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading && items.length === 0 ? (
          <LoadingGrid />
        ) : error && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="mb-6 text-lg" style={{ color: "var(--text-secondary)" }}>{error}</p>
            <button
              onClick={() => fetchVideos(false)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-5">📺</div>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>No content found</h2>
            <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
              {debouncedSearch ? "Try adjusting your search query" : "Start by adding some playlists"}
            </p>
            <button
              onClick={() => navigate("/playlist")}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Add Playlists
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
              {items.map((item) =>
                item.type === "playlist" ? (
                  <PlaylistCard
                    key={`pl-${item.playlistId}`}
                    playlist={item}
                    onClick={() => handlePlaylistClick(item)}
                  />
                ) : (
                  <VideoCard
                    key={`vid-${item.videoId}-${item.playlistId}`}
                    video={item}
                    onClick={() => handleVideoClick(item)}
                  />
                ),
              )}
            </div>
            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-14">
                <button
                  onClick={() => { if (hasMore && !loading) fetchVideos(true); }}
                  disabled={loading}
                  className="px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                >
                  {loading ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
