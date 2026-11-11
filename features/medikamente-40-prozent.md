# Medikamente mit 40% Selbstbehalt

Bei manchen teuren Medikamenten gibt es eine günstigere Alternative mit demselben Wirkstoff. Wer
trotzdem das teure Original bezieht, soll mehr selber zahlen als die üblichen 10%. Die
Sachbearbeiterin soll solche Medikamentenrechnungen richtig abrechnen können, und die Versicherte
soll nachvollziehen können, warum sie mehr bezahlt.

Wann das gilt, welche Ausnahmen es gibt und wie es sich auf den Deckel auswirkt, ist offen und
gehört in den Grill. Grundlage: `docs/kvg-rules.md`.

## Vor dem Grill (5 Minuten)

1. Startet die App mit `pnpm dev`, öffnet im Codespace den Tab **Ports** und klickt auf das Globus-Symbol bei Port 3000. Klickt in der Liste **Versicherte Personen** auf **Peter Sparfuchs**. Erfasst unter **Neue Rechnung erfassen** eine Rechnung: Behandlungsdatum 2026-11-10, Rechnungsdatum 2026-11-12, Betrag in CHF 100, Beschreibung "Medikament", dann **Rechnung speichern**. Ihr seht eine neue Zeile unter **Kostenbeteiligung 2026**: Franchise CHF 0.00, Selbstbehalt CHF 10.00, Patient zahlt CHF 10.00, Kasse zahlt CHF 90.00. Die Zeile **Total 2026** bei Patient zahlt wächst von CHF 2'530.00 auf CHF 2'540.00.

   So rechnet die App heute: Peter hat die Franchise 2500 und sie in diesem Jahr schon aufgebraucht (CHF 2200 im Juni, dazu CHF 300 von den CHF 600 im Oktober). Auf euer Medikament über CHF 100 zahlt er 10% Selbstbehalt = CHF 10. Die App rechnet jede Rechnung gleich, sie unterscheidet nicht, was behandelt oder abgegeben wurde.

2. Lest in `GLOSSARY.md`: Kostenbeteiligung, Franchise, Selbstbehalt, Cap, Patient share. (Das Cap heisst in der App "Selbstbehalt-Obergrenze".)
3. Fragt den Agenten, bevor ihr grillt: `Erklär uns diese Karte und die Begriffe darin in fünf Sätzen. Noch nichts bauen.`

Im Grill gibt es neben "Ja" drei nützliche Antworten: "Warum?", "Was wäre die Alternative?" und "Zeig ein Zahlenbeispiel."
