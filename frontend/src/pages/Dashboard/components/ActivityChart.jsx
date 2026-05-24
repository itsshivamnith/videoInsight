// frontend/src/pages/Dashboard/components/ActivityChart.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../../context/ThemeContext";

const TABS = [
  { id: "watchTime",    label: "Watch Time",      color: "#6366f1", format: "time" },
  { id: "appOpenTime",  label: "App Time",         color: "#8b5cf6", format: "time" },
  { id: "videosWatched",label: "Videos",           color: "#10b981", format: "count" },
  { id: "quizzesSolved",label: "Quizzes",          color: "#f59e0b", format: "count" },
];

const TIME_FILTERS = [
  { id: "month",   label: "1M" },
  { id: "3months", label: "3M" },
  { id: "year",    label: "1Y" },
  { id: "all",     label: "All" },
];

export default function ActivityChart({ data }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("watchTime");
  const [timeRange, setTimeRange] = useState("month");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 150);
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, []);

  const currentTab = TABS.find((t) => t.id === activeTab);

  const filteredData = React.useMemo(() => {
    if (timeRange === "all" || !data) return data;
    const cutoff = new Date();
    if (timeRange === "month") cutoff.setMonth(cutoff.getMonth() - 1);
    else if (timeRange === "3months") cutoff.setMonth(cutoff.getMonth() - 3);
    else if (timeRange === "year") cutoff.setFullYear(cutoff.getFullYear() - 1);
    return data.filter((d) => new Date(d.date).getTime() >= cutoff.getTime());
  }, [data, timeRange]);

  const fmtTime = (v) => `${Math.floor(v / 60)}m ${v % 60}s`;

  // Recharts colors from CSS vars
  const axisColor = isDark ? "#4b5680" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.05)" : "#e2e8f0";
  const tooltipBg = isDark ? "#0e0e17" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const tooltipLabel = isDark ? "#f0f2ff" : "#0f172a";

  return (
    <div
      className="rounded-3xl p-5 sm:p-8 flex flex-col"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-sm)",
        height: "450px",
      }}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <h3 className="text-xl font-bold tracking-tight order-1" style={{ color: "var(--text-primary)" }}>
          Daily Activity
        </h3>

        {/* Time range dropdown */}
        <div className="relative order-2 lg:order-3 ml-auto" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {TIME_FILTERS.find((f) => f.id === timeRange)?.label}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-28 rounded-2xl py-1.5 z-50"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            >
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setTimeRange(f.id); setDropdownOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm font-semibold rounded-xl mx-auto transition-colors"
                  style={{
                    color: timeRange === f.id ? "var(--accent)" : "var(--text-secondary)",
                    background: timeRange === f.id ? "var(--accent-subtle)" : "transparent",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metric tabs */}
        <div
          className="flex p-1 rounded-2xl overflow-x-auto no-scrollbar w-full lg:w-auto flex-nowrap order-3 lg:order-2"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-300 flex-1 lg:flex-none"
                style={{
                  background: isActive ? "var(--bg-surface)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: isActive ? tab.color : "var(--text-muted)" }}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          {chartReady && (
            <ResponsiveContainer width="99%" height="99%">
              <LineChart data={filteredData} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}
                style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke={gridColor} opacity={0.8} />
                <XAxis dataKey="date" axisLine={false} tickLine={false}
                  tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }} dy={15} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: axisColor, fontSize: 12, fontWeight: 600 }}
                  tickFormatter={(v) => currentTab.format === "time" ? `${Math.round(v / 60)}m` : v} />
                <Tooltip
                  cursor={{ stroke: axisColor, strokeWidth: 1.5, strokeDasharray: "4 4" }}
                  contentStyle={{
                    borderRadius: 16, border: `1px solid ${tooltipBorder}`,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                    background: tooltipBg, backdropFilter: "blur(12px)", padding: "12px 16px",
                  }}
                  formatter={(v) => currentTab.format === "time" ? [fmtTime(v), currentTab.label] : [v, currentTab.label]}
                  labelStyle={{ color: tooltipLabel, fontWeight: 800, fontSize: 14, marginBottom: 6 }}
                  itemStyle={{ fontWeight: 700, fontSize: 13, color: currentTab.color }}
                />
                <Line
                  type="monotone" dataKey={currentTab.id} name={currentTab.label}
                  stroke={currentTab.color} strokeWidth={4} dot={false}
                  activeDot={{ r: 6, stroke: isDark ? "#0e0e17" : "#fff", strokeWidth: 3, fill: currentTab.color }}
                  animationDuration={700} animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
