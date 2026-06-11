import { describe, expect, it } from "vitest";
import { DEFAULT_ASSETS, parseStoredWatchlist } from "./use-watchlist";

describe("parseStoredWatchlist", () => {
  it("falls back for missing, malformed, or incorrectly shaped values", () => {
    expect(parseStoredWatchlist(null)).toEqual(DEFAULT_ASSETS);
    expect(parseStoredWatchlist("{")).toEqual(DEFAULT_ASSETS);
    expect(parseStoredWatchlist("null")).toEqual(DEFAULT_ASSETS);
    expect(parseStoredWatchlist('{"BTCUSD":true}')).toEqual(DEFAULT_ASSETS);
  });

  it("normalizes and de-duplicates valid symbols", () => {
    expect(parseStoredWatchlist('["btcusd","BTCUSD","ethusd"]')).toEqual([
      "BTCUSD",
      "ETHUSD",
    ]);
  });
});
