import playersJson from "./players.json";

export type Position = "Keeper" | "Verdediger" | "Middenvelder" | "Aanvaller";

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  club: string;
  /** Titel van de Wikipedia-pagina (gebruikt door de sync-tool). */
  wikiTitle: string;
}

export const PLAYERS: Player[] = playersJson as Player[];

export const POSITIONS: Position[] = [
  "Keeper",
  "Verdediger",
  "Middenvelder",
  "Aanvaller",
];
