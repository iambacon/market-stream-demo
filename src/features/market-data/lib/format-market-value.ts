export function formatMarketVolume(volume: number): string {
  if (!Number.isFinite(volume)) return "-";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(volume);
}
