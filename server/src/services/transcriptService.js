// server/src/services/transcriptService.js
// Fetches transcripts via Supadata.ai (production-only provider).
// Local Python fallback (youtube_transcript_api) lives in scripts/fetch_transcript.py
// and is git-ignored — local use only.

import fetch from "node-fetch";
import { runPython } from "../utils/runPython.js";

// ─── Configuration ─────────────────────────────────────────────────────────────
const CACHE_MAX_SIZE = 200;
const SUPADATA_TIMEOUT_MS = 30_000; // 30 s — gives Supadata reasonable headroom

// ─── LRU cache ─────────────────────────────────────────────────────────────────
const CACHE = new Map();

function cacheGet(key) {
  if (!CACHE.has(key)) return null;
  const value = CACHE.get(key);
  CACHE.delete(key);
  CACHE.set(key, value); // move to end (most recently used)
  return value;
}

function cacheSet(key, value) {
  if (CACHE.size >= CACHE_MAX_SIZE) CACHE.delete(CACHE.keys().next().value); // evict LRU
  CACHE.set(key, value);
}

// ─── In-flight deduplication ───────────────────────────────────────────────────
const IN_FLIGHT = new Map();

// ─── Text cleaner ──────────────────────────────────────────────────────────────
function cleanText(raw) {
  return (raw || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "")
    .replace(/\[Music\]/gi, "")
    .replace(/\[Applause\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Local Python Scraper Fallback ──────────────────────────────────────────────
async function fetchFromPython(videoId, lang = "en") {
  try {
    const result = await runPython("fetch_transcript.py", [videoId, lang], 30000);
    if (!result.stdout) {
      throw new Error("Empty stdout from python script");
    }
    const segments = JSON.parse(result.stdout);
    if (!Array.isArray(segments) || segments.length === 0) {
      throw new Error("No transcript segments returned by python script");
    }
    const text = segments.map((s) => s.text ?? "").join(" ");
    return {
      text: cleanText(text),
      segments: segments.map((s) => ({
        text: s.text,
        offset: s.offset ?? 0.0,
        duration: s.duration ?? 0.0,
      })),
    };
  } catch (err) {
    console.error(`[Python Fallback] Failed for ${videoId}:`, err.message);
    throw err;
  }
}

// ─── Supadata.ai transcript API ───────────────────────────────────────────────
async function fetchFromSupadata(videoId, lang = "en") {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) throw new Error("SUPADATA_API_KEY not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SUPADATA_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&lang=${lang}`,
      {
        headers: {
          "x-api-key": apiKey,
          "User-Agent": "VideoInsight/1.0",
        },
        signal: controller.signal,
      },
    );
  } catch (err) {
    if (err.name === "AbortError") {
      throw Object.assign(
        new Error(`Transcript fetch timed out after ${SUPADATA_TIMEOUT_MS}ms`),
        { code: "TIMEOUT" },
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 404)
    throw Object.assign(new Error("No transcript available for this video"), {
      code: "NOT_FOUND",
    });
  if (res.status === 403)
    throw Object.assign(new Error("Video is private or age-restricted"), {
      code: "FORBIDDEN",
    });
  if (!res.ok) throw new Error(`Supadata responded ${res.status}`);

  const data = await res.json();

  if (data?.error) {
    if (
      data.error === "transcript-unavailable" ||
      data.error === "not-found"
    ) {
      throw Object.assign(
        new Error("No transcript found. The video may not have captions."),
        { code: "NOT_FOUND" },
      );
    }
    throw new Error(`Supadata error: ${data.error}`);
  }

  const segments = Array.isArray(data) ? data : data.content ?? data.segments ?? [];
  const text = segments.map((s) => s.text ?? "").join(" ");

  if (!text || text.trim().length < 30)
    throw new Error("Supadata returned empty transcript");

  return {
    text: cleanText(text),
    segments: segments.map((s) => ({
      text: s.text,
      offset: s.offset ?? s.start ?? 0.0,
      duration: s.duration ?? 0.0,
    })),
  };
}

// ─── Dispatcher with local python fallback ─────────────────────────────────────
async function fetchTranscript(videoId, lang = "en") {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (apiKey) {
    try {
      return await fetchFromSupadata(videoId, lang);
    } catch (err) {
      console.warn(`[Supadata API] Failed for ${videoId}, trying local Python fallback:`, err.message);
    }
  }
  return await fetchFromPython(videoId, lang);
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function fetchTranscriptText(videoId, lang = "en") {
  const key = `${videoId}:${lang}`;

  const cached = cacheGet(key);
  if (cached !== null) return cached;

  if (IN_FLIGHT.has(key)) return IN_FLIGHT.get(key);

  const promise = fetchTranscript(videoId, lang).then(
    (result) => {
      cacheSet(key, result);
      IN_FLIGHT.delete(key);
      return result;
    },
    (err) => {
      IN_FLIGHT.delete(key);
      throw err;
    },
  );

  IN_FLIGHT.set(key, promise);
  return promise;
}

export function getTranscriptStats() {
  return {
    cacheSize: CACHE.size,
    cacheCapacity: CACHE_MAX_SIZE,
    inFlightCount: IN_FLIGHT.size,
    provider: "supadata + python fallback",
  };
}