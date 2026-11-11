import { add, francs, rappen, type Rappen } from './money';
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
}

/**
 * The Franchise with the lowest yearly cost (12 premiums + Kostenbeteiligung) for one adult and
 * calendar year. Cost sharing comes from the normal yearly statement with the Franchise swapped.
 * Ties go to the lower Franchise. Children have no Franchise choice: undefined.
 */
export function cheapestFranchise(
  person: InsuredPerson,
  invoices: readonly Invoice[],
  year: number,
): FranchiseOption | undefined {
  if (isChild(person, year)) return undefined;
  const options = ADULT_FRANCHISES.map((franchise): FranchiseOption => {
    const premium = rappen(12 * MONTHLY_PREMIUM[franchise]);
    const costSharing = computeStatement({ ...person, franchise }, invoices, year).totals
      .patientShare;
    return { franchise, premium, costSharing, total: add(premium, costSharing) };
  });
  return options.reduce((best, option) => (option.total < best.total ? option : best));
}
