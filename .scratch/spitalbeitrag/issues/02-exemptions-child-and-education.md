# 02: No Spitalbeitrag for children and young adults in education

**What to build:** A stay of a Child, or of a young adult in education who is not older than 25 in the treatment year, shows 0 billed Spitalbeitrag. An adult who is 19 to 25 but not in education still pays. The insured person gets an "in education" flag (default no) that only seed data sets. The person page says "Kein Spitalbeitrag" with the reason when the person is exempt in the shown year, so nobody thinks the discharge date was lost. Seed data has an exempt child with a stay and a student with a stay.

**Blocked by:** 01: Spitalbeitrag for an adult's hospital stay

**Status:** done

- [x] A child's stay has Spitalbeitrag 0
- [x] A student in education aged 25 in the treatment year pays 0, aged 26 pays
- [x] A 22 year old not in education pays the Spitalbeitrag
- [x] Person page shows "Kein Spitalbeitrag" with the reason for exempt persons and nothing for others
- [x] Seed child and seed student with a stay show 0 in the running app
- [x] Glossary and rule sheet updated (rule 20, except the maternity part which stays not yet)
