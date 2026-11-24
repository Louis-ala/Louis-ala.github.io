// Le comportement est ajouté par src/enhance/theme.ts (le HTML est pré-rendu, sans React côté client).
export function ThemeToggle() {
  return (
    <button type="button" className="theme-toggle" data-theme-toggle aria-pressed="false" title="Mode sombre">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
      <span className="visually-hidden">Mode sombre</span>
    </button>
  );
}
