import { isSupportedAsset } from "@/features/market-data/api/asset-service";
import { HistoryPoint } from "@/features/market-data/types";
import { NextResponse } from "next/server";

const DEFAULT_LIMIT = 30;
const MIN_LIMIT = 2;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = normalizeSymbol(searchParams.get("symbol"));
  const limit = parseLimit(searchParams.get("limit"));

  if (!symbol || !isSupportedAsset(symbol)) {
    return NextResponse.json(
      { error: "A supported symbol is required" },
      { status: 400 },
    );
  }

  if (limit === null) {
    return NextResponse.json(
      { error: `Limit must be an integer from ${MIN_LIMIT} to ${MAX_LIMIT}` },
      { status: 400 },
    );
  }

  try {
    const url = new URL(
      `https://api-pub.bitfinex.com/v2/trades/t${symbol}/hist`,
    );
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Bitfinex responded with status ${response.status}`);
    }

    const data: unknown = await response.json();
    const history = transformTrades(data);

    return NextResponse.json(history);
  } catch (error) {
    console.error("Market history route failed", error);
    return NextResponse.json(
      { error: "Failed to fetch market history" },
      { status: 502 },
    );
  }
}

export function parseLimit(value: string | null): number | null {
  if (value === null) return DEFAULT_LIMIT;
  if (!/^\d+$/.test(value)) return null;

  const limit = Number(value);
  return limit >= MIN_LIMIT && limit <= MAX_LIMIT ? limit : null;
}

export function transformTrades(value: unknown): HistoryPoint[] {
  if (!Array.isArray(value)) {
    throw new Error("Bitfinex history response was not an array");
  }

  return value
    .map((trade) => {
      if (
        !Array.isArray(trade) ||
        typeof trade[1] !== "number" ||
        typeof trade[3] !== "number" ||
        !Number.isFinite(trade[1]) ||
        !Number.isFinite(trade[3])
      ) {
        throw new Error("Bitfinex history response contained an invalid trade");
      }

      return {
        value: trade[3],
        timestamp: new Date(trade[1]).toISOString(),
      };
    })
    .reverse();
}

function normalizeSymbol(value: string | null): string | null {
  if (!value) return null;

  const symbol = value.replace(/^t/i, "").toUpperCase();
  return /^[A-Z0-9]{6,12}$/.test(symbol) ? symbol : null;
}
