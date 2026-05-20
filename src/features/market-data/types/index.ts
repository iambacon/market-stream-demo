/**
 * Market Data Types
 * 
 * Centralised type definitions for the market-data feature.
 * Following a "Contract-First" approach to decouple implementation from definition.
 */

/**
 * Represents a market data record.
 */
export type TransformedMarketData = Record<string, unknown>;

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface StreamEvent {
  topic: string;
  data: Record<string, unknown>;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
}
