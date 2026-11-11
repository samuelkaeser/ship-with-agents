import { Hono } from 'hono';
import { parseChf } from '../domain/money';
import { compareFranchises } from '../domain/franchise-comparison';
import { computeStatement } from '../domain/statement';
import { yearOf } from '../domain/rules';
import type { InsuredPerson } from '../domain/types';
import type { Store } from '../store/store';
import { Layout, PersonList, PersonPage } from './views';

const DEFAULT_YEAR = 2026;

// Round trip catches impossible dates: 2026-02-30 becomes 2026-03-02, month 13 is invalid.
const isValidDate = (text: string) => {
  const date = new Date(`${text}T00:00:00Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(text) &&
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text
  );
};

const parseYear = (text = '') => (/^\d{4}$/.test(text) ? Number(text) : undefined);

export function createApp(store: Store) {
  const app = new Hono();

  app.notFound((c) =>
    c.html(
      <Layout title="Nicht gefunden">
        <h1>Nicht gefunden</h1>
        <a href="/">Zurück zur Liste</a>
      </Layout>,
      404,
    ),
  );

  app.get('/', (c) => c.html(<PersonList persons={store.listPersons()} />));

  app.get('/persons/:id', (c) => {
    const person = store.getPerson(c.req.param('id'));
    if (!person) return c.notFound();
    return c.html(renderPerson(person, parseYear(c.req.query('year'))));
  });

  app.post('/persons/:id/invoices', async (c) => {
    const person = store.getPerson(c.req.param('id'));
    if (!person) return c.notFound();

    const form = await c.req.parseBody();
    const text = (key: string) => String(form[key] ?? '').trim();
    const amount = parseChf(text('amount'));
    const errors: string[] = [];
    if (!isValidDate(text('treatmentDate'))) errors.push('Behandlungsdatum ist ungültig.');
    if (!isValidDate(text('invoiceDate'))) errors.push('Rechnungsdatum ist ungültig.');
    if (amount === undefined) errors.push('Betrag ungültig, z.B. 123.45');
    if (!text('description')) errors.push('Beschreibung fehlt.');

    if (errors.length > 0 || amount === undefined) {
      return c.html(renderPerson(person, undefined, errors), 400);
    }
    store.addInvoice({
      personId: person.id,
      treatmentDate: text('treatmentDate'),
      invoiceDate: text('invoiceDate'),
      amount,
      description: text('description'),
    });
    return c.redirect(`/persons/${person.id}?year=${yearOf(text('treatmentDate'))}`, 303);
  });

  function renderPerson(person: InsuredPerson, requestedYear?: number, errors: string[] = []) {
    const invoices = store.listInvoices(person.id);
    const invoiceYears = invoices
      .map((invoice) => yearOf(invoice.treatmentDate))
      .sort((a, b) => a - b);
    const year = requestedYear || (invoiceYears.at(-1) ?? DEFAULT_YEAR);
    const years = [...new Set([...invoiceYears, year])].sort((a, b) => a - b);
    return (
      <PersonPage
        person={person}
        invoices={invoices}
        statement={computeStatement(person, invoices, year)}
        comparison={compareFranchises(person, invoices, year)}
        years={years}
        errors={errors}
      />
    );
  }

  return app;
}
