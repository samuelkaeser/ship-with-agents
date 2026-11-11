import { francs, type Rappen } from './money';
import type { InsuredPerson, Invoice, IsoDate, Maternity } from './types';

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

const MATERNITY_DAYS_AFTER_BIRTH = 56; // KVV Art. 105 Abs. 3: until day 56 at 24:00

/** Pure date arithmetic on "YYYY-MM-DD", no clock involved. */
function addDays(date: IsoDate, days: number): IsoDate {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

/** Last day of the maternity period, or undefined while no birth is recorded (KVV Art. 105 Abs. 3). */
export function maternityEnd(maternity: Maternity): IsoDate | undefined {
  return maternity.birthDate && addDays(maternity.birthDate, MATERNITY_DAYS_AFTER_BIRTH);
}

/**
 * No cost sharing on maternity services (KVG Art. 64 Abs. 7 lit. a), and on every service from
 * week 13 of the pregnancy until day 56 after birth (KVG Art. 64 Abs. 7 lit. b, KVV Art. 105).
 * The treatment date decides.
 */
export function exemptionOf(person: InsuredPerson, invoice: Invoice): Exemption | undefined {
  if (invoice.maternityService) return 'maternityService';
  const { maternity } = person;
  if (!maternity || invoice.treatmentDate < maternity.week13Start) return undefined;
  const end = maternityEnd(maternity);
  return end === undefined || invoice.treatmentDate <= end ? 'maternityPeriod' : undefined;
}
