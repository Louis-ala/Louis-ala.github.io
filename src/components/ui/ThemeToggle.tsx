import { useSyncExternalStore } from "react";
import { applyTheme, DEFAULT_THEME, oppositeTheme, readTheme } from "../../lib/theme";

// Le thème vit sur <html data-theme> : on s'y abonne comme à un store externe.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Bouton « Mode lecture » : parchemin clair, contraste doux pour lire longtemps. */
export function ThemeToggle() {
  // Pré-rendu et hydratation : mode nuit ; ensuite, le thème réellement appliqué.
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
  const reading = theme === "light";

  return (
    <button
      type="button"
      aria-pressed={reading}
      onClick={() => applyTheme(oppositeTheme(theme))}
      className="group inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 font-display text-sm font-semibold text-fg transition-colors duration-200 hover:border-violet"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="text-violet">
        {/* Livre ouvert : une page se remplit en mode lecture. */}
        <path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13C17 4 14 4.5 12 6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 6v13" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 4.5v13c3-.5 6 0 8 1.5V6C10 4.5 7 4 4 4.5Z" fill="currentColor" className="opacity-0 transition-opacity duration-300 group-aria-pressed:opacity-40" />
      </svg>
      Mode lecture
    </button>
  );
}
