import { Asset } from '../types';

/**
 * Common Bitfinex Trading Pairs
 */
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

/**
 * AssetService
 * 
 * Updated for Bitfinex compatibility. 
 * Provides top-tier pairs for the live WebSocket stream.
 */
export async function getTopAssets(): Promise<Asset[]> {
  // In a production app, we would fetch the full list of symbols 
  // from https://api-pub.bitfinex.com/v2/conf/pub:list:pair:exchange
  // For this demo, we use a curated list to ensure high-quality stream data.
  return BITFINEX_ASSETS;
}
