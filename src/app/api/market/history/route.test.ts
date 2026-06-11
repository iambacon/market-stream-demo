import { afterEach, describe, expect, it, vi } from "vitest";
import { GET, parseLimit, transformTrades } from "./route";

describe("market history route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates and bounds limits", () => {
    expect(parseLimit(null)).toBe(30);
    expect(parseLimit("2")).toBe(2);
    expect(parseLimit("100")).toBe(100);
    expect(parseLimit("1")).toBeNull();
    expect(parseLimit("101")).toBeNull();
    expect(parseLimit("10.5")).toBeNull();
  });

  it("validates and transforms upstream trades", () => {
    expect(
      transformTrades([
        [2, 1_717_680_001_000, 0.2, 101],
        [1, 1_717_680_000_000, 0.1, 100],
      ]),
    ).toEqual([
      { value: 100, timestamp: "2024-06-06T13:20:00.000Z" },
      { value: 101, timestamp: "2024-06-06T13:20:01.000Z" },
    ]);
    expect(() => transformTrades({})).toThrow();
    expect(() => transformTrades([[1, "invalid", 0.1, 100]])).toThrow();
  });

  it("rejects unsupported symbols without calling upstream", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost/api/market/history?symbol=NOPEUSD"),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requests validated upstream history", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([[1, 1_717_680_000_000, 0.1, 100]]), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        "http://localhost/api/market/history?symbol=btcusd&limit=25",
      ),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        "https://api-pub.bitfinex.com/v2/trades/tBTCUSD/hist?limit=25",
      ),
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 },
      },
    );
  });
});
