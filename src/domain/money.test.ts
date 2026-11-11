import { describe, expect, it } from 'vitest';
import { formatChf, francs, parseChf, percentRoundHalfUp, rappen } from './money';

describe('money', () => {
  it('rejects fractions of a Rappen', () => {
    expect(() => rappen(0.5)).toThrow();
  });

  it('formats CHF with Swiss thousands separator', () => {
    expect(formatChf(francs(1000))).toBe("CHF 1'000.00");
    expect(formatChf(rappen(123456789))).toBe("CHF 1'234'567.89");
    expect(formatChf(rappen(5))).toBe('CHF 0.05');
  });

  it('parses user input into Rappen', () => {
    expect(parseChf('123')).toBe(francs(123));
    expect(parseChf('123.5')).toBe(rappen(12350));
    expect(parseChf("1'234.05")).toBe(rappen(123405));
    expect(parseChf('abc')).toBeUndefined();
  });

  it('accepts comma or dot as decimal separator and the apostrophe as thousands separator', () => {
    expect(parseChf('12,50')).toBe(rappen(1250));
    expect(parseChf('12.5')).toBe(rappen(1250));
    expect(parseChf("1'000.00")).toBe(rappen(100000));
    expect(parseChf('19.99')).toBe(rappen(1999));
  });

  it('rejects anything that is not a positive amount of at most CHF 10,000,000', () => {
    for (const text of ['1.005', '-5', '1e3', '0', '', '10000000.01', '99999999999999999']) {
      expect(parseChf(text), text).toBeUndefined();
    }
    expect(parseChf('10000000')).toBe(francs(10_000_000));
  });

  it('computes percentages rounded half up', () => {
    expect(percentRoundHalfUp(rappen(5), 10)).toBe(rappen(1));
    expect(percentRoundHalfUp(rappen(4), 10)).toBe(rappen(0));
    expect(percentRoundHalfUp(rappen(14), 10)).toBe(rappen(1));
    expect(percentRoundHalfUp(rappen(15), 10)).toBe(rappen(2));
  });
});
