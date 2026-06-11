import { useEffect, useState } from "react";

const STORAGE_KEY = "market-stream-watchlist-v2";
export const DEFAULT_ASSETS = ["BTCUSD", "ETHUSD", "SOLUSD", "DOTUSD"];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setWatchlist(parseStoredWatchlist(localStorage.getItem(STORAGE_KEY)));
      } catch {
        setWatchlist(DEFAULT_ASSETS);
      }
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
      } catch {
        // Storage can be unavailable in private or restricted browser contexts.
      }
    }
  }, [watchlist, isLoaded]);

  const addAsset = (id: string) => {
    const upperId = id.toUpperCase();
    setWatchlist((current) =>
      current.includes(upperId) ? current : [...current, upperId],
    );
  };

  const removeAsset = (id: string) => {
    const upperId = id.toUpperCase();
    setWatchlist((current) => current.filter((item) => item !== upperId));
  };

  return { watchlist, addAsset, removeAsset, isLoaded };
}

export function parseStoredWatchlist(value: string | null): string[] {
  if (value === null) return DEFAULT_ASSETS;

  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === "string")
    ) {
      return DEFAULT_ASSETS;
    }

    return [...new Set(parsed.map((item) => item.toUpperCase()))];
  } catch {
    return DEFAULT_ASSETS;
  }
}
