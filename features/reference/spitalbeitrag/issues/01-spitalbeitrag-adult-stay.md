# 01: Spitalbeitrag for an adult's hospital stay

**What to build:** The Sachbearbeiterin can enter a discharge date on an invoice. The Yearly statement then shows the billed days (admission day up to, not including, the discharge day) and the Spitalbeitrag of CHF 15 per day for an adult. The Spitalbeitrag is added to the Patient share and the yearly total, and taken off the insurer share. It does not use Franchise or cap room, and never exceeds what is left of the invoice after Franchise and Selbstbehalt. An invalid discharge date, or one that is not after the treatment date, shows a German error and stores nothing. Invoices without a discharge date behave as before. Seed data has an adult with an earlier CHF 300 invoice and a Monday to Saturday stay, so the app shows worked example D (patient pays 675). The glossary gets the term Spitalbeitrag, and the rule sheet marks the rules and example D as implemented.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Worked example D: Franchise already used, stay Monday to Saturday, insurer share CHF 6,000: Selbstbehalt 600, Spitalbeitrag 75, patient pays 675
- [ ] Discharge day is not billed, a stay of one night bills 1 day
- [ ] Spitalbeitrag is on top of the capped Selbstbehalt: a person at the cap still pays 15 per day
- [ ] Spitalbeitrag never exceeds the rest of the invoice, insurer share is never negative
- [ ] Statement shows billed days and Spitalbeitrag per invoice and in the totals
- [ ] Form takes an optional discharge date, invalid or not later than the treatment date gives a German error and stores nothing
- [ ] Invoices without a discharge date give the same numbers as before
- [ ] Seed adult with a stay is visible in the running app, glossary and rule sheet updated
