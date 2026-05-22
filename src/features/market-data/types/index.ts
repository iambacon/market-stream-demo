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
