# 03: Difference to the current Franchise

**What to build:** The table gets a column "Differenz zur aktuellen Franchise": per level the yearly cost minus the yearly cost of the person's current Franchise, written in words as "CHF 120.00 günstiger" or "CHF 60.00 teurer", and "aktuell" on the current row. Above the table, the sentence says what a switch would have saved ("Mit Franchise 500 hätte Erika Beispiel 2026 CHF 120.00 gespart.") or that the current Franchise already is the cheapest. The KVG rules doc marks the difference implemented.

**Blocked by:** 02: Comparison table

**Status:** ready-for-agent

- [ ] Erika Beispiel (current 300), 2026: 500 shows "CHF 120.00 günstiger", 1500 shows "CHF 60.00 teurer", 2500 shows "CHF 540.00 teurer", the 300 row shows "aktuell", the sentence says she would have saved CHF 120.00 with 500
- [ ] Peter Sparfuchs (current 2500), 2026: the sentence names 500 and the saving matches the table (hand check: 6,130 minus 5,470 = 660)
- [ ] A person whose current Franchise already is the cheapest (a hand-made person with Franchise 500 and the CHF 5,000 invoice) gets the sentence "Die aktuelle Franchise ist bereits die günstigste." and no saving amount
- [ ] The current row's difference is zero and is never worded as a saving
- [ ] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass
