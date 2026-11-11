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

describe('worked example D: Spitalbeitrag', () => {
  const stay = (
    id: string,
    treatmentDate: string,
    dischargeDate: string,
    amount: Rappen,
  ): Invoice => ({ ...invoice(id, treatmentDate, amount), dischargeDate });

  it('Monday to Saturday, Franchise used up: Selbstbehalt 600 + 5 days x 15 = patient pays 675', () => {
    const { lines } = computeStatement(
      adult,
      [
        invoice('early', '2026-01-20', francs(300)),
        stay('stay', '2026-09-07', '2026-09-12', francs(6000)),
      ],
      2026,
    );
    expect(lines[1]).toMatchObject({
      billableDays: 5,
      selbstbehaltPart: francs(600),
      spitalbeitrag: francs(75),
      patientShare: francs(675),
      insurerShare: francs(5325),
    });
  });

  it('does not bill the day of discharge: one night is 1 day', () => {
    const { lines } = computeStatement(
      adult,
      [stay('a', '2026-09-07', '2026-09-08', francs(1000))],
      2026,
    );
    expect(lines[0]?.billableDays).toBe(1);
    expect(lines[0]?.spitalbeitrag).toBe(francs(15));
  });

  it('is charged on top of the capped Selbstbehalt: at the cap, the stay still costs 15 a day', () => {
    const { lines, totals } = computeStatement(
      adult,
      [
        invoice('big', '2026-01-10', francs(20000)),
        stay('stay', '2026-09-07', '2026-09-10', francs(2000)),
      ],
      2026,
    );
    expect(lines[1]?.selbstbehaltPart).toBe(francs(0));
    expect(lines[1]?.spitalbeitrag).toBe(francs(45));
    expect(totals.spitalbeitrag).toBe(francs(45));
    expect(totals.patientShare).toBe(francs(1045));
  });

  it('does not use up Franchise or cap room', () => {
    const { franchiseLeft, capLeft } = computeStatement(
      adult,
      [stay('a', '2026-09-07', '2026-09-12', francs(100))],
      2026,
    );
    expect(franchiseLeft).toBe(francs(200));
    expect(capLeft).toBe(francs(700));
  });

  it('never exceeds what is left of the invoice: insurer share stays 0, not negative', () => {
    const { lines } = computeStatement(
      adult,
      [stay('a', '2026-01-01', '2026-03-01', francs(100))],
      2026,
    );
    expect(lines[0]?.spitalbeitrag).toBe(francs(0));
    expect(lines[0]?.insurerShare).toBe(francs(0));
  });

  it('an invoice without discharge date has no Spitalbeitrag', () => {
    const { lines, totals } = computeStatement(
      adult,
      [invoice('a', '2026-03-01', francs(5000))],
      2026,
    );
    expect(lines[0]).toMatchObject({ billableDays: 0, spitalbeitrag: francs(0) });
    expect(totals.spitalbeitrag).toBe(francs(0));
  });
});

describe('Spitalbeitrag leave days (KVV Art. 104 Abs. 1bis)', () => {
  const stay = (leaveDays?: number): Invoice => ({
    ...invoice('a', '2026-11-02', francs(3000)),
    dischargeDate: '2026-11-09',
    ...(leaveDays !== undefined && { leaveDays }),
  });
  const lineOf = (leaveDays?: number) => computeStatement(adult, [stay(leaveDays)], 2026).lines[0];

  it('a stay of 7 days with 2 leave days bills 5 days, Spitalbeitrag 75', () => {
    expect(lineOf(2)).toMatchObject({ billableDays: 5, spitalbeitrag: francs(75) });
  });

  it('a stay without leave days bills all 7 days', () => {
    expect(lineOf()?.billableDays).toBe(7);
  });

  it.each([7, 10])('%s leave days on a 7 day stay bill 0 days, not a negative amount', (days) => {
    expect(lineOf(days)).toMatchObject({ billableDays: 0, spitalbeitrag: francs(0) });
  });
});

describe('Spitalbeitrag exemptions (KVV Art. 104 Abs. 2)', () => {
  const stay = { ...invoice('a', '2026-09-07', francs(1000)), dischargeDate: '2026-09-12' };
  const spitalbeitragOf = (p: InsuredPerson) =>
    computeStatement(p, [stay], 2026).totals.spitalbeitrag;

  it('a child pays no Spitalbeitrag and has 0 billed days for the same 5 day stay', () => {
    const { lines } = computeStatement(person('2015-06-01', 0), [stay], 2026);
    expect(lines[0]?.billableDays).toBe(0);
    expect(lines[0]?.spitalbeitrag).toBe(francs(0));
  });

  it('a student in education aged 25 has 0 billed days', () => {
    const student = { ...person('2001-03-03'), inEducation: true };
    expect(computeStatement(student, [stay], 2026).lines[0]?.billableDays).toBe(0);
  });

  it('a student in education aged 25 in the treatment year pays nothing', () => {
    expect(spitalbeitragOf({ ...person('2001-03-03'), inEducation: true })).toBe(francs(0));
  });

  it('a student in education aged 26 in the treatment year pays 75', () => {
    expect(spitalbeitragOf({ ...person('2000-03-03'), inEducation: true })).toBe(francs(75));
  });

  it('a 22 year old not in education pays 75', () => {
    expect(spitalbeitragOf(person('2004-03-03'))).toBe(francs(75));
  });
});
