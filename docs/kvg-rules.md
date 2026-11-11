# KVG cost-sharing rules (2026)

Public rules of the Swiss basic health insurance (OKP), as of 1 January 2026. Teaching simplification, not legal advice.
Sources: KVG (SR 832.10), KVV (SR 832.102), KLV (SR 832.112.31) on fedlex.admin.ch.

Amounts are CHF per calendar year unless stated. In the code, all money is integer Rappen.

Status marks: **[implemented]** is in the base app. **[not yet]** is not in the app (three of them are workshop features, see `features/`).

## 1. Franchise

1. **[implemented]** Ordinary Franchise for adults: CHF 300 per calendar year (KVV Art. 103 Abs. 1).
2. **[implemented]** Children pay no Franchise in the ordinary model (KVG Art. 64 Abs. 4). The app gives children Franchise 0 only.
3. **[implemented]** Selectable higher Franchisen for adults: 500, 1000, 1500, 2000, 2500 (KVV Art. 93 Abs. 1). The app offers 300, 500, 1500 and 2500.
4. Children could also choose 100 to 600 (KVV Art. 93 Abs. 1). **[not yet]**, the app has children at 0 only.
5. A higher Franchise can only start on 1 January (KVV Art. 94 Abs. 1). **[not yet]**, relevant for any Franchise comparison.
6. Young adults (19 to 25) have the same Franchise amounts and the same cap as other adults. Only premiums differ.

## 2. Selbstbehalt and cap

7. **[implemented]** Selbstbehalt is 10% of the costs above the Franchise (KVG Art. 64 Abs. 2 lit. b).
8. **[implemented]** Yearly cap: CHF 700 for adults, CHF 350 for children (KVV Art. 103 Abs. 2). Same cap with a selectable Franchise (KVV Art. 93 Abs. 2).
9. **[implemented]** An adult with the ordinary Franchise pays at most 300 + 700 = CHF 1,000. The cap is reached at costs of CHF 7,300.
10. **[implemented]** Rounding: the Selbstbehalt is rounded half up to the whole Rappen, per invoice. The law has no rounding rule, this is our choice.

## 3. Which year, which order

11. **[implemented]** The treatment date decides the calendar year, not the invoice date (KVV Art. 103 Abs. 3). A December treatment invoiced in January counts for December.
12. **[implemented]** Each calendar year starts with a fresh Franchise and a fresh cap. A continuous treatment over 31 December is split by treatment date.
13. **[implemented]** Child or adult: the app uses the age on 31 December of the treatment year, under 19 is a child (KVG Art. 16 Abs. 5 reading, simplification).
14. **[implemented]** Invoices are processed in treatment-date order: Franchise first, then Selbstbehalt on the rest.

## 4. Rules behind the workshop features

### Medikamente with 40% Selbstbehalt **[not yet]**

15. Differentiated Selbstbehalt for drugs: 40% instead of 10% when the factory price is at least 10% above the average of the cheapest third of all drugs on the Spezialitätenliste with the same active ingredient (KLV Art. 38a Abs. 1). Applies to originals, generics, co-marketing, reference drugs and biosimilars (Abs. 2).
16. The 40% does not apply if the doctor expressly prescribes the original for medical reasons, or the pharmacist documents a medical reason against substitution (KLV Art. 38a Abs. 7).
17. A drug cost counted at more than 10% only counts half of the excess toward the cap. At 40%, that is 30 points above the legal rate, so 15 points count toward the CHF 700 cap: 10 + 15 = 25% of the drug cost counts. The patient still pays the full 40% (KVV Art. 104a Abs. 2).
    Example: Franchise already met, original drug CHF 100, generic exists, no medical reason. Patient pays 40, counted toward the cap: 25. With a medical reason: patient pays 10, counted 10.

### Spitalbeitrag **[not yet]**

18. CHF 15 per day of hospital stay for adults, no time limit (KVV Art. 104 Abs. 1). Charged in addition to Franchise and Selbstbehalt.
19. Not charged for the day of discharge, nor for leave days (KVV Art. 104 Abs. 1bis).
20. No Spitalbeitrag for children, young adults in education (up to 25), and women whose cost sharing is waived for maternity (KVV Art. 104 Abs. 2).
    Example: admitted Monday, discharged Saturday. Billable days Monday to Friday = 5, so 5 x 15 = CHF 75.

### Mutterschaft **[not yet]**

21. No cost sharing at all on the specific maternity services of KVG Art. 29 Abs. 2: check-ups during and after pregnancy, birth, midwife care, breastfeeding advice, care of the healthy newborn (KVG Art. 64 Abs. 7 lit. a).
22. From the 13th week of pregnancy, during birth, and until 8 weeks after birth, no cost sharing on any basic-insurance service, also for illnesses unrelated to the pregnancy (KVG Art. 64 Abs. 7 lit. b).
23. The doctor states the presumed start of week 13 on the invoice (KVV Art. 105 Abs. 1). A stillbirth after week 23 counts as birth (Abs. 2). The period ends on day 56 after birth at 24:00 (Abs. 3).
    Example: woman in week 14, CHF 300 check-up and CHF 200 flu visit: all cost sharing 0. The same flu visit in week 10 is normal cost sharing.

### Franchisen-Vergleich **[not yet]**

24. The Franchise levels the app knows are in rules 1 to 3. The yearly statement rules (sections 2 and 3) apply unchanged to every level. How a comparison should treat premiums is open, see `features/franchisen-vergleich.md`.
25. Premium discounts for a higher Franchise are set by the insurer. The law only caps them: at most 70% of the extra risk the insured takes on (KVV Art. 95 Abs. 2bis).

## 5. Out of scope

Households and family caps, prevention exemptions (vaccinations, screenings), insurer change mid-year, tiers garant and tiers payant, Bonus insurance, premium reduction. Nothing in the app depends on them.
