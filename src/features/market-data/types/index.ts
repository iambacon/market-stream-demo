/**
 * Market Data Types
 * 
 * Centralised type definitions for the market-data feature.
 * Following a "Contract-First" approach to decouple implementation from definition.
 */

export interface DataMapping {
  /** The raw key from the stream (e.g., "g") */
  key: string;
  /** The human-readable label (e.g., "Bid") */
  label: string;
  /** Optional formatter function for the value (e.g., price rounding) */
  formatter?: (value: unknown) => string;
}

export interface TransformerConfig {
  /** A collection of mappings to apply to the raw data */
  mappings: DataMapping[];
  /** Whether to append a local ISO timestamp to transformed objects */
  includeTimestamp?: boolean;
}

/**
 * Represents a transformed market data record.
 * Using a Record to allow dynamic keys based on the labels in mappings.
 */
export type TransformedMarketData = Record<string, unknown>;

/** A 2D matrix suitable for grid displays or exports */
export type MarketDataMatrix = unknown[][];

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
