"use client";

import { useState, type ComponentType } from "react";
import GuessPlayer from "./games/GuessPlayer";
import MatchNumber from "./games/MatchNumber";
import GuessPosition from "./games/GuessPosition";
import Study from "./games/Study";

interface GameDef {
  id: string;
  title: string;
  icon: string;
  desc: string;
  Component: ComponentType<{ onExit: () => void }>;
}

const GAMES: GameDef[] = [
  {
    id: "guess-player",
    title: "Raad de speler",
    icon: "🕵️",
    desc: "Wie zie je? Kies de juiste naam.",
    Component: GuessPlayer,
  },
  {
    id: "match-number",
    title: "Koppel het rugnummer",
    icon: "🔢",
    desc: "Tik een speler en daarna zijn rugnummer.",
    Component: MatchNumber,
  },
  {
    id: "guess-position",
    title: "Raad de positie",
    icon: "📍",
    desc: "Waar speelt deze speler?",
    Component: GuessPosition,
  },
  {
    id: "study",
    title: "Bekijk de selectie",
    icon: "📚",
    desc: "Leer de avatars, namen en nummers.",
    Component: Study,
  },
];

export default function Hub() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = GAMES.find((g) => g.id === activeId);

  if (active) {
    const Game = active.Component;
    return (
      <div className="game-container">
        <Game onExit={() => setActiveId(null)} />
      </div>
    );
  }

  return (
    <div className="hub">
      <header className="hub-header">
        <h1>Herken de Oranje Selectie</h1>
        <p className="subtitle">Kies een mini-game ⚽🟠</p>
      </header>
      <div className="hub-grid">
        {GAMES.map((game) => (
          <button
            key={game.id}
            className="hub-card"
            onClick={() => setActiveId(game.id)}
          >
            <span className="hub-icon">{game.icon}</span>
            <span className="hub-name">{game.title}</span>
            <span className="hub-desc">{game.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
