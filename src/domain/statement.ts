import { ZERO, add, francs, min, percentRoundHalfUp, sub, type Rappen } from './money';
import { capCountPercent, selbstbehaltCap, selbstbehaltPercent, yearOf } from './rules';
import type { InsuredPerson, Invoice } from './types';

export interface StatementLine {
  invoice: Invoice;
  franchisePart: Rappen;
  selbstbehaltPart: Rappen;
  /** What this invoice used up of the yearly cap (less than selbstbehaltPart for a 40% drug). */
  capCounted: Rappen;
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
 *   (KVG Art. 64 Abs. 2 lit. b; 40% for a marked drug, KLV Art. 38a Abs. 1),
 *   capped per year (KVV Art. 103 Abs. 2).
 * - A 40% drug counts only 25% of its base toward the cap (KVV Art. 104a Abs. 2).
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
    const base = sub(invoice.amount, franchisePart);
    const percent = selbstbehaltPercent(invoice);
    const countPercent = capCountPercent(percent);
    const capCounted = min(percentRoundHalfUp(base, countPercent), capLeft);
    // KVV Art. 104a Abs. 2: the patient pays the full percentage, only part of it counts toward the cap.
    // If the cap runs out inside this invoice, the patient pays in the same proportion (our reading).
    const selbstbehaltPart =
      capCounted === percentRoundHalfUp(base, countPercent)
        ? percentRoundHalfUp(base, percent)
        : percentRoundHalfUp(capCounted, (percent * 100) / countPercent);
    franchiseLeft = sub(franchiseLeft, franchisePart);
    capLeft = sub(capLeft, capCounted);
    const patientShare = add(franchisePart, selbstbehaltPart);
    lines.push({
      invoice,
      franchisePart,
      selbstbehaltPart,
      capCounted,
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
