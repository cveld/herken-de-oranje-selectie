"use client";

import { useCallback, useState } from "react";
import Avatar from "@/components/Avatar";
import { RESOLVED_PLAYERS, type ResolvedPlayer } from "@/lib/players";
import { sample, shuffle } from "@/components/ui";
import { GameHeader, Results } from "./common";

const COUNT = 6;
const TITLE = "Koppel het rugnummer";

function makeRound() {
  const players = sample(RESOLVED_PLAYERS, COUNT);
  const numbers = shuffle(players.map((p) => p.number));
  return { players, numbers };
}

export default function MatchNumber({ onExit }: { onExit: () => void }) {
  const [{ players, numbers }, setRound] = useState(makeRound);
  const [selected, setSelected] = useState<ResolvedPlayer | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [shakeN, setShakeN] = useState<number | null>(null);
  const [status, setStatus] = useState("Tik een speler om te beginnen.");
  const [finished, setFinished] = useState(false);

  const reset = useCallback(() => {
    setRound(makeRound());
    setSelected(null);
    setMatched(new Set());
    setMistakes(0);
    setShakeN(null);
    setStatus("Tik een speler om te beginnen.");
    setFinished(false);
  }, []);

  function selectPlayer(p: ResolvedPlayer) {
    if (matched.has(p.id)) return;
    setSelected(p);
    setStatus(`Welk rugnummer hoort bij ${p.name}?`);
  }

  function selectNumber(n: number) {
    const owner = players.find((p) => p.number === n)!;
    if (matched.has(owner.id)) return;
    if (!selected) {
      setStatus("Kies eerst een speler.");
      return;
    }
    if (selected.number === n) {
      const next = new Set(matched);
      next.add(selected.id);
      setMatched(next);
      setSelected(null);
      if (next.size === COUNT) {
        setStatus("Helemaal goed! 🎉");
        setTimeout(() => setFinished(true), 600);
      } else {
        setStatus(`Goed! Nog ${COUNT - next.size} te gaan.`);
      }
    } else {
      setMistakes((m) => m + 1);
      setShakeN(n);
      setTimeout(() => setShakeN(null), 400);
      setStatus(`Nee, dat is niet het nummer van ${selected.name}.`);
    }
  }

  if (finished) {
    return (
      <Results
        title={TITLE}
        score={Math.max(0, COUNT - mistakes)}
        total={COUNT}
        onAgain={reset}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="game">
      <GameHeader title={TITLE} onExit={onExit} />
      <p className="match-status">{status}</p>
      <div className="match-board">
        <div className="match-col players-col">
          {players.map((p) => {
            const isMatched = matched.has(p.id);
            const isSelected = selected?.id === p.id;
            return (
              <button
                key={p.id}
                className={
                  "match-player" +
                  (isMatched ? " locked" : "") +
                  (isSelected ? " selected" : "")
                }
                disabled={isMatched}
                onClick={() => selectPlayer(p)}
              >
                <Avatar player={p} size={64} />
                <span className="match-name">{p.name}</span>
              </button>
            );
          })}
        </div>
        <div className="match-col numbers-col">
          {numbers.map((n) => {
            const owner = players.find((p) => p.number === n)!;
            const isLocked = matched.has(owner.id);
            return (
              <button
                key={n}
                className={
                  "num-chip" +
                  (isLocked ? " locked" : "") +
                  (shakeN === n ? " shake" : "")
                }
                disabled={isLocked}
                onClick={() => selectNumber(n)}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
