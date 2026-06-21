import { PLAYERS, type Player } from "@/data/players";
import photosJson from "@/data/photos.json";

/** Eén entry in de foto-index (data/photos.json), beheerd door de sync-tool. */
export interface PhotoEntry {
  wikiTitle: string;
  source: string;
  file: string;
  author: string;
  license: string;
  licenseUrl: string;
  descriptionUrl: string;
  blob: string;
  sourceHash: string;
}

export type PhotoIndex = Record<string, PhotoEntry>;

export const PHOTOS: PhotoIndex = photosJson as PhotoIndex;

/** Speler verrijkt met een foto-URL (blob) wanneer beschikbaar in de index. */
export interface ResolvedPlayer extends Player {
  image?: string;
  credit?: PhotoEntry;
}

export const RESOLVED_PLAYERS: ResolvedPlayer[] = PLAYERS.map((p) => {
  const photo = PHOTOS[p.id];
  return photo && photo.blob
    ? { ...p, image: photo.blob, credit: photo }
    : { ...p };
});

/** Alle spelers met een foto (voor de "Fotoverantwoording"). */
export const CREDITS: { player: ResolvedPlayer; credit: PhotoEntry }[] =
  RESOLVED_PLAYERS.filter((p) => p.credit).map((p) => ({
    player: p,
    credit: p.credit as PhotoEntry,
  }));
