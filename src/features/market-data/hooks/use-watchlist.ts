import { useState, useEffect } from 'react';

const STORAGE_KEY = 'market-stream-watchlist-v2'; // Versioned key to clear old CoinCap data
const DEFAULT_ASSETS = ['BTCUSD', 'ETHUSD', 'SOLUSD', 'DOTUSD'];

/**
 * useWatchlist
 * 
 * Manages the user's selected assets with LocalStorage persistence.
 */
export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        setWatchlist(DEFAULT_ASSETS);
      }
    } else {
      setWatchlist(DEFAULT_ASSETS);
    }
    setIsLoaded(true);
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
