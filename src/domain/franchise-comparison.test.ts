import { describe, expect, it } from 'vitest';
import { cheapestOf, compareFranchises } from './franchise-comparison';
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

const cheapestFranchise = (p: InsuredPerson, invoices: Invoice[], year: number) =>
  cheapestOf(compareFranchises(p, invoices, year));

describe('compare all four Franchise levels', () => {
  it('worked example H: CHF 5,000 bill gives 5,810, 5,690, 5,870 and 6,350 in ascending order', () => {
    const options = compareFranchises(adult, [invoice(francs(5000))], 2026);
    expect(options.map((option) => option.franchise)).toEqual([300, 500, 1500, 2500]);
    expect(options.map((option) => option.total)).toEqual([
      francs(5810),
      francs(5690),
      francs(5870),
      francs(6350),
    ]);
  });

  it('splits each level into 12 premiums and the cost sharing of the yearly statement', () => {
    const [first] = compareFranchises(adult, [invoice(francs(5000))], 2026);
    expect(first).toMatchObject({
      franchise: 300,
      premium: francs(5040),
      costSharing: francs(770),
      total: francs(5810),
    });
  });

  it('differences to the current Franchise 300: 0, -120, +60, +540 (Erika, CHF 5,000 bill)', () => {
    const options = compareFranchises(adult, [invoice(francs(5000))], 2026);
    expect(options.map((option) => option.differenceToCurrent)).toEqual([
      francs(0),
      francs(-120),
      francs(60),
      francs(540),
    ]);
  });

  it('measures against the current Franchise of the person: from 2500, level 500 is 660 cheaper', () => {
    // 2,800 of invoices: 2500 gives 3,600 + 2,500 + 30 = 6,130, 500 gives 4,740 + 500 + 230 = 5,470
    const saver = { ...adult, franchise: 2500 as const };
    const invoices = [invoice(francs(2200)), { ...invoice(francs(600)), id: 'i2' }];
    const options = compareFranchises(saver, invoices, 2026);
    expect(options.find((option) => option.franchise === 2500)?.total).toBe(francs(6130));
    expect(options.find((option) => option.franchise === 500)?.total).toBe(francs(5470));
    expect(options.find((option) => option.franchise === 500)?.differenceToCurrent).toBe(
      francs(-660),
    );
  });

  it('children have no Franchise choice, so no levels at all', () => {
    expect(compareFranchises(person('2019-04-01'), [invoice(francs(5000))], 2026)).toEqual([]);
  });

  it('Kim Klein (child Franchise 0) is an adult in 2038: four levels, but no difference to a current Franchise', () => {
    const kim: InsuredPerson = { ...person('2019-04-01'), franchise: 0 };
    const options = compareFranchises(
      kim,
      [{ ...invoice(francs(5000)), treatmentDate: '2038-03-01' }],
      2038,
    );
    expect(options.map((option) => option.franchise)).toEqual([300, 500, 1500, 2500]);
    expect(options.map((option) => option.total)).toEqual([
      francs(5810),
      francs(5690),
      francs(5870),
      francs(6350),
    ]);
    expect(options.map((option) => option.differenceToCurrent)).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect(cheapestOf(options)?.franchise).toBe(500);
  });
});

describe('cheapest Franchise', () => {
  it('worked example H: CHF 5,000 bill, 500 wins with 4,740 premium + 950 cost sharing', () => {
    // 300: 5,040 + 770 = 5,810 / 500: 4,740 + 950 = 5,690 / 1500: 4,020 + 1,850 = 5,870 / 2500: 3,600 + 2,750 = 6,350
    expect(cheapestFranchise(adult, [invoice(francs(5000))], 2026)).toMatchObject({
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
