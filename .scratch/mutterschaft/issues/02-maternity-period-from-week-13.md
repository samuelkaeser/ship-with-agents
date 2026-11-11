# 02: Free of charge from the 13th week of pregnancy

**What to build:** On a person's page the clerk can record the start of week 13 (as stated by the doctor). From that date on, every invoice with a treatment date on or after it has a patient share of CHF 0, even a flu visit unrelated to the pregnancy. Invoices before that date are charged normally. The person page shows the recorded start, and the statement shows a note "Mutterschaft" on the free invoices. Recording the start again replaces the old one. Sara Storch gets a recorded start and a flu visit in week 14 (free) next to her flu visit in week 10 (charged).

**Blocked by:** 01: Mark an invoice as maternity service

**Status:** done

- [x] Worked example F without the hospital days: week 14, CHF 300 check-up and CHF 200 flu visit all cost 0; the same CHF 200 flu visit in week 10 is charged normally
- [x] The first day of week 13 is exempt, the day before is charged
- [x] When both the flag and the period apply, the note names the flag
- [x] The page has a form for the start of week 13; a valid date is stored on the person, the page is shown again for that year and a second submit replaces the first
- [x] An impossible date is rejected with a German message and nothing is stored
- [x] The person page shows the recorded start
- [x] Glossary term "Maternity period" added, rule 22 marked implemented
- [x] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass

## Comments
