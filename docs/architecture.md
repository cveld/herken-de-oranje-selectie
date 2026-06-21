# Architecture

Next.js (App Router) + React + TypeScript, shipped as a **static export**
(`output: 'export'` in [next.config.mjs](../next.config.mjs)) and hosted on
GitHub Pages. The whole app is one stateful client SPA.

## Static export gotchas (GitHub Pages)

- Project site → it runs under **`/herken-de-oranje-selectie`**. `basePath` /
  `assetPrefix` are applied **only in production** (`NODE_ENV === 'production'`);
  there is no basePath in `npm run dev`.
- `public/.nojekyll` is required, otherwise Pages' Jekyll strips the `_next/`
  folder and all assets 404.
- `images: { unoptimized: true }` — the Next image optimizer can't run on a
  static host; photos are plain `<img>`.

## Data flow

- [data/players.json](../data/players.json) is the source of truth (id, name,
  number, position, club, `wikiTitle`); [data/players.ts](../data/players.ts)
  adds types. The `.json` is shared so the sync tool can read it without TS.
- [data/photos.json](../data/photos.json) is the photo index (managed by the
  sync tool — see [photos.md](photos.md)).
- [lib/players.ts](../lib/players.ts) merges the two into `ResolvedPlayer`
  (adds `image` = blob URL + `credit` when a photo exists).
- [components/Avatar.tsx](../components/Avatar.tsx) renders the photo when
  available **and** the global "use photos" preference is on; otherwise the
  generated avatar. Preference lives in [lib/prefs.ts](../lib/prefs.ts)
  (localStorage, shared via `useSyncExternalStore`); the toggle is in the
  "Bekijk de selectie" view.

## Avatars

[lib/avatar.ts](../lib/avatar.ts) is a **deterministic** SVG generator (FNV hash
→ LCG RNG → same id always yields the same avatar). It's a verbatim port of the
original vanilla-JS generator — keep it byte-for-byte stable so avatars don't
change; it's the permanent fallback when a player has no photo.
