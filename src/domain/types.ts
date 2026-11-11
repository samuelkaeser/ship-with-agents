import type { Rappen } from './money';

/** Calendar date as "YYYY-MM-DD". Dates are always passed in, the domain never reads the clock. */
export type IsoDate = string;

export type Franchise = 0 | 300 | 500 | 1500 | 2500;

export interface InsuredPerson {
  id: string;
  name: string;
  dateOfBirth: IsoDate;
  franchise: Franchise;
}

export interface Invoice {
  id: string;
  personId: string;
  treatmentDate: IsoDate;
  invoiceDate: IsoDate;
  amount: Rappen;
  description: string;
}
