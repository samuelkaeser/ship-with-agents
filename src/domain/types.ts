import type { Rappen } from './money';

/** Calendar date as "YYYY-MM-DD". Dates are always passed in, the domain never reads the clock. */
export type IsoDate = string;

export type Franchise = 0 | 300 | 500 | 1500 | 2500;

export interface InsuredPerson {
  id: string;
  name: string;
  dateOfBirth: IsoDate;
  franchise: Franchise;
  /** In education, set in seed data only. Matters for the Spitalbeitrag exemption up to age 25. */
  inEducation?: boolean;
}

export interface Invoice {
  id: string;
  personId: string;
  treatmentDate: IsoDate;
  invoiceDate: IsoDate;
  amount: Rappen;
  description: string;
  /** Set for a hospital stay: the Treatment date is the day of admission. */
  dischargeDate?: IsoDate;
  /** Leave days during the stay, not billed. Only the count is known. */
  leaveDays?: number;
}
