import { useState, useEffect } from "react";
import defaultModels from "./defaultModels.json";

const CACHE_KEY = "openrouter_models_cache";
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day

/**
 * Add or remove model IDs here to curate which models appear in the dropdown.
 *
 * Pricing is fetched from OpenRouter and cached in localStorage.
 * `src/defaultModels.json` serves as the initial data so first-time visitors
 * see real prices without waiting for an API call.
 */
export const MODEL_IDS = [
  "openai/gpt-4o-mini",
  "openai/gpt-5.4-nano",
  "google/gemini-2.5-flash-lite",
  "google/gemini-3.5-flash",
  "deepseek/deepseek-v4-flash",
  "anthropic/claude-haiku-4.5",
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
 *  1. On very first render, read localStorage synchronously.  If a previous
 *     cache exists → use it instantly.  Otherwise fall back to the static
 *     `src/defaultModels.json` snapshot committed in the repo.
 *  2. After mount, check if the cache is stale (older than 1 day) or missing.
 *     If so, fetch fresh data from the API in the background and update
 *     state + localStorage.
 *  3. If the API fetch fails and no cache exists, the static snapshot still
 *     provides working data.
 */
export function useModels() {
  const [models, setModels] = useState(() => {
    const cached = loadCachedModels();
    if (cached) {
      const curated = getCurated(cached.models);
      if (curated.length > 0) return curated;
    }
    // No cache → use the committed snapshot
    return getCurated(defaultModels);
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const cached = loadCachedModels();
    if (cached && !(cached.age > CACHE_DURATION_MS)) {
      setLoading(false);
      return; // cache is still fresh
    }

    // Stale or no cache → fetch from API in the background
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
