# 02: All four Franchise levels side by side

**What to build:** Below the sentence from ticket 01, the advisor sees a table with one row per Franchise level (300, 500, 1500, 2500) and the columns Franchise, Prämie (12 Monate), Kostenbeteiligung and Jahreskosten. The cheapest row is marked with the word "günstigste". The comparison follows the selected year. The table is not shown for a child. Glossary gets Franchise comparison, the KVG rules doc marks the table implemented.

**Blocked by:** 01: Cheapest Franchise as one sentence

**Status:** ready-for-agent

- [ ] Erika Beispiel, 2026: four rows with Jahreskosten CHF 5'810.00, 5'690.00, 5'870.00 and 6'350.00 in ascending Franchise order
- [ ] The 500 row carries the mark "günstigste", no other row does
- [ ] Each row's Prämie is 12 times its monthly premium, and its Kostenbeteiligung equals the patient total of the yearly statement for that level
- [ ] Switching the year on the person page (Anna Stichtag, 2026 and 2027) shows the comparison for that year
- [ ] Child: no table
- [ ] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass
