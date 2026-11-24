// Bouton clair / sombre. Sans choix enregistré, le site suit le réglage du système.
// Le choix est appliqué avant l'affichage par le petit script en ligne de index.html.

export type Theme = "light" | "dark";

export const STORAGE_KEY = "theme";

export function parseTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

export function oppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}

function readStored(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null; // stockage bloqué (navigation privée, cookies refusés…)
  }
}

function store(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // le choix ne sera simplement pas mémorisé
  }
}

export function initThemeToggle(): void {
  const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!button) return;

  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const current = (): Theme => parseTheme(root.dataset.theme) ?? (systemDark.matches ? "dark" : "light");
  const sync = () => button.setAttribute("aria-pressed", String(current() === "dark"));

  button.addEventListener("click", () => {
    const next = oppositeTheme(current());
    root.dataset.theme = next;
    store(next);
    sync();
  });
  systemDark.addEventListener("change", () => {
    if (!readStored()) sync();
  });

  sync();
  button.dataset.ready = "";
}
