#!/usr/bin/env node
/*
 * sync-photos.mjs — synchroniseert spelersfoto's van Wikimedia Commons
 * naar het Azure Storage account en werkt de foto-index (data/photos.json) bij.
 *
 * Per speler (uit data/players.json):
 *   1. Resolve   : haal de originele Commons-foto-URL op via de Wikipedia API (nl, fallback en).
 *   2. Attributie: haal auteur + licentie op via de Commons imageinfo/extmetadata API.
 *   3. Download  : haal de bytes op, bereken sha256 (= sourceHash) -> scripts/.cache/.
 *   4. Upload    : 'az storage blob upload' naar account/container.
 *   5. Index     : schrijf blob-URL + attributie + sourceHash naar data/photos.json.
 *
 * Idempotent: slaat upload over wanneer sourceHash ongewijzigd is (tenzij --force).
 *
 * Gebruik:
 *   node scripts/sync-photos.mjs [opties]
 *   --force            altijd opnieuw downloaden + uploaden
 *   --resolve-only     alleen metadata bijwerken, niet downloaden/uploaden
 *   --player <id>      beperk tot één of meer spelers (komma-gescheiden of herhaald)
 *   --set-public       zet container op anonieme blob-read (eenmalig, vereist rechten)
 *   --help
 *
 * Vereist: Azure CLI ingelogd op de juiste tenant met data-toegang tot de container:
 *   az login --tenant <jouw-cloudnation-tenant>
 *   (rol 'Storage Blob Data Contributor' op het account/de container)
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PLAYERS_FILE = join(ROOT, "data", "players.json");
const PHOTOS_FILE = join(ROOT, "data", "photos.json");
const CACHE_DIR = join(__dirname, ".cache");

const ACCOUNT = "carlintveld";
const CONTAINER = "herken-de-oranje-selectie";
const BLOB_BASE = `https://${ACCOUNT}.blob.core.windows.net/${CONTAINER}`;

const UA = "herken-de-oranje-selectie/1.0 (https://github.com/cveld/herken-de-oranje-selectie; sync-photos)";

// Breedte van de thumbnail die we uploaden (i.p.v. het volledige origineel).
// Ruim genoeg voor een avatar/prompt van 180px op high-DPI, maar veel lichter.
const THUMB_SIZE = 600;

const MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
};

// ---------- args ----------
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
if (has("--help")) {
  console.log(
    "node scripts/sync-photos.mjs [--force] [--resolve-only] [--player <id>] [--set-public]"
  );
  process.exit(0);
}
const FORCE = has("--force");
const RESOLVE_ONLY = has("--resolve-only");
const SET_PUBLIC = has("--set-public");
let onlyPlayers = null;
const pIdx = args.indexOf("--player");
if (pIdx !== -1 && args[pIdx + 1]) {
  onlyPlayers = new Set(
    args[pIdx + 1].split(",").map((s) => s.trim()).filter(Boolean)
  );
}

// Auth-modus voor data-plane calls: 'login' (RBAC) met fallback naar 'key'.
let AUTH_MODE = "login";

// ---------- helpers ----------
function az(argv) {
  // az is op Windows een .cmd -> shell:true.
  return new Promise((resolve) => {
    const child = spawn("az", argv, { shell: true });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("close", (code) => resolve({ code, out, err }));
    child.on("error", (e) => resolve({ code: 1, out: "", err: String(e) }));
  });
}

async function api(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} voor ${url}`);
  return res.json();
}

function extFromUrl(url) {
  const m = url.split("?")[0].match(/\.([a-zA-Z0-9]+)$/);
  return (m ? m[1] : "jpg").toLowerCase();
}

function firstPage(data) {
  const pages = data?.query?.pages;
  if (!pages) return null;
  const vals = Object.values(pages);
  return vals.length ? vals[0] : null;
}

// Wikipedia-pagina -> originele + thumbnail-URL + bestandsnaam.
async function resolveImage(wikiTitle) {
  for (const lang of ["nl", "en"]) {
    const url =
      `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&redirects=1` +
      `&prop=pageimages&piprop=original|thumbnail|name&pithumbsize=${THUMB_SIZE}` +
      `&titles=${encodeURIComponent(wikiTitle)}&origin=*`;
    const page = firstPage(await api(url));
    const source = page?.original?.source;
    const thumb = page?.thumbnail?.source;
    const file = page?.pageimage;
    if (source && file) return { source, thumb: thumb || source, file: `File:${file}` };
  }
  return null;
}

// Commons File: -> attributie + bron-URL.
async function resolveAttribution(file) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json` +
    `&prop=imageinfo&iiprop=extmetadata|url&titles=${encodeURIComponent(file)}&origin=*`;
  const page = firstPage(await api(url));
  const info = page?.imageinfo?.[0];
  const ext = info?.extmetadata || {};
  const clean = (s) => (s ? String(s).replace(/\s+/g, " ").trim() : "");
  return {
    author: clean(ext.Artist?.value) || "Onbekend",
    license: clean(ext.LicenseShortName?.value) || "",
    licenseUrl: clean(ext.LicenseUrl?.value) || "",
    descriptionUrl: info?.descriptionurl || "",
  };
}

async function downloadToCache(source, id) {
  const ext = extFromUrl(source);
  const res = await fetch(source, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const hash = createHash("sha256").update(buf).digest("hex");
  await mkdir(CACHE_DIR, { recursive: true });
  const path = join(CACHE_DIR, `${id}.${ext}`);
  await writeFile(path, buf);
  return { path, ext, hash, bytes: buf.length };
}

async function preflight() {
  const acct = await az(["account", "show", "-o", "json"]);
  if (acct.code !== 0) {
    console.error(
      "\n✗ Azure CLI is niet ingelogd.\n" +
        "  Log in op de juiste tenant (CloudNation), bv:\n" +
        "    az login --tenant <jouw-cloudnation-tenant>\n"
    );
    process.exit(1);
  }
  let info = {};
  try {
    info = JSON.parse(acct.out);
  } catch {}
  console.log(
    `• Azure-account: ${info.user?.name || "?"} (tenant ${info.tenantId || "?"})`
  );

  // Bepaal werkende auth-modus: eerst RBAC (login), dan account-key.
  // Let op: gebruik een écht data-plane-commando (blob list), want
  // 'container show' lukt ook zonder data-rol via de management-plane.
  const loginProbe = await az([
    "storage", "blob", "list",
    "--container-name", CONTAINER, "--account-name", ACCOUNT,
    "--auth-mode", "login", "--num-results", "1", "-o", "none",
  ]);
  if (loginProbe.code === 0) {
    AUTH_MODE = "login";
    console.log("• Auth: RBAC (--auth-mode login)");
  } else {
    const keyProbe = await az([
      "storage", "account", "keys", "list",
      "--account-name", ACCOUNT, "-o", "none",
    ]);
    if (keyProbe.code === 0) {
      AUTH_MODE = "key";
      console.log(
        "• Auth: account-key (--auth-mode key) — data-rol ontbreekt, maar control-plane toegang aanwezig."
      );
    } else {
      console.error(
        "\n✗ Geen toegang tot de container.\n" +
          "  Login-auth faalde (geen 'Storage Blob Data Contributor') én\n" +
          "  account-key ophalen faalde (geen 'listKeys'-recht).\n" +
          "  Vraag één van beide rechten op account/container aan.\n"
      );
      process.exit(1);
    }
  }

  if (SET_PUBLIC) {
    console.log("• Container op anonieme blob-read zetten…");
    const r = await az([
      "storage", "container", "set-permission",
      "--name", CONTAINER, "--account-name", ACCOUNT,
      "--public-access", "blob", "--auth-mode", AUTH_MODE,
    ]);
    if (r.code !== 0) console.error("  ⚠ set-permission faalde:\n" + r.err);
    else console.log("  ✓ container is nu publiek leesbaar (blob).");
  }
}

async function uploadBlob(id, ext, path) {
  const name = `${id}.${ext}`;
  const r = await az([
    "storage", "blob", "upload",
    "--account-name", ACCOUNT,
    "--container-name", CONTAINER,
    "--name", name,
    "--file", path,
    "--overwrite",
    "--auth-mode", AUTH_MODE,
    "--content-type", MIME[ext] || "application/octet-stream",
    "-o", "none",
  ]);
  if (r.code !== 0) {
    throw new Error(
      `az upload faalde voor ${name}:\n${r.err.trim()}\n` +
        "Heb je rechten (Storage Blob Data Contributor) op de juiste tenant?"
    );
  }
  return `${BLOB_BASE}/${name}`;
}

// ---------- main ----------
async function main() {
  const players = JSON.parse(await readFile(PLAYERS_FILE, "utf8"));
  let index = {};
  try {
    index = JSON.parse(await readFile(PHOTOS_FILE, "utf8"));
  } catch {}

  if (!RESOLVE_ONLY) await preflight();

  const targets = players.filter(
    (p) => !onlyPlayers || onlyPlayers.has(p.id)
  );

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const p of targets) {
    process.stdout.write(`→ ${p.name} … `);
    try {
      const resolved = await resolveImage(p.wikiTitle);
      if (!resolved) {
        console.log("geen foto gevonden, sla over");
        failed++;
        continue;
      }
      const attr = await resolveAttribution(resolved.file);
      const prev = index[p.id] || {};

      const entry = {
        wikiTitle: p.wikiTitle,
        source: resolved.source,
        file: resolved.file,
        author: attr.author,
        license: attr.license,
        licenseUrl: attr.licenseUrl,
        descriptionUrl: attr.descriptionUrl,
        blob: prev.blob || "",
        sourceHash: prev.sourceHash || "",
      };

      if (RESOLVE_ONLY) {
        index[p.id] = entry;
        console.log("metadata bijgewerkt (resolve-only)");
        skipped++;
        continue;
      }

      const dl = await downloadToCache(resolved.thumb, p.id);
      const unchanged =
        !FORCE && prev.sourceHash === dl.hash && prev.blob;
      if (unchanged) {
        index[p.id] = { ...entry, blob: prev.blob, sourceHash: dl.hash };
        console.log("ongewijzigd, skip upload");
        skipped++;
        continue;
      }

      const blob = await uploadBlob(p.id, dl.ext, dl.path);
      index[p.id] = { ...entry, blob, sourceHash: dl.hash };
      console.log(`geüpload (${(dl.bytes / 1024).toFixed(0)} kB)`);
      uploaded++;
    } catch (e) {
      console.log("FOUT");
      console.error("   " + (e?.message || e));
      failed++;
    }
  }

  // Index sorteren op spelervolgorde voor nette diffs.
  const ordered = {};
  for (const p of players) if (index[p.id]) ordered[p.id] = index[p.id];
  await writeFile(PHOTOS_FILE, JSON.stringify(ordered, null, 2) + "\n", "utf8");

  console.log(
    `\nKlaar. Geüpload: ${uploaded}, overgeslagen: ${skipped}, mislukt: ${failed}.`
  );
  console.log(`Index bijgewerkt: ${PHOTOS_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
