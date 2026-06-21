# Herken de Oranje Selectie

A web app to test your knowledge of the Dutch national football team. Built with
**Next.js + React (TypeScript)** and hosted on GitHub Pages (static export).

Players are shown with real photos from **Wikimedia Commons** (served from Azure
Blob Storage), falling back to a deterministically generated **avatar** when no
photo is available. In "Bekijk de selectie" a button lets you switch between
photos and avatars (your preference is remembered).

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build / export

```bash
npm run build      # static export to ./out
npx serve out      # preview the export locally
```

The app is published to GitHub Pages automatically on every push to `main`
(see [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

> On GitHub Pages the app runs under `/herken-de-oranje-selectie` (`basePath`
> in [`next.config.mjs`](next.config.mjs)). There is no basePath locally.

## Syncing photos (Wikimedia → Azure)

The photo index lives in [`data/photos.json`](data/photos.json) and is managed by
the sync tool. For each player it fetches the lead photo + author/license from
Wikimedia Commons, uploads a 600px thumbnail to Azure Blob Storage, and updates
the index.

**Requirements:**

- Azure CLI logged in to the **carlintveld tenant**. The account used has no
  data-plane role, so the tool falls back to account-key auth automatically.
  Use a dedicated config dir so you don't touch the wrong tenant:
  ```bash
  AZURE_CONFIG_DIR="C:\Users\CarlintVeld/.azurecustomers/carlintveld.onmicrosoft.com"
  az login   # only when the session has expired
  ```
- Storage account `carlintveld`, container `herken-de-oranje-selectie`.
- The container must allow **anonymous blob read** so the static site can load
  the photos. One-off (requires permissions):
  ```bash
  npm run sync:photos -- --set-public
  ```

**Syncing:**

```bash
npm run sync:photos                            # fetch + upload new/changed photos
npm run sync:photos -- --force                 # redo everything
npm run sync:photos -- --resolve-only          # update metadata only
npm run sync:photos -- --player vandijk,depay  # limit to specific players
```

Commit the updated `data/photos.json` afterwards. See also the `/sync-photos`
skill in [`.claude/skills/sync-photos`](.claude/skills/sync-photos/SKILL.md).

## Player data

[`data/players.json`](data/players.json) is the source of truth (id, name,
number, position, club, `wikiTitle`). Edit the selection here; the sync tool uses
`wikiTitle` to find the right photo.

## Releases

Versioning is handled via [release-please](https://github.com/googleapis/release-please).
Use [Conventional Commits](https://www.conventionalcommits.org/) so release-please
can generate a release PR and changelog automatically.
