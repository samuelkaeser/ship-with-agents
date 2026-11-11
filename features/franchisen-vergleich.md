# Franchisen-Vergleich

Versicherte fragen uns jedes Jahr im Herbst: "Welche Franchise wäre für mich im letzten Jahr am
günstigsten gewesen?" Die Beraterin soll das auf der Personenseite für ein gewähltes Jahr sehen,
damit sie eine klare Antwort geben kann statt zu schätzen.

Fiktive Monatsprämien (nur Prämie, ohne Kostenbeteiligung):

| Franchise | Prämie pro Monat |
| --------- | ---------------- |
| 300       | CHF 420          |
| 500       | CHF 395          |
| 1500      | CHF 335          |
| 2500      | CHF 300          |

Die Beraterin will nicht nur die günstigste Franchise sehen, sondern alle vier Stufen nebeneinander
und wie viel mehr oder weniger sie gegenüber der heutigen Franchise kosten. Kinder haben keine Wahl,
und auch ein Jahr ohne Rechnungen soll eine brauchbare Antwort geben.

Was "am günstigsten" genau heisst und wie wir mit Randfällen umgehen, ist offen und gehört in den
Grill. Grundlage: `docs/kvg-rules.md`.

## Vor dem Grill (5 Minuten)

1. Startet die App mit `pnpm dev`, öffnet im Codespace den Tab **Ports** und klickt auf das Globus-Symbol bei Port 3000. Klickt in der Liste **Versicherte Personen** auf **Peter Sparfuchs**. Erfasst unter **Neue Rechnung erfassen** eine Rechnung: Behandlungsdatum 2026-12-01, Rechnungsdatum 2026-12-05, Betrag in CHF 1000, Beschreibung "Kontrolle", dann **Rechnung speichern**. Ihr seht eine neue Zeile unter **Kostenbeteiligung 2026**: Franchise CHF 0.00, Selbstbehalt CHF 100.00, Patient zahlt CHF 100.00, Kasse zahlt CHF 900.00. Die Zeile **Total 2026** bei Patient zahlt wächst von CHF 2'530.00 auf CHF 2'630.00.

   So rechnet die App heute: Peter hat die Franchise 2500. Seine erste Rechnung (CHF 2200) zahlt er ganz selbst, das sind CHF 2200 Franchise. Bei der zweiten (CHF 600) fehlen noch CHF 300 bis zur Franchise, dazu kommen 10% von (600 - 300) = CHF 30 Selbstbehalt, zusammen CHF 330. Im Jahr 2026 zahlt er also CHF 2530, die Kasse CHF 270. Die App kennt heute nur die Franchise, die eine Person gewählt hat. Prämien kommen in ihr nicht vor.

2. Lest in `GLOSSARY.md`: Kostenbeteiligung, Franchise, Selbstbehalt, Yearly statement, Child and Adult.
3. Fragt den Agenten, bevor ihr grillt: `Erklär uns diese Karte und die Begriffe darin in fünf Sätzen. Noch nichts bauen.`

Im Grill gibt es neben "Ja" drei nützliche Antworten: "Warum?", "Was wäre die Alternative?" und "Zeig ein Zahlenbeispiel."
