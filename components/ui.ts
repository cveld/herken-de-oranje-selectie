/* Kleine helpers, gedeeld door de mini-games (port van js/ui.js). */

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** n willekeurige items behalve `exclude` (op basis van keyFn, default .id). */
export function distractors<T extends { id: string }>(
  all: T[],
  exclude: T,
  n: number,
  keyFn: (p: T) => string = (p) => p.id
): T[] {
  const pool = all.filter((p) => keyFn(p) !== keyFn(exclude));
  return sample(pool, n);
}
