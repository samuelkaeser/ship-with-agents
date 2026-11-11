# 01: Mark an invoice as a drug with 40% Selbstbehalt

**What to build:** The clerk can tick "Medikament mit 40% Selbstbehalt" when entering an invoice. The yearly statement then charges 40% instead of 10% Selbstbehalt on the part above the Franchise, and the statement and the invoice list show that the invoice is a marked drug. Unmarked invoices behave as before. At this stage the full amount paid still counts toward the cap (the half-counting comes in ticket 03). A seed person shows the feature in the running app.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Worked example G, first half: Franchise already met, original drug CHF 100, marked, no exception: Selbstbehalt CHF 40, patient pays CHF 40, insurer CHF 60
- [x] A marked invoice below the Franchise costs 0 Selbstbehalt (Franchise first)
- [x] Unmarked invoices give the same numbers as before (existing tests stay green)
- [x] The "Neue Rechnung erfassen" form has the checkbox, and a posted marked invoice shows up marked in the invoice list and the statement with a note "Medikament mit 40% Selbstbehalt"
- [x] A seed person with an ordinary invoice that uses up the Franchise and a marked drug invoice is visible in the person list and on the person page
- [x] `GLOSSARY.md` has the new term, `docs/kvg-rules.md` rule 15 is marked partly implemented (marker instead of price comparison)
