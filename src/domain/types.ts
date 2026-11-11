import type { Rappen } from './money';

/** Calendar date as "YYYY-MM-DD". Dates are always passed in, the domain never reads the clock. */
export type IsoDate = string;

export type Franchise = 0 | 300 | 500 | 1500 | 2500;

/** One pregnancy, as stated by the doctor (KVV Art. 105 Abs. 1). */
export interface Maternity {
  /** Presumed first day of week 13. */
  week13Start: IsoDate;
  /** Day of birth. Stillbirth after week 23 counts as birth (KVV Art. 105 Abs. 2). */
  birthDate?: IsoDate;
}

export interface InsuredPerson {
  id: string;
  name: string;
  dateOfBirth: IsoDate;
  franchise: Franchise;
  maternity?: Maternity;
}

export interface Invoice {
  id: string;
  personId: string;
  treatmentDate: IsoDate;
  invoiceDate: IsoDate;
  amount: Rappen;
  description: string;
  /** Specific maternity service (KVG Art. 29 Abs. 2), ticked by the clerk. */
  maternityService?: boolean;
}
