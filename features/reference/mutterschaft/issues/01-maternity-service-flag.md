# 01: Mark an invoice as maternity service

**What to build:** When a clerk records an invoice, she can tick "Mutterschaftsleistung". The patient share of that invoice is CHF 0 and the insurer pays everything. The invoice does not use up any Franchise or Selbstbehalt cap, so later invoices of the same year are charged as if it did not exist. The yearly statement shows a short note next to the invoice saying why it is free. A seed person (Sara Storch) shows this in the running app: a flagged CHF 300 check-up next to a normal CHF 200 flu visit.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A flagged invoice has Franchise part 0, Selbstbehalt part 0, patient share 0 and insurer share equal to the amount
- [ ] A flagged invoice processed first leaves the full Franchise and cap for later invoices (flagged CHF 300, then a normal CHF 5,000 gives the same 770 as worked example A)
- [ ] The new-invoice form has a checkbox and the saved invoice carries the flag
- [ ] The statement note "Mutterschaftsleistung" appears on the flagged line
- [ ] Seed person Sara Storch with the flagged check-up and a charged flu visit appears in the person list and her page shows the numbers
- [ ] The glossary has the term, and rule 21 in the rule sheet is marked implemented
- [ ] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass

## Comments
