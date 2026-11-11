import { francs, type Rappen } from './money';
import type { Franchise, InsuredPerson, IsoDate } from './types';

export const SELBSTBEHALT_PERCENT = 10; // KVG Art. 64 Abs. 2 lit. b

// KVV Art. 103 Abs. 2
export const SELBSTBEHALT_CAP_ADULT = francs(700);
export const SELBSTBEHALT_CAP_CHILD = francs(350);

// KVV Art. 103 Abs. 1 (300 ordinary) and Art. 93 Abs. 1 (500, 1500, 2500 selectable); children: KVG Art. 64 Abs. 4
export const ADULT_FRANCHISES: readonly Franchise[] = [300, 500, 1500, 2500];
export const CHILD_FRANCHISES: readonly Franchise[] = [0];

export function yearOf(date: IsoDate): number {
  return Number(date.slice(0, 4));
}

/** Child = under 19 on 31.12. of the treatment year (teaching simplification, see KVG Art. 16 Abs. 5). */
export function isChild(person: InsuredPerson, year: number): boolean {
  return year - yearOf(person.dateOfBirth) < 19;
}

export function franchiseOptions(person: InsuredPerson, year: number): readonly Franchise[] {
  return isChild(person, year) ? CHILD_FRANCHISES : ADULT_FRANCHISES;
}

export function selbstbehaltCap(person: InsuredPerson, year: number): Rappen {
  return isChild(person, year) ? SELBSTBEHALT_CAP_CHILD : SELBSTBEHALT_CAP_ADULT;
}
