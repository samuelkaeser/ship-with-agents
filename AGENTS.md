# Krankenkasse light

Small TypeScript app for a fictional Swiss health insurer. It computes what an insured person pays
themselves (Kostenbeteiligung) under public KVG rules, per person and calendar year. Teaching repo
for a workshop: keep it small and readable.

## Commands

pnpm only. `pnpm dev` (server on port 3000), `pnpm test`, `pnpm typecheck`, `pnpm format`.
The pre-commit hook runs prettier, typecheck and tests. Never skip it.

## Layout

- `src/domain/`: pure rule functions (money, rules, yearly statement)
- `src/store/`: in-memory store and seed data
- `src/web/`: Hono routes and server-rendered JSX views (German UI text)
- `GLOSSARY.md`: domain terms. `docs/kvg-rules.md`: the rules, with article references
- `features/`: feature cards. `.scratch/<feature>/`: specs and tickets (committed)

## Rules

1. Money is integer `Rappen`, never floating-point CHF. Format only via `formatChf`.
2. Domain rules live in `src/domain/` as pure functions: no I/O, no clock access (dates are passed
   in). Each rule cites the article it implements in a comment, e.g. `KVV Art. 103 Abs. 2`.
3. Every rule change comes with a test that names the case.
4. Code, comments and docs in English. UI text in German. German domain terms (Franchise,
   Selbstbehalt, Rappen) stay as they are.

## Agent skills

### Issue tracker

Local markdown under `.scratch/<feature>/`, no GitHub issues. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
