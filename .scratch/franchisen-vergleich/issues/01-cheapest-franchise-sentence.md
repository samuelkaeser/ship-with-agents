# 01: Cheapest Franchise as one sentence

**What to build:** On an adult's person page, the advisor sees one sentence for the selected year, e.g. "Günstigste Franchise 2026: CHF 500.00 (Prämie und Kostenbeteiligung zusammen CHF 5'690.00)". The yearly cost of a level is 12 fictional monthly premiums plus the Kostenbeteiligung from the existing yearly statement computed with that level. The premium table sits in the domain as constants (fictional, say so in a comment). Ties go to the lower Franchise. For a child nothing is shown yet. Glossary gets Monthly premium and Yearly cost, and the KVG rules doc gets the comparison rule and one worked example marked implemented.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Erika Beispiel, 2026 (one CHF 5,000 invoice): the page names Franchise 500 with yearly cost CHF 5'690.00 (hand check: 4,740 + 950)
- [x] Max Muster, 2026 (cap reached on every level): the page names a Franchise and a yearly cost that matches premium plus the Kostenbeteiligung of the statement for that level
- [x] A single CHF 1,766.67 invoice makes 500 and 2500 equal in yearly cost (5,366.67), the result is 500 (domain test names the tie)
- [x] A year without invoices: the result is 2500 with yearly cost CHF 3'600.00 (premium only)
- [x] A child (Kim Klein): no comparison sentence and no error
- [x] The Kostenbeteiligung comes from the existing yearly statement function, not from a second implementation of Franchise and Selbstbehalt
- [x] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass
