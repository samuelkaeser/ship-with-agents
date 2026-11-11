# ship-with-agents

Vorlage für den ETH-Workshop "How to ship reliable software with AI agents" (17.11.2026). Die Vorlage enthält die Umgebung (Codespace, Claude Code, Skills) und eine kleine App, "Krankenkasse light". Sie rechnet aus, was eine versicherte Person nach den Schweizer KVG-Regeln selber zahlt (Franchise, Selbstbehalt). Zu dieser App fügt ihr am Workshop eine Funktion hinzu.

So startest du:

1. Oben auf **Use this template** klicken und ein eigenes Repository erstellen.
2. In deinem Repository: **Code** → **Codespaces** → **Create codespace on main**. Das Einrichten dauert ein paar Minuten.
3. Im Terminal des Codespace `./setup-key.sh` ausführen und den Schlüssel vom Zettel einfügen. Das muss vor dem ersten `claude` passieren.
4. `claude` tippen. Fertig.

Wenn der Schlüssel abgelehnt wird: `./setup-key.sh` nochmals ausführen, sonst die Workshop-Leitung fragen.

## Was im Repo liegt

- `AGENTS.md`: die Regeln für den Agenten (`CLAUDE.md` verweist darauf). Kurz halten.
- `GLOSSARY.md`: die Fachbegriffe der App (Franchise, Selbstbehalt, Rappen, ...).
- `docs/kvg-rules.md`: die KVG-Regeln mit Artikelnummern. Hier schaut ihr nach, wenn der Agent fragt.
- `features/`: vier Feature-Karten. Ihr wählt eine.
- `.claude/skills/`: die Skills für den Ablauf unten.
- `.scratch/<feature>/`: hier landen eure Spec und die Tickets. Sie werden committet.
- `src/domain/`, `src/store/`, `src/web/`: die App (Regeln, Daten, Webseiten).

## Befehle

- `pnpm dev`: startet die App. Der Codespace leitet Port 3000 weiter. Öffne den Tab **Ports** und klicke auf das Globus-Symbol bei Port 3000.
- `pnpm test`: alle Tests.
- `pnpm typecheck`: Typenprüfung.
- `pnpm format`: Code formatieren.

Beim Commit laufen Prettier, Typenprüfung und Tests automatisch. Schlägt etwas fehl, wird nicht committet.

## Der Ablauf des Abends

Ihr arbeitet zu zweit an einer Feature-Karte. Jeder Schritt ist ein Befehl in Claude Code:

1. `/grill-with-docs`: Der Agent befragt euch zur Karte, bis alle offenen Punkte geklärt sind. Antworten kommen von euch, Wissen zu den Regeln steht in `docs/kvg-rules.md`.
2. `/to-spec`: Aus dem Gespräch wird eine Spec in `.scratch/<feature>/spec.md`.
3. `/to-tickets`: Die Spec wird in kleine Tickets zerlegt, eines pro Datei in `.scratch/<feature>/issues/`.
4. `/implement`: Der Agent setzt ein Ticket um, Test zuerst, dann Code.
5. `/code-review`: Der Agent prüft die Änderungen gegen die Regeln und die Spec.

Ihr entscheidet, der Agent schreibt den Code.
