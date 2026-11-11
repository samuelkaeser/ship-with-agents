# Mutterschaft

Schwangere sollen während der Schwangerschaft und nach der Geburt keine Kostenbeteiligung zahlen.
Heute rechnet die App bei einer Frau in dieser Zeit ganz normal Franchise und Selbstbehalt aus, das
ist falsch und führt zu Beschwerden. Die Sachbearbeiterin soll auf der Rechnung festhalten können,
dass es um Mutterschaft geht, und die Abrechnung soll das berücksichtigen.

Was genau wann gilt und was gespeichert werden muss, ist offen und gehört in den Grill.
Grundlage: `docs/kvg-rules.md`.

## Vor dem Grill (5 Minuten)

1. Startet die App mit `pnpm dev`, öffnet im Codespace den Tab **Ports** und klickt auf das Globus-Symbol bei Port 3000. Klickt in der Liste **Versicherte Personen** auf **Erika Beispiel**. Erfasst unter **Neue Rechnung erfassen** eine Rechnung: Behandlungsdatum 2026-06-15, Rechnungsdatum 2026-06-20, Betrag in CHF 200, Beschreibung "Grippe-Besuch", dann **Rechnung speichern**. Ihr seht eine neue Zeile unter **Kostenbeteiligung 2026**: Franchise CHF 0.00, Selbstbehalt CHF 20.00, Patient zahlt CHF 20.00, Kasse zahlt CHF 180.00. Die Zeile **Total 2026** bei Patient zahlt wächst von CHF 770.00 auf CHF 790.00.

   So rechnet die App heute: Erikas Rechnung über CHF 5000 (März) hat ihre Franchise von CHF 300 schon aufgebraucht. Auf euren Grippe-Besuch über CHF 200 zahlt sie deshalb nur 10% Selbstbehalt = CHF 20, die Kasse zahlt CHF 180. Eine Rechnung hat heute nur Datum, Betrag und Beschreibung, sonst nichts.

2. Lest in `GLOSSARY.md`: Insured person, Invoice, Treatment date, Franchise, Selbstbehalt.
3. Fragt den Agenten, bevor ihr grillt: `Erklär uns diese Karte und die Begriffe darin in fünf Sätzen. Noch nichts bauen.`

Im Grill gibt es neben "Ja" drei nützliche Antworten: "Warum?", "Was wäre die Alternative?" und "Zeig ein Zahlenbeispiel."
