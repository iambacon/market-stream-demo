import { Asset, HistoryPoint } from "../types";

const BITFINEX_ASSETS: Asset[] = [
  { id: "BTCUSD", symbol: "BTC", name: "Bitcoin / USD" },
  { id: "ETHUSD", symbol: "ETH", name: "Ethereum / USD" },
  { id: "SOLUSD", symbol: "SOL", name: "Solana / USD" },
  { id: "DOTUSD", symbol: "DOT", name: "Polkadot / USD" },
  { id: "XRPUSD", symbol: "XRP", name: "XRP / USD" },
  { id: "LTCUSD", symbol: "LTC", name: "Litecoin / USD" },
  { id: "ADAUSD", symbol: "ADA", name: "Cardano / USD" },
  { id: "AVAXUSD", symbol: "AVAX", name: "Avalanche / USD" },
];

const historyRequests = new Map<string, Promise<HistoryPoint[]>>();

export async function getTopAssets(): Promise<Asset[]> {
  return BITFINEX_ASSETS;
}

export function isSupportedAsset(symbol: string): boolean {
  const normalizedSymbol = symbol.replace(/^t/i, "").toUpperCase();
  return BITFINEX_ASSETS.some((asset) => asset.id === normalizedSymbol);
}

export async function getAssetHistory(
  symbol: string,
  limit = 30,
): Promise<HistoryPoint[]> {
  const requestKey = `${symbol.toUpperCase()}:${limit}`;
  const pendingRequest = historyRequests.get(requestKey);
  if (pendingRequest) return pendingRequest;

  const request = fetchAssetHistory(symbol, limit).finally(() => {
    historyRequests.delete(requestKey);
  });
  historyRequests.set(requestKey, request);

  return request;
}

async function fetchAssetHistory(
  symbol: string,
  limit: number,
): Promise<HistoryPoint[]> {
  const searchParams = new URLSearchParams({
    symbol,
    limit: String(limit),
  });
  const response = await fetch(`/api/market/history?${searchParams}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      typeof errorData.error === "string"
        ? errorData.error
        : "Failed to fetch market history";
    throw new Error(message);
  }

  const data: unknown = await response.json();
  if (!isHistory(data)) {
    throw new Error("Market history response was invalid");
  }

  return data;
}

function isHistory(value: unknown): value is HistoryPoint[] {
  return (
    Array.isArray(value) &&
    value.every(
      (point) =>
        typeof point === "object" &&
        point !== null &&
        typeof point.value === "number" &&
        Number.isFinite(point.value) &&
        typeof point.timestamp === "string",
    )
  );
}
