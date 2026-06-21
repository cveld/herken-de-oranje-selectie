"use client";

import { useMemo } from "react";
import { makeAvatar } from "@/lib/avatar";
import type { ResolvedPlayer } from "@/lib/players";
import { useUsePhotos } from "@/lib/prefs";

interface AvatarProps {
  player: ResolvedPlayer;
  size?: number;
  showNumber?: boolean;
  /** Forceer de gegenereerde avatar, ook als er een foto is. */
  forceAvatar?: boolean;
}

export default function Avatar({
  player,
  size = 120,
  showNumber = false,
  forceAvatar = false,
}: AvatarProps) {
  const [usePhotos] = useUsePhotos();

  const svg = useMemo(
    () => makeAvatar(player.id, { number: player.number, showNumber, size }),
    [player.id, player.number, showNumber, size]
  );

  const showPhoto = usePhotos && !forceAvatar && Boolean(player.image);

  if (showPhoto) {
    return (
      <div className="avatar avatar-photo" style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.image}
          alt={`Foto van ${player.name}`}
          width={size}
          height={size}
          loading="lazy"
        />
        {showNumber && <span className="avatar-number">{player.number}</span>}
      </div>
    );
  }

  return (
    <div
      className="avatar"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
