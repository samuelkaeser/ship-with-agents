# 04: Say something sensible for children, empty years and timing

**What to build:** Where the comparison is missing or limited, the page explains it. For a child (Kim Klein): "Kinder haben keine Franchise-Wahl, darum gibt es keinen Vergleich." For a year without invoices: "Keine Rechnungen in <Jahr>: verglichen werden nur die Prämien." Under every comparison: "Die Prämien sind fiktiv. Eine höhere Franchise gilt erst ab dem 1. Januar." The KVG rules doc marks the section implemented (rule 5 reference and the children decision).

**Blocked by:** 03: Difference to the current Franchise

**Status:** done

- [x] Kim Klein, 2026: the children sentence is shown, no table and no cheapest sentence
- [x] Erika Beispiel, a year without invoices (for example 2025 via the year parameter): the table still shows, the note names the year, Franchise 2500 is marked cheapest
- [x] Erika Beispiel, 2026: the note about missing invoices is not shown, the footnote about fictional premiums and 1 January is shown
- [x] Child or adult follows the selected year: a hand-made person born in 2008 gets the children sentence for 2026 and a table for 2027
- [x] `pnpm test`, `pnpm typecheck` and `pnpm exec prettier --check .` pass
