# 02: Medical reason exception

**What to build:** The clerk can additionally tick "Medizinischer Grund" on a marked invoice. Such an invoice is charged the normal 10%, and the statement note tells the insured person that the normal Selbstbehalt applies because of a medical reason. A medical reason on an unmarked invoice changes nothing. The seed person gets an invoice that shows it.

**Blocked by:** 01: Mark an invoice as a drug with 40% Selbstbehalt

**Status:** done

- [x] Worked example G, second half: Franchise already met, original drug CHF 100, marked, with medical reason: patient pays CHF 10
- [x] A medical reason without the 40% marker gives the ordinary 10% result and no drug note
- [x] The form has the second checkbox, and the posted values are stored on the invoice
- [x] The statement note for a marked invoice with medical reason reads "Medikament, Selbstbehalt 10% (medizinischer Grund)"
- [x] The seed person has a marked invoice with medical reason
- [x] `docs/kvg-rules.md` rule 16 is marked implemented, `GLOSSARY.md` has the term for the exception

**Notes:** the app does not record who stated the reason and has no free text (see spec).
