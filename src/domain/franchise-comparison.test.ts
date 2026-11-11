import { describe, expect, it } from 'vitest';
import { cheapestFranchise } from './franchise-comparison';
import { francs, rappen, type Rappen } from './money';
import type { InsuredPerson, Invoice } from './types';

const person = (dateOfBirth: string): InsuredPerson => ({
  id: 'p',
  name: 'Test Person',
  dateOfBirth,
  franchise: 300,
});

const invoice = (amount: Rappen): Invoice => ({
  id: 'i1',
  personId: 'p',
  treatmentDate: '2026-03-01',
  invoiceDate: '2026-03-01',
  amount,
  description: 'Test',
});

const adult = person('1985-05-05');

describe('cheapest Franchise', () => {
  it('worked example H: CHF 5,000 bill, 500 wins with 4,740 premium + 950 cost sharing', () => {
    // 300: 5,040 + 770 = 5,810 / 500: 4,740 + 950 = 5,690 / 1500: 4,020 + 1,850 = 5,870 / 2500: 3,600 + 2,750 = 6,350
    expect(cheapestFranchise(adult, [invoice(francs(5000))], 2026)).toEqual({
      franchise: 500,
      premium: francs(4740),
      costSharing: francs(950),
      total: francs(5690),
    });
  });

  it('with the cap reached on every level, 500 still wins: 4,740 + 500 + 700', () => {
    expect(cheapestFranchise(adult, [invoice(francs(20000))], 2026)?.franchise).toBe(500);
  });

  it('a tie between 500 and 2500 goes to the lower Franchise (CHF 1,766.67 bill: 5,366.67 both)', () => {
    const result = cheapestFranchise(adult, [invoice(rappen(176667))], 2026);
    expect(result?.franchise).toBe(500);
    expect(result?.total).toBe(rappen(536667));
  });

  it('a year without invoices costs premium only, so 2500 wins with 3,600', () => {
    const result = cheapestFranchise(adult, [], 2026);
    expect(result?.franchise).toBe(2500);
    expect(result?.total).toBe(francs(3600));
  });

  it('only counts invoices of the selected treatment year', () => {
    const lastYear = { ...invoice(francs(5000)), treatmentDate: '2025-03-01' };
    expect(cheapestFranchise(adult, [lastYear], 2026)?.franchise).toBe(2500);
  });

  it('children have no Franchise choice, so there is no comparison', () => {
    expect(cheapestFranchise(person('2019-04-01'), [invoice(francs(5000))], 2026)).toBeUndefined();
  });
});
