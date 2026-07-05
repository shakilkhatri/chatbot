import { useState, useEffect } from "react";

const CACHE_KEY = "openrouter_models_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

// Add or remove model IDs here to curate which models appear in the dropdown.
// Pricing is fetched dynamically from OpenRouter for whichever IDs are listed.
export const MODEL_IDS = [
  "openai/gpt-4o-mini",
  "openai/gpt-5.4-nano",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.4",
];

// Fallback pricing used when the API is unreachable and no cache exists.
const FALLBACK_MODELS = [
  {
    model_name: "openai/gpt-4o-mini",
    inputCost: "$0.15",
    outputCost: "$0.60",
    isCOT: false,
  },
  {
    model_name: "openai/gpt-5.4-nano",
    inputCost: "$0.20",
    outputCost: "$1.25",
    isCOT: true,
  },
  {
    model_name: "openai/gpt-5.4-mini",
    inputCost: "$0.75",
    outputCost: "$4.50",
    isCOT: true,
  },
  {
    model_name: "openai/gpt-5.4",
    inputCost: "$2.50",
    outputCost: "$15.00",
    isCOT: true,
  },
];

/**
 * Convert a raw model object from the OpenRouter API into the app's format.
 *
 * API pricing is per token (string).  The app stores cost per 1M tokens as "$X.XX".
 * Reasoning / COT support is inferred from the `reasoning` object or
 * `supported_parameters` array returned by the API.
 */
function formatModelData(apiModel) {
  const promptCost = parseFloat(apiModel.pricing?.prompt) || 0;
  const completionCost = parseFloat(apiModel.pricing?.completion) || 0;

  const hasReasoning = !!(
    apiModel.reasoning?.supported_efforts?.length > 0 ||
    apiModel.supported_parameters?.includes("reasoning") ||
    apiModel.supported_parameters?.includes("include_reasoning")
  );

  return {
    model_name: apiModel.id,
    inputCost: `$${(promptCost * 1_000_000).toFixed(2)}`,
    outputCost: `$${(completionCost * 1_000_000).toFixed(2)}`,
    isCOT: hasReasoning,
  };
}

/* ── localStorage cache ─────────────────────────────────────────────── */

function loadCachedModels() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { timestamp, models } = JSON.parse(raw);
    if (!Array.isArray(models)) return null;
    return { models, age: Date.now() - timestamp };
  } catch {
    return null;
  }
}

function saveModelsToCache(models) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), models })
    );
  } catch (e) {
    console.warn("Failed to cache models:", e);
  }
}

/* ── API fetch ──────────────────────────────────────────────────────── */

async function fetchAllModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error(`OpenRouter API returned ${res.status}`);
  const { data } = await res.json();
  if (!Array.isArray(data)) throw new Error("Unexpected API response shape");
  return data
    .filter((m) => m.pricing?.prompt != null && m.pricing?.completion != null)
    .map(formatModelData);
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function getCurated(fullList) {
  return fullList.filter((m) => MODEL_IDS.includes(m.model_name));
}

/* ── React hook ─────────────────────────────────────────────────────── */

/**
 * useModels — fetch model pricing from OpenRouter, cache in localStorage.
 *
 * Behaviour:
 *  1. On very first render, read localStorage synchronously so cached data
 *     appears instantly (no flash of fallbacks).
 *  2. After mount, check if cache is stale (older than 1 day). If so, fetch
 *     fresh data from the API in the background and update state + cache.
 *  3. If no cache exists at all, show fallback prices while fetching.
 *
 * Returns { models, loading }:
 *  - models  – the curated model array ready to render.
 *  - loading – true only while the network request is in flight and no cache
 *              was available; useful for a gentle loading indicator.
 */
export function useModels() {
  const [models, setModels] = useState(() => {
    const cached = loadCachedModels();
    if (cached) {
      const curated = getCurated(cached.models);
      return curated.length > 0 ? curated : FALLBACK_MODELS;
    }
    return FALLBACK_MODELS;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cached = loadCachedModels();
    if (cached && !(cached.age > CACHE_DURATION_MS)) {
      setLoading(false);
      return; // cache is still fresh
    }

    // Stale or no cache → fetch from API
    (async () => {
      try {
        const fresh = await fetchAllModels();
        saveModelsToCache(fresh);
        if (!cancelled) {
          const curated = getCurated(fresh);
          if (curated.length > 0) setModels(curated);
        }
      } catch (err) {
        console.error("Failed to refresh model pricing:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { models, loading };
}
