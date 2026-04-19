import { describe, it, expect } from 'vitest';
import { DataTransformer } from './data-transformer';
import { TransformerConfig } from '../types';

describe('DataTransformer', () => {
  const config: TransformerConfig = {
    mappings: [
      { key: 'g', label: 'Bid' },
      { key: 'a', label: 'Ask' },
      { key: 'v', label: 'Volume', formatter: (val) => `${val}k` },
    ],
  };

  const transformer = new DataTransformer(config);

  it('should transform raw data into human-readable format', () => {
    const raw = { g: 1.234, a: 1.235, v: 100 };
    const result = transformer.transform(raw);

    expect(result).toEqual({
      bid: 1.234,
      ask: 1.235,
      volume: '100k',
    });
  });

  it('should ignore unmapped keys', () => {
    const raw = { g: 1.234, x: 'ignore me' };
    const result = transformer.transform(raw);

    expect(result).not.toHaveProperty('x');
    expect(result).toHaveProperty('bid', 1.234);
  });

  it('should generate a matrix with headers and data', () => {
    const data = [
      { g: 1.1, a: 1.2, v: 10 },
      { g: 2.1, a: 2.2, v: 20 },
    ];

    const matrix = transformer.toMatrix(data);

    expect(matrix).toHaveLength(3); // Header + 2 rows
    expect(matrix[0]).toEqual(['Bid', 'Ask', 'Volume']);
    expect(matrix[1]).toEqual([1.1, 1.2, '10k']);
    expect(matrix[2]).toEqual([2.1, 2.2, '20k']);
  });

  it('should handle jagged data by filling with empty strings', () => {
    const data = [
      { g: 1.1, a: 1.2 }, // Missing Volume
      { g: 2.1, v: 20 },   // Missing Ask
    ];

    const matrix = transformer.toMatrix(data);

    expect(matrix[1]).toEqual([1.1, 1.2, '']);
    expect(matrix[2]).toEqual([2.1, '', '20k']);
  });
});
