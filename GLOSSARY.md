# Krankenkasse light

A fictional Swiss health insurer's tool. It works out how much of an invoice the insured person pays
(Kostenbeteiligung) and how much the insurer pays, under public KVG rules.

## Language

**Insured person**:
One person insured with the insurer, with a name, a date of birth and a chosen Franchise. Persons are single, there are no households.
_Avoid_: Customer, patient, member, client

**Invoice**:
A provider's bill for one treatment of one insured person, with one amount and no line items.
_Avoid_: Bill, claim, receipt

**Treatment date**:
The day the treatment happened. It decides which calendar year an invoice belongs to.
_Avoid_: Service date, visit date

**Invoice date**:
The day the provider issued the invoice. It never decides the calendar year.
_Avoid_: Billing date, booking date

**Rappen**:
The only money unit in the code: a whole number, 100 Rappen = CHF 1.
_Avoid_: Cents, centimes, CHF as a decimal number

### Cost sharing

**Kostenbeteiligung**:
The part of the costs the insured person pays themselves in a calendar year: Franchise plus Selbstbehalt.
_Avoid_: Co-payment, deductible (as a total)

**Franchise**:
The fixed yearly amount the insured person pays in full before the insurer pays anything. Adults choose 300 (ordinary), 500, 1500 or 2500, children have 0.
_Avoid_: Deductible, excess

**Selbstbehalt**:
10% of the costs above the Franchise, up to the cap.
_Avoid_: Co-insurance, coinsurance

**Cap**:
The highest Selbstbehalt one person pays per calendar year: CHF 700 for adults, CHF 350 for children.
_Avoid_: Limit, maximum, ceiling

**Yearly statement**:
The result for one insured person and one calendar year: per invoice the patient share (Franchise part and Selbstbehalt part) and the insurer share, plus yearly totals and what is left of Franchise and cap.
_Avoid_: Report, summary, bill

### People

**Child** and **Adult**:
A person is a child in a treatment year if they are under 19 on 31 December of that year, otherwise an adult.
_Avoid_: Minor, young adult (no separate category here)
