import { chapters, type ChapterId } from "../../data/content";

/**
 * Marque-pages de navigation. Desktop : rubans sur le bord droit, le libellé se déplie au survol.
 * Mobile : barre fixe en bas d'écran.
 */
export function Bookmarks({ active }: { active: ChapterId }) {
  return (
    <nav aria-label="Chapitres" className="fixed z-40 max-lg:inset-x-0 max-lg:bottom-0 lg:top-1/2 lg:right-0 lg:-translate-y-1/2">
      <ol className="flex border-line bg-ink/90 backdrop-blur-md max-lg:justify-around max-lg:border-t max-lg:px-1 lg:flex-col lg:gap-2 lg:bg-transparent lg:backdrop-blur-none">
        {chapters.map((c) => {
          const current = c.id === active;
          return (
            <li key={c.id}>
              <a
                href={`#${c.id}`}
                aria-current={current ? "location" : undefined}
                className={[
                  "group flex items-center font-display text-sm font-semibold transition-all duration-300 ease-snap",
                  // mobile
                  "max-lg:min-h-12 max-lg:flex-col max-lg:justify-center max-lg:px-2 max-lg:text-[0.7rem]",
                  // desktop : ruban
                  "lg:h-11 lg:translate-x-[calc(100%-3rem)] lg:gap-3 lg:rounded-l-lg lg:border lg:border-r-0 lg:pr-4 lg:pl-3 lg:hover:translate-x-0 lg:focus-visible:translate-x-0",
                  current
                    ? "text-on-accent max-lg:text-violet lg:border-violet lg:bg-violet"
                    : "text-muted hover:text-fg lg:border-line lg:bg-surface",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={`font-pixel lg:w-6 lg:text-center ${current ? "" : "text-gold"} max-lg:text-xs`}
                >
                  {c.numeral || (c.id === "prologue" ? "P" : "E")}
                </span>
                <span className="whitespace-nowrap max-lg:max-w-[4.5rem] max-lg:truncate">{c.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
