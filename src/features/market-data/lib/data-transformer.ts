/**
 * DataTransformer
 * 
 * A framework-agnostic, SOLID-compliant utility for transforming 
 * high-frequency raw stream data into UI-ready formats.
 * 
 * This implementation is inspired by real-time trading data systems
 * where bandwidth is optimised by using single-character keys that 
 * must be mapped to human-readable business terms.
 * 
 * Follows the "Contract-First" principle by importing definitions
 * from the feature-specific types directory.
 */

import { 
  DataMapping, 
  TransformerConfig, 
  TransformedMarketData, 
  MarketDataMatrix 
} from "../types";

export class DataTransformer {
  private config: TransformerConfig;
  private mappingMap: Map<string, DataMapping>;

  constructor(config: TransformerConfig) {
    this.config = config;
    this.mappingMap = new Map(
      config.mappings.map((mapping) => [mapping.key, mapping])
    );
  }

  /**
   * Transforms a raw SignalR-style object into a human-readable object.
   * Example: { g: 1.23, a: 1.24 } -> { bid: 1.23, ask: 1.24 }
   */
  public transform(rawData: Record<string, any>): TransformedMarketData {
    const transformed: TransformedMarketData = {};

    for (const [key, value] of Object.entries(rawData)) {
      const mapping = this.mappingMap.get(key);
      if (mapping) {
        // We use the label (lowercase) as the key for the transformed object
        transformed[mapping.label.toLowerCase()] = mapping.formatter 
          ? mapping.formatter(value) 
          : value;
      }
    }

    if (this.config.includeTimestamp) {
      transformed.timestamp = new Date().toISOString();
    }

    return transformed;
  }

  /**
   * Transforms an array of objects into a 2D matrix (array of arrays) 
   * suitable for grid displays or Excel exports.
   * 
   * Handles "jagged" data by ensuring every row has the same length 
   * based on the provided mappings.
   */
  public toMatrix(data: Record<string, any>[]): MarketDataMatrix {
    const headers = this.config.mappings.map((m) => m.label);
    const rows = data.map((item) => {
      const transformed = this.transform(item);
      return this.config.mappings.map((m) => {
        const val = transformed[m.label.toLowerCase()];
        return val !== undefined ? val : ""; // Handle jagged data with empty strings
      });
    });

    return [headers, ...rows];
  }
}
