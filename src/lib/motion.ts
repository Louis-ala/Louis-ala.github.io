import { useCallback, useEffect, useLayoutEffect, useSyncExternalStore } from "react";

/** Courbe « nerveuse » : départ explosif, arrivée amortie (sprint puis contrôle). */
export const EASE_SNAP = [0.2, 0.9, 0.1, 1] as const;

export const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Suit une media query ; `false` au pré-rendu et à l'hydratation. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
