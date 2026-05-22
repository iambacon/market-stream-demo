import { useState, useEffect } from 'react';

const STORAGE_KEY = 'market-stream-watchlist-v2';
const DEFAULT_ASSETS = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'DOTUSD'];

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    return [];
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initialWatchlist = saved ? (() => {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ASSETS;
      }
    })() : DEFAULT_ASSETS;

    const timer = setTimeout(() => {
      setWatchlist(initialWatchlist);
      setIsLoaded(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

  const addAsset = (id: string) => {
    const upperId = id.toUpperCase();
    if (!watchlist.includes(upperId)) {
      setWatchlist(prev => [...prev, upperId]);
    }
  };

  const removeAsset = (id: string) => {
    const upperId = id.toUpperCase();
    setWatchlist(prev => prev.filter(item => item !== upperId));
  };

  return { watchlist, addAsset, removeAsset, isLoaded };
}
