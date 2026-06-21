"use client";

import { useCallback, useState } from "react";
import Avatar from "@/components/Avatar";
import { RESOLVED_PLAYERS } from "@/lib/players";
import { POSITIONS } from "@/data/players";
import { sample } from "@/components/ui";
import { GameHeader, ProgressBar, Results } from "./common";

const ROUNDS = 10;
const TITLE = "Raad de positie";

export default function GuessPosition({ onExit }: { onExit: () => void }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [target, setTarget] = useState(() => sample(RESOLVED_PLAYERS, 1)[0]);
  const [picked, setPicked] = useState<string | null>(null);

  const reset = useCallback(() => {
    setRound(1);
    setScore(0);
    setFinished(false);
    setTarget(sample(RESOLVED_PLAYERS, 1)[0]);
    setPicked(null);
  }, []);

  function choose(pos: string) {
    if (picked) return;
    setPicked(pos);
    if (pos === target.position) setScore((s) => s + 1);
    setTimeout(() => {
      if (round >= ROUNDS) {
        setFinished(true);
      } else {
        setRound((r) => r + 1);
        setTarget(sample(RESOLVED_PLAYERS, 1)[0]);
        setPicked(null);
      }
    }, 900);
  }

  if (finished) {
    return (
      <Results
        title={TITLE}
        score={score}
        total={ROUNDS}
        onAgain={reset}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="game">
      <GameHeader title={TITLE} onExit={onExit} />
      <ProgressBar current={round - 1} total={ROUNDS} />
      <div className="prompt">
        <Avatar player={target} size={150} />
        <p className="prompt-name">{target.name}</p>
      </div>
      <div className="pos-grid">
        {POSITIONS.map((pos) => {
          let cls = "option pos-option";
          if (picked) {
            if (pos === target.position) cls += " correct";
            else if (pos === picked) cls += " wrong";
          }
          return (
            <button
              key={pos}
              className={cls}
              disabled={Boolean(picked)}
              onClick={() => choose(pos)}
            >
              {pos}
            </button>
          );
        })}
      </div>
    </div>
  );
}
