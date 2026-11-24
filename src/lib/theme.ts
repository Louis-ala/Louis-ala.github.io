// Thème : sombre par défaut, « mode lecture » clair au choix.
// Le choix est mémorisé et appliqué avant l'affichage par le script en ligne de index.html.

export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme";
export const DEFAULT_THEME: Theme = "dark";

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

export function readTheme(): Theme {
  return parseTheme(document.documentElement.dataset.theme) ?? DEFAULT_THEME;
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // le choix ne sera simplement pas mémorisé
  }
}
