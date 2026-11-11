# 03: The period ends 8 weeks after birth

**What to build:** The same form takes an optional birth date. With a birth date, the period ends on day 56 after birth (birth date plus 56 days, inclusive): invoices up to and including that day are free, the next day they are charged normally again. The period also works across 31 December, each year's statement applies it to its own invoices. A birth date before the start of week 13, or an impossible one, is rejected with a German message. The person page shows start and end. Sara Storch's seed data gets a December birth and invoices on both sides of the end of the period in February 2027.

**Blocked by:** 02: Free of charge from the 13th week of pregnancy

**Status:** ready-for-agent

- [ ] Day 56 after birth is exempt, day 57 is charged
- [ ] The birth date itself is exempt
- [ ] Without a birth date the period has no end
- [ ] Birth on 2026-12-10: an invoice on 2027-01-20 is free in the 2027 statement, an invoice on 2027-02-05 is charged
- [ ] A birth date before the start of week 13 is rejected with a German message and nothing is stored
- [ ] The person page shows the recorded end
- [ ] Rule 23 and worked example F marked implemented in the rule sheet (hospital days stay with the feature Spitalbeitrag), the glossary definition covers the end of the period
- [ ] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass

## Comments
