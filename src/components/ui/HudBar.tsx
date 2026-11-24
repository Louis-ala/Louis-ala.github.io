import { m, useScroll, useSpring } from "motion/react";
import { chapters, type ChapterId } from "../../data/content";
import { ThemeToggle } from "./ThemeToggle";

/** Barre du haut façon HUD : monogramme, jauge d'XP liée au scroll, chapitre courant, changer le thème. */
export function HudBar({ active }: { active: ChapterId }) {
  const { scrollYProgress } = useScroll();
  const xp = useSpring(scrollYProgress, { stiffness: 260, damping: 40, restDelta: 0.001 });
  const index = chapters.findIndex((c) => c.id === active);
  const chapter = chapters[index];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line/70 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        <a
          href="#prologue"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet font-display text-lg font-extrabold text-on-accent"
        >
          <span aria-hidden="true">LA</span>
          <span className="sr-only">Retour au début</span>
        </a>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3 font-pixel text-xs text-muted">
            <span className="text-gold">Niv. {index + 1}</span>
            <span className="truncate">
              {chapter.numeral ? `Chapitre ${chapter.numeral}, ` : ""}
              {chapter.label}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-raised" aria-hidden="true">
            <m.div
              className="h-full origin-left rounded-full bg-gradient-to-r from-violet via-gold to-court"
              style={{ scaleX: xp }}
            />
          </div>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
