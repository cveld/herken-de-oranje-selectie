/*
 * Deterministische avatar-generator.
 * 1:1 port van de originele js/avatar.js — zelfde hash/RNG/stijlen,
 * dus exact dezelfde avatars als voorheen ("veiliggesteld").
 * Geen externe requests, geen auteursrecht. Zelfde id => zelfde avatar.
 *
 * makeAvatar(id, { number, showNumber, size }) => SVG-string
 */

export interface AvatarOpts {
  /** Rugnummer (alleen nodig wanneer showNumber=true). */
  number?: number;
  showNumber?: boolean;
  size?: number;
}

function hash(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministische pseudo-random op basis van seed (LCG).
function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return function () {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const SKIN = ["#ffdbac", "#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#5a3825"];
const HAIR = ["#1b1208", "#2c1b10", "#4a3520", "#6a4e2b", "#a9743b", "#1a1a1a", "#444444", "#d8c08a"];
const BG = ["#ffe9d6", "#dceefb", "#e3f6e6", "#fde2ec", "#efe2f7", "#fff0d9", "#d9f4f6", "#eaf5da"];

const JERSEY = "#f36c21"; // Oranje
const JERSEY_DARK = "#d2551a";

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

// --- Haarstijlen (worden over het hoofd getekend) ---
function hair(style: number, color: string): string {
  switch (style) {
    case 0: // korte coupe
      return `<path d="M29 38 Q50 12 71 38 Q71 30 50 24 Q29 30 29 38 Z" fill="${color}"/>`;
    case 1: // buzz cut
      return `<path d="M30 40 Q50 18 70 40 Q66 30 50 28 Q34 30 30 40 Z" fill="${color}" opacity="0.92"/>`;
    case 2: // krullen / afro
      return `<g fill="${color}">
          <circle cx="36" cy="30" r="9"/><circle cx="50" cy="25" r="10"/>
          <circle cx="64" cy="30" r="9"/><circle cx="30" cy="40" r="7"/>
          <circle cx="70" cy="40" r="7"/></g>`;
    case 3: // bolletje / langer bovenop
      return `<path d="M28 42 Q28 16 50 16 Q72 16 72 42 Q72 30 50 27 Q28 30 28 42 Z" fill="${color}"/>
              <circle cx="50" cy="15" r="6" fill="${color}"/>`;
    case 4: // zijscheiding
      return `<path d="M30 40 Q40 18 71 26 Q70 22 50 21 Q33 23 30 40 Z" fill="${color}"/>`;
    case 5: // wijkende haarlijn / kort aan zijkant
    default:
      return `<path d="M30 42 Q31 30 40 27 M70 42 Q69 30 60 27" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  }
}

// --- Gezichtsbeharing ---
function facialHair(style: number, color: string): string {
  switch (style) {
    case 1: // stoppels
      return `<path d="M31 50 Q50 78 69 50 Q66 66 50 70 Q34 66 31 50 Z" fill="${color}" opacity="0.22"/>`;
    case 2: // volle baard
      return `<path d="M31 50 Q50 82 69 50 Q66 70 50 73 Q34 70 31 50 Z" fill="${color}"/>
              <path d="M40 60 Q50 66 60 60" stroke="#0003" stroke-width="1" fill="none"/>`;
    case 3: // snor
      return `<path d="M42 58 Q50 62 58 58" stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    default:
      return "";
  }
}

export function makeAvatar(id: string, opts: AvatarOpts = {}): string {
  const size = opts.size || 120;
  const r = makeRng(hash(id || "x"));

  const skin = pick(SKIN, r);
  const hairColor = pick(HAIR, r);
  const bg = pick(BG, r);
  const hairStyle = Math.floor(r() * 6);
  const beardStyle = Math.floor(r() * 4);
  const hasGlasses = r() < 0.18;
  const eyeY = 46;

  const numberBadge =
    opts.showNumber && opts.number != null
      ? `<g>
           <circle cx="82" cy="82" r="15" fill="#1a1a2e" stroke="#fff" stroke-width="2"/>
           <text x="82" y="88" text-anchor="middle" font-size="16" font-weight="700"
                 fill="#fff" font-family="system-ui, sans-serif">${opts.number}</text>
         </g>`
      : "";

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Spelersavatar">
    <circle cx="50" cy="50" r="50" fill="${bg}"/>
    <!-- shirt -->
    <path d="M22 100 Q22 80 38 73 L50 80 L62 73 Q78 80 78 100 Z" fill="${JERSEY}"/>
    <path d="M42 74 L50 81 L58 74 L58 78 L50 85 L42 78 Z" fill="${JERSEY_DARK}"/>
    <!-- nek -->
    <rect x="43" y="63" width="14" height="14" rx="6" fill="${skin}"/>
    <!-- oren -->
    <circle cx="29" cy="49" r="5" fill="${skin}"/>
    <circle cx="71" cy="49" r="5" fill="${skin}"/>
    <!-- hoofd -->
    <ellipse cx="50" cy="46" rx="21" ry="23" fill="${skin}"/>
    ${hair(hairStyle, hairColor)}
    <!-- wenkbrauwen -->
    <path d="M37 40 Q42 37 47 40" stroke="${hairColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M53 40 Q58 37 63 40" stroke="${hairColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- ogen -->
    <circle cx="42" cy="${eyeY}" r="2.4" fill="#222"/>
    <circle cx="58" cy="${eyeY}" r="2.4" fill="#222"/>
    <!-- neus -->
    <path d="M50 47 L48 54 Q50 56 52 54" stroke="#00000033" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <!-- mond -->
    <path d="M44 60 Q50 64 56 60" stroke="#9c4a4a" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${facialHair(beardStyle, hairColor)}
    ${
      hasGlasses
        ? `<g stroke="#333" stroke-width="1.6" fill="none">
        <circle cx="42" cy="${eyeY}" r="5"/><circle cx="58" cy="${eyeY}" r="5"/>
        <path d="M47 ${eyeY} h6"/></g>`
        : ""
    }
    ${numberBadge}
  </svg>`;
}
