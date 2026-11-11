# Mutterschaft

**Status:** ready-for-agent

## Problem Statement

A clerk at the insurer enters invoices for a woman who is pregnant or has just given birth. The app
charges her Franchise and Selbstbehalt as for everyone else. That is wrong: under KVG Art. 64 Abs. 7
she pays no cost sharing on maternity services, and from the 13th week of pregnancy until 8 weeks
after birth she pays none on any basic-insurance service. The clerk has no way to say "this is about
maternity", the yearly statement is too high, and the insured person complains.

## Solution

The clerk can do two things. First, mark an invoice as a **maternity service** (check-up, birth,
midwife and so on): its patient share is 0. Second, record a **maternity period** for the insured
person: the start of week 13 as stated by the doctor, and later the birth date. Every invoice with a
treatment date inside that period has a patient share of 0, whatever it is for. The yearly statement
shows these invoices with a note why they cost the insured person nothing, and they use up neither
Franchise nor cap.

## User Stories

1. As a clerk, I want to mark an invoice as a maternity service, so that the insured person pays nothing for a check-up or a birth.
2. As a clerk, I want the patient share of a marked invoice to be CHF 0, so that the statement is right without me calculating anything.
3. As an insured woman, I want a maternity invoice to leave my Franchise untouched, so that my later invoices in the year are charged as if the maternity invoice never happened.
4. As an insured woman, I want a maternity invoice to leave my Selbstbehalt cap untouched, so that I still have the full cap for illnesses later in the year.
5. As a clerk, I want to see on the statement why an invoice costs the insured person nothing, so that I can answer a complaint without opening the rule sheet.
6. As a clerk, I want to record the start of week 13 for an insured person, so that the app knows from when she is exempt.
7. As an insured woman in week 14, I want an unrelated flu visit to be free as well, so that I am not charged for something the law says is covered.
8. As an insured woman in week 10, I want a flu visit to be charged normally, so that the app follows the rule and not more.
9. As a clerk, I want an invoice with a treatment date exactly on the first day of week 13 to be exempt, so that there is no gap at the start.
10. As a clerk, I want to record the birth date, so that the exemption ends 8 weeks after birth.
11. As a clerk, I want the treatment on day 56 after birth to be exempt and day 57 to be charged, so that the app matches "until day 56 at 24:00".
12. As an insured woman, I want the exemption to continue across 31 December, so that a birth in December does not cost me in January.
13. As a clerk, I want the person page to show the recorded period, so that I can check it at a glance.
14. As a clerk, I want to correct a wrong entry by recording the period again, so that a typo does not stay forever.
15. As a clerk, I want a birth date before the start of week 13 to be rejected with a clear message, so that I cannot store a period that makes no sense.
16. As a clerk, I want an impossible date to be rejected, so that the statement is never computed from garbage.

## Implementation Decisions

Decisions a grill would have reached. Each open question from the feature card and the rule sheet is
settled here, simplest reading first.

- **Two mechanisms, not one.** Rule 21 (specific maternity services of KVG Art. 29 Abs. 2, from the first day of pregnancy) is a flag on the invoice. Rule 22 (everything else, from week 13 to 8 weeks after birth) is a period on the insured person. The card says "on the invoice", and KVV Art. 105 has the doctor state week 13 on the invoice. We still store the period once on the person, because flagging every single invoice in a 6-month window would be tedious and error-prone. This is a teaching simplification.
- **The flag is the clerk's decision.** The app does not know which services are in Art. 29 Abs. 2. There is no list of services, the clerk ticks a box.
- **Flag and period give the same result** (patient share 0). If both apply, the statement names the flag as the reason.
- **Exempt invoices are skipped entirely.** Franchise part 0, Selbstbehalt part 0, insurer share is the full amount. They do not use up Franchise or cap. This is the straight reading of "no cost sharing" and the hardest decision: letting them eat Franchise without charging would be wrong, because nothing was paid.
- **No sex field.** The app has no sex on the insured person and we do not add one. Any insured person can have a maternity period. The clerk is responsible for entering it for the right person.
- **One period per person.** The period is one optional record on the insured person: start of week 13 (required) and birth date (optional). Recording again overwrites it, that is also the correction mechanism, there is no delete button. Two pregnancies in the data are out of scope.
- **The start is given as a date, not computed.** The doctor states the presumed start of week 13 (KVV Art. 105 Abs. 1), the clerk types it in. The app never derives it from a due date or from the last menstrual period.
- **Period start is inclusive.** An invoice is in the period when its treatment date is on or after the start of week 13.
- **Birth ends the period 56 days later.** KVV Art. 105 Abs. 3: the period ends on day 56 after birth at 24:00. The birth date is day 0, so the last exempt treatment date is birth date plus 56 days, inclusive. Birth on 2026-12-10 gives last exempt day 2027-02-04. The birth itself and the days around it are inside the period.
- **No birth date means no end.** While no birth is recorded, the period is open-ended. The clerk records the birth when it happens. The app does not guess a due date.
- **Stillbirth after week 23 counts as birth** (KVV Art. 105 Abs. 2). The app does not check the week: the clerk enters the date of the event as birth date. A miscarriage before week 23 has no defined end in the rule sheet and is not modelled.
- **The treatment date decides**, as everywhere else (KVV Art. 103 Abs. 3). The invoice date plays no role for the period. A period can span two calendar years, and each year's statement applies it to its own invoices.
- **Validation.** The start must be a real date. The birth date, if given, must be a real date and not before the start. Errors are shown in German on the person page, same style as the invoice form.
- **Statement line gets a reason.** A line is exempt for one of two reasons: maternity service, or maternity period. The view shows a short German note next to the description.
- **Domain.** The exemption rule is a pure function in the rules module with article citations. The period end is computed by a small pure date helper (adding days to a date given as text, no clock). The yearly statement asks the exemption rule for each invoice before doing Franchise and Selbstbehalt.
- **Store.** The invoice gets an optional maternity flag. The insured person gets an optional maternity record. The store gets one method to set the record, which replaces the person object instead of mutating the seed.
- **UI.** The new-invoice form gets a checkbox. The person page gets a small form for the period and a line that shows the recorded period.
- **Seed.** One new insured person, Sara Storch, whose 2026 and 2027 statements show a flagged check-up, a charged flu visit in week 10, a free flu visit in week 14, a birth in December and the end of the period in February 2027.

## Testing Decisions

- A good test states a case from the rule sheet in terms a clerk would use (week 14, day 56) and checks the visible numbers. It does not look at how the exemption is stored or computed.
- Two seams, both exist already: the yearly statement function (all rule cases, boundaries, interaction with Franchise and cap) and the HTTP app (forms, redirect, validation messages, numbers on the page). No new seam.
- Worked example F from the rule sheet is reproduced as tests: week 14 with CHF 300 check-up and CHF 200 flu visit gives all zeros, the same flu visit in week 10 is charged. The hospital days in example F belong to the feature Spitalbeitrag and are left out here.
- Prior art: the existing statement tests (one `describe` per worked example) and the existing app tests (POST then GET and read the patient total).

## Out of Scope

- Spitalbeitrag for the hospital days of the birth (own feature card). KVV Art. 104 Abs. 2 says women in maternity pay none, that is added there, not here.
- A list of maternity services or any check that a flagged invoice really is one.
- Sex or gender on the insured person.
- Two pregnancies, deleting a period, miscarriages.
- Deriving week 13 from a due date, and the doctor's statement as a document.
- Premiums, and maternity allowances (Mutterschaftsentschädigung).

## Further Notes

- The rule sheet says "no cost sharing on any basic-insurance service" in the period. The app has only one kind of service, so that is every invoice of the person with a treatment date in the period.
- Rule 22 says "during birth": it is covered by the period, no separate rule.
- Rule 22 says "until 8 weeks after birth" and rule 23 says "day 56 at 24:00". They are the same thing, 8 times 7 is 56.
