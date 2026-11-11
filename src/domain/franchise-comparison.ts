import { add, francs, rappen, sub, type Rappen } from './money';
import { isChild } from './rules';
import { computeStatement } from './statement';
import type { Franchise, InsuredPerson, Invoice } from './types';

type AdultFranchise = Exclude<Franchise, 0>;

// Fictional monthly premiums for adults, made up for this app. They come from no law and no real
// insurer. The same table applies to every calendar year. Ascending Franchise order matters: the
// cheapest-level pick below relies on it for ties.
export const MONTHLY_PREMIUM: Readonly<Record<AdultFranchise, Rappen>> = {
  300: francs(420),
  500: francs(395),
  1500: francs(335),
  2500: francs(300),
};

const ADULT_FRANCHISES: AdultFranchise[] = [300, 500, 1500, 2500];

export interface FranchiseOption {
  franchise: Franchise;
  /** 12 monthly premiums. */
  premium: Rappen;
  /** Patient share of the yearly statement if the person had this Franchise. */
  costSharing: Rappen;
  /** premium + costSharing. */
  total: Rappen;
  /**
   * total minus the total of the person's current Franchise: negative means cheaper. Undefined when
   * the stored Franchise is not one of the four levels (a child's Franchise 0 in a year the person
   * is an adult): there is nothing to compare with.
   */
  differenceToCurrent: Rappen | undefined;
}

/**
 * What each Franchise level would have cost one adult in a calendar year, in ascending Franchise
 * order. Cost sharing comes from the normal yearly statement with the Franchise swapped.
 * Children have no Franchise choice: empty list.
 */
export function compareFranchises(
  person: InsuredPerson,
  invoices: readonly Invoice[],
  year: number,
): FranchiseOption[] {
  if (isChild(person, year)) return [];
  const options = ADULT_FRANCHISES.map((franchise) => {
    const premium = rappen(12 * MONTHLY_PREMIUM[franchise]);
    const costSharing = computeStatement({ ...person, franchise }, invoices, year).totals
      .patientShare;
    return { franchise, premium, costSharing, total: add(premium, costSharing) };
  });
  // Usually an adult's current Franchise is one of the four levels. If not, nothing to compare.
  const current = options.find((option) => option.franchise === person.franchise);
  return options.map((option) => ({
    ...option,
    differenceToCurrent: current ? sub(option.total, current.total) : undefined,
  }));
}

/** The option with the lowest yearly cost. A tie goes to the lower Franchise (first in the list). */
export function cheapestOf(options: readonly FranchiseOption[]): FranchiseOption | undefined {
  return options.reduce<FranchiseOption | undefined>(
    (best, option) => (best && best.total <= option.total ? best : option),
    undefined,
  );
}
