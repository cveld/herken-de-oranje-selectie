"use client";

import { useSyncExternalStore, useCallback } from "react";

/*
 * Globale voorkeur: foto's tonen (true) of de gegenereerde avatars (false).
 * Bewaard in localStorage en gedeeld over alle componenten via een kleine store.
 */

const KEY = "hdos:usePhotos";
const listeners = new Set<() => void>();

function read(): boolean {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem(KEY);
  return v === null ? true : v === "1";
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  // Reageer ook op wijzigingen in andere tabs.
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function setUsePhotos(value: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, value ? "1" : "0");
  listeners.forEach((cb) => cb());
}

/** React-hook: [usePhotos, setUsePhotos, toggle]. */
export function useUsePhotos(): [boolean, (v: boolean) => void, () => void] {
  // Server snapshot = true (default), zodat SSG markup overeenkomt.
  const usePhotos = useSyncExternalStore(subscribe, read, () => true);
  const toggle = useCallback(() => setUsePhotos(!read()), []);
  return [usePhotos, setUsePhotos, toggle];
}
