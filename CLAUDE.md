# Herken de Oranje Selectie

A Next.js/React (TypeScript) quiz app about the Dutch national football team,
static-exported to GitHub Pages. Players show a Wikimedia Commons photo (served
from Azure Blob Storage) with a deterministic generated avatar as fallback.

## Docs

- [docs/architecture.md](docs/architecture.md) — app structure, static-export gotchas, data flow, avatars.
- [docs/photos.md](docs/photos.md) — Wikimedia → Azure photo system; tenant/auth/public-read gotchas.
- [docs/workflows.md](docs/workflows.md) — dev/build/deploy, releases, shell & commit conventions.

## Skills

- `/sync-photos` — sync player photos (Wikimedia → Azure) and update the index.
- `/learn` — persist new session learnings into CLAUDE.md + `docs/`.

## Global rules

- Windows repo: run cmdlets via the PowerShell tool; set env vars in the same invocation (state doesn't persist).
- Conventional Commits in English (release-please + CHANGELOG). Pushing to `main` triggers the Pages deploy.
