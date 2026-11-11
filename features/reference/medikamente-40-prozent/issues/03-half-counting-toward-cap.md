# 03: Half of the extra 30 points counts toward the cap

**What to build:** A 40% invoice uses up only 25% of its base (10 + 15 points) of the yearly cap, while the patient still pays the full 40%. The statement shows per marked invoice how much counted toward the cap, and "Selbstbehalt-Spielraum" shrinks by the counted amount. If the cap runs out inside a 40% invoice, the patient pays in the same proportion (counted x 40 / 25). The seed person gets a large marked invoice that crosses the cap.

**Blocked by:** 01: Mark an invoice as a drug with 40% Selbstbehalt, 02: Medical reason exception

**Status:** ready-for-agent

- [ ] Worked example G in full: Franchise met, original drug CHF 100, no medical reason: patient pays CHF 40, counted toward the cap CHF 25; with a medical reason: patient pays CHF 10, counted CHF 10
- [ ] Cap left after a marked invoice is reduced by the counted amount, not by the amount paid
- [ ] Cap crossing inside one marked invoice: with CHF 665 of the cap left and a drug base of CHF 3,000, the patient pays CHF 1,064 and the cap left is 0
- [ ] After the cap is reached, a further marked invoice costs 0 Selbstbehalt
- [ ] Child cap CHF 350 works the same way
- [ ] The statement note on a 40% invoice shows the counted amount ("an die Obergrenze angerechnet")
- [ ] `docs/kvg-rules.md` rule 17 and example G are marked implemented, with the proportional reading at the cap noted
