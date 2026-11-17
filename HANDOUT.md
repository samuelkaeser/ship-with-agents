# Vom Prompt zum Ablauf

**Ihr entscheidet, der Agent baut, ihr prüft.**

Starte `claude` immer im Hauptordner des Repos.

## Der Ablauf

1. `/grill-with-docs features/<karte>.md`: Der Agent fragt, ihr entscheidet. Statt nur "Ja": "Warum?", "Was wäre die Alternative?", "Zeig ein Zahlenbeispiel."
2. `/to-spec`: Aus dem Gespräch wird `.scratch/<feature>/spec.md`. Eure Entscheide stehen schwarz auf weiss da.
3. `/to-tickets`: Dünne Scheiben von der Eingabe bis zur Anzeige, nicht nach Schichten. Ticket 1 muss allein zeigbar sein.
4. Falls noch kein Branch da ist, im Terminal: `git switch -c feature/<name>`. Dann drei Beispiele mit dem richtigen Ergebnis aus eurer Spec aufschreiben, bevor der Agent baut (zum Beispiel "Erwachsene, 5 Spitaltage: CHF 75"). Danach Ticket für Ticket: `/clear`, `/implement .scratch/<feature>/issues/01-….md`. Erst ein roter Test, dann Code, Typen, Hook, Commit. Nach jedem Commit euer Beispiel in der App prüfen. Ziel: das ganze Feature. Fertig? Zweite Karte, diesmal alleine.
5. `/clear`, dann `/code-review main`: Ein frischer Agent prüft den Branch gegen Spec und Repo-Regeln. Nimm den Eintrag mit `(project)`, nicht `/review`.

## Fahren und navigieren

Wer fährt, tippt. Wer navigiert, liest mit (Fragen, Tests, Diff) und sagt, wenn etwas nicht zur Spec passt. Wechsel in der Pause.

## Wenn du feststeckst

- Agent wird langsam oder wirr: `/clear` und das Ticket neu geben. Der Stand liegt in den Dateien.
- Test oder Hook rot: Der Agent liest die Fehlermeldung, der Hook wird nie umgangen.
- Nichts geht mehr: `git diff main origin/solution/<feature>`, oder Hand heben.

## So nimmst du das mit

1. Ordner `.claude/skills/` in dein Projekt kopieren (mit `LICENSE-mattpocock-skills`), einmal `/setup-matt-pocock-skills` ausführen.
2. `AGENTS.md` mit wenigen prüfbaren Regeln, zum Beispiel "Geld nur in Rappen".
3. Schnelle Tests, Typecheck und Pre-commit-Hook, damit der Agent Fehler selber merkt.
4. Specs und Tickets als Markdown im Repo, ein Ticket pro Datei.

Heute Abend: Codespace stoppen, Feedback-Formular ausfüllen.
