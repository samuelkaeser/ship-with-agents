import { describe, expect, it } from 'vitest';
import { francs, rappen, type Rappen } from './money';
import { computeStatement } from './statement';
import type { Franchise, InsuredPerson, Invoice } from './types';

const person = (dateOfBirth: string, franchise: Franchise = 300): InsuredPerson => ({
  id: 'p',
  name: 'Test Person',
  dateOfBirth,
  franchise,
});

const invoice = (
  id: string,
  treatmentDate: string,
  amount: Rappen,
  invoiceDate = treatmentDate,
): Invoice => ({ id, personId: 'p', treatmentDate, invoiceDate, amount, description: 'Test' });

const adult = person('1985-05-05');
const child0 = person('1985-05-05', 0);

describe('worked example A: adult, CHF 5,000 outpatient bill', () => {
  it('pays 300 Franchise + 470 Selbstbehalt = 770, insurer pays 4,230', () => {
    const { lines, totals } = computeStatement(
      adult,
      [invoice('a', '2026-03-01', francs(5000))],
      2026,
    );
    expect(lines[0]).toMatchObject({
      franchisePart: francs(300),
      selbstbehaltPart: francs(470),
      patientShare: francs(770),
      insurerShare: francs(4230),
    });
    expect(totals.patientShare).toBe(francs(770));
  });
});

describe('worked example B: the Selbstbehalt cap', () => {
  it('CHF 20,000 in one year: patient pays 1,000, insurer 19,000', () => {
    const { totals, capLeft } = computeStatement(
      adult,
      [invoice('a', '2026-03-01', francs(20000))],
      2026,
    );
    expect(totals.patientShare).toBe(francs(1000));
    expect(totals.insurerShare).toBe(francs(19000));
    expect(capLeft).toBe(francs(0));
  });

  it('exactly CHF 7,300 just reaches the cap: 300 + 700 = 1,000', () => {
    const { totals, capLeft } = computeStatement(
      adult,
      [invoice('a', '2026-03-01', francs(7300))],
      2026,
    );
    expect(totals.patientShare).toBe(francs(1000));
    expect(capLeft).toBe(francs(0));
  });

  it('CHF 7,301 is still 1,000, the cap holds', () => {
    const { totals } = computeStatement(adult, [invoice('a', '2026-03-01', francs(7301))], 2026);
    expect(totals.patientShare).toBe(francs(1000));
  });

  it('CHF 7,299 is just below the cap: 300 + 699.90', () => {
    const { totals, capLeft } = computeStatement(
      adult,
      [invoice('a', '2026-03-01', francs(7299))],
      2026,
    );
    expect(totals.selbstbehaltPart).toBe(rappen(69990));
    expect(capLeft).toBe(rappen(10));
  });

  it('the cap is shared across several invoices in the same year', () => {
    const { lines, totals } = computeStatement(
      adult,
      [
        invoice('a', '2026-02-01', francs(5000)),
        invoice('b', '2026-06-01', francs(5000)),
        invoice('c', '2026-09-01', francs(5000)),
      ],
      2026,
    );
    expect(lines.map((line) => line.selbstbehaltPart)).toEqual([
      francs(470),
      francs(230), // only 230 of the cap is left
      francs(0),
    ]);
    expect(totals.patientShare).toBe(francs(1000));
  });
});

describe('cap reached in the middle of one invoice', () => {
  it('CHF 5,000 then CHF 3,000: the second invoice only gets the remaining 230 of the cap', () => {
    const { lines, totals, capLeft } = computeStatement(
      adult,
      [invoice('a', '2026-02-01', francs(5000)), invoice('b', '2026-06-01', francs(3000))],
      2026,
    );
    expect(lines[1]).toMatchObject({
      selbstbehaltPart: francs(230), // 10% would be 300
      patientShare: francs(230),
      insurerShare: francs(2770),
    });
    expect(totals.patientShare).toBe(francs(1000));
    expect(capLeft).toBe(francs(0));
  });
});

describe('worked example C: child', () => {
  it('single child, CHF 5,000: no Franchise, Selbstbehalt capped at 350', () => {
    const child = person('2019-04-01', 0);
    const { totals } = computeStatement(child, [invoice('a', '2026-03-01', francs(5000))], 2026);
    expect(totals.franchisePart).toBe(francs(0));
    expect(totals.patientShare).toBe(francs(350));
    expect(totals.insurerShare).toBe(francs(4650));
  });

  it('a person turning 19 in the treatment year is an adult for that whole year', () => {
    const turning19 = person('2007-12-31', 300);
    const { totals, capLeft } = computeStatement(
      turning19,
      [invoice('a', '2026-01-10', francs(20000))],
      2026,
    );
    expect(totals.patientShare).toBe(francs(1000));
    expect(capLeft).toBe(francs(0));
  });

  it('a person turning 18 in the treatment year is still a child (cap 350)', () => {
    const turning18 = person('2008-01-01', 0);
    const { totals } = computeStatement(
      turning18,
      [invoice('a', '2026-12-31', francs(20000))],
      2026,
    );
    expect(totals.patientShare).toBe(francs(350));
  });
});

describe('worked example E: year boundary', () => {
  const invoices = [
    invoice('dec', '2026-12-20', francs(400), '2027-01-15'),
    invoice('jan', '2027-01-08', francs(400), '2027-01-15'),
  ];

  it('treatments on both sides of 31.12. give 620 in total, not 350', () => {
    const y2026 = computeStatement(adult, invoices, 2026);
    const y2027 = computeStatement(adult, invoices, 2027);
    expect(y2026.totals.patientShare).toBe(francs(310)); // 300 Franchise + 10 Selbstbehalt
    expect(y2027.totals.patientShare).toBe(francs(310)); // fresh Franchise
    expect(y2026.totals.patientShare + y2027.totals.patientShare).toBe(francs(620));
  });

  it('assigns the December treatment to 2026 although it was invoiced in 2027', () => {
    const y2026 = computeStatement(adult, invoices, 2026);
    expect(y2026.lines.map((line) => line.invoice.id)).toEqual(['dec']);
  });
});

describe('Franchise and ordering', () => {
  it('a higher Franchise absorbs more: 2500 Franchise, CHF 3,000 bill = 2,500 + 50', () => {
    const { totals, franchiseLeft } = computeStatement(
      person('1980-01-01', 2500),
      [invoice('a', '2026-03-01', francs(3000))],
      2026,
    );
    expect(totals.franchisePart).toBe(francs(2500));
    expect(totals.selbstbehaltPart).toBe(francs(50));
    expect(franchiseLeft).toBe(francs(0));
  });

  it('a small invoice is absorbed by the Franchise entirely and leaves the rest', () => {
    const { lines, franchiseLeft, capLeft } = computeStatement(
      adult,
      [invoice('a', '2026-03-01', francs(120))],
      2026,
    );
    expect(lines[0]?.patientShare).toBe(francs(120));
    expect(franchiseLeft).toBe(francs(180));
    expect(capLeft).toBe(francs(700));
  });

  it('processes invoices in treatment-date order, not input order', () => {
    const { lines } = computeStatement(
      adult,
      [invoice('late', '2026-09-01', francs(300)), invoice('early', '2026-02-01', francs(300))],
      2026,
    );
    expect(lines.map((line) => line.invoice.id)).toEqual(['early', 'late']);
    expect(lines[0]?.franchisePart).toBe(francs(300));
    expect(lines[1]?.franchisePart).toBe(francs(0));
  });

  it('same treatment date: the earlier invoice date is processed first, then the lower id', () => {
    const { lines } = computeStatement(
      adult,
      [
        invoice('b', '2026-03-01', francs(300), '2026-03-10'),
        invoice('c', '2026-03-01', francs(300), '2026-03-05'),
        invoice('a', '2026-03-01', francs(300), '2026-03-10'),
      ],
      2026,
    );
    expect(lines.map((line) => line.invoice.id)).toEqual(['c', 'a', 'b']);
    expect(lines[0]?.franchisePart).toBe(francs(300));
  });

  it('ignores invoices of other persons', () => {
    const foreign: Invoice = {
      ...invoice('x', '2026-03-01', francs(500)),
      personId: 'someone-else',
    };
    expect(computeStatement(adult, [foreign], 2026).lines).toEqual([]);
  });
});

describe('Selbstbehalt rounding', () => {
  it('rounds half up to the whole Rappen: 10% of CHF 300.05 above Franchise = 0.005 -> 0.01', () => {
    const { totals } = computeStatement(adult, [invoice('a', '2026-03-01', rappen(30005))], 2026);
    expect(totals.selbstbehaltPart).toBe(rappen(1));
  });

  it('rounds down below half: 10% of CHF 300.04 above Franchise = 0.004 -> 0.00', () => {
    const { totals } = computeStatement(adult, [invoice('a', '2026-03-01', rappen(30004))], 2026);
    expect(totals.selbstbehaltPart).toBe(rappen(0));
  });
});

describe('worked example G: drug with 40% Selbstbehalt', () => {
  // Franchise 300 is used up by an ordinary invoice first, so the drug invoice is all Selbstbehalt.
  const franchiseMet = invoice('a', '2026-01-10', francs(300));
  const drug = (amount: Rappen): Invoice => ({
    ...invoice('b', '2026-02-10', amount),
    differentiatedDrug: true,
  });

  it('original drug CHF 100, no medical reason: patient pays 40, insurer 60', () => {
    const { lines } = computeStatement(adult, [franchiseMet, drug(francs(100))], 2026);
    expect(lines[1]).toMatchObject({
      franchisePart: francs(0),
      selbstbehaltPart: francs(40),
      patientShare: francs(40),
      insurerShare: francs(60),
    });
  });

  it('the Franchise comes first: a marked CHF 200 drug inside the Franchise has no Selbstbehalt', () => {
    const { lines } = computeStatement(adult, [drug(francs(200))], 2026);
    expect(lines[0]).toMatchObject({ franchisePart: francs(200), selbstbehaltPart: francs(0) });
  });

  it('only the part above the Franchise is charged 40%: CHF 400 drug = 300 + 40', () => {
    const { lines } = computeStatement(adult, [drug(francs(400))], 2026);
    expect(lines[0]).toMatchObject({ franchisePart: francs(300), selbstbehaltPart: francs(40) });
  });

  it('with a medical reason the normal 10% applies: patient pays 10', () => {
    const { lines } = computeStatement(
      adult,
      [franchiseMet, { ...drug(francs(100)), medicalReason: true }],
      2026,
    );
    expect(lines[1]).toMatchObject({ selbstbehaltPart: francs(10), patientShare: francs(10) });
  });

  it('a medical reason on an unmarked invoice changes nothing: still 10%', () => {
    const { lines } = computeStatement(
      adult,
      [franchiseMet, { ...invoice('b', '2026-02-10', francs(100)), medicalReason: true }],
      2026,
    );
    expect(lines[1]?.selbstbehaltPart).toBe(francs(10));
  });

  it('counts only 25% toward the cap: patient pays 40, counted 25, cap left 675', () => {
    const { lines, capLeft } = computeStatement(adult, [franchiseMet, drug(francs(100))], 2026);
    expect(lines[1]?.capCounted).toBe(francs(25));
    expect(capLeft).toBe(francs(675));
  });

  it('with a medical reason the full 10% counts: patient pays 10, counted 10', () => {
    const { lines } = computeStatement(
      adult,
      [franchiseMet, { ...drug(francs(100)), medicalReason: true }],
      2026,
    );
    expect(lines[1]).toMatchObject({ selbstbehaltPart: francs(10), capCounted: francs(10) });
  });

  it('an unmarked invoice counts its full Selbstbehalt toward the cap, as before', () => {
    const { lines } = computeStatement(adult, [invoice('a', '2026-01-10', francs(5000))], 2026);
    expect(lines[0]?.capCounted).toBe(francs(470));
  });

  it('cap reached inside a 40% invoice: 665 of the cap left, CHF 3,000 drug, patient pays 1,064', () => {
    const invoices = [
      franchiseMet,
      drug(francs(100)), // pays 40, counts 25
      { ...invoice('c', '2026-03-10', francs(100)), differentiatedDrug: true, medicalReason: true }, // pays 10, counts 10
      { ...drug(francs(3000)), id: 'd', treatmentDate: '2026-04-10' }, // would count 750
    ];
    const { lines, capLeft } = computeStatement(adult, invoices, 2026);
    expect(lines[3]).toMatchObject({ capCounted: francs(665), selbstbehaltPart: francs(1064) });
    expect(capLeft).toBe(francs(0));
  });

  it('after the cap is reached a further 40% invoice costs nothing', () => {
    const invoices = [
      franchiseMet,
      drug(francs(7000)),
      { ...drug(francs(500)), id: 'c', treatmentDate: '2026-05-10' },
    ];
    const { lines } = computeStatement(adult, invoices, 2026);
    expect(lines[2]).toMatchObject({ selbstbehaltPart: francs(0), capCounted: francs(0) });
  });

  it('child cap CHF 350 works the same way: CHF 2,000 drug counts 350 and costs 560', () => {
    const child = person('2015-01-01', 0);
    const { lines } = computeStatement(child, [drug(francs(2000))], 2026);
    expect(lines[0]).toMatchObject({ capCounted: francs(350), selbstbehaltPart: francs(560) });
  });

  it('rounds each figure half up on its own: base CHF 10.02 pays 4.01 and counts 2.51', () => {
    const { lines } = computeStatement(child0, [drug(rappen(1002))], 2026);
    expect(lines[0]).toMatchObject({ selbstbehaltPart: rappen(401), capCounted: rappen(251) });
  });

  it('an unmarked invoice of the same amount is still charged 10%', () => {
    const { lines } = computeStatement(
      adult,
      [franchiseMet, invoice('b', '2026-02-10', francs(100))],
      2026,
    );
    expect(lines[1]?.selbstbehaltPart).toBe(francs(10));
  });
});
