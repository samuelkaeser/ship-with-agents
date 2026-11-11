# Spitalbeitrag: spec

## Problem Statement

When an insured person stays in hospital, the insured person owes CHF 15 per day of stay on top of Franchise and Selbstbehalt (KVV Art. 104). The app ignores this. The Sachbearbeiterin cannot record that an invoice is a hospital stay, so the Yearly statement of every hospital case is too low: the Patient share is missing the Spitalbeitrag. She also cannot see how many days were billed.

## Solution

An invoice can be marked as a hospital stay by entering a discharge date. The Yearly statement then shows, for that invoice, the number of billed days and the Spitalbeitrag (CHF 15 per day). The Spitalbeitrag is added to the Patient share and taken off the insurer share. Children and young adults in education up to 25 pay no Spitalbeitrag. Leave days entered on the invoice are not billed.

## User Stories

1. As a Sachbearbeiterin, I want to enter a discharge date on an invoice, so that the app knows the invoice is a hospital stay.
2. As a Sachbearbeiterin, I want the statement to show the billed hospital days per invoice, so that I can check the count against the hospital's invoice.
3. As a Sachbearbeiterin, I want the statement to show the Spitalbeitrag per invoice, so that I can see what the patient pays extra for the stay.
4. As an insured adult, I want the Spitalbeitrag added to my Patient share, so that the statement matches what I am really asked to pay.
5. As an insured adult, I want the discharge day not to be billed, so that I pay for the nights I was there only (KVV Art. 104 Abs. 1bis).
6. As a Sachbearbeiterin, I want the Spitalbeitrag in the yearly totals, so that the total Patient share is right.
7. As a Sachbearbeiterin, I want the insurer share of the invoice reduced by the Spitalbeitrag, so that patient plus insurer still add up to the invoice amount.
8. As an insured adult, I want the Spitalbeitrag not to count toward the Selbstbehalt cap and not to use up my Franchise, so that my cost sharing is computed as the law says.
9. As a Sachbearbeiterin, I want a clear German error when the discharge date is invalid or not after the treatment date, so that I do not store a broken stay.
10. As a parent of a Child, I want no Spitalbeitrag on my child's stay, so that the statement follows KVV Art. 104 Abs. 2.
11. As a young adult in education (up to 25), I want no Spitalbeitrag, so that the statement follows KVV Art. 104 Abs. 2.
12. As a Sachbearbeiterin, I want the person page to say why no Spitalbeitrag is charged, so that I do not think the discharge date was lost.
13. As a Sachbearbeiterin, I want to enter the number of leave days of a stay, so that leave days are not billed (KVV Art. 104 Abs. 1bis).
14. As a Sachbearbeiterin, I want a leave-day count that exceeds the stay to bill 0 days instead of a negative amount, so that a typo cannot create a refund.
15. As a Sachbearbeiterin, I want invoices without a discharge date to behave exactly as before, so that nothing changes for outpatient cases.
16. As a team member, I want seed persons with a hospital stay, an exempt child and an exempt student, so that I can see the feature in the running app.

## Implementation Decisions

Decisions a grill reached, simplest reading that honours `docs/kvg-rules.md`:

1. **A stay is an invoice with an optional discharge date.** The Treatment date is the day of admission. There is no separate admission field and no separate stay record. An invoice without a discharge date is outpatient and has no Spitalbeitrag.
2. **Billed days** = number of days from the Treatment date up to, but not including, the discharge date, minus leave days, never below 0. Admission Monday, discharge Saturday gives 5 days (worked example D).
3. **Leave days** are a whole number on the invoice, default 0. The app does not know which days they were, it only subtracts the count. Larger than the stay means 0 billed days.
4. **Rate**: CHF 15 per billed day, no limit on the number of days (KVV Art. 104 Abs. 1). No rounding is involved.
5. **The Spitalbeitrag is on top of Franchise and Selbstbehalt.** Franchise and Selbstbehalt are computed on the invoice amount exactly as today. The Spitalbeitrag does not use up Franchise, is not subject to the cap and does not use up cap room.
6. **Patient share and insurer share**: Patient share = Franchise part + Selbstbehalt part + Spitalbeitrag. Insurer share = amount - Patient share. The Spitalbeitrag is limited to what is left of the invoice after Franchise part and Selbstbehalt part, so the insurer share is never negative.
7. **Canton share is not modelled.** For a stay, the invoice amount the clerk enters is the insurer's share of the stay (the cantonal share of at least 55% is already taken off). The Selbstbehalt runs on that amount like on any invoice. The app does not split an invoice into cantonal and insurer share. This is the unverified reading from the rule sheet, accepted as a teaching simplification.
8. **Year**: the whole stay belongs to the calendar year of the Treatment date. A stay over New Year is not split by day. Teaching simplification.
9. **Exemption by person**: no Spitalbeitrag if the person is a Child in the treatment year, or is a young adult in education and not older than 25 in the treatment year. Age uses the year-difference rule already used for Child (year minus birth year). Rule 20 of the rule sheet.
10. **"In education" is a flag on the insured person**, set in seed data only. There is no screen to edit it. Default is not in education.
11. **Maternity exemption** (women whose cost sharing is waived for maternity) belongs to the Mutterschaft feature and is not built here. The app has no sex or pregnancy data.
12. **Validation on the invoice form**: the discharge date is optional. If given it must be a valid date and later than the Treatment date. Leave days is optional, if given it must be a whole number, 0 or more. Errors are German, shown the same way as the existing ones.
13. **Display**: the statement table gets two columns, billed days and Spitalbeitrag, and the totals row gets the Spitalbeitrag. The invoice form gets two optional fields (Austrittsdatum, Urlaubstage). The person page says "Kein Spitalbeitrag" with the reason when the person is exempt in the shown year.
14. **Vocabulary**: add Spitalbeitrag to the glossary, and widen Patient share to include it.

## Testing Decisions

- A good test checks behaviour at a seam: given a person, invoices and a year, what is the statement; given a request, what does the page show. No test looks at internals.
- Seams: the yearly statement function (all rule cases, worked example D, exemptions, leave days, limit by invoice amount) and the Hono app via `app.request` (form validation and what the page shows). Both exist already, no new seam.
- Prior art: the worked-example `describe` blocks in the statement tests, and the POST and GET tests in the app tests.
- Each test names its case. Expected values are literals from the rule sheet or hand-computed, never recomputed with the same formula.

## Out of Scope

- Maternity exemption (Mutterschaft feature).
- Splitting an invoice into cantonal and insurer share.
- Splitting a stay at New Year.
- Which days were leave days, hospital transfers, partial-day rules.
- Editing a person (education flag) in the UI.
- Editing or deleting stored invoices.

## Further Notes

- Worked example D in `docs/kvg-rules.md` is the main acceptance case: Franchise used up, cap room 700, Monday to Saturday stay with insurer share CHF 6,000. Selbstbehalt 600, Spitalbeitrag 75, patient pays 675.
- The rule sheet marks the Selbstbehalt-on-insurer-share reading as unverified. Decision 7 keeps the app independent of it: it takes whatever amount is entered.
