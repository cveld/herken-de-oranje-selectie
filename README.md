# Herken de Oranje Selectie

Een webapp om je kennis van het Nederlands elftal te testen. Gehost op GitHub Pages.

## Lokaal draaien

Open `index.html` rechtstreeks in de browser, of serveer de map met een statische server:

```bash
npx serve .
```

## Deployment

De app wordt automatisch naar GitHub Pages gepubliceerd bij elke push naar `main`
(zie [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## Releases

Versiebeheer verloopt via [release-please](https://github.com/googleapis/release-please).
Gebruik [Conventional Commits](https://www.conventionalcommits.org/) zodat release-please
automatisch een release-PR en changelog kan genereren.
