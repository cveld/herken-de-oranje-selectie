"use client";

import type { ReactNode } from "react";

export function GameHeader({
  title,
  onExit,
  extra,
}: {
  title: string;
  onExit: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="game-header">
      <button className="btn-ghost" onClick={onExit} aria-label="Terug">
        ‹ Terug
      </button>
      <h2 className="game-title">{title}</h2>
      <span className="spacer">{extra}</span>
    </div>
  );
}

export function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="progress">
      <div
        className="progress-fill"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  );
}

export function Results({
  title,
  score,
  total,
  onAgain,
  onExit,
}: {
  title: string;
  score: number;
  total: number;
  onAgain: () => void;
  onExit: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  let msg = "Lekker bezig! 🟠";
  if (pct === 100) msg = "Perfect! Echte Oranje-kenner! 🏆";
  else if (pct >= 70) msg = "Sterk gespeeld! 💪";
  else if (pct < 40) msg = "Oefenen in de selectie-modus? 📚";

  return (
    <div className="results">
      <h2>{title}</h2>
      <div className="score-big">
        {score}
        <span> / {total}</span>
      </div>
      <p className="results-msg">{msg}</p>
      <div className="results-actions">
        <button className="btn" onClick={onAgain}>
          Opnieuw
        </button>
        <button className="btn-secondary" onClick={onExit}>
          Naar menu
        </button>
      </div>
    </div>
  );
}
