# Photos & Azure

Player photos come from **Wikimedia Commons** and are served from **Azure Blob
Storage** (account `carlintveld`, container `herken-de-oranje-selectie`).
[scripts/sync-photos.mjs](../scripts/sync-photos.mjs) resolves each player's
lead photo + author/license, uploads a 600px thumbnail, and writes
[data/photos.json](../data/photos.json).

> To run the sync, use the **`/sync-photos` skill** — it has the exact commands.
> This doc captures the *why* and the non-obvious gotchas.

## Gotchas / decisions

- **Tenant:** the storage account lives in the **carlintveld tenant**, not the
  default `az` session. The sync uses a dedicated CLI config via
  `AZURE_CONFIG_DIR=C:\Users\CarlintVeld/.azurecustomers/carlintveld.onmicrosoft.com`
  so it never touches the wrong tenant.
- **Auth fallback:** the logged-in account has **no data-plane role**
  (Storage Blob Data Contributor) but does have control-plane access. The tool
  probes with a real data-plane call (`blob list`) — *not* `container show`,
  which succeeds via the management plane and gives a false positive — and falls
  back to **account-key auth** when the data role is missing.
- **Public read:** the container allows **anonymous blob read**, so the static
  site can hotlink the blobs. Without it you'd need SAS/CDN URLs.
- **Thumbnails, not originals:** originals can be huge (one was 16 MB). The tool
  uploads a `THUMB_SIZE` (600px) Wikimedia thumbnail; `source` in the index
  still records the original for provenance.
- **Attribution is required:** Commons photos are CC-licensed, so author +
  license are stored per photo and shown in the "Fotoverantwoording" credits.
  The `author` field may contain HTML from Commons (rendered as-is; stray
  `<img>` is hidden via CSS).
- **Idempotent:** uploads are skipped when the downloaded bytes' `sourceHash`
  is unchanged (override with `--force`).
