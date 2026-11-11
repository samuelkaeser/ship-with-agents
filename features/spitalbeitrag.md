# Spitalbeitrag

Wenn jemand im Spital liegt, soll die Kostenbeteiligung auch den Beitrag an die Verpflegungskosten
enthalten. Die Sachbearbeiterin soll bei einer Rechnung sehen, wie viele Spitaltage verrechnet
wurden und was die Patientin dafür zusätzlich zahlt. Heute fehlt das, die Abrechnung ist für
Spitalfälle deshalb zu tief.

Die Regeln und Sonderfälle sind noch offen, das klären wir im Grill. Grundlage: `docs/kvg-rules.md`.

## Vor dem Grill (5 Minuten)

1. Startet die App mit `pnpm dev`, öffnet im Codespace den Tab **Ports** und klickt auf das Globus-Symbol bei Port 3000. Klickt in der Liste **Versicherte Personen** auf **Erika Beispiel**. Erfasst unter **Neue Rechnung erfassen** eine Rechnung: Behandlungsdatum 2026-09-01, Rechnungsdatum 2026-09-10, Betrag in CHF 1000, Beschreibung "Spital", dann **Rechnung speichern**. Ihr seht eine neue Zeile unter **Kostenbeteiligung 2026**: Franchise CHF 0.00, Selbstbehalt CHF 100.00, Patient zahlt CHF 100.00, Kasse zahlt CHF 900.00. Die Zeile **Total 2026** bei Patient zahlt wächst von CHF 770.00 auf CHF 870.00.

   So rechnet die App heute: Erika hat die Franchise 300. Ihre Rechnung über CHF 5000 kostet sie CHF 300 Franchise plus 10% von (5000 - 300) = CHF 470 Selbstbehalt, zusammen CHF 770. Die Kasse zahlt CHF 4230. Eure Rechnung über CHF 1000 kommt danach: die Franchise ist schon aufgebraucht, also zahlt Erika 10% = CHF 100. Eine Rechnung hat heute nur einen Betrag. Es gibt keine Spitaltage und keinen Zuschlag.

2. Lest in `GLOSSARY.md`: Kostenbeteiligung, Franchise, Selbstbehalt, Cap, Patient share. (Das Cap heisst in der App "Selbstbehalt-Obergrenze".)
3. Fragt den Agenten, bevor ihr grillt: `Erklär uns diese Karte und die Begriffe darin in fünf Sätzen. Noch nichts bauen.`

Im Grill gibt es neben "Ja" drei nützliche Antworten: "Warum?", "Was wäre die Alternative?" und "Zeig ein Zahlenbeispiel."
