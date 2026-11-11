// Money is an integer number of Rappen (1 CHF = 100 Rappen). Never use floating-point CHF.

export type Rappen = number & { readonly __brand: 'Rappen' };

export function rappen(value: number): Rappen {
  if (!Number.isSafeInteger(value)) throw new Error(`Not a whole number of Rappen: ${value}`);
  return value as Rappen;
}

export function francs(whole: number): Rappen {
  return rappen(whole * 100);
}

export const ZERO = rappen(0);

export const add = (a: Rappen, b: Rappen): Rappen => rappen(a + b);
export const sub = (a: Rappen, b: Rappen): Rappen => rappen(a - b);
export const min = (a: Rappen, b: Rappen): Rappen => (a <= b ? a : b);

/** Percentage of an amount, rounded half up to the whole Rappen. The only rounding rule in the app. */
export function percentRoundHalfUp(amount: Rappen, percent: number): Rappen {
  return rappen(Math.floor((amount * percent + 50) / 100));
}

/** Parses user input like "123", "123.5" or "1'234.50" into Rappen. Returns undefined if invalid. */
export function parseChf(text: string): Rappen | undefined {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text.trim().replaceAll("'", ''));
  if (!match) return undefined;
  const [, whole = '0', fraction = ''] = match;
  return rappen(Number(whole) * 100 + Number(fraction.padEnd(2, '0')));
}

/** The one place that turns Rappen into display text: "CHF 1'234.50". */
export function formatChf(amount: Rappen): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  const whole = String(Math.floor(abs / 100)).replace(/\B(?=(\d{3})+$)/g, "'");
  const fraction = String(abs % 100).padStart(2, '0');
  return `CHF ${sign}${whole}.${fraction}`;
}
