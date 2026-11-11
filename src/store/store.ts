import type { Rappen } from '../domain/money';
import type { InsuredPerson, Invoice, IsoDate } from '../domain/types';
import { seedInvoices, seedPersons } from './seed';

export interface NewInvoice {
  personId: string;
  treatmentDate: IsoDate;
  invoiceDate: IsoDate;
  amount: Rappen;
  description: string;
  maternityService?: boolean;
}

export interface Store {
  listPersons(): InsuredPerson[];
  getPerson(id: string): InsuredPerson | undefined;
  listInvoices(personId: string): Invoice[];
  addInvoice(input: NewInvoice): Invoice;
}

/** In-memory store. Every call to createStore starts from a fresh copy of the seed data. */
export function createStore(
  persons: readonly InsuredPerson[] = seedPersons,
  invoices: readonly Invoice[] = seedInvoices,
): Store {
  const personList = [...persons];
  const invoiceList = [...invoices];

  return {
    listPersons: () => [...personList],
    getPerson: (id) => personList.find((person) => person.id === id),
    listInvoices: (personId) => invoiceList.filter((invoice) => invoice.personId === personId),
    addInvoice(input) {
      const id = `i${String(invoiceList.length + 1).padStart(2, '0')}`;
      const invoice: Invoice = { ...input, id };
      invoiceList.push(invoice);
      return invoice;
    },
  };
}
