# Workflows

## Local dev / build

```bash
npm install
npm run dev        # http://localhost:3000 (no basePath)
npm run build      # static export to ./out (basePath applied)
npx serve out      # preview the production export
```

## Deploy

GitHub Actions ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml))
builds on every push to `main`: `npm ci` → `npm run build` → publish `out/` to
GitHub Pages. **Pushing to `main` deploys** — commit freely, push deliberately.

## Releases

[release-please](https://github.com/googleapis/release-please) drives versioning
from **Conventional Commits** on `main`, so commit subjects must follow that
format (`feat:`, `fix:`, …) and be written in **English** (they land verbatim in
`CHANGELOG.md`).

## Conventions

- **Shell:** this is a Windows repo; run cmdlets through the PowerShell tool, not
  bash. Note `AZURE_CONFIG_DIR` (and any env var) must be set in the *same*
  invocation as the command — shell state doesn't persist between tool calls.
- **Local Claude settings:** `.claude/settings.local.json` is git-ignored
  (personal permissions); committed skills live under `.claude/skills/`.
