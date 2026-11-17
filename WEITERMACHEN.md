# Weitermachen nach dem Workshop

Alles, was du brauchst, um den Ablauf in einem eigenen Projekt zu nutzen.

## Die Folien

Die Folien des Abends liegen in [`slides/index.html`](slides/index.html), ohne Sprechernotizen. GitHub zeigt HTML nur als Quelltext an, darum:

1. Repo klonen oder als ZIP laden (grüner Button **Code**, **Download ZIP**).
2. `slides/index.html` im Browser öffnen.
3. Pfeil rechts oder Leertaste = weiter, Pfeil links = zurück, `f` = Vollbild.

Der Ablauf auf einer Seite steht in [HANDOUT.md](HANDOUT.md).

## Woher die Befehle kommen: Matt Pocock

`/grill-with-docs`, `/to-spec`, `/to-tickets`, `/implement` und `/code-review` sind nicht von uns. Sie stammen von Matt Pocock, unverändert aus seinem Plugin `mattpocock-skills` (MIT-Lizenz). Welche Version hier im Repo liegt, steht in [`.claude/skills/PROVENANCE.md`](.claude/skills/PROVENANCE.md).

- Die Skills, mit Erklärung zu jedem einzelnen: https://github.com/mattpocock/skills
- Seine Seite mit Artikeln und Kursen zum Arbeiten mit Coding-Agents: https://www.aihero.dev
- Newsletter zu neuen und geänderten Skills: https://www.aihero.dev/s/skills-newsletter
- Videos: https://www.youtube.com/@mattpocockuk

Ein Skill ist nur ein Ordner mit einer Markdown-Datei. Lies ein paar davon in `.claude/skills/`, dann siehst du, dass nichts Geheimes dahinter steckt, und kannst sie für dein Projekt anpassen.

## In deinem eigenen Projekt

Du hast zwei Wege, die Skills zu bekommen. Nimm einen, nicht beide, sonst hast du jeden Befehl doppelt.

**Als Plugin** (aktualisiert sich selber):

```bash
claude plugin install mattpocock-skills@claude-plugins-official
```

**Als Kopie** (genau der Stand vom Workshop): den Ordner `.claude/skills/` aus diesem Repo in dein Projekt kopieren, zusammen mit `LICENSE-mattpocock-skills`.

Danach in beiden Fällen einmal `/setup-matt-pocock-skills` ausführen. Der Befehl fragt, wo Tickets und Doku in deinem Projekt liegen.

Was es neben den Skills braucht (das war am Workshop schon vorbereitet):

1. **`AGENTS.md` mit wenigen prüfbaren Regeln.** Hier zum Beispiel "Geld nur in Rappen" und "kein Feature ohne Spec". Schau dir [AGENTS.md](AGENTS.md) als Muster an. Das Format ist offen und funktioniert auch mit anderen Agents: https://agents.md
2. **Schnelle Tests, Typecheck und ein Pre-commit-Hook.** Damit merkt der Agent seine Fehler selber, bevor du sie suchen musst. In diesem Repo: `vitest`, `tsc` und der Hook in `.git/hooks`, eingerichtet über `package.json`.
3. **Ein Glossar und die Fachregeln als Datei im Repo.** Hier [GLOSSARY.md](GLOSSARY.md) und [docs/kvg-rules.md](docs/kvg-rules.md). Der Grill ist nur so gut wie das, was der Agent über dein Fach lesen kann.
4. **Specs und Tickets als Markdown im Repo**, ein Ticket pro Datei, wie in `.scratch/<feature>/`.

## Claude Code ohne Workshop-Schlüssel

Der Schlüssel vom Abend läuft nach einem Tag ab. Für danach brauchst du ein eigenes Konto: entweder ein Claude-Abo (Pro oder Max) oder einen eigenen API-Schlüssel aus der Console (https://console.anthropic.com), bezahlt nach Verbrauch.

Zur Grössenordnung beim Bezahlen nach Verbrauch: Bei unseren Probeläufen mit Sonnet kostete ein Ticket aus diesem Repo etwa 0.60 bis 0.80 Dollar, das ganze Feature Spitalbeitrag etwa 2 Dollar.

- Installation und Einstieg: https://code.claude.com/docs/en/overview
- Wie Skills funktionieren und wie du eigene schreibst: https://code.claude.com/docs/en/skills

Der Ablauf hängt nicht an Claude Code. Die Skills laufen laut Matt Pococks README auch mit Codex und GitHub Copilot; die Installationsbefehle stehen dort.

## Zum Nachschauen in diesem Repo

- Die vier Feature-Karten: [`features/`](features/)
- Eine fertige Lösung pro Karte: die Branches `solution/spitalbeitrag`, `solution/mutterschaft`, `solution/medikamente-40-prozent`, `solution/franchisen-vergleich` (ein Commit pro Ticket)
- Muster für Spec und Tickets: der Branch `reference`

## Der eine Satz

Ihr entscheidet, der Agent baut, ihr prüft.
