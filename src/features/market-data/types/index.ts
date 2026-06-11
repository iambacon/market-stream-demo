export interface HistoryPoint {
  value: number;
  timestamp: string;
}

export interface MarketData {
  bid: number;
  ask: number;
  volume: number;
  timestamp: string;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface StreamEvent {
  topic: string;
  data: MarketData;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
}
