import { francs, rappen, type Rappen } from '../domain/money';
import type { InsuredPerson, Invoice } from '../domain/types';

// Fictional persons and invoices for the demo. Nothing here is real.

export const seedPersons: InsuredPerson[] = [
  { id: 'erika-beispiel', name: 'Erika Beispiel', dateOfBirth: '1985-05-05', franchise: 300 },
  { id: 'max-muster', name: 'Max Muster', dateOfBirth: '1970-09-12', franchise: 300 },
  { id: 'anna-stichtag', name: 'Anna Stichtag', dateOfBirth: '1990-02-28', franchise: 300 },
  { id: 'kim-klein', name: 'Kim Klein', dateOfBirth: '2019-04-01', franchise: 0 },
  {
    id: 'lena-lernend',
    name: 'Lena Lernend',
    dateOfBirth: '2004-08-19',
    franchise: 300,
    inEducation: true,
  },
  { id: 'sabine-spital', name: 'Sabine Spital', dateOfBirth: '1975-03-14', franchise: 300 },
  { id: 'peter-sparfuchs', name: 'Peter Sparfuchs', dateOfBirth: '1978-11-23', franchise: 2500 },
];

const inv = (
  id: string,
  personId: string,
  treatmentDate: string,
  invoiceDate: string,
  amount: Rappen,
  description: string,
): Invoice => ({ id, personId, treatmentDate, invoiceDate, amount, description });

export const seedInvoices: Invoice[] = [
  // Erika: one ordinary outpatient bill (CHF 5,000, she pays 770)
  inv('i01', 'erika-beispiel', '2026-03-10', '2026-03-20', francs(5000), 'Ambulante Behandlung'),

  // Max: hits the Selbstbehalt cap in 2026
  inv('i02', 'max-muster', '2026-02-02', '2026-02-12', rappen(18050), 'Hausarzt und Labor'),
  inv('i03', 'max-muster', '2026-05-18', '2026-06-01', francs(15400), 'Ambulante Operation'),
  inv('i04', 'max-muster', '2026-08-25', '2026-09-05', francs(840), 'Physiotherapie, Serie'),
  inv('i05', 'max-muster', '2026-11-03', '2026-11-20', rappen(32050), 'Nachkontrolle'),

  // Anna: treatments on both sides of the year boundary, both invoiced in January 2027
  inv('i06', 'anna-stichtag', '2026-12-20', '2027-01-15', francs(400), 'Zahnarzt (Dezember)'),
  inv('i07', 'anna-stichtag', '2027-01-08', '2027-01-15', francs(400), 'Zahnarzt (Januar)'),

  // Kim: a child, cap CHF 350
  inv('i08', 'kim-klein', '2026-04-14', '2026-04-30', francs(5000), 'Kinderspital, Abklärung'),

  // Sabine: Franchise used up in January, then a stay Monday 7.9. to Saturday 12.9. (worked example D).
  // The amount of a stay is the insurer's share of it. She pays 600 Selbstbehalt + 5 x 15 = 675.
  inv('i11', 'sabine-spital', '2026-01-20', '2026-01-30', francs(300), 'Hausarzt'),
  {
    ...inv('i12', 'sabine-spital', '2026-09-07', '2026-09-20', francs(6000), 'Spital, Operation'),
    dischargeDate: '2026-09-12',
  },

  // Kim (child) and Lena (22, in education) each have a stay but pay no Spitalbeitrag
  {
    ...inv(
      'i13',
      'kim-klein',
      '2026-06-01',
      '2026-06-15',
      francs(2000),
      'Kinderspital, Aufenthalt',
    ),
    dischargeDate: '2026-06-06',
  },
  {
    ...inv('i14', 'lena-lernend', '2026-10-05', '2026-10-20', francs(2100), 'Spital, Blinddarm'),
    dischargeDate: '2026-10-10',
  },

  // Peter: high Franchise, barely above it
  inv(
    'i09',
    'peter-sparfuchs',
    '2026-06-06',
    '2026-06-20',
    francs(2200),
    'Rückenschmerzen, Abklärung',
  ),
  inv('i10', 'peter-sparfuchs', '2026-10-15', '2026-10-30', francs(600), 'Kontrolle'),
];
