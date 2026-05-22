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

export async function getAssetHistory(symbol: string, limit = 30) {
  const response = await fetch(`/api/market/history?symbol=${symbol}&limit=${limit}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch market history');
  }
  
  return await response.json();
}
