import { francs, type Rappen } from './money';
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

/** Why an invoice carries no cost sharing. */
export type Exemption = 'maternityService' | 'maternityPeriod';

/**
 * No cost sharing on maternity services (KVG Art. 64 Abs. 7 lit. a), and on every service from
 * week 13 of the pregnancy on (KVG Art. 64 Abs. 7 lit. b, KVV Art. 105). The treatment date decides.
 */
export function exemptionOf(person: InsuredPerson, invoice: Invoice): Exemption | undefined {
  if (invoice.maternityService) return 'maternityService';
  const start = person.maternity?.week13Start;
  if (start && invoice.treatmentDate >= start) return 'maternityPeriod';
  return undefined;
}
