import { francs, rappen, type Rappen } from './money';
import type { InsuredPerson, Invoice, IsoDate } from './types';

export const SELBSTBEHALT_PERCENT = 10; // KVG Art. 64 Abs. 2 lit. b

// KVV Art. 103 Abs. 2
export const SELBSTBEHALT_CAP_ADULT = francs(700);
export const SELBSTBEHALT_CAP_CHILD = francs(350);

export function yearOf(date: IsoDate): number {
  return Number(date.slice(0, 4));
}

/** Child = under 19 on 31.12. of the treatment year (teaching simplification, see KVG Art. 16 Abs. 5). */
export function isChild(person: InsuredPerson, year: number): boolean {
  return year - yearOf(person.dateOfBirth) < 19;
}

export function selbstbehaltCap(person: InsuredPerson, year: number): Rappen {
  return isChild(person, year) ? SELBSTBEHALT_CAP_CHILD : SELBSTBEHALT_CAP_ADULT;
}

export const SPITALBEITRAG_PER_DAY = francs(15); // KVV Art. 104 Abs. 1

const DAY_MS = 24 * 60 * 60 * 1000;

/** Days from admission up to, not including, the day of discharge (KVV Art. 104 Abs. 1bis). 0 for outpatient. */
export function billableHospitalDays(invoice: Invoice): number {
  if (!invoice.dischargeDate) return 0;
  const admitted = Date.parse(invoice.treatmentDate);
  const discharged = Date.parse(invoice.dischargeDate);
  return Math.max(0, Math.round((discharged - admitted) / DAY_MS));
}
