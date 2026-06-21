"use client";

import Avatar from "@/components/Avatar";
import { RESOLVED_PLAYERS, CREDITS } from "@/lib/players";
import { useUsePhotos } from "@/lib/prefs";
import { GameHeader } from "./common";

const TITLE = "Bekijk de selectie";

export default function Study({ onExit }: { onExit: () => void }) {
  const [usePhotos, , toggle] = useUsePhotos();

  const players = RESOLVED_PLAYERS.slice().sort((a, b) => a.number - b.number);

  const toggleBtn = (
    <button
      className="btn-toggle"
      onClick={toggle}
      aria-pressed={!usePhotos}
      title="Wissel tussen echte foto's en de gegenereerde avatars"
    >
      {usePhotos ? "🎨 Toon avatars" : "📷 Toon foto's"}
    </button>
  );

  return (
    <div className="game">
      <GameHeader title={TITLE} onExit={onExit} extra={toggleBtn} />

      <div className="study-grid">
        {players.map((p) => (
          <div className="study-card" key={p.id}>
            <Avatar player={p} size={96} showNumber />
            <strong>{p.name}</strong>
            <span className="study-meta">{p.position}</span>
            <span className="study-club">{p.club || ""}</span>
          </div>
        ))}
      </div>

      {CREDITS.length > 0 && (
        <details className="credits">
          <summary>Fotoverantwoording ({CREDITS.length})</summary>
          <p className="credits-intro">
            Foto&apos;s afkomstig van Wikimedia Commons, gebruikt onder hun
            respectievelijke licenties.
          </p>
          <ul>
            {CREDITS.map(({ player, credit }) => (
              <li key={player.id}>
                <strong>{player.name}</strong>:{" "}
                <span
                  dangerouslySetInnerHTML={{ __html: credit.author || "Onbekend" }}
                />{" "}
                —{" "}
                <a
                  href={credit.licenseUrl || credit.descriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credit.license || "licentie"}
                </a>{" "}
                (
                <a
                  href={credit.descriptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bron
                </a>
                )
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
