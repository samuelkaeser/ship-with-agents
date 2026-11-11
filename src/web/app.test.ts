import { describe, expect, it } from 'vitest';
import { rappen } from '../domain/money';
import { seedInvoices, seedPersons } from '../store/seed';
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

describe('GET /persons/:id?year=', () => {
  it.each(['abc', '-5', '2026.5', '20266'])('renders without a 500 for year=%s', async (year) => {
    const res = await freshApp().request(`/persons/erika-beispiel?year=${year}`);
    expect(res.status).toBe(200);
    expect(await textOf(res)).toContain('Erika Beispiel');
  });
});

describe('Franchisen-Vergleich on the person page', () => {
  const cheapest = (year: number, franchise: number) =>
    new RegExp(
      `data-testid="cheapest-franchise">\\s*Günstigste Franchise ${year}: CHF ${franchise}\\.00`,
    );

  it('names the cheapest Franchise for Erika 2026: 500, CHF 5,690 in total', async () => {
    const html = await textOf(await freshApp().request('/persons/erika-beispiel?year=2026'));
    expect(html).toMatch(cheapest(2026, 500));
    expect(html).toContain("CHF 5'690.00");
  });

  it('names the cheapest Franchise for Max Muster 2026 (cap reached): 500, CHF 5,940', async () => {
    const html = await textOf(await freshApp().request('/persons/max-muster?year=2026'));
    expect(html).toMatch(cheapest(2026, 500));
    expect(html).toContain("CHF 5'940.00");
  });

  it('shows all four levels for Erika 2026, only the cheapest one marked', async () => {
    const html = await textOf(await freshApp().request('/persons/erika-beispiel?year=2026'));
    expect(html).toContain('Franchisen-Vergleich 2026');
    for (const total of ["5'810.00", "5'690.00", "5'870.00", "6'350.00"]) {
      expect(html).toContain(`CHF ${total}`);
    }
    expect(html).toMatch(/CHF 500\.00 \(günstigste\)/);
    expect(html.match(/\(günstigste\)/g)).toHaveLength(1);
  });

  it('shows the comparison for the selected year: Peter has no invoices in 2027, 2500 wins', async () => {
    const html = await textOf(await freshApp().request('/persons/peter-sparfuchs?year=2027'));
    expect(html).toContain('Franchisen-Vergleich 2027');
    expect(html).toMatch(/CHF 2'500\.00 \(günstigste\)/);
    expect(html).toContain("CHF 3'600.00");
  });

  it('shows the difference to the current Franchise 300 for Erika 2026', async () => {
    const html = await textOf(await freshApp().request('/persons/erika-beispiel?year=2026'));
    expect(html).toContain('CHF 120.00 günstiger');
    expect(html).toContain('CHF 60.00 teurer');
    expect(html).toContain('CHF 540.00 teurer');
    expect(html).toContain('aktuell');
    expect(html).toMatch(
      /data-testid="franchise-saving">\s*Mit einer Franchise von CHF 500\.00 hätte Erika Beispiel 2026 CHF 120\.00 gespart\./,
    );
  });

  it('says what Peter Sparfuchs (current 2500) would have saved with 500 in 2026: CHF 660', async () => {
    const html = await textOf(await freshApp().request('/persons/peter-sparfuchs?year=2026'));
    expect(html).toContain(
      'Mit einer Franchise von CHF 500.00 hätte Peter Sparfuchs 2026 CHF 660.00 gespart.',
    );
  });

  it('says so when the current Franchise already is the cheapest', async () => {
    const erika = { ...seedPersons[0]!, franchise: 500 as const };
    const app = createApp(createStore([erika], seedInvoices));
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2026'));
    expect(html).toContain('Die aktuelle Franchise ist bereits die günstigste.');
    expect(html).not.toContain('gespart');
  });

  it('says no saving when the current Franchise 2500 ties with the cheapest 500', async () => {
    const tied = { ...seedPersons[0]!, franchise: 2500 as const };
    const bill = { ...seedInvoices[0]!, amount: rappen(176667) };
    const app = createApp(createStore([tied], [bill]));
    const html = await textOf(await app.request('/persons/erika-beispiel?year=2026'));
    expect(html).toContain('Die aktuelle Franchise ist bereits die günstigste.');
    expect(html).not.toContain('gespart');
  });

  it('explains for the child Kim Klein why there is no comparison', async () => {
    const html = await textOf(await freshApp().request('/persons/kim-klein?year=2026'));
    expect(html).toContain('Kinder haben keine Franchise-Wahl, darum gibt es keinen Vergleich.');
  });

  it('Kim Klein in 2038 is an adult without adult Franchise: table and cheapest marked, no comparison with the current one', async () => {
    const kim = seedPersons.find((p) => p.id === 'kim-klein')!;
    const app = createApp(createStore([kim], []));
    const html = await textOf(await app.request('/persons/kim-klein?year=2038'));
    expect(html).toContain('Franchisen-Vergleich 2038');
    expect(html).toMatch(/CHF 2'500\.00 \(günstigste\)/);
    expect(html).toContain(
      'Ein Vergleich mit der aktuellen Franchise ist nicht möglich, weil Kim Klein keine Franchise für Erwachsene hinterlegt hat.',
    );
    expect(html).not.toContain('Die aktuelle Franchise ist bereits die günstigste.');
    expect(html).not.toContain('gleich teuer');
    expect(html).not.toContain('aktuell</td>');
    expect(html).not.toContain('gespart');
  });

  it('says only premiums were compared in a year without invoices (Erika 2025)', async () => {
    const html = await textOf(await freshApp().request('/persons/erika-beispiel?year=2025'));
    expect(html).toContain('Keine Rechnungen in 2025: verglichen werden nur die Prämien.');
    expect(html).toMatch(/CHF 2'500\.00 \(günstigste\)/);
  });

  it('shows the footnote on fictional premiums and 1 January, and no empty-year note, for Erika 2026', async () => {
    const html = await textOf(await freshApp().request('/persons/erika-beispiel?year=2026'));
    expect(html).toContain(
      'Die Prämien sind fiktiv. Eine höhere Franchise gilt erst ab dem 1. Januar.',
    );
    expect(html).not.toContain('Keine Rechnungen in');
  });

  it('decides child or adult per selected year: born 2008 is a child in 2026, compared in 2027', async () => {
    const teen = { ...seedPersons[0]!, dateOfBirth: '2008-06-01' };
    const app = createApp(createStore([teen], []));
    const y2026 = await textOf(await app.request('/persons/erika-beispiel?year=2026'));
    const y2027 = await textOf(await app.request('/persons/erika-beispiel?year=2027'));
    expect(y2026).toContain('Kinder haben keine Franchise-Wahl');
    expect(y2027).toContain('Franchisen-Vergleich 2027');
  });

  it('shows no comparison for the child Kim Klein', async () => {
    const res = await freshApp().request('/persons/kim-klein?year=2026');
    expect(res.status).toBe(200);
    const html = await textOf(res);
    expect(html).not.toContain('Günstigste Franchise');
    expect(html).not.toContain('Franchisen-Vergleich');
  });
});
