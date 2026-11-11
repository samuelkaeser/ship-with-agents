import { francs, rappen, type Rappen } from '../domain/money';
import type { InsuredPerson, Invoice } from '../domain/types';

// Fictional persons and invoices for the demo. Nothing here is real.

export const seedPersons: InsuredPerson[] = [
  { id: 'erika-beispiel', name: 'Erika Beispiel', dateOfBirth: '1985-05-05', franchise: 300 },
  { id: 'max-muster', name: 'Max Muster', dateOfBirth: '1970-09-12', franchise: 300 },
  { id: 'anna-stichtag', name: 'Anna Stichtag', dateOfBirth: '1990-02-28', franchise: 300 },
  { id: 'kim-klein', name: 'Kim Klein', dateOfBirth: '2019-04-01', franchise: 0 },
  { id: 'lena-original', name: 'Lena Original', dateOfBirth: '1988-07-19', franchise: 300 },
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

  // Lena: Franchise used up by a visit, then an original drug (40%), then one with a medical reason (10%)
  inv('i11', 'lena-original', '2026-02-09', '2026-02-20', francs(300), 'Hausarzt, Abklärung'),
  {
    ...inv('i12', 'lena-original', '2026-03-16', '2026-03-25', francs(100), 'Original-Medikament'),
    differentiatedDrug: true,
  },
  {
    ...inv('i13', 'lena-original', '2026-05-04', '2026-05-12', francs(100), 'Original-Medikament'),
    differentiatedDrug: true,
    medicalReason: true,
  },
  // Lena's big drug crosses the cap: it would count 750, only 665 are left, so she pays 1,064 instead of 1,200
  {
    ...inv(
      'i14',
      'lena-original',
      '2026-08-24',
      '2026-09-02',
      francs(3000),
      'Original-Medikament, Dauertherapie',
    ),
    differentiatedDrug: true,
  },
];
