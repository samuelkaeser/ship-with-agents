# ship-with-agents

Vorlage für den ETH-Workshop "How to ship reliable software with AI agents" (17.11.2026). Die Vorlage enthält die Umgebung (Codespace, Claude Code, Skills) und eine kleine App, "Krankenkasse light". Sie rechnet aus, was eine versicherte Person nach den Schweizer KVG-Regeln selber zahlt (Franchise, Selbstbehalt). Zu dieser App fügt ihr am Workshop eine Funktion hinzu.

So startest du:

1. `github.com/samuelkaeser/ship-with-agents` öffnen.
2. Grüner Button **Use this template**, dann **Create a new repository** (nicht "Open in a codespace").
3. **Include all branches**: Toggle auf **On** stellen, sonst fehlen die Lösungs-Branches.
4. **Repository name**: `ship-with-agents` eintippen.
5. **Choose visibility**: **Private** wählen.
6. **Create repository** klicken.
7. Im neuen Repo: grüner Button **Code** (rechts über der Dateiliste, nicht der Tab "Code" oben links), Tab **Codespaces**, **Create codespace on main**. Das dauert ein paar Minuten. Die gelben Hinweise "had recent pushes" ignorieren.
8. Die Schlüssel-Seite öffnen (URL und Passwort stehen vorne auf der Leinwand und auf der Karte am Tisch), Raum-Passwort eintippen, **Schlüssel holen**, **Kopieren**.
9. Im Codespace unten ins Terminal klicken, `./setup-key.sh` tippen, Enter. Schlüssel einfügen, Enter (er bleibt unsichtbar, das ist normal). Es erscheint "Bereit." Das muss vor dem ersten `claude` passieren.
10. `claude` tippen, Enter, und zwar im Hauptordner des Repos. Dann `Sag Hallo in einem Satz.` tippen, Enter. Der Agent antwortet.
11. Zweites Terminal mit dem **+** oben rechts im Terminal-Bereich öffnen, `pnpm dev` tippen, Enter. Tab **Ports**, Globe-Icon bei Port 3000. Die App zeigt eine Liste von Personen.

Wenn der Schlüssel abgelehnt wird: `./setup-key.sh` nochmals ausführen, sonst die Workshop-Leitung fragen.

## Was im Repo liegt

- `AGENTS.md`: die Regeln für den Agenten (`CLAUDE.md` verweist darauf). Kurz halten.
- `GLOSSARY.md`: die Fachbegriffe der App (Franchise, Selbstbehalt, Rappen, ...).
- `docs/kvg-rules.md`: die KVG-Regeln mit Artikelnummern. Der Agent liest sie selber. Ihr schaut hier nach, wenn ihr prüfen wollt, was er über die Regeln behauptet.
- `features/`: vier Feature-Karten. Ihr wählt eine.
- `.claude/skills/`: die Skills für den Ablauf unten.
- `.scratch/<feature>/`: hier landen eure Spec und die Tickets. Sie werden committet.
- `src/domain/`, `src/store/`, `src/web/`: die App (Regeln, Daten, Webseiten).

## Befehle

- `pnpm dev`: startet die App. Der Codespace leitet Port 3000 weiter. Öffne den Tab **Ports** und klicke auf das Globe-Icon bei Port 3000.
- `pnpm test`: alle Tests.
- `pnpm typecheck`: Typenprüfung.
- `pnpm format`: Code formatieren.

Beim Commit laufen Prettier, Typenprüfung und Tests automatisch. Schlägt etwas fehl, wird nicht committet.

## Der Ablauf des Abends

Ihr arbeitet zu zweit an einer Feature-Karte. Fast jeder Schritt ist ein Befehl in Claude Code:

1. Im Terminal (nicht in Claude) einen Branch anlegen: `git switch -c feature/<name>`. Ohne Branch hat das Review am Schluss nichts zu vergleichen.
2. App und Karte: Folgt dem Abschnitt "App und Karte" am Ende eurer Feature-Karte. Ihr startet die App, erfasst eine Rechnung und lest die Begriffe nach. So versteht ihr, worüber der Agent euch gleich befragt.
3. `/grill-with-docs`: Der Agent befragt euch zur Karte, bis alle offenen Punkte geklärt sind. Die Regeln in `docs/kvg-rules.md` liest der Agent selber. Er fragt nur, was die Regeln nicht entscheiden, also Entscheidungen über die App. Die Datei liegt für euch da: Wenn der Agent etwas über die Regeln behauptet, prüft ihr es dort, bevor ihr Ja sagt.
4. `/to-spec`: Aus dem Gespräch wird eine Spec in `.scratch/<feature>/spec.md`.
5. `/to-tickets`: Die Spec wird in kleine Tickets zerlegt, eines pro Datei in `.scratch/<feature>/issues/`.
6. `/implement`: Schreibt zuerst drei Beispiele mit dem richtigen Ergebnis auf, bevor der Agent baut, z.B. "Erwachsene, 5 Tage im Spital: 75 Franken". Sie gehören in die Datei `.scratch/<feature>/beispiele.md`. Dann Ticket für Ticket: `/clear`, `/implement` mit der Ticket-Datei. Der Agent schreibt zuerst einen Test, der rot ist, dann den Code. Ein Ticket dauert ein paar Minuten. Nach jedem Commit tippt ihr das passende Beispiel in die laufende App und prüft, ob die Zahl herauskommt. Ziel ist das ganze Feature. Seid ihr fertig, nehmt ihr eine zweite Karte, diesmal alleine.
7. `/clear`, dann `/code-review main`: Ein frischer Agent prüft den ganzen Branch gegen die Regeln und die Spec. Nehmt den Eintrag mit `(project)`, nicht `/review`.

Ihr entscheidet, der Agent baut, ihr prüft.

## Wenn ihr feststeckt

Zu jeder Karte gibt es eine Referenz. Schaut erst hinein, wenn ihr es selber versucht habt.

- Tickets zu gross geraten: Referenz-Spec und Referenz-Tickets holen mit `git checkout origin/reference -- features/reference/<feature>` und nach `.scratch/<feature>/` kopieren.
- Umsetzung hängt: Der Branch `solution/<feature>` hat einen Commit pro Ticket. Ansehen mit `git log origin/solution/<feature>` und `git show <commit>`.
