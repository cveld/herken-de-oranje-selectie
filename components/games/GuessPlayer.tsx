"use client";

import { useCallback, useState } from "react";
import Avatar from "@/components/Avatar";
import { RESOLVED_PLAYERS, type ResolvedPlayer } from "@/lib/players";
import { shuffle, sample, distractors } from "@/components/ui";
import { GameHeader, ProgressBar, Results } from "./common";

const ROUNDS = 10;
const TITLE = "Raad de speler";

function makeQuestion() {
  const target = sample(RESOLVED_PLAYERS, 1)[0];
  const options = shuffle([target, ...distractors(RESOLVED_PLAYERS, target, 3)]);
  return { target, options };
}

export default function GuessPlayer({ onExit }: { onExit: () => void }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [q, setQ] = useState(makeQuestion);
  const [picked, setPicked] = useState<string | null>(null);

  const reset = useCallback(() => {
    setRound(1);
    setScore(0);
    setFinished(false);
    setQ(makeQuestion());
    setPicked(null);
  }, []);

  function choose(p: ResolvedPlayer) {
    if (picked) return;
    setPicked(p.id);
    if (p.id === q.target.id) setScore((s) => s + 1);
    setTimeout(() => {
      if (round >= ROUNDS) {
        setFinished(true);
      } else {
        setRound((r) => r + 1);
        setQ(makeQuestion());
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
        <Avatar player={q.target} size={180} />
      </div>
      <div className="options">
        {q.options.map((p) => {
          let cls = "option";
          if (picked) {
            if (p.id === q.target.id) cls += " correct";
            else if (p.id === picked) cls += " wrong";
          }
          return (
            <button
              key={p.id}
              className={cls}
              disabled={Boolean(picked)}
              onClick={() => choose(p)}
            >
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
