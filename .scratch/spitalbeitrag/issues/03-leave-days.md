# 03: Leave days are not billed

**What to build:** The invoice form takes an optional number of leave days for a stay. Leave days are subtracted from the billed days, the count never goes below 0, so too many leave days bill nothing instead of a negative amount. A leave-day entry that is not a whole number of 0 or more shows a German error and stores nothing. Seed data has a second stay with leave days for the seed adult.

**Blocked by:** 01: Spitalbeitrag for an adult's hospital stay

**Status:** done

- [x] Stay of 7 days with 2 leave days bills 5 days, Spitalbeitrag 75
- [x] Leave days equal to or above the stay length bill 0 days and Spitalbeitrag 0
- [x] A stay without leave days is unchanged
- [x] Form field "Urlaubstage" accepts 0 or a whole number, rejects "-1", "1.5" and "abc" with a German error and stores nothing
- [x] Seed stay with leave days is visible in the running app
- [x] Glossary has the leave day, rule sheet marks rule 19 and the Spitalbeitrag section as implemented
