import { Asset } from '../types';

const BITFINEX_ASSETS: Asset[] = [
  { id: 'BTCUSD', symbol: 'BTC', name: 'Bitcoin / USD' },
  { id: 'ETHUSD', symbol: 'ETH', name: 'Ethereum / USD' },
  { id: 'SOLUSD', symbol: 'SOL', name: 'Solana / USD' },
  { id: 'DOTUSD', symbol: 'DOT', name: 'Polkadot / USD' },
  { id: 'XRPUSD', symbol: 'XRP', name: 'XRP / USD' },
  { id: 'LTCUSD', symbol: 'LTC', name: 'Litecoin / USD' },
  { id: 'ADAUSD', symbol: 'ADA', name: 'Cardano / USD' },
  { id: 'AVAXUSD', symbol: 'AVAX', name: 'Avalanche / USD' },
];

export async function getTopAssets(): Promise<Asset[]> {
  return BITFINEX_ASSETS;
}

/**
 * getAssetHistory
 * 
 * Fetches historical snapshots via our internal server-side proxy.
 * Bypasses CORS and provides an additional layer of resilience.
 */
export async function getAssetHistory(symbol: string, limit = 30) {
  try {
    // Calling our internal Next.js API route
    const response = await fetch(`/api/market/history?symbol=${symbol}&limit=${limit}`);
    
    if (!response.ok) throw new Error('Proxy history fetch failed');
    
    return await response.json();
  } catch (error) {
    console.error('AssetService: Failed to fetch history via proxy for', symbol, error);
    return [];
  }
}
