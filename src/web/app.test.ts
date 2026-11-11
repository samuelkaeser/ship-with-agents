import { describe, expect, it } from 'vitest';
import { createStore } from '../store/store';
import { createApp } from './app';

// Hono escapes ' as &#39;, undo that so assertions can use plain CHF text.
const textOf = async (res: Response) => (await res.text()).replaceAll('&#39;', "'");

const freshApp = () => createApp(createStore());

const post = (app: ReturnType<typeof freshApp>, path: string, fields: Record<string, string>) =>
  app.request(path, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });

describe('GET /', () => {
  it('lists the insured persons', async () => {
    const res = await freshApp().request('/');
    const html = await textOf(res);
    expect(res.status).toBe(200);
    expect(html).toContain('Erika Beispiel');
    expect(html).toContain('Max Muster');
  });
});

describe('GET /persons/:id', () => {
  it('shows the statement for Erika: CHF 5,000 bill, she pays 770', async () => {
    const res = await freshApp().request('/persons/erika-beispiel?year=2026');
    const html = await textOf(res);
    expect(res.status).toBe(200);
    expect(html).toContain("CHF 5'000.00");
    expect(html).toContain('CHF 770.00');
    expect(html).toContain("CHF 4'230.00");
  });

  it('shows the capped Selbstbehalt for Max Muster: patient total CHF 1,000', async () => {
    const html = await textOf(await freshApp().request('/persons/max-muster?year=2026'));
    expect(html).toMatch(/data-testid="patient-total">\s*CHF 1'000\.00/);
  });

  it('splits Anna Stichtag by treatment date: 310 in 2026 and 310 in 2027', async () => {
    const app = freshApp();
    const y2026 = await textOf(await app.request('/persons/anna-stichtag?year=2026'));
    const y2027 = await textOf(await app.request('/persons/anna-stichtag?year=2027'));
    expect(y2026).toMatch(/data-testid="patient-total">\s*CHF 310\.00/);
    expect(y2027).toMatch(/data-testid="patient-total">\s*CHF 310\.00/);
  });

  it('answers 404 for an unknown person', async () => {
    expect((await freshApp().request('/persons/nobody')).status).toBe(404);
  });
});

describe('POST /persons/:id/invoices', () => {
  it('adds an invoice, redirects to the treatment year and shows the new numbers', async () => {
    const app = freshApp();
    const res = await post(app, '/persons/erika-beispiel/invoices', {
      treatmentDate: '2027-02-01',
      invoiceDate: '2027-02-10',
      amount: '1000.50',
      description: 'Kontrolle',
    });
    expect(res.status).toBe(303);
    const location = res.headers.get('location') ?? '';
    expect(location).toBe('/persons/erika-beispiel?year=2027');

    const html = await textOf(await app.request(location));
    expect(html).toContain('Kontrolle');
    expect(html).toMatch(/data-testid="patient-total">\s*CHF 370\.05/); // 300 + 10% of 700.50
  });

  it('rejects an invalid amount and stores nothing', async () => {
    const app = freshApp();
    const res = await post(app, '/persons/erika-beispiel/invoices', {
      treatmentDate: '2026-02-01',
      invoiceDate: '2026-02-10',
      amount: 'abc',
      description: 'Kontrolle',
    });
    expect(res.status).toBe(400);
    expect(await textOf(res)).toContain('Betrag muss grösser als 0 sein');
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2026'));
    expect(html).not.toContain('Kontrolle');
  });
});
