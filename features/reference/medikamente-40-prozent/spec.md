# Medikamente mit 40% Selbstbehalt

## Problem Statement

For some drugs a cheaper alternative with the same active ingredient exists. If the insured person still takes the expensive original, the Selbstbehalt on that drug is 40% instead of 10% (KLV Art. 38a Abs. 1), unless there is a medical reason (KLV Art. 38a Abs. 7). The clerk cannot book such an invoice correctly today: the app always charges 10%. The insured person also cannot see why she pays more, and the cap (CHF 700 for adults, CHF 350 for children) would be used up too fast if the full 40% counted, because the law counts only part of the extra 30 points toward it (KVV Art. 104a Abs. 2).

## Solution

The clerk marks an invoice as "Medikament mit 40% Selbstbehalt" when she enters it. The app then charges 40% instead of 10% on the part of the invoice above the Franchise, and says so in the yearly statement. The clerk can additionally tick "Medizinischer Grund". Then the invoice is charged at the normal 10% and the statement says why. Only 25% of a 40% invoice counts toward the cap (10 points plus half of the 30 extra points), while the patient still pays the full 40%.

The app does not decide whether the 40% applies. It has no drug catalogue and no price comparison. The clerk decides, the app does the arithmetic.

## User Stories

1. As a clerk, I want to mark an invoice as a drug with 40% Selbstbehalt when I enter it, so that the patient share is booked correctly.
2. As a clerk, I want an unmarked invoice to behave exactly as before, so that nothing changes for ordinary treatments.
3. As an insured person, I want to see in my yearly statement which invoices were charged 40%, so that I understand why I pay more.
4. As a clerk, I want to tick "Medizinischer Grund" on a marked invoice, so that the patient pays the normal 10%.
5. As an insured person, I want the statement to say that the normal 10% applies because of a medical reason, so that I know the exception was applied.
6. As a clerk, I want the Franchise to be used up first on a marked invoice, so that the drug is not treated differently from other costs below the Franchise.
7. As an insured person, I want only 25% of a 40% invoice to count toward my cap, so that I am not capped earlier than the law says.
8. As an insured person, I want the statement to show how much of a 40% invoice counted toward the cap, so that I can follow the "Selbstbehalt-Spielraum" figure.
9. As an insured person, I want the cap to still hold when a 40% invoice crosses it, so that I never pay more than the cap allows.
10. As a parent of a child, I want the same rules to apply with the child's cap of CHF 350, so that children are not treated differently by accident.
11. As a clerk, I want the seed data to contain a patient with 40% invoices, so that I can see the feature in the running app.
12. As a clerk, I want a medical-reason tick without the 40% marker to change nothing, so that a wrong tick cannot change an ordinary invoice.

## Implementation Decisions

Decisions a grill would have reached. Every open question from the card and the rule sheet is answered here, simply.

- **Who decides that the 40% applies?** The clerk. The invoice carries a yes/no marker "differentiated drug". The app has no drug catalogue, no list of active ingredients and no price comparison (KLV Art. 38a Abs. 1 and 2 are applied by the clerk outside the app). Teaching simplification.
- **Whole invoice or part of it?** The whole invoice. An invoice has one amount and no line items, so the marker applies to the entire amount above the Franchise. A mixed invoice (drug plus consultation) is entered as two invoices.
- **Franchise.** Unchanged and first: the Franchise is used up before any Selbstbehalt, also on a marked invoice (KVG Art. 64 Abs. 2 lit. a). Only the part above the Franchise is charged at 40%.
- **Medical reason.** A second yes/no marker "medical reason" on the invoice (KLV Art. 38a Abs. 7). The app does not record who stated it (doctor or pharmacist), and has no free text. If it is set on a marked invoice, the invoice is charged 10% and 10% counts toward the cap, exactly like an ordinary invoice. If it is set on an unmarked invoice, it has no effect.
- **Effective rate.** An invoice is charged 40% if it is a differentiated drug and has no medical reason, otherwise 10%. This is one pure function in the domain, next to the existing Selbstbehalt percentage constant.
- **Cap counting.** At 40%, 30 points are above the legal 10%. Half of them (15 points) count toward the cap, so 25% of the base counts (KVV Art. 104a Abs. 2). The patient pays the full 40%. At 10% the counted amount equals the amount paid, as today.
- **Cap reached inside one invoice.** The counted amount is limited by the cap that is left. If it is limited, the patient pays in the same proportion (counted x 40 / 25, rounded half up). Example: 665 counted of 750 possible means the patient pays 1,064 instead of 1,200. The law has no rule for this, we chose the proportional reading. For 10% invoices this gives today's result.
- **Rounding.** Per invoice, half up to the whole Rappen, as today. The amount paid (40% of the base) and the counted amount (25% of the base) are each rounded on their own.
- **Statement data.** Each statement line gets one new figure, the amount counted toward the cap (`capCounted`). "Selbstbehalt-Spielraum" (cap left) is reduced by the counted amount, not by the amount paid. The yearly totals do not change shape.
- **Explaining to the insured person.** In the yearly statement, a marked invoice shows a short note under the description: "Medikament mit 40% Selbstbehalt", or "Medikament, Selbstbehalt 10% (medizinischer Grund)", plus, for 40%, the amount counted toward the cap. The invoice list shows the same marker.
- **Entering it.** The existing "Neue Rechnung erfassen" form gets two checkboxes. Existing invoices are unmarked. There is no editing of invoices (none exists today).
- **Children.** Same rule, same percentages, cap CHF 350. No special case.
- **Seed data.** One new person with a Franchise of 300 who has an ordinary invoice that uses up the Franchise, a marked drug invoice, a marked invoice with medical reason, and a large marked invoice that crosses the cap. Existing persons and their numbers stay as they are.
- **Modules touched.** The `Invoice` type (two optional booleans), the rules module (effective rate and counted percentage), the yearly statement function, the in-memory store (accepts the two fields), the invoice form handler and the two views. No new modules.

## Testing Decisions

- A good test checks behavior through the public seam and takes its expected numbers from the rule sheet or from hand calculation, not from the code under test.
- One seam for the rules: `computeStatement`. Worked example G of `docs/kvg-rules.md` is reproduced in full: Franchise met, original drug CHF 100, no medical reason: patient pays 40, counted 25; with a medical reason: patient pays 10, counted 10.
- One seam for the pages: the Hono app through `app.request(...)`, as in the existing web tests. It covers the form (checkboxes), the marker in the page and the seed person.
- Extra rule cases: Franchise first (a marked invoice smaller than the Franchise costs 0 Selbstbehalt), cap crossing inside one invoice, medical reason without marker, child cap, rounding of the 25%.
- Prior art: the existing describe blocks per worked example in the statement tests, and the POST/GET tests in the web tests.

## Out of Scope

- A drug catalogue, active ingredients, factory prices, the "10% above the cheapest third" comparison (KLV Art. 38a Abs. 1) and the list of drug types (Abs. 2).
- Line items on invoices, or splitting one invoice into drug and non-drug parts.
- Recording who confirmed the medical reason, free text, or any proof.
- Editing or deleting invoices.
- Any other feature card (Spitalbeitrag, Mutterschaft, Franchisen-Vergleich).

## Further Notes

- The rule sheet says "15 points count toward the CHF 700 cap: 10 + 15 = 25%". This spec follows it literally. It is a teaching reading of KVV Art. 104a Abs. 2, not legal advice.
- The proportional payment at the cap is our choice, noted in `docs/kvg-rules.md`.
