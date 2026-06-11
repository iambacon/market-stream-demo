import { describe, expect, it } from "vitest";
import { formatMarketVolume } from "./format-market-value";

describe("formatMarketVolume", () => {
  it("uses truthful compact units", () => {
    expect(formatMarketVolume(999)).toBe("999");
    expect(formatMarketVolume(33_102.4)).toBe("33.1K");
    expect(formatMarketVolume(1_350_300)).toBe("1.4M");
    expect(formatMarketVolume(Number.NaN)).toBe("-");
  });
});
