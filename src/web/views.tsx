import { raw } from 'hono/html';
import type { PropsWithChildren } from 'hono/jsx';
import { formatChf, francs } from '../domain/money';
import {
  SELBSTBEHALT_PERCENT,
  isChild,
  selbstbehaltCap,
  selbstbehaltPercent,
} from '../domain/rules';
import type { Statement } from '../domain/statement';
import type { InsuredPerson, Invoice } from '../domain/types';

export const INSURER_NAME = 'Krankenkasse light';

const css = `
  body { font-family: system-ui, sans-serif; margin: 0; background: #f6f7f9; color: #1d2330; }
  header { background: #0b5d4b; color: #fff; padding: 0.8rem 1.5rem; }
  header a { color: #fff; text-decoration: none; font-weight: 600; }
  main { max-width: 64rem; margin: 1.5rem auto; padding: 0 1.5rem; }
  h1 { margin-top: 0; }
  table { border-collapse: collapse; width: 100%; background: #fff; margin: 0.5rem 0 1.5rem; }
  th, td { border-bottom: 1px solid #dde1e8; padding: 0.4rem 0.6rem; text-align: left; }
  th.num, td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tfoot td { font-weight: 700; }
  nav.years a { margin-right: 0.8rem; }
  nav.years a[aria-current] { font-weight: 700; color: #1d2330; text-decoration: none; }
  form { background: #fff; padding: 1rem; display: grid; gap: 0.6rem; max-width: 26rem; }
  label { display: grid; gap: 0.2rem; font-size: 0.9rem; }
  input, button { font: inherit; padding: 0.35rem 0.5rem; }
  button { background: #0b5d4b; color: #fff; border: 0; cursor: pointer; }
  .error { color: #b00020; }
`;

export function Layout({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{`${title} | ${INSURER_NAME}`}</title>
        <style>{raw(css)}</style>
      </head>
      <body>
        <header>
          <a href="/">{INSURER_NAME}</a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

const drugNote = (invoice: Invoice) => {
  if (!invoice.differentiatedDrug) return undefined;
  return invoice.medicalReason
    ? 'Medikament, Selbstbehalt 10% (medizinischer Grund)'
    : 'Medikament mit 40% Selbstbehalt';
};

export function PersonList({ persons }: { persons: InsuredPerson[] }) {
  return (
    <Layout title="Versicherte">
      <h1>Versicherte Personen</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Geburtsdatum</th>
            <th class="num">Franchise</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((person) => (
            <tr>
              <td>
                <a href={`/persons/${person.id}`}>{person.name}</a>
              </td>
              <td>{person.dateOfBirth}</td>
              <td class="num">{formatChf(francs(person.franchise))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}

interface PersonPageProps {
  person: InsuredPerson;
  invoices: Invoice[];
  statement: Statement;
  years: number[];
  errors?: string[];
}

export function PersonPage({ person, invoices, statement, years, errors = [] }: PersonPageProps) {
  const { year, totals } = statement;
  return (
    <Layout title={person.name}>
      <h1>{person.name}</h1>
      <p>
        Geboren {person.dateOfBirth}, Franchise {formatChf(francs(person.franchise))}, im Jahr{' '}
        {year} {isChild(person, year) ? 'Kind' : 'Erwachsene/r'}, Selbstbehalt-Obergrenze{' '}
        {formatChf(selbstbehaltCap(person, year))} pro Jahr.
      </p>

      <h2>Rechnungen</h2>
      <table>
        <thead>
          <tr>
            <th>Behandlung</th>
            <th>Rechnung</th>
            <th>Beschreibung</th>
            <th class="num">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr>
              <td>{invoice.treatmentDate}</td>
              <td>{invoice.invoiceDate}</td>
              <td>
                {invoice.description}
                {drugNote(invoice) && <small> ({drugNote(invoice)})</small>}
              </td>
              <td class="num">{formatChf(invoice.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Neue Rechnung erfassen</h2>
      {errors.map((message) => (
        <p class="error">{message}</p>
      ))}
      <form method="post" action={`/persons/${person.id}/invoices`}>
        <label>
          Behandlungsdatum
          <input type="date" name="treatmentDate" required />
        </label>
        <label>
          Rechnungsdatum
          <input type="date" name="invoiceDate" required />
        </label>
        <label>
          Betrag in CHF
          <input type="text" name="amount" inputmode="decimal" placeholder="123.45" required />
        </label>
        <label>
          Beschreibung
          <input type="text" name="description" required />
        </label>
        <label>
          <span>
            <input type="checkbox" name="differentiatedDrug" /> Medikament mit 40% Selbstbehalt
          </span>
        </label>
        <label>
          <span>
            <input type="checkbox" name="medicalReason" /> Medizinischer Grund (Original ärztlich
            verordnet)
          </span>
        </label>
        <button type="submit">Rechnung speichern</button>
      </form>

      <h2>Kostenbeteiligung {year}</h2>
      <nav class="years">
        {years.map((y) => (
          <a
            href={`/persons/${person.id}?year=${y}`}
            aria-current={y === year ? 'page' : undefined}
          >
            {y}
          </a>
        ))}
      </nav>
      <p>Massgebend ist das Behandlungsdatum, nicht das Rechnungsdatum.</p>
      <table>
        <thead>
          <tr>
            <th>Behandlung</th>
            <th>Beschreibung</th>
            <th class="num">Betrag</th>
            <th class="num">Franchise</th>
            <th class="num">Selbstbehalt</th>
            <th class="num">Patient zahlt</th>
            <th class="num">Kasse zahlt</th>
          </tr>
        </thead>
        <tbody>
          {statement.lines.map((line) => (
            <tr>
              <td>{line.invoice.treatmentDate}</td>
              <td>
                {line.invoice.description}
                {drugNote(line.invoice) && (
                  <>
                    <br />
                    <small>
                      {drugNote(line.invoice)}
                      {selbstbehaltPercent(line.invoice) > SELBSTBEHALT_PERCENT &&
                        `, an die Obergrenze angerechnet: ${formatChf(line.capCounted)}`}
                    </small>
                  </>
                )}
              </td>
              <td class="num">{formatChf(line.invoice.amount)}</td>
              <td class="num">{formatChf(line.franchisePart)}</td>
              <td class="num">{formatChf(line.selbstbehaltPart)}</td>
              <td class="num">{formatChf(line.patientShare)}</td>
              <td class="num">{formatChf(line.insurerShare)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colspan={2}>Total {year}</td>
            <td class="num">{formatChf(totals.invoiced)}</td>
            <td class="num">{formatChf(totals.franchisePart)}</td>
            <td class="num">{formatChf(totals.selbstbehaltPart)}</td>
            <td class="num" data-testid="patient-total">
              {formatChf(totals.patientShare)}
            </td>
            <td class="num">{formatChf(totals.insurerShare)}</td>
          </tr>
        </tfoot>
      </table>
      <p>
        Franchise übrig: {formatChf(statement.franchiseLeft)}. Selbstbehalt-Spielraum bis zur
        Obergrenze: {formatChf(statement.capLeft)}.
      </p>
    </Layout>
  );
}
