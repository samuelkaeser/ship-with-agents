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
    expect(await textOf(res)).toContain('Betrag ungültig, z.B. 123.45');
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2026'));
    expect(html).not.toContain('Kontrolle');
  });

  it.each(['99999999999999999', '90071992547409', '10000000.01'])(
    'rejects the huge amount %s with a 400 and the person page still renders',
    async (amount) => {
      const app = freshApp();
      const res = await post(app, '/persons/erika-beispiel/invoices', {
        treatmentDate: '2026-02-01',
        invoiceDate: '2026-02-10',
        amount,
        description: 'Gross',
      });
      expect(res.status).toBe(400);
      expect(await textOf(res)).toContain('Betrag ungültig, z.B. 123.45');
      const page = await app.request('/persons/erika-beispiel?year=2026');
      expect(page.status).toBe(200);
      expect(await textOf(page)).not.toContain('Gross');
    },
  );

  it('accepts a comma as decimal separator: 12,50', async () => {
    const app = freshApp();
    const res = await post(app, '/persons/erika-beispiel/invoices', {
      treatmentDate: '2027-02-01',
      invoiceDate: '2027-02-10',
      amount: '12,50',
      description: 'Komma',
    });
    expect(res.status).toBe(303);
    expect(await textOf(await app.request('/persons/erika-beispiel?year=2027'))).toContain(
      'CHF 12.50',
    );
  });

  it.each(['2026-02-30', '2026-13-01', '2026-2-1', '2026-02-10x'])(
    'rejects the impossible or malformed date %s',
    async (date) => {
      const res = await post(freshApp(), '/persons/erika-beispiel/invoices', {
        treatmentDate: date,
        invoiceDate: '2026-02-10',
        amount: '10',
        description: 'Datum',
      });
      expect(res.status).toBe(400);
      expect(await textOf(res)).toContain('Behandlungsdatum ist ungültig');
    },
  );

  it('escapes HTML in the description', async () => {
    const app = freshApp();
    await post(app, '/persons/erika-beispiel/invoices', {
      treatmentDate: '2027-02-01',
      invoiceDate: '2027-02-10',
      amount: '10',
      description: '<script>alert(1)</script>',
    });
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2027'));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('maternity service', () => {
  it('shows Sara Storch: the flagged check-up is free, the flu visit costs CHF 200', async () => {
    const html = await textOf(await freshApp().request('/persons/sara-storch?year=2026'));
    expect(html).toContain('Mutterschaftsleistung');
    expect(html).toMatch(/data-testid="patient-total">\s*CHF 200\.00/);
  });

  it('saves the checkbox as a flag: a ticked CHF 300 invoice adds nothing to the patient total', async () => {
    const app = freshApp();
    await post(app, '/persons/erika-beispiel/invoices', {
      treatmentDate: '2027-02-01',
      invoiceDate: '2027-02-10',
      amount: '300',
      description: 'Schwangerschaftskontrolle',
      maternityService: 'on',
    });
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2027'));
    expect(html).toMatch(/data-testid="patient-total">\s*CHF 0\.00/);
  });
});

describe('POST /persons/:id/maternity', () => {
  const sendInvoice = (app: ReturnType<typeof freshApp>) =>
    post(app, '/persons/erika-beispiel/invoices', {
      treatmentDate: '2027-03-10',
      invoiceDate: '2027-03-15',
      amount: '200',
      description: 'Grippe',
    });

  it('shows the recorded start on Sara Storch, her flu visit in week 14 is free', async () => {
    const html = await textOf(await freshApp().request('/persons/sara-storch?year=2026'));
    expect(html).toContain('Schwangerschaft: 13. Woche ab 2026-06-01');
    expect(html).toContain('Mutterschaft, keine Kostenbeteiligung');
  });

  it('stores the start: invoices from that day on are free, then the page shows it', async () => {
    const app = freshApp();
    await sendInvoice(app);
    const res = await post(app, '/persons/erika-beispiel/maternity', { week13Start: '2027-03-01' });
    expect(res.status).toBe(303);
    expect(res.headers.get('location')).toBe('/persons/erika-beispiel?year=2027');
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2027'));
    expect(html).toContain('13. Woche ab 2027-03-01');
    expect(html).toMatch(/data-testid="patient-total">\s*CHF 0\.00/);
  });

  it('a second submit replaces the first', async () => {
    const app = freshApp();
    await sendInvoice(app);
    await post(app, '/persons/erika-beispiel/maternity', { week13Start: '2027-03-01' });
    await post(app, '/persons/erika-beispiel/maternity', { week13Start: '2027-03-20' });
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2027'));
    expect(html).toContain('13. Woche ab 2027-03-20');
    expect(html).toMatch(/data-testid="patient-total">\s*CHF 200\.00/);
  });

  it('rejects an impossible date with a message and stores nothing', async () => {
    const app = freshApp();
    const res = await post(app, '/persons/erika-beispiel/maternity', { week13Start: '2027-02-30' });
    expect(res.status).toBe(400);
    expect(await textOf(res)).toContain('Beginn der 13. Woche ist ungültig.');
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2026'));
    expect(html).not.toContain('13. Woche ab');
  });

  it('answers 404 for an unknown person', async () => {
    const res = await post(freshApp(), '/persons/nobody/maternity', { week13Start: '2027-03-01' });
    expect(res.status).toBe(404);
  });
});

describe('GET /persons/:id?year=', () => {
  it.each(['abc', '-5', '2026.5', '20266'])('renders without a 500 for year=%s', async (year) => {
    const res = await freshApp().request(`/persons/erika-beispiel?year=${year}`);
    expect(res.status).toBe(200);
    expect(await textOf(res)).toContain('Erika Beispiel');
  });
});
