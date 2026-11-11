## Problem Statement

Every autumn, insured persons ask the advisor: "Which Franchise would have been the cheapest for me last year?" The advisor has the invoices and the yearly statement, but only for the person's current Franchise. To answer, she has to estimate, or work out the other three levels by hand, and she forgets that a lower Franchise costs more in premium.

## Solution

On the person page, for the selected calendar year, the advisor sees what each of the four Franchise levels (300, 500, 1500, 2500) would have cost in total: twelve monthly premiums plus the Kostenbeteiligung that the normal yearly statement gives for that level. The page names the cheapest level, shows all four side by side, and says how much more or less each one costs compared with the person's current Franchise. For children and for years without invoices the page says something sensible instead of a wrong or empty answer.

## User Stories

1. As an advisor, I want to see the cheapest Franchise for the selected year on the person page, so that I can answer "which Franchise would have been best" without estimating
2. As an advisor, I want the cheapest level to count premium and Kostenbeteiligung together, so that a low Franchise is not judged on premium or on cost sharing alone
3. As an advisor, I want the comparison to use the same yearly statement rules as the page already shows, so that the numbers never disagree with the statement below
4. As an advisor, I want all four Franchise levels side by side with premium, Kostenbeteiligung and total, so that I can show the person why a level wins
5. As an advisor, I want the cheapest level marked in that table, so that I find it at a glance
6. As an advisor, I want the difference to the current Franchise per level, so that I can say "with 500 you would have paid CHF 120 less"
7. As an advisor, I want a clear sentence when the current Franchise already is the cheapest, so that I can reassure the person
8. As an advisor, I want the comparison to follow the year I selected, so that I can answer for last year and for earlier years
9. As an advisor, I want a year without invoices to still show a comparison (premium only), so that the answer is not blank
10. As an advisor, I want a note for children that there is no Franchise choice, so that I don't wonder why the section is missing
11. As an advisor, I want a tie between two levels resolved the same way every time, so that two advisors give the same answer
12. As an advisor, I want to know the premiums are fictional and that a change is only possible on 1 January, so that I don't promise a switch in the middle of the year

## Implementation Decisions

Decisions from the grill, each one simple on purpose:

- **What "cheapest" means.** Yearly cost of a level = 12 monthly premiums + the person's Kostenbeteiligung for that year if they had that level. The level with the lowest yearly cost is the cheapest. Nothing else counts (no tax effect, no risk appetite, no expected costs next year).
- **Reuse, don't reimplement.** The Kostenbeteiligung of a level comes from the existing yearly statement computation, called with the person's Franchise replaced by the level. Selbstbehalt, cap, treatment-date year and invoice order stay exactly as they are.
- **Ties.** If two levels have the same yearly cost, the lower Franchise wins (less risk for the same money). Example: a single invoice of CHF 1,766.67 gives 500 and 2500 the same yearly cost (5,366.67), so 500 is the cheapest. This is the only single-invoice amount where the cheapest level is tied.
- **Premiums.** One fixed table of fictional monthly premiums for adults (300: CHF 420, 500: CHF 395, 1500: CHF 335, 2500: CHF 300). It lives in the domain as constants, next to the other rule constants, not in the store and not per person. It is the same for every calendar year and for young adults (rule 6 in the KVG rules doc: only the real premiums differ, ours don't). The code says in a comment that the numbers are fictional.
- **Children.** Children have no Franchise choice in the app (Franchise 0 only) and the card has no children's premiums. No comparison for a child; the page says so in one sentence. Child or adult is decided per selected year, as everywhere else.
- **Year without invoices.** The comparison still runs. Kostenbeteiligung is 0 for every level, so the highest Franchise has the lowest premium and wins. The page adds a note that only premiums were compared.
- **Current Franchise.** The person's one Franchise applies to every year (the person has no Franchise history). The difference to the current Franchise is the yearly cost of the level minus the yearly cost of the current Franchise: negative means the level is cheaper. An adult's current Franchise is always one of the four levels.
- **Timing.** The comparison is a look back, so the "higher Franchise only from 1 January" rule does not block anything. The page mentions the rule so nobody promises a mid-year switch.
- **Display.** The cheapest level is shown as a sentence and as a marked row in a table of all four levels with columns Franchise, Prämie (12 Monate), Kostenbeteiligung, Jahreskosten and Differenz zur aktuellen Franchise. When the current Franchise is the cheapest, the sentence says that instead of naming a saving.
- **Modules.** A new pure domain module holds the premium table and the comparison (list of options per level, each with premium, Kostenbeteiligung, yearly cost and difference to current). The person page view gets a comparison section. The route passes the comparison in. No change to the store, to the invoice form or to the yearly statement.
- **Interface shape.** The comparison takes a person, the invoices and a year and returns the options in ascending Franchise order, or an empty list for a child. Ascending order makes the tie rule fall out of picking the first minimum.
- **Docs.** Glossary gets Monthly premium, Yearly cost and Franchise comparison. The KVG rules doc marks each part implemented in the ticket that delivers it, and gets one worked example.

## Testing Decisions

- A good test checks external behaviour: given a person, invoices and a year, which numbers and which words come out. It doesn't look at how the options are built.
- Domain tests (pure functions) carry the cases and numbers: Erika 2026 (CHF 5,000 bill) with all four levels computed by hand, the tie at CHF 1,300, a year without invoices, a child, a capped year (Max Muster).
- Web tests use the existing route seam (`app.request` on the person page) and check the visible German text and CHF amounts for the seeded persons. One test per visible behaviour.
- Prior art: the worked-example style tests for the yearly statement, and the person page tests that match on formatted CHF text.
- Hand-computed expected values go into the tests, never numbers copied from the code's own output.

## Out of Scope

- Real premiums, premium differences by age group, canton or insurer model; premium changes by year.
- Children's Franchise choice (100 to 600) and children's premiums.
- Predicting next year's costs, recommending a switch, or doing the switch.
- Franchise history per person, or a Franchise change in the app.
- Households, tax effect, risk appetite.
- An overview over all persons.

## Further Notes

- Worked example for the docs: Erika Beispiel, 2026, one invoice of CHF 5,000. Premium plus Kostenbeteiligung: 300 gives 5,040 + 770 = 5,810; 500 gives 4,740 + 950 = 5,690; 1500 gives 4,020 + 1,850 = 5,870; 2500 gives 3,600 + 2,750 = 6,350. Cheapest is 500, CHF 120 below her current 300.
- Hardest calls: what happens in the tie (lower Franchise, decided by "less risk for the same money"), and whether children get a comparison (no).
- With the fictional table, 500 always beats 300 (premium saving CHF 300 a year, extra Franchise at most CHF 200). So the 300 level is never the cheapest. That is a property of the made-up numbers, not a bug.
- The card says "für ein gewähltes Jahr": the existing year navigation already selects it, no new control.
