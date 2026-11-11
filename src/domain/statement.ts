import { ZERO, add, francs, min, percentRoundHalfUp, sub, type Rappen } from './money';
import { SELBSTBEHALT_PERCENT, selbstbehaltCap, yearOf } from './rules';
import type { InsuredPerson, Invoice } from './types';

export interface StatementLine {
  invoice: Invoice;
  franchisePart: Rappen;
  selbstbehaltPart: Rappen;
  patientShare: Rappen;
  insurerShare: Rappen;
}

export interface Statement {
  year: number;
  lines: StatementLine[];
  totals: {
    invoiced: Rappen;
    franchisePart: Rappen;
    selbstbehaltPart: Rappen;
    patientShare: Rappen;
    insurerShare: Rappen;
  };
  franchiseLeft: Rappen;
  capLeft: Rappen;
}

/**
 * Yearly cost-sharing statement (Kostenbeteiligung) for one person and calendar year.
 *
 * - Invoices belong to the year of their TREATMENT date, not the invoice date (KVV Art. 103 Abs. 3).
 * - They are processed in treatment-date order (ties: invoice date, then id).
 * - Franchise first (KVG Art. 64 Abs. 2 lit. a), then 10% Selbstbehalt on the rest
 *   (KVG Art. 64 Abs. 2 lit. b), capped per year (KVV Art. 103 Abs. 2).
 * - The Selbstbehalt is rounded half up to the whole Rappen per invoice.
 */
export function computeStatement(
  person: InsuredPerson,
  invoices: readonly Invoice[],
  year: number,
): Statement {
  const franchise = francs(person.franchise);
  const cap = selbstbehaltCap(person, year);

  const inYear = invoices
    .filter((invoice) => invoice.personId === person.id && yearOf(invoice.treatmentDate) === year)
    .sort(
      (a, b) =>
        a.treatmentDate.localeCompare(b.treatmentDate) ||
        a.invoiceDate.localeCompare(b.invoiceDate) ||
        a.id.localeCompare(b.id),
    );

  let franchiseLeft = franchise;
  let capLeft = cap;
  const lines: StatementLine[] = [];

  for (const invoice of inYear) {
    const franchisePart = min(invoice.amount, franchiseLeft);
    const selbstbehaltPart = min(
      percentRoundHalfUp(sub(invoice.amount, franchisePart), SELBSTBEHALT_PERCENT),
      capLeft,
    );
    franchiseLeft = sub(franchiseLeft, franchisePart);
    capLeft = sub(capLeft, selbstbehaltPart);
    const patientShare = add(franchisePart, selbstbehaltPart);
    lines.push({
      invoice,
      franchisePart,
      selbstbehaltPart,
      patientShare,
      insurerShare: sub(invoice.amount, patientShare),
    });
  }

  const sum = (pick: (line: StatementLine) => Rappen) =>
    lines.reduce((total, line) => add(total, pick(line)), ZERO);

  return {
    year,
    lines,
    totals: {
      invoiced: sum((line) => line.invoice.amount),
      franchisePart: sum((line) => line.franchisePart),
      selbstbehaltPart: sum((line) => line.selbstbehaltPart),
      patientShare: sum((line) => line.patientShare),
      insurerShare: sum((line) => line.insurerShare),
    },
    franchiseLeft,
    capLeft,
  };
}
