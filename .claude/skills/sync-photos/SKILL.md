---
name: sync-photos
description: Synchroniseer de spelersfoto's (Wikimedia Commons → Azure Storage) en werk data/photos.json bij. Gebruik dit wanneer de gebruiker vraagt om "de foto's te syncen", "draai de sync", "foto's bijwerken/uploaden", of de Oranje-selectie/foto-index wil verversen.
---

# Spelersfoto's synchroniseren

Synct per speler de lead-foto + attributie van Wikimedia Commons naar het Azure
Storage account `carlintveld` (container `herken-de-oranje-selectie`) en werkt de
foto-index [`data/photos.json`](../../../data/photos.json) bij. De app gebruikt
die index direct (foto als beschikbaar, anders de gegenereerde avatar).

## Belangrijk: juiste Azure-login

De storage account zit in de **carlintveld tenant**, niet in de standaard
`az`-sessie. Gebruik een aparte Azure CLI config-dir zodat je niet de verkeerde
tenant raakt. Zet **altijd** deze env var vóór het draaien:

```
AZURE_CONFIG_DIR = C:\Users\CarlintVeld/.azurecustomers/carlintveld.onmicrosoft.com
```

Daarin staat (of zet je eenmalig) de login:

```powershell
$env:AZURE_CONFIG_DIR = "C:\Users\CarlintVeld/.azurecustomers/carlintveld.onmicrosoft.com"
az login   # alleen nodig als de sessie verlopen is
```

> Het ingelogde account heeft géén data-rol ("Storage Blob Data Contributor")
> maar wél control-plane toegang. De sync-tool detecteert dit en valt
> automatisch terug op **account-key auth**. De container staat op anonieme
> blob-read, dus de geüploade foto's zijn publiek leesbaar.

## Draaien (PowerShell)

Zet de env var en draai de sync in dezelfde aanroep (shell-state blijft niet
bewaard tussen tool-calls):

```powershell
$env:AZURE_CONFIG_DIR = "C:\Users\CarlintVeld/.azurecustomers/carlintveld.onmicrosoft.com"
node scripts/sync-photos.mjs
```

Opties:

| Commando | Effect |
| --- | --- |
| `node scripts/sync-photos.mjs` | nieuwe/gewijzigde foto's ophalen + uploaden (idempotent) |
| `node scripts/sync-photos.mjs --force` | alles opnieuw downloaden + uploaden |
| `node scripts/sync-photos.mjs --resolve-only` | alleen metadata bijwerken (geen Azure nodig) |
| `node scripts/sync-photos.mjs --player vandijk,depay` | beperk tot specifieke spelers |
| `node scripts/sync-photos.mjs --set-public` | container eenmalig op anonieme blob-read zetten |

Of via npm: `npm run sync:photos -- --force` (let op de extra `--`).

## Na afloop

1. Controleer de output (`Geüpload / overgeslagen / mislukt`).
2. Commit de bijgewerkte [`data/photos.json`](../../../data/photos.json).
3. Optioneel: verifieer een blob anoniem, bijv.
   `https://carlintveld.blob.core.windows.net/herken-de-oranje-selectie/vandijk.jpg`.

## Spelers toevoegen/wijzigen

Pas [`data/players.json`](../../../data/players.json) aan (incl. `wikiTitle` —
de exacte Wikipedia-paginatitel) en draai daarna de sync.
